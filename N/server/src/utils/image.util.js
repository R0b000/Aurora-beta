import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

const ensureTempDir = async () => {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
};

export const uploadImageToCloudinary = async (filePath, dir = '') => {
    await ensureTempDir();

    const originalFileName = path.basename(filePath);
    const webpFileName = `${uuidv4()}-${originalFileName.replace(/\.[^/.]+$/, '')}.webp`;
    const webpPath = path.join(TEMP_DIR, webpFileName);

    try {
        await sharp(filePath)
            .webp({ quality: 80 })
            .toFile(webpPath);

        const result = await cloudinary.uploader.upload(webpPath, {
            folder: `mern/e-commerce/${dir}`,
            resource_type: 'image',
            format: 'webp',
        });

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
        };
    } catch (error) {
        console.error('Error in uploadImageToCloudinary:', error);
        throw new Error('Failed to process and upload image');
    } finally {
        await fs.unlink(filePath).catch(() => {});
        await fs.unlink(webpPath).catch(() => {});
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
};
