import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTag } from "react-icons/fa";
import { Input, Modal, Button } from "antd";
import adminSvc from "../../service/admin.service";
import type { CategoryResponse } from "../Admin/admin.validator";
import { Table, Popconfirm, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import FileUpload from "../../components/ui/FileUpload";

interface CategoryPageProps {
    service?: typeof adminSvc;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ service = adminSvc }) => {
    const [categoryList, setCategoryList] = useState<CategoryResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [categoryName, setCategoryName] = useState('');

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

    const openAddModal = () => {
        setEditingItem(null);
        setCategoryName('');
        setUploadedFiles([]);
        setIsModalOpen(true);
    };

    const openEditModal = (record: any) => {
        setEditingItem(record);
        setCategoryName(record.name);
        if (record.image?.secure_url) {
            setUploadedFiles([{
                id: 'existing-category',
                file: new File([], record.image.public_id || 'category-image'),
                preview: record.image.secure_url,
                progress: 100,
                status: 'done',
                public_id: record.image.public_id,
                secure_url: record.image.secure_url,
            }]);
        } else {
            setUploadedFiles([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!categoryName.trim()) return;

        setSubmitting(true);
        try {
            const payload: any = { name: categoryName }
            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            if (editingItem) {
                await service.updateCategory(editingItem._id, payload);
            } else {
                await service.createCategory(payload);
            }
            setIsModalOpen(false);
            fetchCategoryList();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        await service.categoryDeleteById(id);
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
            title: <span className="text-xs font-bold">Image</span>,
            dataIndex: 'image',
            key: 'image',
            render: (image: any) => image?.secure_url ? (
                <img src={image.secure_url} width={60} height={40} className="rounded object-cover" />
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
                        onClick={() => openEditModal(record)}
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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800">Categories</h2>
                <button
                    onClick={openAddModal}
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

            <Modal
                title={<span className="text-sm font-bold text-slate-800">{editingItem ? 'Edit Category' : 'Add Category'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={520}
                styles={{
                    header: { paddingBottom: 8, borderBottom: '1px solid #f1f5f9' },
                    body: { padding: '16px 24px' }
                }}
            >
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label={<span className="text-xs font-semibold text-slate-700">Category Name</span>}
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            className="rounded-md h-8 text-xs"
                        />
                    </Form.Item>

                    <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Category Picture</p>
                        <FileUpload
                            accept="image/*"
                            multiple={false}
                            maxFiles={1}
                            maxSizeMB={5}
                            uploadUrl="/api/upload"
                            folder="Category"
                            value={uploadedFiles}
                            onChange={setUploadedFiles}
                            helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                        />
                    </div>

                    <Form.Item className="mb-0 mt-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => setIsModalOpen(false)}
                                className="flex items-center gap-1.5 text-xs font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryPage;
