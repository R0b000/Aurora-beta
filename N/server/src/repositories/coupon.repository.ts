import { executeStoredProcedure } from "../config/db-mssql";

export async function getCoupons(isActive = null) {
    const result = await executeStoredProcedure('sp_get_coupons', { isActive });
    return { data: result.recordset.map(c => ({ ...c, _id: c.id })) };
}

export async function getCouponById(id) {
    const result = await executeStoredProcedure('sp_get_coupon_by_id', { id });
    if (result.recordset.length === 0) return null;
    return { ...result.recordset[0], _id: result.recordset[0].id };
}

export async function createCoupon(data) {
    const result = await executeStoredProcedure('sp_create_coupon', {
        code: data.code,
        type: data.discountType || 'percent',
        value: data.discountValue
    });
    return { id: result.recordset[0].id };
}

export async function updateCoupon(id, data) {
    await executeStoredProcedure('sp_update_coupon', {
        id,
        code: data.code || null,
        value: data.discountValue || null,
        is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : null
    });
}

export async function deleteCoupon(id) {
    await executeStoredProcedure('sp_delete_coupon', { id });
}