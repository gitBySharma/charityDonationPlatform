const express = require('express');
const router = express.Router();
const passwordController = require("../controllers/forgotPassword.js");



router.post('/password/forgotPassword', passwordController.forgotPassword);

router.get('/password/resetPassword/:id', passwordController.resetPassword);

router.post('/password/updatePassword/:id', passwordController.updatePassword);



module.exports = router;
