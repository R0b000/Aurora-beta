import { uploadImageToCloudinary } from '../utils/image.util.js';

export async function uploadFile(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const result = await uploadImageToCloudinary(req.file.path, '');
        return res.status(200).json({
            success: true,
            data: {
                public_id: result.public_id,
                secure_url: result.secure_url,
            },
        });
    } catch (err) {
        next(err);
    }
}
