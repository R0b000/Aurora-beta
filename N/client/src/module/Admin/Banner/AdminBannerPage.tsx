import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import adminSvc from "../../../service/admin.service";
import type { BannerResponse } from "../admin.validator";
import { Table, Popconfirm, Modal, Form, Input, InputNumber, Select, DatePicker, Button, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import FileUpload from "../../../components/ui/FileUpload";

const AdminBannerPage = () => {
    const [bannerList, setBannerList] = useState<BannerResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

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

    const openAddModal = () => {
        setEditingItem(null);
        setUploadedFiles([]);
        setIsModalOpen(true);
    };

    const openEditModal = (record: any) => {
        setEditingItem(record);
        if (record.image?.secure_url) {
            setUploadedFiles([{
                id: 'existing-banner',
                file: new File([], record.image.public_id || 'banner-image'),
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

    const handleDelete = async (id: string) => {
        await adminSvc.bannerDeleteById(id);
        fetchBanners();
    };

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const payload: any = {
                title: values.title,
                url: values.url || '',
                type: values.type || 'homepage',
                priority: values.priority ?? 0,
                isActive: values.isActive !== undefined ? values.isActive : true,
                startAt: values.startAt ? dayjs(values.startAt).toISOString() : dayjs().toISOString(),
                endAt: values.endAt ? dayjs(values.endAt).toISOString() : dayjs().add(7, 'day').toISOString(),
            };

            const latest = uploadedFiles[uploadedFiles.length - 1]
            if (latest?.secure_url) {
                payload.image_url = latest.secure_url
                payload.public_id = latest.public_id
            }

            if (editingItem) {
                await adminSvc.updateBannerById(payload, editingItem._id);
            } else {
                await adminSvc.createBanners(payload);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
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
            dataIndex: 'is_active',
            key: 'status',
            render: (isActive: boolean) => (
                <span className={`text-[10px] px-2 py-0.5 rounded ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
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

    const initialValues = editingItem
        ? {
            title: editingItem.title,
            url: editingItem.link_url || '',
            type: editingItem.type || 'homepage',
            priority: editingItem.sort_order ?? 0,
            isActive: editingItem.is_active ?? true,
            startAt: editingItem.startAt ? dayjs(editingItem.startAt) : dayjs(),
            endAt: editingItem.endAt ? dayjs(editingItem.endAt) : dayjs().add(7, 'day'),
          }
        : {
            title: '',
            url: '',
            type: 'homepage',
            priority: 0,
            isActive: true,
            startAt: dayjs(),
            endAt: dayjs().add(7, 'day'),
          };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800">Banners</h2>
                <button
                    onClick={openAddModal}
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

            <Modal
                title={<span className="text-sm font-bold text-slate-800">{editingItem ? 'Edit Banner' : 'Add Banner'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={580}
                styles={{
                    header: { paddingBottom: 8, borderBottom: '1px solid #f1f5f9' },
                    body: { padding: '16px 24px' }
                }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={initialValues}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Banner Title</label>
                            <Form.Item
                                name="title"
                                rules={[{ required: true, message: 'Please enter title' }]}
                                className="mb-0"
                            >
                                <Input placeholder="Enter banner title" className="rounded-md h-8 text-xs" />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Type</label>
                            <Form.Item name="type" className="mb-0">
                                <Select className="rounded-md h-8 text-xs" options={[
                                    { value: 'homepage', label: 'Homepage' },
                                    { value: 'category', label: 'Category' },
                                ]} />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Priority</label>
                            <Form.Item name="priority" className="mb-0">
                                <InputNumber className="w-full rounded-md h-8 text-xs" min={0} />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Start Date</label>
                            <Form.Item name="startAt" className="mb-0">
                                <DatePicker className="w-full rounded-md h-8 text-xs" />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">End Date</label>
                            <Form.Item name="endAt" className="mb-0">
                                <DatePicker className="w-full rounded-md h-8 text-xs" />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Link URL</label>
                            <Form.Item name="url" className="mb-0">
                                <Input placeholder="Enter link URL" className="rounded-md h-8 text-xs" />
                            </Form.Item>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Active</label>
                            <Form.Item name="isActive" className="mb-0">
                                <Select className="rounded-md h-8 text-xs" options={[
                                    { value: true, label: 'True' },
                                    { value: false, label: 'False' },
                                ]} />
                            </Form.Item>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Banner Picture</label>
                            <FileUpload
                                accept="image/*"
                                multiple={false}
                                maxFiles={1}
                                maxSizeMB={5}
                                uploadUrl="/api/upload"
                                folder="Banner"
                                value={uploadedFiles}
                                onChange={setUploadedFiles}
                                helperText="Accepted: JPG, PNG, WEBP. Max 5MB."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
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
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBannerPage;
