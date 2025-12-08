import { Select, DatePicker, InputNumber } from "antd";
import { couponType, CouponValidationDTO, type createCouponProps } from "../admin.validator";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import adminSvc from "../../../service/admin.service";
import type { AdminCouponPageProps } from "./AdminCouponPage";
import { ImSpinner9 } from "react-icons/im";

const AdminCouponCreatePage = ({ setAddClick, categoryList }: AdminCouponPageProps) => {
    const { handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            discountType: couponType.Percentage,
            discountValue: 0,
            validFrom: dayjs(),
            validUntil: dayjs(),
            applicableCategories: []
        },
        resolver: yupResolver(CouponValidationDTO)
    })

    const onSubmit = async (data: createCouponProps) => {
        try {
            const payload = {
                discountType: data.discountType.toLowerCase() as couponType,
                discountValue: data.discountValue,
                validFrom: data.validFrom?.toISOString() || "",
                validUntil: data.validUntil?.toISOString() || "",
                applicableCategories: data.applicableCategories || []
            };

            await adminSvc.createCoupon(payload);
            reset();
            setAddClick(false)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const options = categoryList?.data.map((items: any) => {
        return {
            label: `${items.name}`,
            value: items._id
        }
    })

    return (
        <>
            <p className="flex text-sm w-full md:text-base">
                Create New Coupon
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full h-auto">
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
                        <div className='flex relative h-[9vh] w-full shrink-0 justify-between'>
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
                            <div className="flex w-full">
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
                                        className="w-full "
                                        placeholder="Please select"
                                        options={options}
                                        optionFilterProp="label"
                                    />
                                )}
                            />
                            <div className='absolute bottom-2 right-1 text-red-500/90 text-shadow-lg text-sm'>
                                {errors.applicableCategories?.message}
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full h-[6vh]">
                        {!isSubmitting &&
                            <button type="submit" className="flex w-full bg-green-950 h-full cursor-pointer text-white header-title items-center justify-center rounded-md">
                                CREATE COUPON
                            </button>
                        }
                        {isSubmitting &&
                            < div className="flex w-full bg-green-950 h-full text-white header-title items-center justify-center rounded-md">
                                <ImSpinner9 className="animate-spin" />
                            </div>
                        }
                    </div>
                </div>
            </form>
        </>
    )
}

export default AdminCouponCreatePage