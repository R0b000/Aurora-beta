import { Image, Input, Upload, type GetProp, type UploadFile, type UploadProps } from "antd";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { categoryValidationDTO, type createCategoryProps } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import adminSvc from "../../../service/admin.service";
import { ImSpinner9 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import type { AdminCategoryProps } from "./AdminCategoryPage";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    }
    );

const AdminCategoryCreatePage = ({ setAddClick }: AdminCategoryProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const navigate = useNavigate()

    const { handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            name: '',
            image: ''
        },
        resolver: yupResolver(categoryValidationDTO)
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

    const onSubmit = async (data: createCategoryProps) => {
        try {
            let formData = new FormData();
            formData.append('name', data.name);
            if (fileList[0]?.originFileObj) {
                formData.append('image', fileList[0].originFileObj as File);
            }

            await adminSvc.createCategoty(formData);
            reset();
            setAddClick(false)
            navigate('/admin/category')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    return (
        <>
            <p className="flex text-sm w-full md:text-base">
                Create New Cateogry
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full">
                <div className="flex flex-col gap-10 w-full">
                    <div className="flex flex-col h-[20vh] w-full justify-center">
                        <div className='flex flex-col relative h-[9vh] shrink-0'>
                            <Controller
                                name='name'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        style={{ height: '45px' }}
                                        placeholder="Enter the name of category."
                                    />
                                )}
                            />
                            <div className='absolute bottom-1 left-1 text-red-500/90 text-sm'>
                                {errors.name?.message}
                            </div>
                        </div>
                        <div className='flex flex-col relative h-[20vh] w-full'>
                            <p className="text-sm px-2 md:text-base">Category Picture</p>
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
                                        className="bg-white rounded-xl w-full"
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
                            <button type="submit" className="flex w-full md:text-base cursor-pointer bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                CREATE CATEGORY
                            </button>
                        }
                        {isSubmitting &&
                            < div className="flex w-full md:text-base bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                <ImSpinner9 className="animate-spin" />
                            </div>
                        }
                    </div>
                </div>
            </form>
        </>
    )
}

export default AdminCategoryCreatePage