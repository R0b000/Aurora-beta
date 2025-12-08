const authRouter = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const uploader = require('../../middleware/uploader.middleware');
const authValidator = require('../../middleware/validation.middleware');
const authCtrl = require('./auth.controller');
const { registerValidationDTO } = require('./auth.validation');

authRouter.post('/register', uploader().single('avatar'), authValidator(registerValidationDTO), authCtrl.registerUser)
authRouter.get('/register', authCtrl.checkEmail)
authRouter.put('/activate/account/:id', authCtrl.activateUser)
authRouter.post('/login', authCtrl.loginUser)
authRouter.post('/refresh', authCtrl.refreshToken)
authRouter.post('/forget-password', authCtrl.forgetPassword)
authRouter.put('/reset-password', authCtrl.resetPassword)
authRouter.get('/me', auth(), authCtrl.getProfile)
authRouter.put('/me', auth(), authCtrl.updateProfile)

// Export the router instance (do NOT call it as a function)
module.exports = authRouter;