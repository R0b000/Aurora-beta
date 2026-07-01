import * as categoryRepo from '../repositories/category.repository.js';
import { deleteFromCloudinary } from '../utils/image.util.js';

export async function createCategory(req, res, next) {
    try {
        const { name, description, image_url, public_id } = req.body;

        const category = await categoryRepo.create({
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            description: description || null,
            image_url: image_url || null,
            public_id: public_id || null,
            parent_id: null
        });

        return res.status(201).json({
            success: true,
            code: 200,
            status: 'Category Created',
            message: 'Category created successfully',
            data: category
        });
    } catch (err) {
        if (req.body.public_id) {
            await deleteFromCloudinary(req.body.public_id).catch(() => {});
        }
        next(err);
    }
}

export async function listCategory(req, res, next) {
    try {
        const { name } = req.query;
        let categories = await categoryRepo.findAll();

        if (name) {
            categories = categories.filter(c => c.name.toLowerCase().includes(String(name).toLowerCase()));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const total = categories.length;

        return res.json({
            success: true,
            message: 'Category List fetched',
            data: categories,
            options: { page, limit, total }
        });
    } catch (err) {
        next(err);
    }
}

export async function getCategoryById(req, res, next) {
    try {
        const category = await categoryRepo.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Invalid Id',
                message: 'Category not found'
            });
        }
        return res.json({
            success: true,
            code: 200,
            status: 'Success',
            message: 'Success',
            data: category
        });
    } catch (err) {
        next(err);
    }
}

export async function updateCategory(req, res, next) {
    try {
        const existing = await categoryRepo.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Invalid Id',
                message: 'Category not found'
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

        let slug = existing.slug;
        if (req.body.name && req.body.name !== existing.name) {
            slug = req.body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        }

        await categoryRepo.update(req.params.id, {
            name: req.body.name || existing.name,
            slug: slug,
            description: req.body.description ?? existing.description,
            image_url,
            public_id: newPublicId,
            parent_id: existing.parent_id,
            is_active: existing.is_active
        });

        const updated = await categoryRepo.findById(req.params.id);
        return res.json({
            success: true,
            code: 200,
            status: 'Category updated Successfully',
            message: 'Category updated Successfully',
            data: updated
        });
    } catch (err) {
        if (req.body.public_id) {
            await deleteFromCloudinary(req.body.public_id).catch(() => {});
        }
        next(err);
    }
}

export async function deleteCategory(req, res, next) {
    try {
        const existing = await categoryRepo.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                code: 422,
                status: 'Error id',
                message: 'Category not found or already deleted'
            });
        }

        if (existing.image?.public_id) {
            await deleteFromCloudinary(existing.image.public_id).catch(() => {});
        }

        await categoryRepo.remove(req.params.id);
        return res.json({
            success: true,
            code: 200,
            status: 'Category Deleted Successfully',
            message: 'Category has been successfully deleted',
            data: existing
        });
    } catch (err) {
        next(err);
    }
}
