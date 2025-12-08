const { string } = require('joi');
const mongoose = require('mongoose');

const ActivationSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    actualToken: {
        actualToken: String, 
        maskedToken: String,
    },
    refreshToken: {
        actualToken: String, 
        maskedToken: String,
    },
    otherData: String,
}, {
    autoIndex: true, 
    autoIndex: true,
})  

const ActivationSessionModel = new mongoose.model("ActivationSession", ActivationSessionSchema);

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    actualToken: {
        actualToken: String, 
        maskedToken: String,
    },
    refreshToken: {
        actualToken: String, 
        maskedToken: String,
    },
    otherData: String,
}, {
    autoIndex: true, 
    autoIndex: true,
})  

const SessionModel = new mongoose.model("Session", SessionSchema);

const ForgetPasswordSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    actualToken: {
        actualToken: String, 
        maskedToken: String,
    },
    refreshToken: {
        actualToken: String, 
        maskedToken: String,
    },
    otherData: String,
}, {
    autoIndex: true, 
    autoIndex: true,
})  

const ForgetPasswordSessionModel = new mongoose.model("ForgetPasswordSession", ForgetPasswordSessionSchema);

module.exports = {
    ActivationSessionModel,
    SessionModel,
    ForgetPasswordSessionModel,
}