import { Image, Input, Select, DatePicker, Upload, type GetProp, type UploadFile, type UploadProps, InputNumber } from "antd";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BannerType, BannerValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import adminSvc from "../../../service/admin.service";
import { useAppContext } from "../../../context/AppContext";
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

const AdminBannerCreatePage = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const { setBannerAddClick } = useAppContext();

    const { handleSubmit, control, formState: { errors, isSubmitting }, getValues } = useForm({
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

    const onSubmit = async () => {
        try {
            const formData = new FormData();
            const allValues = getValues();

            // Convert dayjs objects → string
            const startAt = dayjs(allValues.startAt).toISOString();
            const endAt = dayjs(allValues.endAt).toISOString();

            // Append primitive values
            formData.append("title", allValues.title);
            formData.append("type", allValues.type);
            formData.append("priority", String(allValues.priority));
            formData.append("isActive", String(allValues.isActive));
            formData.append("startAt", startAt);
            formData.append("endAt", endAt);

            // Append image
            if (fileList.length > 0) {
                formData.append("image", fileList[0].originFileObj as File);
            }

            await adminSvc.createBanners(formData);
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