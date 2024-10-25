require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const sequelize = require('./util/database.js');

const DonorUser = require("./models/donorUser.js");
const CharityOrgUser = require("./models/charityOrgUser.js");
const Admin = require("./models/admin.js");
const CharityCampaign = require("./models/charityCampaign.js");
const Donations = require("./models/donations.js");
const Transactions = require("./models/transactions.js");
const ArchivedCampaign = require("./models/archivedCampaign.js");
const ForgotPassword = require("./models/forgotPassword.js");

const donorUserRoutes = require('./routes/donorUser.js');
const charityOrgUserRoutes = require('./routes/charityOrgUser.js');
const adminRoutes = require("./routes/admin.js");
const charityCampaignRoutes = require("./routes/charityCampaign.js");
const donorRoutes = require("./routes/donors.js");
const forgotPasswordRoutes = require("./routes/forgotPassword.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//middleware for base route
app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, './public', 'homePage.html'));
});


app.use(donorUserRoutes);
app.use(charityOrgUserRoutes);
app.use(adminRoutes);
app.use(charityCampaignRoutes);
app.use(donorRoutes);
app.use(forgotPasswordRoutes);


CharityOrgUser.hasMany(CharityCampaign);
CharityCampaign.belongsTo(CharityOrgUser);

CharityOrgUser.hasMany(ArchivedCampaign);
ArchivedCampaign.belongsTo(CharityOrgUser);

CharityCampaign.hasMany(Donations, { foreignKey: 'campaignId' });
Donations.belongsTo(CharityCampaign, { foreignKey: 'campaignId' });

DonorUser.hasMany(Donations);
Donations.belongsTo(DonorUser);

DonorUser.hasMany(Transactions);
Transactions.belongsTo(DonorUser);

CharityCampaign.hasMany(Transactions);
Transactions.belongsTo(CharityCampaign);

DonorUser.hasMany(ForgotPassword, { foreignKey: 'donorUserId' });
ForgotPassword.belongsTo(DonorUser, { foreignKey: 'donorUserId' });

CharityOrgUser.hasMany(ForgotPassword, { foreignKey: 'charityOrgUserId' });
ForgotPassword.belongsTo(CharityOrgUser, { foreignKey: 'charityOrgUserId' });

Admin.hasMany(ForgotPassword, { foreignKey: 'adminId' });
ForgotPassword.belongsTo(Admin, { foreignKey: 'adminId' });


sequelize.sync().
    then((result) => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }).catch((err) => {
        console.log(err);
    });