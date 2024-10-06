const express = require('express');
const router = express.Router();


const donorController = require('../controllers/donor.js');
const authentication = require("../middleware/donorAuth.js");


router.get('/donors/getCampaigns', authentication.authenticate, donorController.getCampaigns);

router.post('/donors/donate/', authentication.authenticate, donorController.donate);

router.post('/donor/updateTransactionStatus', authentication.authenticate, donorController.updateTransactionStatus);


module.exports = router;