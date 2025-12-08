const { appConfig } = require("../../config/const.config")
const MailSvc = require("../../services/nodemailer.service")
const { randomNumberGeneration } = require("../../utility/helper")
const authSvc = require("./auth.service")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const UserModel = require("../user/user.model")

class AuthController {
    checkEmail = async (req, res, next) => {
        const email = req.query.email;

        try {
            const response = await UserModel.findOne({
                email: email
            })

            if (response) {
                return res.json({
                    code: 404,
                    message: "Email already exists",
                    status: "Email duplication"
                })
            } else {
                return res.json({
                    code: 200,
                    status: "Email available",
                    message: "Email is available for registration",
                    options: null
                })
            }
        } catch (error) {
            throw error
        }
    }

    registerUser = async (req, res, next) => {
        try {
            const transformedData = await authSvc.transformRegisterDetails(req)
            const data = await authSvc.registerUser(transformedData)
            await MailSvc.sendMail(data)

            const actualToken = jwt.sign({ sub: data._id, type: "Bearer" }, appConfig.activation_token, { expiresIn: '15min' })
            const refreshToken = jwt.sign({ sub: data._id, type: "Refresh" }, appConfig.activation_token, { expiresIn: '15min' })

            const activationSessionData = {
                userId: data._id,
                actualToken: {
                    actualToken: actualToken,
                    maskedToken: randomNumberGeneration(150)
                },
                refreshToken: {
                    actualToken: refreshToken,
                    maskedToken: randomNumberGeneration(150)
                },
                sessionData: JSON.stringify({
                    device: 'web'
                })
            };

            await authSvc.storeUserActivationSession(activationSessionData)

            res.json({
                data: data,
                code: 200,
                status: 'Successfully registered',
                message: "Thank you for register now activate your account from the email.",
                options: {
                    actualToken: activationSessionData.actualToken.maskedToken,
                    refreshToken: activationSessionData.refreshToken.maskedToken,
                }
            })
        } catch (error) {
            throw error
        }
    }
    activateUser = async (req, res, next) => {
        try {
            const userDetails = await authSvc.getSingleByFilter(req);

            if (!userDetails) {
                throw {
                    code: 404,
                    status: "Error Activation",
                    message: "Error finding your account. Try to create your account again."
                }
            };

            const userToken = await authSvc.getTokenByFilter(req);

            if (!userToken) {
                throw {
                    code: 404,
                    status: "Token Failure",
                    message: "Token missing please try again"
                }
            }

            let decodedToken;
            try {
                decodedToken = jwt.verify(
                    userToken.actualToken.actualToken,
                    appConfig.activation_token
                );
            } catch (err) {
                return res.status(400).json({
                    code: 400,
                    status: "Token Expired",
                    message: "Token expired or invalid, please try activation again."
                });
            }

            const updatedUserDetails = await authSvc.activateUser(
                { isVerified: true },
                { _id: userToken.userId }
            );

            res.json({
                data: updatedUserDetails,
                code: 200,
                status: 'Successfully activated the account',
                message: "Thank you for activating your account. Welocome!!",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
    loginUser = async (req, res, next) => {
        try {
            const userDetails = await authSvc.getUserDataFromEmail(req);

            if (!userDetails) {
                throw {
                    code: 422,
                    status: "No data",
                    message: "This account is either deleted or try again"
                }
            };

            if (!bcrypt.compareSync(req.body.password, userDetails.password)) {
                throw {
                    code: 422,
                    status: "Credentials error",
                    message: "Check your email or password."
                }
            }


            const actualToken = jwt.sign({ sub: userDetails._id, type: "Bearer" }, appConfig.web_token, { expiresIn: "3hr" });
            const refreshToken = jwt.sign({ sub: userDetails._id, type: "Bearer" }, appConfig.web_token, { expiresIn: "6hr" });

            const sessionData = {
                userId: userDetails._id,
                actualToken: {
                    actualToken: actualToken,
                    maskedToken: randomNumberGeneration(150)
                },
                refreshToken: {
                    actualToken: refreshToken,
                    maskedToken: randomNumberGeneration(150)
                },
                otherData: JSON.stringify({
                    device: 'web'
                })
            };

            await authSvc.storeUserSessionData(sessionData);

            res.json({
                data: {
                    actualToken: sessionData.actualToken.maskedToken,
                    refreshToken: sessionData.refreshToken.maskedToken
                },
                code: 200,
                status: 'Successful Login',
                message: "Thank you for logging in. Welocome!!",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
    refreshToken = (req, res, next) => {
        try {

            res.json({
                data: "",
                code: 200,
                status: 'Token refreshed successfully',
                message: "Token refreshed successfully. Welocome!!",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
    forgetPassword = async (req, res, next) => {
        try {
            const userDetails = await authSvc.getUserDataFromEmail(req);

            if (!userDetails) {
                throw {
                    code: 404,
                    status: "Invalid Email",
                    message: "Unable to find the email please try again"
                }
            };

            await MailSvc.forgetPassword(userDetails);

            const actualToken = jwt.sign({ sub: userDetails._id }, appConfig.forget_password_token, { expiresIn: '15min' })
            const refreshToken = jwt.sign({ sub: userDetails._id }, appConfig.forget_password_token, { expiresIn: '15min' });

            const forgetPasswordSessionData = {
                userId: userDetails._id,
                actualToken: {
                    actualToken: actualToken,
                    refreshToken: randomNumberGeneration(150)
                },
                refreshToken: {
                    actualToken: refreshToken,
                    refreshToken: randomNumberGeneration(150)
                },
                otherData: JSON.stringify({
                    device: "web"
                })
            }

            await authSvc.storeForgetPasswordSessionModel(forgetPasswordSessionData)

            res.json({
                data: userDetails,
                code: 200,
                status: 'Forget Password',
                message: "Check the email to reset the password",
                options: {
                    actualToken: forgetPasswordSessionData.actualToken.maskedToken,
                    refreshToken: forgetPasswordSessionData.refreshToken.maskedToken
                }
            })
        } catch (error) {
            throw error
        }
    }
    resetPassword = async (req, res, next) => {
        try {
            let newPassword = req.body.newPassword

            newPassword = bcrypt.hashSync(newPassword, 12)

            const updatedUserDetails = await authSvc.resetPassword({
                password: newPassword
            }, {
                email: req.body.email
            })

            res.json({
                data: updatedUserDetails,
                code: 200,
                status: "Password Reset Successfully",
                message: "You may now re-login.",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
    getProfile = async (req, res, next) => {
        try {
            const userDetails = req.loggedInUser;
            res.json({
                data: userDetails,
                code: 200,
                status: "User Details",
                message: "Successfully feteched user details.",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
    updateProfile = (req, res, next) => {
        try {

            res.json({
                data: "",
                code: 200,
                status: "User Details Updated",
                message: "Successfully updated user details.",
                options: null
            })
        } catch (error) {
            throw error
        }
    }
};

const authCtrl = new AuthController;

module.exports = authCtrl