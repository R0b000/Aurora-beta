const cloudinarySvc = require("../../services/cloudinary.service");
const CategoryModel = require("./category.model");

class CategoryService {
    transformedCategoryData = async (req) => {
        try {
            let data = req.body;

            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '-').slice(0, 19);
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-') + '-' + timestamp;

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

            if (data.name) {
                const timestamp = new Date().toISOString().replace(/[-:T.]/g, '-').slice(0, 19);
                data.slug = data.name.toLowerCase().replace(/\s+/g, '-') + '-' + timestamp;
            }

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