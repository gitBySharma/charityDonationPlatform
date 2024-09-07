const Sequelize = require("sequelize");

const sequelize = require("../util/database.js");
const { type } = require("os");

const CharityOrgUser = sequelize.define('charityOrgUser', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    goal: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = CharityOrgUser;