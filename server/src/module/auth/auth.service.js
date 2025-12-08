const cloudinarySvc = require("../../services/cloudinary.service");
const bcrypt = require('bcryptjs');
const UserModel = require("../user/user.model");
const { ActivationSessionModel, SessionModel, ForgetPasswordSessionModel } = require("./auth.session.model");

class AuthService {
    async transformRegisterDetails(req) {
        try {
            let details = req.body

            if (req.file) {
                details.avatar = await cloudinarySvc.uploadAvatar(req.file.path, "User/");
            } else {
                details.avatar = null
            }

            details.password = bcrypt.hashSync(details.password, 12)

            return details
        } catch (error) {
            throw error
        }
    }

    registerUser = async (data) => {
        try {
            const userDetails = UserModel(data);
            return await userDetails.save();
        } catch (error) {
            throw error
        }
    }

    getUserDataFromEmail = async (req) => {
        try {
            const userDetails = await UserModel.findOne({
                "email": req.body.email
            })

            return userDetails
        } catch (error) {
            throw error
        }
    }

    getSingleByFilter = async (req) => {
        try {
            const { id } = req.params;
            const userDetails = await UserModel.findById({
                "_id": id
            });
            return userDetails
        } catch (error) {
            throw error
        }
    }

    getSingleById = async (data) => {
        try {
            const userDetails = await UserModel.findById(data);
            return userDetails
        } catch (error) {
            throw error
        }
    }

    storeUserActivationSession = async (data) => {
        try {
            const userDetails = ActivationSessionModel(data);
            return await userDetails.save();
        } catch (error) {
            throw error
        }
    }

    storeUserSessionData = async (data) => {
        try {
            const userDetails = SessionModel(data);
            return await userDetails.save();
        } catch (error) {
            throw error
        }
    }

    getTokenByFilter = async (req) => {
        try {
            const { id } = req.params;
            const userDetails = await ActivationSessionModel.findOne({
                'userId': id
            })
            return userDetails
        } catch (error) {
            throw error;
        }
    }

    activateUser = async (data, filter) => {
        try {
            const userDetails = await UserModel.findOneAndUpdate(
                filter,
                data,
                { new: true }
            )
            return userDetails
        } catch (error) {
            throw error
        }
    }

    resetPassword = async (data, filter) => {
        try {
            const userDetails = await UserModel.findOneAndUpdate(
                filter,
                data,
                { new: true }
            )
            return userDetails
        } catch (error) {
            throw error
        }
    }

    storeForgetPasswordSessionModel = async (data) => {
        try {
            const userDetails = await ForgetPasswordSessionModel(data);
            return await userDetails.save();
        } catch (error) {
            throw error
        }
    }

    getSessionDataUsingToken = async (data) => {
        try {
            const userDetails = await SessionModel.findOne(data);
            return userDetails;
        } catch (error) {
            throw error
        }
    }

    getMyProfile = (data) => {
        return {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            isVerified: data.isVerified, 
            isBan: data.isBan, 
            avatar: {
                public_id: data.avatar.public_id,
                secure_url: data.avatar.secure_url,
                optimizedUrl: data.avatar.optimizedUrl
            },
            sellerProfile: {
                companyName: data.sellerProfile.companyName,
                gstNumber: data.sellerProfile.gstNumber,
                bio: data.sellerProfile.bio,
                address: data.sellerProfile.address,
                rating: data.sellerProfile.rating,
                totalReviews: data.sellerProfile.totalReviews
            },
            addresses: data.addresses.map((items) => {
                return {
                    label: items.addresses.label,
                    fullName: items.addresses.fullName,
                    phone: items.addresses.phone,
                    line1: items.addresses.line1,
                    line2: items.addresses.line2,
                    city: items.addresses.city,
                    state: items.addresses.state,
                    postalCode: items.addresses.postalCode,
                    country: items.addresses.country,
                    isDefault: items.addresses.isDefault
                }
            }),
            favourites: data.favourites.map((items) => {
                return {

                }
            })
        }
    }
};

const authSvc = new AuthService();

module.exports = authSvc