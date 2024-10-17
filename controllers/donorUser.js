require('dotenv').config();

const DonorUser = require('../models/donorUser.js');
const Donations = require('../models/donations.js');

const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");

const Campaign = require('../models/charityCampaign.js');

const jwt = require('jsonwebtoken');


exports.donorUserSignup = async (req, res, next) => {
    const { name, email, phone, password } = req.body;
    try {

        const existingUser = await DonorUser.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists, register using different email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await DonorUser.create({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword
        });

        res.status(200).json({ message: "Signup successful", userData: data, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, process.env.JWT_SECRET);
}


exports.donorUserLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await DonorUser.findOne({ where: { email: email } });

        //case1 - if the emailId is incorrect
        if (!user) {
            return res.status(404).json({ error: "Incorrect email, User not found", success: false });
        }

        //case2 if the emailId is correct
        const match = await bcrypt.compare(password, user.password);  //matching the entered password with the hashed password stored in database
        if (match) {
            return res.status(200).json({ data: user, message: "User logged in successfully", success: true, token: generateAccessToken(user.id, user.name) });

        } else {
            return res.status(401).json({ error: "Incorrect password", success: false });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}



exports.getProfileDetails = async (req, res, next) => {
    try {
        const user = await DonorUser.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });

        } else {
            const totalDonation = await Donations.sum('amount', {
                where: {
                    donorUserId: req.user.id
                }
            });

            const totalDonationAmount = totalDonation || 0;

            return res.status(200).json({
                message: "User profile details fetched",
                data: user,
                totalDonation: totalDonationAmount,
                success: true
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });

    }
};



exports.editProfile = async (req, res, next) => {
    const { name, email, phone } = req.body;

    try {
        const user = await DonorUser.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });

        } else {
            user.name = name;
            user.email = email;
            user.phone = phone;

            await user.save();

            return res.status(200).json({ message: "Profile updated successfully", success: true });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await DonorUser.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });

        } else {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid current password", success: false });

            } else {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                user.password = hashedPassword;
                await user.save();
                return res.status(200).json({ message: "Password changed successfully", success: true });

            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.getDonationDetails = async (req, res, next) => {
    try {
        const user = await DonorUser.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        const donations = await Donations.findAll({
            where: { donorUserId: req.user.id }, // Fetch donations for the logged-in user
            include: [{
                model: Campaign, // Include associated campaign details
                attributes: ['campaignName', 'campaignLocation']
            }],
            order: [['createdAt', 'DESC']],
            limit: 15
        });

        const donationDetails = donations.map(donation => {
            return {
                campaignName: donation.campaign.campaignName,
                campaignLocation: donation.campaign.campaignLocation,
                donationAmount: donation.amount, // Donation amount from the Donations table
                donationDate: donation.createdAt, // Donation date
                paymentId: donation.paymentId
            };
        });

        res.status(200).json({ message: "Donation details fetched successfully", data: donationDetails, success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", success: false });
    }
};



async function uploadToS3(data, fileName) {
    const s3bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_ACCESS_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
        Bucket: "charityconnect"
    });

    var params = {
        Bucket: "charityconnect",
        Key: fileName,
        Body: data,
        ACL: "public-read"
    }

    try {
        const response = await s3bucket.upload(params).promise();   //.promise() returns a promise
        //console.log("Success", response);
        return response.Location;

    } catch (error) {
        console.log("Error", error);

    }
};



exports.downloadDonationReport = async (req, res, next) => {
    try {
        const user = await DonorUser.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        const donations = await Donations.findAll({
            where: { donorUserId: req.user.id }, // Fetch donations for the logged-in user
            include: [{
                model: Campaign, // Include associated campaign details
                attributes: ['campaignName', 'campaignLocation']
            }],
            order: [['createdAt', 'DESC']]
        });

        const donationDetails = donations.map(donation => {
            return {
                campaignName: donation.campaign.campaignName,
                campaignLocation: donation.campaign.campaignLocation,
                donationAmount: donation.amount, // Donation amount from the Donations table
                donationDate: donation.createdAt, // Donation date
                paymentId: donation.paymentId
            };
        });
        const stringifiedDonations = JSON.stringify(donationDetails);
        const fileName = `Donations${req.user.id}/${new Date().toISOString()}.txt`;
        const fileUrl = await uploadToS3(stringifiedDonations, fileName);

        res.status(201).json({ fileUrl, success: true });

    } catch (error) {
        console.log("Error", error);
        res.status(500).json({ Error: "Something went wrong", success: false });
    }
};