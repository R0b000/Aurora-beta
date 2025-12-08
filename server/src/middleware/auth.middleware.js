const { appConfig, userRoles } = require("../config/const.config");
const authSvc = require("../module/auth/auth.service");
const jwt = require('jsonwebtoken')

const auth = (allowedRoles = null) => {
    return async (req, res, next) => {
        let token = req.headers['authorization'] || null
        
        if (!token) {
            throw {
                status: 401,
                message: "Token expected.",
            }
        }

        token = token.split(' ').pop();

        //Checking if the token is valid or not
        const sessionDetail = await authSvc.getSessionDataUsingToken({
            "actualToken.maskedToken": token
        });

        if (!sessionDetail) {
            throw {
                code: 422,
                status: "Token Expected",
                message: "Token Exptected, Try again"
            }
        }

        //Verifiying the jwt token 
        const payload = jwt.verify(sessionDetail.actualToken.actualToken, appConfig.web_token);

        if(payload.type !== 'Bearer') {
            throw {
                code: 403, 
                status: "Invalid token",
                message: "Token invalid, Access token expected"
            }
        }

        const userDetails = await authSvc.getSingleById({
            '_id': payload.sub
        })

        if(!userDetails) {
            throw {
                code: 402, 
                status: "Account Not Found", 
                message: "Unable to find the account"
            }
        }

        if(allowedRoles === null || allowedRoles === userRoles.ADMIN || allowedRoles.includes(userDetails.role)) {
            req.loggedInUser = authSvc.getMyProfile(userDetails);
            next(); 
        } else {
            throw {
                code: 422, 
                status: "Access Denied",
                message: "You are not authorized to access."
            }
        }
    }
}

module.exports = auth