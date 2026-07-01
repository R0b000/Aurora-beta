import { Input } from "antd";
import { useCallback, useEffect, useState } from "react";
import { categoryValidationDTO } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import adminSvc from "../../../service/admin.service";
import { ImSpinner9 } from "react-icons/im";
import FileUpload from "../../../components/ui/FileUpload";

const AdminCategoryUpdatePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

    const { handleSubmit, control, formState: { errors, dirtyFields, isSubmitting }, setValue, getValues } = useForm({
        defaultValues: {
            name: '',
        },
        resolver: yupResolver(categoryValidationDTO)
    })

    const fetchCategoryDetails = useCallback(async (catId: string) => {
        try {
            const response = await adminSvc.categoryDetailsById(catId);
            setValue('name', response.name)
            if (response.image?.secure_url) {
                setUploadedFiles([{
                    id: 'existing-category',
                    file: new File([], response.image.public_id || 'category-image'),
                    preview: response.image.secure_url,
                    progress: 100,
                    status: 'done',
                    public_id: response.image.public_id,
                    secure_url: response.image.secure_url,
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
            fetchCategoryDetails(id)
        }
    }, [id, fetchCategoryDetails])

    const onSubmit = async () => {
        try {
            if (!id) return;

            const payload: any = {}
            const allValues = getValues()

            if (allValues.name) {
                payload.name = allValues.name
            }

            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            await adminSvc.updateCategoryById(payload, id)
            navigate("/admin/category")
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    return (
        <>
            {!isLoading &&
                <div className="flex w-full h-full items-center justify-center">
                    <div className='felx flex-col lg:w-[20vw] w-full h-full'>
                        <p className="flex text-sm w-full mb-3 md:text-base">
                            Update Cateogry
                        </p>
                        <form onSubmit={handleSubmit(() => onSubmit())} className="flex w-full">
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
                                        <FileUpload
                                            accept="image/*"
                                            multiple={false}
                                            maxFiles={1}
                                            maxSizeMB={5}
                                            uploadUrl="/api/upload"
                                            folder="Category"
                                            value={uploadedFiles}
                                            onChange={setUploadedFiles}
                                            label="Category Picture"
                                            helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col w-full gap-4">
                                    {!isSubmitting &&
                                        <button type="submit" className="flex w-full md:text-base md:h-[7vh] cursor-pointer bg-green-950 text-white header-title items-center justify-center rounded-md h-[6vh]">
                                            UPDATE CATEGORY
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
