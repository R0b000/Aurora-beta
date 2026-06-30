import * as categoryRepo from '../repositories/category.repository.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

export async function createCategory(req, res, next) {
    try {
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const name = req.body.name;
        const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

        const category = await categoryRepo.create({
            name: name,
            slug: slug,
            description: req.body.description || null,
            image_url: image_url,
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

        let image_url = existing.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        let slug = existing.slug;
        if (req.body.name && req.body.name !== existing.name) {
            slug = req.body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        }

        await categoryRepo.update(req.params.id, {
            name: req.body.name || existing.name,
            slug: slug,
            description: req.body.description || existing.description,
            image_url: image_url,
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
