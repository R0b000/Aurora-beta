import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import adminSvc from "../../../service/admin.service";
import type { BannerResponse } from "../admin.validator";
import AdminModal from "../../../component/AdminModal";
import { Table, Popconfirm, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const AdminBannerPage = () => {
    const [bannerList, setBannerList] = useState<BannerResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBanners = useCallback(async () => {
        try {
            const response = await adminSvc.listActiveBanners(null);
            setBannerList(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingItem(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await adminSvc.bannerDeleteById(id);
        fetchBanners();
    };

    const handleSubmit = async (data: any) => {
        if (editingItem) {
            await adminSvc.updateBannerById(data, editingItem._id);
        } else {
            await adminSvc.createBanners(data);
        }
        setIsModalOpen(false);
        fetchBanners();
    };

    const columns: ColumnsType<any> = [
        {
            title: <span className="text-xs font-bold">Title</span>,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="text-xs">{text}</span>,
        },
        {
            title: <span className="text-xs font-bold">Image</span>,
            dataIndex: 'image',
            key: 'image',
            render: (image: any) => image?.secure_url ? (
                <Image src={image.secure_url} width={60} height={40} className="rounded object-cover" />
            ) : (
                <span className="text-xs text-slate-400">No image</span>
            ),
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
                        title="Delete banner?"
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
        { name: 'title', label: 'Banner Title', placeholder: 'Enter banner title', rules: [{ required: true, message: 'Please enter title' }] },
        { name: 'url', label: 'Link URL', placeholder: 'Enter link URL', rules: [{ required: true, message: 'Please enter URL' }] },
    ];

    const initialValues = editingItem
        ? { title: editingItem.title, url: editingItem.url }
        : { title: '', url: '' };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800">Banners</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                >
                    <FaPlus className="text-xs" />
                    Add Banner
                </button>
            </div>

            <Table
                dataSource={bannerList?.data || []}
                columns={columns}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'No banners found' }}
                className="text-xs"
                rowClassName="hover:bg-slate-50"
            />

            <AdminModal
                title={editingItem ? 'Edit Banner' : 'Add Banner'}
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                formFields={formFields}
                initialValues={initialValues}
            />
        </div>
    );
};

export default AdminBannerPage;