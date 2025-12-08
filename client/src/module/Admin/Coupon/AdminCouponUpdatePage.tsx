import { Select, DatePicker, InputNumber } from "antd";
import { couponType, CouponValidationDTO, type updatePayloadCouponProps } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import adminSvc from "../../../service/admin.service";
import dayjs from "dayjs";
import { ImSpinner9 } from "react-icons/im";
import type { AdminCouponPageProps } from "./AdminCouponPage";

const AdminCouponUpdatePage = () => {
    const { categoryList } = useOutletContext<AdminCouponPageProps>();
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { id } = useParams();

    const { handleSubmit, control, formState: { errors, dirtyFields, isSubmitting }, setValue, getValues } = useForm({
        defaultValues: {
            discountType: couponType.Percentage,
            discountValue: 0,
            validFrom: '',
            validUntil: '',
            applicableCategories: []
        },
        resolver: yupResolver(CouponValidationDTO)
    })

    const onSubmit = async (id: string) => {
        try {
            let payload: updatePayloadCouponProps = {};
            const allValues = getValues()

            if (dirtyFields.discountType) payload.discountType = allValues.discountType
            if (dirtyFields.discountValue) payload.discountValue = allValues.discountValue
            if (dirtyFields.validFrom) payload.validFrom = allValues.validFrom?.toISOString() || ''
            if (dirtyFields.validUntil) payload.validUntil = allValues.validUntil?.toISOString() || ''
            if (dirtyFields.applicableCategories) payload.applicableCategories = (allValues.applicableCategories) || []

            await adminSvc.updateCouponById(payload, id)
            navigate('/admin/coupon')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const fetchCouponDetails = useCallback(async (id: string) => {
        try {
            const response = await adminSvc.getSingleCouponById(id);
            setValue('discountType', response.data.discountType);
            setValue('discountValue', Number(response.data.discountValue));
            setValue('validFrom', dayjs(response.data.validFrom))
            setValue('validUntil', dayjs(response.data.validUntil))
            setValue('applicableCategories', response.data.applicableCategories)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (id) {
            fetchCouponDetails(id)
        }
    }, [id])

    const options = categoryList?.data.map((items: any) => {
        return {
            label: `${items.name}`,
            value: items._id
        }
    })

    return (
        <>
            {!isLoading &&
                <>
                    <p className="flex text-sm w-full mb-3 md:text-base">
                        Update Coupon
                    </p>
                    <form onSubmit={handleSubmit(() => onSubmit(id!))} className="flex w-full h-auto">
                        <div className="flex flex-col gap-5 w-full h-auto">
                            <div className="flex flex-col w-full justify-center">
                                <div className='flex flex-col relative h-[9vh] shirnk-0'>
                                    <p className="text-sm px-2 md:text-base">Coupon Type</p>
                                    <Controller
                                        name='discountType'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                className="w-full"
                                                style={{ height: '45px' }}
                                                options={[
                                                    { value: couponType.Percentage, label: 'Percentage' },
                                                    { value: couponType.Fixed, label: 'Fixed' },
                                                ]}
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90'>
                                        {errors.discountType?.message}
                                    </div>
                                </div>
                                <div className='flex flex-col relative h-[12vh] shink-0'>
                                    <p className="text-sm px-2 md:text-base">Coupon Discount Value</p>
                                    <Controller
                                        name='discountValue'
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ height: '45px', width: '100%', alignContent: 'center' }}
                                                placeholder="Enter the title of banner."
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 left-1 text-red-500/90 text-sm'>
                                        {errors.discountValue?.message}
                                    </div>
                                </div>
                                <div className='flex relative h-[9vh] md:gap-5 w-full shrink-0 justify-between'>
                                    <div className="flex flex-col relative w-full">
                                        <Controller
                                            name='validFrom'
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
                                            {errors.validFrom?.message}
                                        </div>
                                    </div>
                                    <div className=" w-full">
                                        <Controller
                                            name='validUntil'
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
                                            {errors.validUntil?.message}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex relative h-[10vh] w-full shrink-0 justify-between">
                                    <Controller
                                        name='applicableCategories'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                mode="multiple"
                                                allowClear
                                                size="large"
                                                className="w-full"
                                                placeholder="Please select"
                                                options={options}
                                                value={field.value || []}
                                                optionFilterProp="label"
                                                onChange={(val) => field.onChange(val)}
                                            />
                                        )}
                                    />
                                    <div className='absolute bottom-2 right-1 text-red-500/90 text-shadow-lg text-sm'>
                                        {errors.applicableCategories?.message}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full gap-4">
                                {!isSubmitting &&
                                    <button type="submit" className="flex w-full bg-green-950 cursor-pointer text-white header-title items-center justify-center rounded-md h-[6vh]">
                                        UPDATE COUPON
                                    </button>
                                }
                                {isSubmitting &&
                                    < div className="flex w-full bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                        <ImSpinner9 className="animate-spin" />
                                    </div>
                                }
                                <button onClick={() => navigate('/admin/coupon')} className="flex w-full cursor-pointer bg-gray-500 h-[6vh] text-white header-title items-center justify-center rounded-md">
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

export default AdminCouponUpdatePage