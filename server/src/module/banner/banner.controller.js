const cloudinarySvc = require("../../services/cloudinary.service");
const bannerSvc = require("./banner.service");

class BannerContoller {
    createBanner = async(req, res, next) => {
        try {
            const transformedBannerData = await bannerSvc.transformedBannerData(req) 

            const bannerDetails = await bannerSvc.saveBanner(transformedBannerData);

            res.json({
                data: bannerDetails,
                code: 200, 
                status: "Banner Created",
                message: "Banner Created"
            })
        } catch (error) {
            throw error
        }
    }  

    listAllBanners = async (req, res, next) => {
        try {
            let filter = {};

            const {title, type, priority, isActive} = req.query;

            // if(title) filter.title = {$regex: new RegExp('${title}$', 'i')}; // This is the case of exact match
            if(title) filter.title = {$regex: title, $options: 'i'};
            if(type) filter.type = type;
            if(priority) filter.priority = priority;
            if(isActive) filter.isActive = isActive;

            const {bannerDetails, options} = await bannerSvc.listAllBanners(filter);
            
            res.json({
                data: bannerDetails, 
                code: 200, 
                status: 'Banner fetched',
                message: "Banner fetched successfully",
                options: options
            })
        } catch (error) {
            throw error
        }
    }

    editBanner = async(req, res, next) => {
        try {
            let {id} = req.params

            const bannerDetails = await bannerSvc.getSingleById({
                '_id': id
            })

            if(!bannerDetails){
                throw {
                    code: 422, 
                    status: "Error id",
                    message: "Either the banner is delted or invalid id"
                }
            }

            const filter = await bannerSvc.updatetransformBannerData(req, bannerDetails)

            const updatedBannerDetails = await bannerSvc.updateBanner(filter, {
                _id: id
            });

            res.json({
                data: updatedBannerDetails,
                code: 200, 
                status: "Banner Updated Successfully",
                message: "Banner has been successfully updated"
            }) 
        } catch (error) {
            throw error
        }
    }

    deleteBanner = async (req, res, next) => {
        try {
            const {id} = req.params

            const bannerDetails = await bannerSvc.getSingleById({
                '_id': id
            })

            if(!bannerDetails){
                throw {
                    code: 422, 
                    status: "Error id",
                    message: "Either the banner is delted or invalid id"
                }
            }

            const deletedBannerDetails = await bannerSvc.deleteBanner({
                _id: id
            })

            res.json({
                data: deletedBannerDetails,
                code: 200, 
                status: "Banner Deleted Successfully",
                message: "Banner has been successfully deleted"
            })
        } catch (error) {
            throw error
        }
    }

    bannerDetailsById = async(req, res, next) => {
        try {
            let {id} = req.params
            const userDetails = await bannerSvc.getSingleById(id)

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
} 

const bannerCtrl = new BannerContoller(); 

module.exports = bannerCtrl