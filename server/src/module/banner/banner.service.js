const { object } = require("joi");
const cloudinarySvc = require("../../services/cloudinary.service");
const BannerModel = require("./banner.model");

class BannerService {
    transformedBannerData = async (req) => {
        try {
            let data = req.body;

            if (req.file) {
                data.image = await cloudinarySvc.uploadFile(req.file.path, '/Banner')
            } else {
                data.image = ''
            }

            if (data.isActive === null || data.isActive === '') {
                data.isActive = undefined
            }

            if (data.priority === null || data.priority === '') {
                data.priority = undefined
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    updatetransformBannerData = async (req, oldData) => {
        try {
            let data = req.body;

            if (data) {
                if (!data.title || data.title === '' || data.title === null) {
                    data.title = oldData.title
                }

                if (!data.subtitle || data.subtitle === '' || data.subtitle === null) {
                    data.subtitle = oldData.subtitle
                }

                if (req.file) {
                    data.image = await cloudinarySvc.uploadFile(req.file.path, '/Banner')
                } else {
                    data.image = oldData.image
                }

                if (data.isActive === null || data.isActive === '' || !data.isActive) {
                    data.isActive = oldData.isActive
                }

                if (data.priority === null || data.priority === '' || !data.priority) {
                    data.priority = oldData.priority
                }

                if (data.startAt === null || data.startAt === '' || !data.startAt) {
                    data.startAt = oldData.startAt
                }
                if (data.endAt === null || data.endAt === '' || !data.endAt) {
                    data.endAt = oldData.endAt
                }
            }else {
                data = oldData
            }

            return data;
        } catch (error) {
            throw error
        }
    }

    saveBanner = async (data) => {
        try {
            const bannerDetails = new BannerModel(data);
            return await bannerDetails.save();
        } catch (error) {
            throw error
        }
    }

    listAllBanners = async (data) => {
        try {
            const bannerDetails = await BannerModel.find(data);
            const total = await BannerModel.countDocuments(data);
            return {bannerDetails, options: {
                total: total
            }};
        } catch (error) {
            throw error
        }
    }

    getSingleById = async (data) => {
        try {
            const bannerDetails = await BannerModel.findById(data);
            return bannerDetails;
        } catch (error) {
            throw error
        }
    }

    updateBanner = async (filter, data) => {
        try {
            const updatedBannerDetails = await BannerModel.findByIdAndUpdate(data, filter, { new: true });
            return updatedBannerDetails;
        } catch (error) {
            throw error
        }
    }

    deleteBanner = async (data) => {
        try {
            const deletedBannerDetails = await BannerModel.findByIdAndDelete(data);
            return deletedBannerDetails;
        } catch (error) {
            throw error
        }
    }
}

const bannerSvc = new BannerService();

module.exports = bannerSvc