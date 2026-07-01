import { Input, Select, DatePicker, InputNumber } from "antd";
import { useState } from "react";
import { BannerType, BannerValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import adminSvc from "../../../service/admin.service";
import { useAppContext } from "../../../context/AppContext";
import { ImSpinner9 } from "react-icons/im";
import FileUpload from "../../../components/ui/FileUpload";

const AdminBannerCreatePage = () => {
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const { setBannerAddClick } = useAppContext();

    const { handleSubmit, control, formState: { errors, isSubmitting }, getValues } = useForm({
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

    const onSubmit = async () => {
        try {
            const allValues = getValues();

            const startAt = dayjs(allValues.startAt).toISOString();
            const endAt = dayjs(allValues.endAt).toISOString();

            const payload: any = {
                title: allValues.title,
                type: allValues.type,
                priority: allValues.priority,
                isActive: String(allValues.isActive),
                startAt: startAt,
                endAt: endAt,
            }

            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            await adminSvc.createBanners(payload)
            setBannerAddClick(false)
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <p className="flex text-sm w-full md:text-base">
                Create New Banner
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full h-auto md:text-base">
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
                            <div className='absolute bottom-2 left-1 text-red-500/90 text-sm md:text-base'>
                                {errors.title?.message}
                            </div>
                        </div>
                        <div className='flex relative h-[9vh] w-full shrink-0 justify-between gap-2'>
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
                                            placeholder="Start Date"
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
                            <p className="text-sm px-2 md:text-base">Banner Type</p>
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
                            <p className="text-sm px-2 md:text-base">Banner Priority</p>
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
                            <p className="text-sm px-2 md:text-base">Banner Active</p>
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
                                onChange={setUploadedFiles}
                                label="Upload Banner Image"
                                helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                            />
                        </div>
                    </div>
                    <div className="flex w-full h-[6vh]">
                        {!isSubmitting &&
                            <button type="submit" className="flex w-full cursor-pointer bg-green-950 h-full md:text-base text-white header-title items-center justify-center rounded-md">
                                CREATE BANNER
                            </button>
                        }
                        {isSubmitting &&
                            < div className="flex w-full bg-green-950 h-full md:text-base text-white header-title items-center justify-center rounded-md">
                                <ImSpinner9 className="animate-spin" />
                            </div>
                        }
                    </div>
                </div>
            </form >
        </>
    )
}

export default AdminBannerCreatePage
