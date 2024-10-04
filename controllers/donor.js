
require('dotenv').config();

const Campaign = require("../models/charityCampaign.js");
const DonorUser = require("../models/donorUser.js");
const Donations = require("../models/donations.js");

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