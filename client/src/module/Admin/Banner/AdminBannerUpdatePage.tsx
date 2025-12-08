import { Image, Input, Select, DatePicker, Upload, type GetProp, type UploadFile, type UploadProps, InputNumber } from "antd";
import { useCallback, useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BannerType, BannerValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import adminSvc from "../../../service/admin.service";
import dayjs from 'dayjs'
import { ImSpinner9 } from "react-icons/im";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    }
    );

const AdminBannerUpdatePage = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const navigate = useNavigate()
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const { handleSubmit, control, formState: { errors, dirtyFields, isSubmitting }, setValue, getValues } = useForm({
        defaultValues: {
            title: '',
            type: BannerType.Homepage,
            image: '',
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
            setValue('image', bannerDetails.image.secure_url)
            setValue('startAt', dayjs(bannerDetails.startAt))
            setValue('endAt', dayjs(bannerDetails.endAt))
            setValue('isActive', bannerDetails.isActive)
            setValue('priority', bannerDetails.priority)
            setFileList([
                {
                    uid: '-1',
                    name: bannerDetails.image.public_id,
                    status: 'done',
                    url: bannerDetails.image.secure_url,
                }
            ])
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

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <AiOutlinePlus />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const onSubmit = async (bannerId: string | undefined) => {
        try {
            if (!bannerId) return;

            let formData = new FormData()
            const allValues = getValues();

            Object.keys(dirtyFields).forEach((field) => {
                if (field === 'image') return;

                formData.append(field, (allValues as any)[field])
            })

            if (fileList[0]?.originFileObj) {
                formData.append('image', fileList[0].originFileObj as File);
            }

            await adminSvc.updateBannerById(formData, bannerId)
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
                        Create New Banner
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
                                    <Controller
                                        name='image'
                                        control={control}
                                        render={({ field }) => (
                                            <Upload
                                                {...field}
                                                listType="picture-card"
                                                beforeUpload={() => false}
                                                fileList={fileList}
                                                onPreview={handlePreview}
                                                onChange={handleChange}
                                                className="bg-white rounded-xl justify-between items-center w-full"
                                            >
                                                {fileList.length >= 1 ? null : uploadButton}
                                            </Upload>
                                        )}
                                    />
                                    {previewImage && (
                                        <Image
                                            wrapperStyle={{ display: 'none' }}
                                            preview={{
                                                visible: previewOpen,
                                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                            }}
                                            src={previewImage}
                                        />
                                    )}
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.image?.message}
                                    </div>
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