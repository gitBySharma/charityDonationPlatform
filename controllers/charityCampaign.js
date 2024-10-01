
require('dotenv').config();

const Campaign = require("../models/charityCampaign.js");
const uploadToS3 = require("../util/aws.js");

const Sequelize = require('sequelize');

exports.registerCharity = async (req, res, next) => {
    const { campaignName, campaignCategory, campaignDescription,
        campaignLocation, campaignGoal, campaignStartDate, campaignEndDate } = req.body;

    try {
        const fileUrl = await uploadToS3(req.files);

        const newCampaign = await Campaign.create({
            campaignName: campaignName,
            campaignCategory: campaignCategory,
            campaignDescription: campaignDescription,
            campaignLocation: campaignLocation,
            campaignGoal: campaignGoal,
            campaignStartDate: campaignStartDate,
            campaignEndDate: campaignEndDate,
            campaignImage: fileUrl,
            charityOrgUserId: req.user.id
        });

        res.status(201).json({ message: "Campaign created successfully", campaign: newCampaign, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating campaign", success: false });
    }
};


exports.getApprovedCampaigns = async (req, res, next) => {
    try {
        const campaigns = await Campaign.findAll({
            where: {
                charityOrgUserId: req.user.id,
                approved: true
            }
        });

        if (campaigns) {
            res.status(200).json({ message: "Campaigns fetched successfully", campaigns: campaigns, success: true });

        } else {
            res.status(404).json({ message: "No campaigns found", success: false });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching campaigns", success: false });
    }
};