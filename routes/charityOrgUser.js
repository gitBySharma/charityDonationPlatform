const express = require('express');
const router = express.Router();

const charityOrgUserController = require('../controllers/charityOrgUser.js');
const authentication = require("../middleware/charityOrgAuth.js");



router.post('/organization/signUp', charityOrgUserController.charityOrgUserSignup);

router.post('/organization/login', charityOrgUserController.charityOrgUserLogin);

router.get('/org/profile', authentication.authenticate, charityOrgUserController.getProfileDetails);

router.put('/charityOrgProfile/edit/', authentication.authenticate, charityOrgUserController.editProfile);

router.post('/charityOrgProfile/changePassword/', authentication.authenticate, charityOrgUserController.changePassword);


module.exports = router;