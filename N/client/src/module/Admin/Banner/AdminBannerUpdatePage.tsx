import { Input, Select, DatePicker, InputNumber } from "antd";
import { useCallback, useEffect, useState } from "react";
import { BannerType, BannerValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import adminSvc from "../../../service/admin.service";
import dayjs from 'dayjs'
import { ImSpinner9 } from "react-icons/im";
import FileUpload from "../../../components/ui/FileUpload";

const AdminBannerUpdatePage = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

    const { handleSubmit, control, formState: { errors, dirtyFields, isSubmitting }, setValue, getValues } = useForm({
        defaultValues: {
            title: '',
            type: BannerType.Homepage,
            startAt: dayjs(),
            endAt: dayjs(),
            isActive: true,
            priority: 0
        },
        resolver: yupResolver(BannerValidationDTO)
    })

    const fetchBannerDetails = useCallback(async (bannerId: string) => {
        try {
            const bannerDetails = await adminSvc.bannerDetailsById(bannerId);
            setValue('title', bannerDetails.title)
            setValue('type', bannerDetails.type)
            setValue('startAt', dayjs(bannerDetails.startAt))
            setValue('endAt', dayjs(bannerDetails.endAt))
            setValue('isActive', bannerDetails.isActive)
            setValue('priority', bannerDetails.priority)
            if (bannerDetails.image?.secure_url) {
                setUploadedFiles([{
                    id: 'existing-banner',
                    file: new File([], bannerDetails.image.public_id || 'banner-image'),
                    preview: bannerDetails.image.secure_url,
                    progress: 100,
                    status: 'done',
                    public_id: bannerDetails.image.public_id,
                    secure_url: bannerDetails.image.secure_url,
                }])
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (id) {
            fetchBannerDetails(id)
        }
    }, [id, fetchBannerDetails])

    const onSubmit = async (bannerId: string | undefined) => {
        try {
            if (!bannerId) return;

            const payload: any = {}
            const allValues = getValues();

            if (allValues.title) payload.title = allValues.title
            if (allValues.type) payload.type = allValues.type
            if (allValues.startAt) payload.startAt = dayjs(allValues.startAt).toISOString()
            if (allValues.endAt) payload.endAt = dayjs(allValues.endAt).toISOString()

            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            await adminSvc.updateBannerById(payload, bannerId)
            navigate('/admin/banner')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    return (
        <>
            {!isLoading &&
                <>
                    <p className="flex text-sm w-full md:text-base">
                        Update Banner
                    </p>
                    <form onSubmit={handleSubmit(() => onSubmit(id))} className="flex w-full h-auto md:mt-3">
                        <div className="flex flex-col gap-5 w-full h-auto">
                            <div className="flex flex-col w-full justify-center">
                                <div className='flex flex-col relative h-[9vh] shink-0'>
                                    <Controller
                                        name='title'
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                style={{ height: '45px' }}
                                                placeholder="Enter the title of banner."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.title?.message}
                                    </div>
                                </div>
                                <div className='flex relative h-[9vh] md:gap-5 w-full shrink-0 justify-between'>
                                    <div className="flex flex-col relative w-full">
                                        <Controller
                                            name='startAt'
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    placeholder="Start Date"
                                                    className="w-full h-[5vh]"
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.startAt?.message}
                                        </div>
                                    </div>
                                    <div className="flex w-full">
                                        <Controller
                                            name='endAt'
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    placeholder="End Date"
                                                    className="w-full h-[5vh]"
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 right-1 text-red-500/90 text-shadow-lg text-sm'>
                                            {errors.endAt?.message}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[9vh] shirnk-0'>
                                    <p className="text-sm md:text-base px-2">Banner Type</p>
                                    <Controller
                                        name='type'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                className="w-full"
                                                style={{ height: '45px' }}
                                                defaultValue={'homepage'}
                                                options={[
                                                    { value: BannerType.Homepage, label: 'Homepage' },
                                                    { value: BannerType.Category, label: 'Category' },
                                                ]}
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.type?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[9vh] shrink-0 w-full'>
                                    <p className="text-sm md:text-base px-2">Banner Priority</p>
                                    <Controller
                                        name='priority'
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                                placeholder="Enter the priority."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.priority?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[9vh] shink-0'>
                                    <p className="text-sm md:text-base px-2">Banner Active</p>
                                    <Controller
                                        name='isActive'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                className="w-full"
                                                style={{ height: '45px' }}
                                                options={[
                                                    { value: true, label: 'True' },
                                                    { value: false, label: "False" },
                                                ]}
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.isActive?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[13vh] lg:h-[16vh]'>
                                    <p className="text-sm md:text-base px-2">Banner Picture</p>
                                    <FileUpload
                                        accept="image/*"
                                        multiple={false}
                                        maxFiles={1}
                                        maxSizeMB={5}
                                        uploadUrl="/api/upload"
                                        folder="Banner"
                                        value={uploadedFiles}
                                        onChange={setUploadedFiles}
                                        label="Upload Banner Image"
                                        helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col w-full gap-4">
                                {!isSubmitting &&
                                    <button type="submit" className="flex w-full bg-green-950 cursor-pointer text-white header-title items-center justify-center rounded-md h-[6vh]">
                                        UPDATE BANNER
                                    </button>
                                }
                                {isSubmitting &&
                                    < div className="flex w-full bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                        <ImSpinner9 className="animate-spin" />
                                    </div>
                                }
                                <button onClick={() => navigate('/admin/category')} className="flex w-full cursor-pointer bg-gray-500 h-[6vh] text-white header-title items-center justify-center rounded-md">
                                    CANCEL UPDATE
                                </button>
                            </div>
                        </div>
                    </form>
                </>
            }
        </>
    )
}

export default AdminBannerUpdatePage
