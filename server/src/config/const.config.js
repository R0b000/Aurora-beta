require('dotenv').config();

const userRoles = {
    ADMIN: 'admin',
    SELLER: 'seller',
    CUSTOMER: 'customer'
};

const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}

const nodemailerConfig = {
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: process.env.NODEMAILER_SECURE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD
    }
}

const mongooseConfig = {
    url: process.env.MONGOOSE_URL,
    dbName: process.env.MONGOOSE_DBNAME
}

const appConfig = {
    web_token: process.env.JSON_WEB_TOKEN,
    activation_token: process.env.JSON_ACTIVATION_TOKEN,
    forget_password_token: process.env.JSON_FORGET_PASSWORD_TOKEN,
    activation_link: process.env.ACTIVITION_LINK,
    forget_password: process.env.FORGET_PASSWORD_LINK
}

const khaltiConfig = {
    key : process.env.KHALTI_SECRET_KEY,
    url : process.env.URL
}

module.exports = {
    userRoles,
    cloudinaryConfig,
    nodemailerConfig,
    mongooseConfig,
    appConfig,
    khaltiConfig
}