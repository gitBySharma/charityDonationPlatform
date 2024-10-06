
require('dotenv').config();

const Razorpay = require("razorpay");

const Campaign = require("../models/charityCampaign.js");
const DonorUser = require("../models/donorUser.js");
const Donations = require("../models/donations.js");
const Transactions = require("../models/transactions.js");

const Sequelize = require('sequelize');


exports.getCampaigns = async (req, res, next) => {
    try {
        const donor = await DonorUser.findOne({ where: { id: req.user.id } });
        if (!donor) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const campaigns = await Campaign.findAll({ where: { approved: true } });
        res.json({ message: "Campaigns fetched successfully", campaigns: campaigns, success: true });

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