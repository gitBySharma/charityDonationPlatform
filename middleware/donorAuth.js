const jwt = require("jsonwebtoken");
const DonorUser = require("../models/donorUser.js");
require('dotenv').config();

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (token) {
            const user = await jwt.verify(token, process.env.JWT_SECRET);
            await DonorUser.findByPk(user.userId)
                .then((user) => {
                    req.user = user;
                    next();
                })
                .catch((error) => {
                    console.log(error);
                    res.status(401).json({ message: 'Invalid token' });
                });

        } else {
            res.status(401).json({ message: "Authentication failed" });

        }

    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Authentication failed" });
    }
};