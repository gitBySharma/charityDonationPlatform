const express = require('express');
const router = express.Router();


const donorController = require('../controllers/donor.js');
const authentication = require("../middleware/donorAuth.js");


router.get('/donors/getCampaigns', authentication.authenticate, donorController.getCampaigns);


module.exports = router;