const productSvc = require("../product/product.service");
const categorySvc = require("./category.service");
const mongoose = require('mongoose')

class CategoryController {
    createCategory = async (req, res, next) => {
        try {
            const transformedData = await categorySvc.transformedCategoryData(req)

            const categoryDetails = await categorySvc.saveCategory(transformedData);

            res.json({
                data: categoryDetails,
                code: 200,
                status: "Category Created",
                message: "Category created successfully"
            })
        } catch (error) {
            throw error
        }
    }

    listCategory = async (req, res, next) => {
        try {
            let filter = {};

            let { name } = req.query

            if (name) {
                filter.name = { $regex: name, $options: 'i' }
            }

            const { categoryList, options } = await categorySvc.listCategory(filter);

            res.json({
                data: categoryList,
                code: 200,
                status: "Category List fetched",
                message: "Category List has been fetched",
                options: options
            })
        } catch (error) {
            throw error
        }
    }

    listProductByCateogoryId = async (req, res, next) => {
        try {
            const { id } = req.params

            let filter = {
                _id: id
            };

            const categoryDetails = await categorySvc.getCategoryById(filter);

            if (!categoryDetails) {
                throw {
                    code: 422,
                    status: "Invalid Id",
                    message: "Either this category is delted or doesn't exist"
                }
            }

            const productList = await productSvc.listProduct({
                category: { $in: [id] }
            });

            res.json({
                data: productList,
                code: 200,
                status: "Product list fetched",
                message: "Product details fetched successsfully"
            })


        } catch (error) {
            throw error
        }
    }

    getCategoryById = async (req, res, next) => {
        try {
            let { id } = req.params
            const userDetails = await categorySvc.getCategoryById(id)

            res.json({
                data: userDetails,
                code: 200,
                status: "Success",
                message: "Success"
            })
        } catch (error) {
            throw error
        }
    }

    deleteCategory = async (req, res, next) => {
        try {
            const { id } = req.params

            const categoryDetails = await categorySvc.getCategoryById({
                '_id': id
            })

            if (!categoryDetails) {
                throw {
                    code: 422,
                    status: "Error id",
                    message: "Either the banner is delted or invalid id"
                }
            }

            const deleteCategoryDetails = await categorySvc.deleteCategory({
                _id: id
            })

            res.json({
                data: deleteCategoryDetails,
                code: 200,
                status: "Banner Deleted Successfully",
                message: "Banner has been successfully deleted"
            })
        } catch (error) {
            throw error
        }
    }

    updateCategoryById = async (req, res, next) => {
        try {
            const { id } = req.params

            let filter = {
                _id: id
            };

            const categoryDetails = await categorySvc.getCategoryById(filter);

            if (!categoryDetails) {
                throw {
                    code: 422,
                    status: "Invalid Id",
                    message: "Either this category is delted or doesn't exist"
                }
            }

            const updateCategoryDetails = await categorySvc.updateTransformCategoryData(req);

            const updatedCategory = await categorySvc.saveUpdatedCategory(id, {$set: updateCategoryDetails});

            res.json({
                data: updatedCategory,
                code: 200,
                status: "Category updated Successfully",
                message: "Category updated Successfully"
            })
        } catch (error) {
            throw error
        }
    }
}

const categoryCtrl = new CategoryController()

module.exports = categoryCtrl;