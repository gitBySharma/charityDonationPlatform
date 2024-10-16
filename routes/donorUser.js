const express = require('express');
const router = express.Router();

const donorUserController = require('../controllers/donorUser.js');
const authentication = require("../middleware/donorAuth.js");


router.post('/donor/signUp', donorUserController.donorUserSignup);

router.post('/donor/login', donorUserController.donorUserLogin);

router.get('/donor/profile', authentication.authenticate, donorUserController.getProfileDetails);

router.put('/donorProfile/edit/', authentication.authenticate, donorUserController.editProfile);

router.post('/donorProfile/changePassword/', authentication.authenticate, donorUserController.changePassword);

router.get('/donor/viewDonations', authentication.authenticate, donorUserController.getDonationDetails);



module.exports = router;