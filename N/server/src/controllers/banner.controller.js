import * as bannerRepo from '../repositories/banner.repository.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

export async function createBanner(req, res, next) {
    try {
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const banner = await bannerRepo.create({
            title: req.body.title,
            image_url: image_url,
            link_url: req.body.url || null,
            position: 0,
            sort_order: parseInt(req.body.priority) || 0
        });

        return res.status(201).json({
            success: true,
            code: 200,
            status: 'Banner Created',
            message: 'Banner created successfully',
            data: banner
        });
    } catch (err) {
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

        let image_url = existing.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        await bannerRepo.update(req.params.id, {
            title: req.body.title || existing.title,
            image_url: image_url,
            link_url: req.body.url || existing.link_url,
            isActive: existing.is_active,
            priority: parseInt(req.body.priority) || existing.sort_order
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
                message: 'Banner not found'
            });
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
