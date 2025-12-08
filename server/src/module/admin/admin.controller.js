const adminSvc = require("./admin.server");

class AdminController {
    listUsers = async (req, res, next) => {
        try {
            const { role } = req.query
            let filter = {}

            if (role) {
                filter = {
                    "role": role
                }
            }

            filter.role = {$ne: 'admin'}

            const {userList, options} = await adminSvc.getAllUsers(filter);

            res.json({
                data: (userList.length === 0) ? "No User found" : userList,
                code: 200,
                status: "User fetched successfully",
                message: "All user fetched successfully.",
                options: options
            })
        } catch (error) {
            throw error
        }
    }
    
    getUserById = async (req, res, next) => {
        try {
            const {id} = req.params;

            const userDetails = await adminSvc.getUserById({
                "_id": id
            })

            if(!userDetails) {
                throw {
                    data: "No User Found",
                    code: 422, 
                    status: "Error Id",
                    message: "User had been deleted or error occured"
                }
            }

            res.json({
                data: userDetails,
                code: 200, 
                status: "User fetched successfully",
                message: "User details has been fetched successfully"
            })
        } catch (error) {
            throw error
        }
    }

    updateUserById = async(req, res, next) => {
        try {
            let ban = req.body.isBan
            let {id} = req.params;

            const updatedUserDetails = await adminSvc.updateUserById({
                "isBan": ban
            }, {
                "_id": id
            })

            res.json({
                data: updatedUserDetails, 
                code: 200, 
                status: "User updated successfully",
                message: "User details has been updated successfully"
            })
        } catch (error) {
            throw error
        }
    }

    deleteUserById = async (req, res, next) => {
        try {
            const {id} = req.params;

            const userDetails = await adminSvc.deleteUserById({
                "_id": id
            })

            res.json({
                data: userDetails, 
                status: "User Deleted",
                code: 200, 
                message: "User successfully deleted",
            })
        } catch (error) {
            throw error
        }
    }
}

const adminCtrl = new AdminController()

module.exports = adminCtrl