const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ForgotPassword = sequelize.define('forgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },

    active: Sequelize.BOOLEAN,
    donorUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    charityOrgUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    adminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    }
});

module.exports = ForgotPassword;