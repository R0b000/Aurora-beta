const nodemailer = require('nodemailer');
const { nodemailerConfig, appConfig } = require('../config/const.config');

class MailService {
    transporter = nodemailer.createTransport({
        host: nodemailerConfig.host,
        port: nodemailerConfig.port,
        secure: nodemailerConfig.secure,
        auth: {
            user: nodemailerConfig.auth.user,
            pass: nodemailerConfig.auth.pass
        }
    })

    sendMail = async (data) => {
        console.log(appConfig.activation_link, appConfig.forget_password)
        try {
            this.transporter.sendMail({
                from: '"Bijaya Kingring" <3ijayakingmagar@gmail.com>',
                to: data.email,
                subject: `Hello ${data.name}`,
                text: "Activate your account.",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9fafb; padding: 20px;">
                        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #2b6cb0;">Hello, ${data.name}👋</h2>
                            <p>Welcome to <strong>${data.name}</strong>! We’re excited to have you on board.</p>

                            <p>Before you can start using your account, please verify your email address by clicking the button below:</p>

                            <a href="${appConfig.activation_link}${data._id}" 
                                style="display: inline-block; cursor: 'pointer'; padding: 12px 20px; background-color: #2b6cb0; color: white; border-radius: 5px; text-decoration: none; font-weight: bold;">
                                Activate My Account
                            </a>

                            <p style="margin-top: 20px;">If the button doesn’t work, you can also copy and paste the following link into your browser:</p>
                            <p style="color: #2b6cb0; word-break: break-all;">${appConfig.activation_link}${data._id}</p>

                            <hr style="margin: 25px 0;">
                            <p style="font-size: 14px; color: #666;">
                                If you didn’t create this account, you can safely ignore this email.
                            </p>

                            <p style="font-size: 14px; color: #999;">
                                Best regards,<br>
                                The <strong>Aurora</strong> Team
                            </p>
                        </div>
                    </div>
                `
            })
        } catch (error) {
            throw error
        }
    }

    forgetPassword = async (data) => {
        try {
            this.transporter.sendMail({
                from: "Comapny name",
                to: data.email,
                subject: "use the link to reset your password",
                text: "Rest your password",
                html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                            <div style="max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <div style="background-color: #007bff; color: white; padding: 15px 30px; text-align: center;">
                                <h2 style="margin: 0;">Password Reset Request</h2>
                            </div>
                            <div style="padding: 30px; color: #333;">
                                <p>Hi ${data.name || "User"},</p>
                                <p>We received a request to reset your password for your <b>Company Name</b> account.</p>
                                <p>Please click the button below to reset your password:</p>

                                <div style="text-align: center; margin: 30px 0;">
                                <a href="${data.resetLink}${data._id}" 
                                    style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; display: inline-block;">
                                    Reset Password
                                </a>
                                </div>

                                <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
                                <p style="word-wrap: break-word; color: #007bff;">${data.resetLink}${data._id}</p>

                                <p>If you didn’t request a password reset, please ignore this email. Your account will remain secure.</p>
                                <p>Thank you,<br>The Aurora Team</p>
                            </div>
                            <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                                © ${new Date().getFullYear()} Company Name. All rights reserved.
                            </div>
                            </div>
                        </div>
                    `
            })
        } catch (error) {
            throw error
        }
    }
}

const MailSvc = new MailService();

module.exports = MailSvc