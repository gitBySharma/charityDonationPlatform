
require('dotenv').config();

const Razorpay = require("razorpay");
const brevo = require('sib-api-v3-sdk');

const Campaign = require("../models/charityCampaign.js");
const DonorUser = require("../models/donorUser.js");
const Donations = require("../models/donations.js");
const Transactions = require("../models/transactions.js");

const Sequelize = require('sequelize');

const defaultClient = brevo.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['api-key'];
ApiKeyAuth.apiKey = process.env.FORGOT_PASSWORD_API_KEY;


exports.getCampaigns = async (req, res, next) => {
    try {
        const donor = await DonorUser.findOne({ where: { id: req.user.id } });
        if (!donor) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const { category, searchQuery, page = 1 } = req.query;
        const limit = 6;
        const offset = (page - 1) * limit;

        let queryOptions = {
            where: { approved: true, active: true },
            limit: limit,
            offset: offset
        };

        if (category) {
            queryOptions.where.campaignCategory = category;
        };

        if (searchQuery) {
            queryOptions.where[Sequelize.Op.or] = [
                { campaignName: { [Sequelize.Op.like]: `%${searchQuery}%` } },
                { campaignLocation: { [Sequelize.Op.like]: `%${searchQuery}%` } }
            ];
        };

        const { count, rows: campaigns } = await Campaign.findAndCountAll(queryOptions);
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            message: "Campaigns fetched successfully",
            campaigns: campaigns,
            totalPages: totalPages,
            currentPage: page,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching campaigns", success: false });
    }
};



exports.donate = async (req, res, next) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        console.log("body", req.body);
        const amount = req.body.donationAmount * 100;  //razorpay expects payment is paisa, so *100

        rzp.orders.create({ amount, currency: "INR" }, async (error, order) => {
            if (error) {
                console.log(error);
                return res.status(404).json({ message: "Failed to create order", error: error });
            }

            try {
                await Transactions.create({
                    orderId: order.id,
                    status: "PENDING",
                    donorUserId: req.user.id,
                    campaignId: req.body.campaignId
                });

                return res.status(201).json({ order, key_id: rzp.key_id });

            } catch (error) {
                console.log(error);
                return res.status(404).json({ message: "Failed to create order in database", error: error });
            }
        })

    } catch (error) {
        console.log(error);
        res.status(403).json({ message: "Something went wrong", error: err });
    }
};


exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { payment_id, order_id, donationAmount, campaignId } = req.body;

        const order = await Transactions.findOne({ where: { orderId: order_id } });

        if (order) {

            if (payment_id === "payment_failed") {

                await order.update({ status: "FAILED" });
                return res.status(401).json({ success: false, message: "Payment failed" });

            } else {
                await order.update({ paymentId: payment_id, status: "SUCCESSFUL" });

                await Donations.create({
                    amount: donationAmount,
                    paymentId: payment_id,
                    donorUserId: req.user.id,
                    campaignId: campaignId
                });

                const campaign = await Campaign.findByPk(campaignId);
                if (campaign) {
                    const currentFundRaised = campaign.fundRaised || 0; // default to 0 if null
                    await campaign.update({ fundRaised: currentFundRaised + parseInt(donationAmount, 10) });
                }

                //send donation confirmation mail
                const apiInstance = new brevo.TransactionalEmailsApi();
                const sender = {
                    email: "subhankarsharma24@gmail.com",
                    name: "Charity Connect Support",
                };

                const donor = await DonorUser.findOne({ where: { id: req.user.id } });
                const receiver = [{ email: donor.email }];

                const emailHtmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Donation Confirmation</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f9f9f9;
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                padding: 20px;
                                max-width: 600px;
                                margin: auto;
                            }
                            h1 {
                                color: #2d465e;
                            }
                            p {
                                font-size: 16px;
                                color: #333333;
                            }
                            .highlight {
                                color: #5777ba;
                                font-weight: bold;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 14px;
                                color: #777777;
                            }
                            .button {
                                display: inline-block;
                                padding: 10px 15px;
                                margin-top: 10px;
                                color: #5777ba;
                                text-decoration: none;
                                border: 2px solid #5777ba;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Donation Successful!</h1>
                            <p>Thank you <span class="highlight">${donor.name}</span> for your generous donation of <span class="highlight">₹${donationAmount}</span> towards <span class="highlight">${campaign.campaignName}</span>.</p>
                            <p>Your payment ID is: <span class="highlight">${payment_id}</span></p>
                            <p>Your support makes a difference. Thank you for being a part of the CharityConnect community!</p>
                            <p>For any questions, feel free to contact us.</p>
                            <div class="footer">
                                <p>Warm regards,</p>
                                <p>The CharityConnect Team</p>
                                <a href="${process.env.WEBSITE}" class="button">Visit Our Website</a>
                            </div>
                        </div>
                    </body>
                    </html>`;

                await apiInstance.sendTransacEmail({
                    sender,
                    to: receiver,
                    subject: "Donation Confirmation",
                    htmlContent: emailHtmlContent
                });

                return res.status(201).json({ success: true, message: "Transaction successful" });

            }

        } else {
            res.status(404).json({ success: false, message: "Order not found" });

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
};