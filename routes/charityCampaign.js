const express = require('express');
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const charityCampaignController = require('../controllers/charityCampaign.js');
const authentication = require("../middleware/charityOrgAuth.js");


router.post('/campaign/register/', authentication.authenticate, upload.array('file'), charityCampaignController.registerCharity);

router.get('/campaign/approved/', authentication.authenticate, charityCampaignController.getApprovedCampaigns);


module.exports = router;