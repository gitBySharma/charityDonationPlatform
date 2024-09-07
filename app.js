require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const sequelize = require('./util/database.js');

const DonorUser = require("./models/donorUser.js");
const CharityOrgUser = require("./models/charityOrgUser.js");

const donorUserRoutes = require('./routes/donorUser.js');
const charityOrgUserRoutes = require('./routes/charityOrgUser.js');

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


sequelize.sync().
    then((result) => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }).catch((err) => {
        console.log(err);
    });