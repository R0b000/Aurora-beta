const cloudinary = require('cloudinary').v2;
const { cloudinaryConfig } = require('../config/const.config');
const { deleteFile } = require('../utility/helper');

class CloudinaryService {
    constructor() {
        try {
            cloudinary.config({
                cloud_name: cloudinaryConfig.cloud_name,
                api_key: cloudinaryConfig.api_key,
                api_secret: cloudinaryConfig.api_secret
            });
        } catch (error) {
            throw error
        }
    }

    uploadAvatar = async (filePath, dir = '') => {
        try {
            const { public_id, secure_url } = await cloudinary.uploader.upload(filePath, {
                folder: `mern/e-commerce/${dir}`,
                unique_filename: true,
                overwrite: true
            })

            const optimizedUrl = cloudinary.url(public_id, {
                transformation: [
                    { gravity: "face", height: 200, width: 200, crop: "thumb" },
                    { radius: "max" },
                    { fetch_format: "auto" }
                ]
            })

            deleteFile(filePath)

            return ({
                public_id,
                secure_url,
                optimizedUrl
            })
        } catch (error) {
            throw error
        }
    }

    uploadFile = async (filePath, dir = '') => {
        try {
            const { public_id, secure_url } = await cloudinary.uploader.upload(filePath, {
                folder: `mern/e-commerce/${dir}`,
                unique_filename: true,
                overwrite: true
            })

            deleteFile(filePath);

            return ({
                public_id,
                secure_url
            })
        } catch (error) {
            throw {
                code: 400,
                status: "Failed Uploading",
                message: "Due to some reason uploading failed"
            }
        }

    }
}

const cloudinarySvc = new CloudinaryService

module.exports = cloudinarySvc;