const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.js');
const authentication = require("../middleware/adminAuth.js");


router.post('/admin/signUp', adminController.adminSignup);

router.post('/admin/login', adminController.adminLogin);

router.get('/admin/getUnapprovedCampaigns', authentication.authenticate, adminController.getUnapprovedCampaigns);

router.post('/admin/approveCampaign', authentication.authenticate, adminController.approveCampaign);

router.post('/admin/rejectCampaign', authentication.authenticate, adminController.rejectCampaign);

router.get('/admin/getApprovedCampaigns', authentication.authenticate, adminController.getApprovedCampaigns);

router.post('/admin/terminateCampaign', authentication.authenticate, adminController.terminateCampaign);


module.exports = router;