import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTag } from "react-icons/fa";
import adminSvc from "../../service/admin.service";
import type { CategoryResponse } from "../Admin/admin.validator";
import AdminModal from "../../component/AdminModal";
import { Table, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CategoryPageProps {
    service?: typeof adminSvc;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ service = adminSvc }) => {
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategoryList = useCallback(async () => {
        try {
            const response = await service.listCategory();
            setCategoryList(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    useEffect(() => {
        fetchCategoryList();
    }, [fetchCategoryList]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingItem(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await service.categoryDeleteById(id);
        fetchCategoryList();
    };

    const handleSubmit = async (data: any) => {
        if (editingItem) {
            await service.updateCategory(editingItem._id, data);
        } else {
            await service.createCategory(data);
        }
        setIsModalOpen(false);
        fetchCategoryList();
    };

    const columns: ColumnsType<any> = [
        {
            title: <span className="text-xs font-bold">Name</span>,
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="text-xs">{text}</span>,
        },
        {
            title: <span className="text-xs font-bold">Slug</span>,
            dataIndex: 'slug',
            key: 'slug',
            render: (text: string) => <span className="text-xs">{text}</span>,
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
                        title="Delete category?"
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
        { name: 'name', label: 'Category Name', placeholder: 'Enter category name', rules: [{ required: true, message: 'Please enter name' }] },
    ];

    const initialValues = editingItem
        ? { name: editingItem.name }
        : { name: '' };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800">Categories</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                >
                    <FaPlus className="text-xs" />
                    Add Category
                </button>
            </div>

            <Table
                dataSource={categoryList?.data || []}
                columns={columns}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'No categories found' }}
                className="text-xs"
                rowClassName="hover:bg-slate-50"
            />

            <AdminModal
                title={editingItem ? 'Edit Category' : 'Add Category'}
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                formFields={formFields}
                initialValues={initialValues}
            />
        </div>
    );
};

export default CategoryPage;