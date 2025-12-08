import { Image, Input, Select, Upload, type GetProp, type UploadFile, type UploadProps, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineDoubleRight, AiOutlinePlus } from "react-icons/ai";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ImSpinner9 } from "react-icons/im";
import { sellerCreateProductSchema } from "./seller.validator";
import sellerSvc from "../../service/seller.service";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { sellerUpdatePageProps } from "./SellerPage";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    }
    );

const SellerUpdatePage = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [moreDetails, setMoreDetails] = useState<boolean>(false)
    const { categoryList, productList } = useOutletContext<sellerUpdatePageProps>();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const navigate = useNavigate();
    const { id } = useParams();

    const { handleSubmit, control, formState: { errors, isSubmitting, dirtyFields }, getValues, setValue } = useForm({
        defaultValues: {
            title: "",
            slug: null,
            category: [],
            price: 0,
            currency: "NPR",
            stock: 0,
            weight: null,
            dimensions: null,
            shippingClass: null,
            isPublished: true,
            variants: null,
            attributes: null,
            description: null,
        },
        resolver: yupResolver(sellerCreateProductSchema)
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

    const setValuesOfProductById = () => {
        try {
            productList?.data.map((items) => {
                if (id === items._id) {
                    setValue('title', items.title)
                    setValue('category', items.category.map(c => c._id))
                    setValue('isPublished', items.isPublished)
                    setValue('currency', items.currency)
                    setValue('price', items.price)
                    setValue('stock', items.stock)
                    setValue('weight', Number(items.weight) || 0)
                    setValue('attributes', items.attributes)
                    setValue('description', items.description)
                    setValue('shippingClass', items.shippingClass)
                    setValue('variants', items.variants)
                    setValue('dimensions', items.dimensions)
                    setFileList(
                        items?.images?.map((img, index) => ({
                            uid: String(index),
                            name: img.public_id,
                            status: 'done',
                            url: img.secure_url,
                        })) || []
                    )
                }
            })
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setValuesOfProductById()
    }, [productList])

    const onSubmit = async (id: string) => {
        try {
            const formData = new FormData();
            const allValues = getValues();

            if (dirtyFields.title) formData.append('title', allValues.title)
            if (dirtyFields.slug) formData.append('slug', allValues?.slug || '')
            if (dirtyFields.category) {
                allValues.category?.map((id) => {
                    formData.append('category[]', id!);
                })
            }
            if (dirtyFields.isPublished) formData.append('isPublished', String(allValues.isPublished))
            if (dirtyFields.price) formData.append('price', String(allValues.price))
            if (dirtyFields.stock) formData.append('stock', String(allValues.stock))
            if (dirtyFields.weight) formData.append('weight', String(allValues.weight) || "")
            if (dirtyFields.currency) formData.append('currency', allValues.currency)
            if (dirtyFields.dimensions) formData.append('dimensions', allValues.dimensions || "")
            if (dirtyFields.shippingClass) formData.append('shippingClass', allValues.shippingClass || '')
            if (dirtyFields.variants) formData.append('variants', allValues.variants || '')
            if (dirtyFields.attributes) formData.append('attributes', allValues.attributes || '')
            if (dirtyFields.description) formData.append('description', allValues.description || '')

            // Append image
            if (fileList.length > 0) {
                fileList.forEach((file) => {
                    formData.append('images', file.originFileObj as File)
                })
            }
            await sellerSvc.updateCategory(id, formData);
            navigate('/seller/product')
        } catch (err) {
            console.log(err);
        }
    };

    const options = categoryList?.data.map((items) => {
        return {
            label: items.name,
            value: items._id
        }
    })

    return (
        !isLoading &&
        <>
            <p className="flex text-sm w-full">
                Create New Product
            </p>
            <form onSubmit={handleSubmit(() => onSubmit(id!))} className="flex w-full h-auto">
                <div className="flex flex-col gap-5 w-full h-auto items-center justify-center">
                    <div className="flex flex-col w-full justify-center md:grid md:grid-cols-2 md:items-center md:justify-center md:gap-10">
                        <div className="flex flex-col lg:h-[84vh] md:h-[75vh] border p-2 rounded-md border-violet-300">
                            <div className='flex flex-col relative h-[9vh] shink-0'>
                                <Controller
                                    name='title'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            style={{ height: '45px' }}
                                            placeholder="Enter the title of product."
                                        />
                                    )}
                                />
                                <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                    {errors.title?.message}
                                </div>
                            </div>
                            <div className="flex flex-col relative h-[14vh] w-full shrink-0">
                                <p className="text-sm px-2">Category Type</p>
                                <Controller
                                    name='category'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            mode="multiple"
                                            allowClear
                                            size="large"
                                            className="w-full h-[10vh] shrink-0"
                                            placeholder="Please select the category type."
                                            optionFilterProp="label"
                                            options={options}
                                        />
                                    )}
                                />
                                <div className='absolute bottom-2 right-1 text-red-500/90 text-shadow-lg text-sm'>
                                    {errors.category?.message}
                                </div>
                            </div>
                            <div className='flex flex-col relative h-[9vh] shirnk-0'>
                                <p className="text-sm px-2">Product Published</p>
                                <Controller
                                    name='isPublished'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            className="w-full"
                                            style={{ height: '45px' }}
                                            defaultValue={true}
                                            options={[
                                                { value: true, label: 'True' },
                                                { value: false, label: 'False' },
                                            ]}
                                        />
                                    )}
                                />
                                <div className='absolute bottom-2 left-1 text-red-500/90'>
                                    {errors.isPublished?.message}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full items-center justify-center">
                                <div className='flex flex-col relative h-[14vh] shink-0 w-[40%]'>
                                    <p className="text-sm px-2">Currency</p>
                                    <Controller
                                        name='currency'
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                style={{ height: '45px' }}
                                                placeholder="Enter the currency type."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.currency?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[14vh] shrink-0 w-[60%]'>
                                    <p className="text-sm px-2">Price</p>
                                    <Controller
                                        name='price'
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                                placeholder="Enter price of product."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 right-1 text-red-500/90'>
                                        {errors.price?.message}
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col relative h-[13vh] shrink-0 w-full'>
                                <p className="text-sm px-2">Product Stock</p>
                                <Controller
                                    name='stock'
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                            placeholder="Enter number of stock."
                                        />
                                    )}
                                />
                                <div className='absolute bottom-2 left-1 text-red-500/90'>
                                    {errors.stock?.message}
                                </div>
                            </div>
                            <div className='flex flex-col relative h-auto mb-10'>
                                <p className="text-sm px-2">Product Images</p>
                                <Controller
                                    name='images'
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
                                            {fileList.length >= 5 ? null : uploadButton}
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
                                <div className='absolute -bottom-9 left-1 text-red-500/90'>
                                    {errors.images?.message}
                                </div>
                            </div>
                        </div>
                        <div className="md:hidden">
                            {!moreDetails &&
                                <div className="flex flex-col h-[10vh] shrink-0 items-center justify-center w-full gap-2 p-2">
                                    <div className="flex w-full">
                                        <p className="text-sm font-semibold">
                                            Add More Details
                                        </p>
                                    </div>
                                    <button onClick={() => setMoreDetails((prev) => !prev)} className="flex text-blue-500">
                                        <AiOutlineDoubleRight className="rotate-90" size={35} />
                                    </button>
                                </div>
                            }
                            {moreDetails &&
                                <div className="flex flex-col">
                                    <div className='flex flex-col relative h-[9vh] shrink-0 w-full'>
                                        <p className="text-sm px-2">Product Weight</p>
                                        <Controller
                                            name='weight'
                                            control={control}
                                            render={({ field }) => (
                                                <InputNumber
                                                    {...field}
                                                    style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                                    placeholder="Enter weight of the product."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90'>
                                            {errors.weight?.message}
                                        </div>
                                    </div>
                                    <div className='flex flex-col relative h-auto shink-0 p-1'>
                                        <p className="text-sm">Product Dimension</p>
                                        <Controller
                                            name='dimensions'
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="border p-2 rounded-md border-gray-400 bg-white h-[7vh]"
                                                    placeholder="Enter the dimension of product."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.dimensions?.message}
                                        </div>
                                    </div>

                                    <div className='flex flex-col relative h-auto shink-0 p-1'>
                                        <p className="text-sm">Shipping Class Details</p>
                                        <Controller
                                            name='shippingClass'
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="border p-2 rounded-md border-gray-400 bg-white h-[10vh]"
                                                    placeholder="Enter the shipping class details."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.shippingClass?.message}
                                        </div>
                                    </div>
                                    {/* Product Variant Details */}
                                    <div className='flex flex-col relative h-auto shink-0 p-1'>
                                        <p className="text-sm">Product Variant Details</p>
                                        <Controller
                                            name='variants'
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="border p-2 rounded-md border-gray-400 bg-white h-[7vh]"
                                                    placeholder="Enter product variant details."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.variants?.message}
                                        </div>
                                    </div>

                                    {/* Product Attributes */}
                                    <div className='flex flex-col relative h-auto shink-0 p-1'>
                                        <p className="text-sm">Product Attributes</p>
                                        <Controller
                                            name='attributes'
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="border p-2 rounded-md border-gray-400 bg-white h-[8vh]"
                                                    placeholder="Enter product attributes."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.attributes?.message}
                                        </div>
                                    </div>

                                    {/* Product Description */}
                                    <div className='flex flex-col relative h-auto shink-0 p-1'>
                                        <p className="text-sm">Product Description</p>
                                        <Controller
                                            name='description'
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="border p-2 rounded-md border-gray-400 bg-white h-[15vh]"
                                                    placeholder="Enter product description."
                                                />
                                            )}
                                        />
                                        <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                            {errors.description?.message}
                                        </div>
                                    </div>
                                </div>
                            }
                            {moreDetails &&
                                <div className="flex flex-col h-[10vh] shrink-0 items-center justify-center w-full gap-2 p-2">
                                    <div className="flex w-full">
                                        <p className="text-sm font-semibold">
                                            Less Details
                                        </p>
                                    </div>
                                    <button onClick={() => setMoreDetails((prev) => !prev)} className="flex text-blue-500">
                                        <AiOutlineDoubleRight className="-rotate-90" size={35} />
                                    </button>
                                </div>
                            }
                        </div>
                        <div className="md:block hidden lg:h-[84vh] md:h-[75vh] border p-2 rounded-md border-violet-300">
                            <div className="flex flex-col">
                                <div className='flex flex-col relative h-[9vh] shrink-0 w-full'>
                                    <p className="text-sm px-2">Product Weight</p>
                                    <Controller
                                        name='weight'
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                                placeholder="Enter weight of the product."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.weight?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-auto shink-0 p-1'>
                                    <p className="text-sm">Product Dimension</p>
                                    <Controller
                                        name='dimensions'
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="border p-2 rounded-md border-gray-400 bg-white h-[7vh] resize-none"
                                                placeholder="Enter the dimension of product."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.dimensions?.message}
                                    </div>
                                </div>

                                <div className='flex flex-col relative h-auto shink-0 p-1'>
                                    <p className="text-sm">Shipping Class Details</p>
                                    <Controller
                                        name='shippingClass'
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="border p-2 rounded-md border-gray-400 bg-white h-[10vh] resize-none"
                                                placeholder="Enter the shipping class details."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.shippingClass?.message}
                                    </div>
                                </div>
                                {/* Product Variant Details */}
                                <div className='flex flex-col relative h-auto shink-0 p-1'>
                                    <p className="text-sm">Product Variant Details</p>
                                    <Controller
                                        name='variants'
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="border p-2 rounded-md border-gray-400 bg-white h-[7vh] resize-none"
                                                placeholder="Enter product variant details."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.variants?.message}
                                    </div>
                                </div>

                                {/* Product Attributes */}
                                <div className='flex flex-col relative h-auto shink-0 p-1'>
                                    <p className="text-sm">Product Attributes</p>
                                    <Controller
                                        name='attributes'
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="border p-2 rounded-md border-gray-400 bg-white h-[8vh] resize-none"
                                                placeholder="Enter product attributes."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.attributes?.message}
                                    </div>
                                </div>

                                {/* Product Description */}
                                <div className='flex flex-col relative h-auto shink-0 p-1'>
                                    <p className="text-sm">Product Description</p>
                                    <Controller
                                        name='description'
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="border p-2 rounded-md border-gray-400 bg-white h-[15vh] resize-none"
                                                placeholder="Enter product description."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.description?.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full lg:w-1/2 h-[6vh]">
                        {!isSubmitting &&
                            <button type="submit" className="flex w-full bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                UPDATE PRODUCT
                            </button>
                        }
                        {isSubmitting &&
                            < div className="flex w-full bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                <ImSpinner9 className="animate-spin" />
                            </div>
                        }
                    </div>
                </div>
            </form >
        </>
    )
}

export default SellerUpdatePage