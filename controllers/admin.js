require('dotenv').config();

const Admin = require('../models/admin.js');
const DonorUser = require("../models/donorUser.js");
const Campaign = require("../models/charityCampaign.js");
const Donations = require("../models/donations.js");
const CharityOrgUser = require("../models/charityOrgUser.js");
const ArchivedCampaign = require("../models/archivedCampaign.js");

const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');


const s3bucket = new AWS.S3({
    accessKeyId: process.env.IAM_USER_ACCESS_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    Bucket: "charityconnect"
});



exports.adminSignup = async (req, res, next) => {
    const { name, email, adminKey, password } = req.body;
    try {

        const existingUser = await Admin.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists, register using different email', success: false });
        }

        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(401).json({ error: 'Invalid admin key', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await Admin.create({
            name: name,
            email: email,
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



exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ where: { email: email } });

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



exports.getUnapprovedCampaigns = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ where: { id: req.user.id } });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found", success: false });
        }

        const campaigns = await Campaign.findAll({
            where: { approved: false, active: true },
            include: [{ model: CharityOrgUser, attributes: ['name'] }],
            order: [['createdAt', 'ASC']]
        });

        const campaignDetails = campaigns.map(campaign => {
            return {
                id: campaign.id,
                campaignName: campaign.campaignName,
                campaignLocation: campaign.campaignLocation,
                campaignCategory: campaign.campaignCategory,
                campaignGoal: campaign.campaignGoal,
                campaignDescription: campaign.campaignDescription,
                uploadedDocumentUrl: campaign.campaignImage,
                charityOrgName: campaign.charityOrgUser.name
            }
        });

        res.status(200).json({ message: "Campaigns fetched successfully", campaignData: campaignDetails, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }

};



exports.approveCampaign = async (req, res, next) => {
    try {
        const campaignId = req.body.campaignId;

        const admin = await Admin.findOne({ where: { id: req.user.id } });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found", success: false });

        }
        const campaign = await Campaign.findOne({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found", success: false });

        }
        if (campaign.approved) {
            return res.status(400).json({ error: "Campaign already approved", success: false });
        }

        campaign.approved = true;
        await campaign.save();

        res.status(200).json({ message: "Campaign approved successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.rejectCampaign = async (req, res, next) => {
    try {
        const campaignId = req.body.campaignId;

        const admin = await Admin.findOne({ where: { id: req.user.id } });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found", success: false });

        }
        const campaign = await Campaign.findOne({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found", success: false });

        }
        if (campaign.approved) {
            return res.status(400).json({ error: "Campaign already approved", success: false });

        }

        const params = {
            Bucket: "charityconnect",
            Key: JSON.stringify(campaign.campaignImage) // The key of the file in S3
        };

        // Delete the document from S3
        await s3bucket.deleteObject(params).promise();

        await Campaign.destroy({
            where: {
                id: campaignId
            }
        });

        res.status(200).json({ message: "Campaign rejected successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};


exports.getApprovedCampaigns = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ where: { id: req.user.id } });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found", success: false });
        }

        const campaigns = await Campaign.findAll({
            where: { approved: true, active: true },
            include: [{ model: CharityOrgUser, attributes: ['name'] }],
            order: [['createdAt', 'ASC']]
        });

        const campaignDetails = campaigns.map(campaign => {
            return {
                id: campaign.id,
                campaignName: campaign.campaignName,
                campaignLocation: campaign.campaignLocation,
                campaignCategory: campaign.campaignCategory,
                campaignGoal: campaign.campaignGoal,
                fundRaised: campaign.fundRaised,
                charityOrgName: campaign.charityOrgUser.name
            }
        });

        res.status(200).json({ message: "Campaigns fetched successfully", campaignData: campaignDetails, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.terminateCampaign = async (req, res, next) => {
    try {
        const campaignId = req.body.campaignId;

        const admin = await Admin.findOne({ where: { id: req.user.id } });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found", success: false });

        }
        const campaign = await Campaign.findOne({ where: { id: campaignId } });
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found", success: false });

        }

        campaign.active = false;
        campaign.approved = false;
        campaign.save();

        res.status(200).json({ message: "Campaign terminated and archived successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};



exports.getDonorUsers = async (req, res, next) => {
    try {
        const donorUsers = await DonorUser.findAll();
        if (!donorUsers) {
            return res.status(404).json({ error: "No donor users found", success: false });

        }
        res.status(200).json({ message: "Donor users fetched successfully", donorUsers: donorUsers, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.getCharityOrganizations = async (req, res, next) => {
    try {
        const charityOrganizations = await CharityOrgUser.findAll();
        if (!charityOrganizations) {
            return res.status(404).json({ error: "No charity organizations found", success: false });

        }
        res.status(200).json({ message: "Charity Organizations fetched successfully", charityOrganizations: charityOrganizations, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};



exports.deleteDonorUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const donorUser = await DonorUser.findOne({ where: { id: userId } });
        if (!donorUser) {
            return res.status(404).json({ error: "Donor user not found", success: false });

        }
        await DonorUser.destroy({ where: { id: userId } });
        res.status(200).json({ message: "Donor user deleted successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};


exports.deleteOrganization = async (req, res, next) => {
    try {
        const organizationId = req.params.organizationId;

        const organization = await CharityOrgUser.findOne({ where: { id: organizationId } });
        if (!organization) {
            return res.status(404).json({ error: "Organization not found", success: false });

        }

        await Campaign.destroy({ where: { charityOrgUserId: organizationId } });
        await CharityOrgUser.destroy({ where: { id: organizationId } });

        res.status(200).json({ message: "Organization deleted successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", success: false });

    }
};