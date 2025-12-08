import { Image, Input, Upload, type GetProp, type UploadFile, type UploadProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { categoryValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import adminSvc from "../../../service/admin.service";
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

const AdminCategoryUpdatePage = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const navigate = useNavigate();
    const { id } = useParams();

    const { handleSubmit, control, formState: { errors, dirtyFields, isSubmitting }, setValue, getValues } = useForm({
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

    const onSubmit = async (id: string | undefined) => {
        try {
            if (!id) return;

            let formData = new FormData()
            const allValues = getValues();

            Object.keys(dirtyFields).forEach((field) => {
                if (field === 'image') return;

                formData.append(field, (allValues as any)[field])
            })

            if (fileList[0]?.originFileObj) {
                formData.append('image', fileList[0].originFileObj as File);
            }

            await adminSvc.updateCategoryById(formData, id);
            navigate("/admin/category");
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const fetchCategoryDetails = useCallback(async (id: string) => {
        try {
            const response = await adminSvc.categoryDetailsById(id);
            setValue('name', response.name);
            setFileList([
                {
                    uid: '-1',
                    name: response.image.public_id,
                    status: 'done',
                    url: response.image.secure_url,
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
            fetchCategoryDetails(id)
        }
    }, [id, fetchCategoryDetails])

    return (
        <>
            {!isLoading &&
                <div className="flex w-full h-full items-center justify-center">
                    <div className="felx flex-col lg:w-[20vw] w-full h-full">
                        <p className="flex text-sm w-full mb-3 md:text-base">
                            Update Cateogry
                        </p>
                        <form onSubmit={handleSubmit(() => onSubmit(id))} className="flex w-full">
                            <div className="flex flex-col gap-5 w-full md:w-[90vh]">
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
                                        <div className='absolute bottom-2 left-1 text-red-500/90'>
                                            {errors.name?.message}
                                        </div>
                                    </div>
                                    <div className='flex relative h-[20vh] w-full items-center'>
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
                                <div className="flex flex-col w-full gap-4">
                                    {!isSubmitting &&
                                        <button type="submit" className="flex w-full md:text-base md:h-[7vh] cursor-pointer bg-green-950 text-white header-title items-center justify-center rounded-md h-[6vh]">
                                            UPDATE BANNER
                                        </button>
                                    }
                                    {isSubmitting &&
                                        < div className="flex w-full md:text-base md:h-[7vh] bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                            <ImSpinner9 className="animate-spin" />
                                        </div>
                                    }
                                    <button onClick={() => navigate('/admin/category')} className="flex w-full md:text-base cursor-pointer md:h-[7vh] bg-gray-500 h-[6vh] text-white header-title items-center justify-center rounded-md">
                                        CANCEL UPDATE
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </>
    )
}

export default AdminCategoryUpdatePage