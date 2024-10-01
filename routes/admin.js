const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.js');


router.post('/admin/signUp', adminController.adminSignup);

router.post('/admin/login', adminController.adminLogin);


module.exports = router;