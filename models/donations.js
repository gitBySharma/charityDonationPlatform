const Sequelize = require("sequelize");

const sequelize = require("../util/database.js");
const { type } = require("os");

const Donation = sequelize.define('donations', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    }

});

module.exports = Donation;