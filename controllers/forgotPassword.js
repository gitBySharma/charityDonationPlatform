require('dotenv').config();

const uuid = require('uuid');
const brevo = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');

const DonorUser = require('../models/donorUser.js');
const CharityOrgUser = require('../models/charityOrgUser.js');
const Admin = require('../models/admin.js');
const ForgotPassword = require('../models/forgotPassword.js');


const defaultClient = brevo.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['api-key'];
ApiKeyAuth.apiKey = process.env.FORGOT_PASSWORD_API_KEY;



exports.forgotPassword = async (req, res, next) => {
    try {
        const { email, userType } = req.body;
        let user, userIdField;

        // Finding the user based on the userType
        if (userType === 'donor') {
            user = await DonorUser.findOne({ where: { email } });
            userIdField = 'donorUserId';

        } else if (userType === 'charityOrg') {
            user = await CharityOrgUser.findOne({ where: { email } });
            userIdField = 'charityOrgUserId';

        } else if (userType === 'admin') {
            user = await Admin.findOne({ where: { email } });
            userIdField = 'adminId';
        }

        if (user) {
            const id = uuid.v4();

            // Creating a forgot password request with the user-specific foreign key
            await ForgotPassword.create({
                id,
                active: true,
                [userIdField]: user.id
            });

            // Configure email data
            const apiInstance = new brevo.TransactionalEmailsApi();
            const sender = {
                email: "subhankarsharma24@gmail.com",
                name: "Charity Connect Support",
            };
            const receiver = [{ email: user.email }];

            // Send reset password email with the reset link
            await apiInstance.sendTransacEmail({
                sender,
                to: receiver,
                subject: "Reset Password",
                htmlContent: `<a href="${process.env.WEBSITE}/password/resetPassword/${id}">Reset password</a>`
            });

            return res.status(200).json({ message: "Password reset link sent to your email", success: true });

        } else {
            return res.status(404).json({ message: "User not found", success: false });

        }
    } catch (error) {
        console.log("Error during forgot password process:", error);
        return res.status(500).json({ message: "Internal server error, please try again" });
    }
};



exports.resetPassword = async (req, res, next) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id, active: true } });

        if (forgotPasswordRequest) {
            await forgotPasswordRequest.update({ active: false });

            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #f8f9fa;
                        }
                        .form-container {
                            background: white;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            width: 100%;
                            max-width: 400px;
                        }
                        h2 {
                            margin-bottom: 1.5rem;
                            color: #2d465e;
                        }
                        small {
                            display: block;
                            margin-top: 0.5rem;
                            color: #6c757d;
                        }
                    </style>
                </head>
                <body>
                    <div class="form-container">
                        <h2>Reset Your Password</h2>
                        <form action="/password/updatePassword/${id}" method="post">
                            <div class="mb-3">
                                <label for="newPassword" class="form-label">Enter New Password</label>
                                <input name="newPassword" type="password" class="form-control" id="newPassword" required>
                                <small>Minimum 8 characters long and must contain at least one number.</small>
                            </div>
                            <button type="submit" class="btn btn-secondary w-100">Reset Password</button>
                        </form>
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
                </body>
                </html>
            `);

        } else {
            return res.status(400).json({ message: "Invalid or expired reset link", success: false });

        }
    } catch (error) {
        console.log("Error during reset password process:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};


exports.updatePassword = async (req, res, next) => {
    try {
        const id = req.params.id;
        const resetPasswordRequest = await ForgotPassword.findOne({ where: { id, active: false } });

        if (resetPasswordRequest) {
            let user;

            // Check which user type the request was for
            if (resetPasswordRequest.donorUserId) {
                user = await DonorUser.findOne({ where: { id: resetPasswordRequest.donorUserId } });

            } else if (resetPasswordRequest.charityOrgUserId) {
                user = await CharityOrgUser.findOne({ where: { id: resetPasswordRequest.charityOrgUserId } });

            } else if (resetPasswordRequest.adminId) {
                user = await Admin.findOne({ where: { id: resetPasswordRequest.adminId } });
            }

            if (user) {
                // Hash the new password
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                await user.update({ password: hashedPassword });

                res.status(201).send(`
                    <html>
                    <head>
                        <title>Password Updated</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background-color: #f0f0f0;
                            }
                            .message {
                                background-color: #d4edda;
                                border-color: #c3e6cb;
                                color: #155724;
                                padding: 20px;
                                border-radius: 5px;
                                text-align: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="message">
                            <h2>Password successfully updated.</h2>
                            <p>Log into your CharityConnect account again.</p>
                        </div>
                    </body>
                    <script>
                            document.addEventListener('DOMContentLoaded', () => {
                                setTimeout(() => {
                                    window.location.href = "${process.env.WEBSITE}";
                                }, 3000);
                            });
                    </script>
                    </html>
                `);
            } else {
                return res.status(404).json({ message: "User not found", success: false });

            }
        } else {
            return res.status(400).json({ message: "Invalid or expired password reset request", success: false });

        }
    } catch (error) {
        console.log("Error updating password:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
