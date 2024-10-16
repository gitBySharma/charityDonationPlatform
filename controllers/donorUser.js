require('dotenv').config();

const DonorUser = require('../models/donorUser.js');
const Donations = require('../models/donations.js');

const bcrypt = require('bcrypt');

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
            where: { donorUserId: req.user.id },
            include: [{
                model: Campaign,
                attributes: ['campaignName', 'campaignLocation']
            }]
        });

        const donationDetails = donations.map(donation => {
            return {
                campaignName: donation.Campaign.campaignName,
                campaignLocation: donation.Campaign.campaignLocation,
                donationAmount: donation.amount,
                donationDate: donation.createdAt
            };
        });

        res.status(200).json({ message: "Donation details fetched successfully", data: donationDetails, success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error", success: false });

    }
};