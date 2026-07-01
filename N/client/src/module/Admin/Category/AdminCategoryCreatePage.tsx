import { Input } from "antd";
import { useState } from "react";
import { categoryValidationDTO, type createCategoryProps } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import adminSvc from "../../../service/admin.service";
import { ImSpinner9 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import FileUpload from "../../../components/ui/FileUpload";

interface AdminCategoryCreatePageProps {
    setAddClick?: (value: boolean) => void;
}

const AdminCategoryCreatePage = ({ setAddClick }: AdminCategoryCreatePageProps) => {
    const navigate = useNavigate()

    const { handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            name: '',
        },
        resolver: yupResolver(categoryValidationDTO)
    })

    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

    const onSubmit = async (data: createCategoryProps) => {
        try {
            const payload: any = { name: data.name }
            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            await adminSvc.createCategory(payload)
            reset()
            setUploadedFiles([])
            setAddClick?.(false)
            navigate('/admin/category')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    return (
        <>
            <p className="flex text-sm w-full md:text-base">
                Create New Category
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
                            <FileUpload
                                accept="image/*"
                                multiple={false}
                                maxFiles={1}
                                maxSizeMB={5}
                                uploadUrl="/api/upload"
                                folder="Category"
                                onChange={setUploadedFiles}
                                label="Upload Category Image"
                                helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                            />
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
