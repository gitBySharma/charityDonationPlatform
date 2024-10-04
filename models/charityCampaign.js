const Sequelize = require("sequelize");

const sequelize = require("../util/database.js");
const { type } = require("os");

const Campaign = sequelize.define('campaign', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    campaignName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    campaignCategory: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    campaignDescription: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    campaignLocation: {
        type: Sequelize.STRING,
        allowNull: false
    },
    campaignGoal: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    campaignStartDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    campaignEndDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    campaignImage: {
        type: Sequelize.JSON,
    },
    fundRaised: {
        type: Sequelize.INTEGER
    },
    approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Campaign;