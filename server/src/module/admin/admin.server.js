const UserModel = require("../user/user.model")

class AdminService {
    getAllUsers = async (filter) => {
        try {
            const userList = await UserModel.find(filter);
            const total = await UserModel.countDocuments(filter);

            return {userList, options: {
                total: total
            } }
        } catch (error) {
            throw error
        }
    }
    getUserById = async (filter) => {
        try {
            const userDetails = await UserModel.findById(filter);
            return userDetails
        } catch (error) {
            throw error
        }
    }
    updateUserById = async(update, data) => {
        try {
            const userDetails = await UserModel.findByIdAndUpdate(data, update, {new: true});
            return userDetails
        } catch (error) {
            throw error
        }
    }
    deleteUserById = async (data) => {
        try {
            const userDetails = await UserModel.findByIdAndDelete(data);
            return userDetails;
        } catch (error) {
            throw error
        }
    }
}

const adminSvc = new AdminService()

module.exports = adminSvc