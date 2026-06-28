import { useCallback, useEffect, useState } from "react"
import { FaPlus, FaEdit, FaTrash, FaTag } from "react-icons/fa"
import { type CategoryResponse, type CouponResponse } from "../admin.validator"
import adminSvc from "../../../service/admin.service"
import AdminModal from "../../../component/AdminModal"
import { Table, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const AdminCouponPage = () => {
    const [couponList, setCouponList] = useState<CouponResponse | null>(null);
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCouponList = useCallback(async () => {
        try {
            const response = await adminSvc.listActiveCoupons(true);
            setCouponList(response);

            const categories = await adminSvc.listCategory();
            setCategoryList(categories);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDelete = async (id: string) => {
        await adminSvc.deleteCouponById(id);
        fetchCouponList();
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingItem(record);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        if (editingItem) {
            await adminSvc.updateCouponById(data, editingItem._id);
        } else {
            await adminSvc.createCoupon(data);
        }
        setIsModalOpen(false);
        fetchCouponList();
    };

    useEffect(() => {
        fetchCouponList();
    }, []);

    const columns: ColumnsType<any> = [
        {
            title: <span className="text-xs font-bold">Code</span>,
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="text-xs font-medium">{text}</span>,
        },
        {
            title: <span className="text-xs font-bold">Discount</span>,
            dataIndex: 'discount',
            key: 'discount',
            render: (discount: number) => <span className="text-xs">{discount}%</span>,
        },
        {
            title: <span className="text-xs font-bold">Status</span>,
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={`text-[10px] px-2 py-0.5 rounded ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                    {status}
                </span>
            ),
        },
        {
            title: <span className="text-xs font-bold">Actions</span>,
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        <FaEdit className="text-xs" />
                    </button>
                    <Popconfirm
                        title="Delete coupon?"
                        description="Are you sure?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100">
                            <FaTrash className="text-xs" />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const formFields = [
        { name: 'code', label: 'Coupon Code', placeholder: 'Enter coupon code', rules: [{ required: true, message: 'Please enter code' }] },
        { name: 'discount', label: 'Discount (%)', placeholder: 'Enter discount percentage', rules: [{ required: true, message: 'Please enter discount' }] },
    ];

    const initialValues = editingItem
        ? { code: editingItem.code, discount: editingItem.discount }
        : { code: '', discount: '' };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800">Coupons</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                >
                    <FaPlus className="text-xs" />
                    Add Coupon
                </button>
            </div>

            <Table
                dataSource={couponList?.data || []}
                columns={columns}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'No coupons found' }}
                className="text-xs"
                rowClassName="hover:bg-slate-50"
            />

            <AdminModal
                title={editingItem ? 'Edit Coupon' : 'Add Coupon'}
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                formFields={formFields}
                initialValues={initialValues}
            />
        </div>
    );
};

export default AdminCouponPage;