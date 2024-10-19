const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.js');
const authentication = require("../middleware/adminAuth.js");


router.post('/admin/signUp', adminController.adminSignup);

router.post('/admin/login', adminController.adminLogin);

router.get('/admin/getUnapprovedCampaigns', authentication.authenticate, adminController.getUnapprovedCampaigns);


module.exports = router;