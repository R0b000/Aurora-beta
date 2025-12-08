const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = './public/asset';

        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true })
        }

        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + "-" + file.originalname
        cb(null, fileName);
    }
})

const uploader = (type = 'image') => {
    let limit = 3e6;
    let allowedExt = [
        "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif", "svg", "heic", "heif", "avif"
    ];

    if(type === 'doc') {
        allowedExt = ["pdf", "doc", "docx", "txt", "rtf", "odt", "xls", "xlsx", "csv", "ppt", "pptx", "ods", "odp"];
        limit = 5e6
    }

    const fileFilter = (req, file, cb) => {
        const fileExt = file.originalname.split('.').pop();

        if(allowedExt.includes(fileExt.toLowerCase())){
            cb(null, true);
        } else {
            cb({
                code: 422, 
                status: "Invalid Extension Detected",
                message: "Try different file extension"
            })
        }
    }

    return(
        multer({
            storage: storage, 
            fileFilter: fileFilter,
            limits: {
                fileSize: limit
            }
        })
    )
}

module.exports = uploader;