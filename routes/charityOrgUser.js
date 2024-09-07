const express = require('express');
const router = express.Router();

const charityOrgUserController = require('../controllers/charityOrgUser.js');


router.post('/organization/signUp', charityOrgUserController.charityOrgUserSignup);

router.post('/organization/login', charityOrgUserController.charityOrgUserLogin);


module.exports = router;