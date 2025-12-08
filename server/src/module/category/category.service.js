const cloudinarySvc = require("../../services/cloudinary.service");
const CategoryModel = require("./category.model");

class CategoryService {
    transformedCategoryData = async (req) => {
        try {
            let data = req.body;

            if (!data.slug) {
                data.slug = data.name.toLowerCase();
            } else {
                data.slug = data.slug.toLowerCase();
            };

            if (req.file) {
                data.image = await cloudinarySvc.uploadFile(req.file.path, '/Category')
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    updateTransformCategoryData = async (req) => {
        try {
            let data = req.body;

            data.slug = data.name.toLowerCase();

            if (req.file) {
                data.image = await cloudinarySvc.uploadFile(req.file.path, '/Category')
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    saveCategory = async (data) => {
        try {
            const categoryDetais = new CategoryModel(data);
            return await categoryDetais.save();
        } catch (error) {
            throw error
        }
    }

    listCategory = async (data) => {
        const categoryList = await CategoryModel.find(data);
        const total = await CategoryModel.countDocuments(data);

        return {
            categoryList, options: {
                total: total
            }
        }
    }

    getCategoryById = async (data) => {
        const categoryDetails = await CategoryModel.findById(data);
        return categoryDetails
    }

    deleteCategory = async (data) => {
        const deleteCategoryDetails = await CategoryModel.findByIdAndDelete(data);
        return deleteCategoryDetails
    }

    saveUpdatedCategory = async (data, filter) => {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(data, filter, { new: true })
        return updatedCategory;
    }
}

const categorySvc = new CategoryService();

module.exports = categorySvc