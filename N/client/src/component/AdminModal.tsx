import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes } from 'react-icons/fa';

interface AdminModalProps {
    title: string;
    visible: boolean;
    onCancel: () => void;
    onSubmit: (data: any) => void;
    formFields?: Array<{
        name: string;
        label: string;
        placeholder?: string;
        rules?: any[];
    }>;
    initialValues?: any;
    loading?: boolean;
}

const AdminModal: React.FC<AdminModalProps> = ({
    title,
    visible,
    onCancel,
    onSubmit,
    formFields = [],
    initialValues,
    loading = false
}) => {
    const [form] = Form.useForm();

    const handleFinish = (values: any) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title={<span className="text-sm font-bold text-slate-800">{title}</span>}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={480}
            styles={{
                header: { paddingBottom: 8, borderBottom: '1px solid #f1f5f9' },
                body: { padding: '16px 24px' }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={initialValues}
            >
                {formFields.map((field) => (
                    <Form.Item
                        key={field.name}
                        name={field.name}
                        label={<span className="text-xs font-semibold text-slate-700">{field.label}</span>}
                        rules={field.rules}
                    >
                        <Input
                            placeholder={field.placeholder}
                            className="rounded-md h-8 text-xs"
                        />
                    </Form.Item>
                ))}

                <Form.Item className="mb-0 mt-4">
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={onCancel}
                            className="flex items-center gap-1.5 text-xs font-medium"
                        >
                            <FaTimes className="text-xs" />
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700"
                        >
                            <FaSave className="text-xs" />
                            Save
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminModal;