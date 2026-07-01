import * as bannerRepo from '../repositories/banner.repository.js';
import { deleteFromCloudinary } from '../utils/image.util.js';

export async function createBanner(req, res, next) {
    try {
        const { title, image_url, public_id, url, priority } = req.body;

        const banner = await bannerRepo.create({
            title: title,
            image_url: image_url || null,
            public_id: public_id || null,
            link_url: url || null,
            position: 0,
            sort_order: parseInt(priority) || 0
        });

        return res.status(201).json({
            success: true,
            code: 200,
            status: 'Banner Created',
            message: 'Banner created successfully',
            data: banner
        });
    } catch (err) {
        if (req.body.public_id) {
            await deleteFromCloudinary(req.body.public_id).catch(() => {});
        }
        next(err);
    }
}

export async function listAllBanners(req, res, next) {
    try {
        const banners = await bannerRepo.findAll();
        return res.json({
            success: true,
            message: 'Banner list fetched',
            data: banners
        });
    } catch (err) {
        next(err);
    }
}

export async function getBannerById(req, res, next) {
    try {
        const banners = await bannerRepo.findAll();
        const banner = banners.find(b => b.id == req.params.id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Invalid Id',
                message: 'Banner not found'
            });
        }
        return res.json({
            success: true,
            code: 200,
            status: 'Success',
            message: 'Success',
            data: banner
        });
    } catch (err) {
        next(err);
    }
}

export async function updateBanner(req, res, next) {
    try {
        const banners = await bannerRepo.findAll();
        const existing = banners.find(b => b.id == req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Invalid Id',
                message: 'Banner not found'
            });
        }

        let image_url = existing.image?.secure_url || null;
        let newPublicId = req.body.public_id || null;

        if (req.body.image_url) {
            image_url = req.body.image_url;
            newPublicId = req.body.public_id || null;

            if (existing.image?.public_id && existing.image.public_id !== newPublicId) {
                await deleteFromCloudinary(existing.image.public_id).catch(() => {});
            }
        }

        await bannerRepo.update(req.params.id, {
            title: req.body.title || existing.title,
            image_url,
            public_id: newPublicId,
            link_url: req.body.url || existing.link_url,
            isActive: existing.is_active,
            priority: req.body.priority !== undefined ? parseInt(req.body.priority) : existing.sort_order
        });

        const updatedBanners = await bannerRepo.findAll();
        const updated = updatedBanners.find(b => b.id == req.params.id);
        return res.json({
            success: true,
            code: 200,
            status: 'Banner updated Successfully',
            message: 'Banner updated Successfully',
            data: updated
        });
    } catch (err) {
        if (req.body.public_id) {
            await deleteFromCloudinary(req.body.public_id).catch(() => {});
        }
        next(err);
    }
}

export async function deleteBanner(req, res, next) {
    try {
        const banners = await bannerRepo.findAll();
        const existing = banners.find(b => b.id == req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Invalid Id',
                message: 'Banner not found or already deleted'
            });
        }

        if (existing.image?.public_id) {
            await deleteFromCloudinary(existing.image.public_id).catch(() => {});
        }

        await bannerRepo.remove(req.params.id);
        return res.json({
            success: true,
            code: 200,
            status: 'Banner Deleted Successfully',
            message: 'Banner has been successfully deleted',
            data: existing
        });
    } catch (err) {
        next(err);
    }
}
