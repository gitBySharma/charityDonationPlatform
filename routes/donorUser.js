const express = require('express');
const router = express.Router();

const donorUserController = require('../controllers/donorUser.js');


router.post('/donor/signUp', donorUserController.donorUserSignup);

router.post('/donor/login', donorUserController.donorUserLogin);


module.exports = router;