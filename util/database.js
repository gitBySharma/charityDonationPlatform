require('dotenv').config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize('charity-donation-platform', process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: "mysql",
    host: process.env.DB_HOST
});

module.exports = sequelize;