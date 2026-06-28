import type { ReactNode } from 'react';
import { Input, InputNumber, Select, Upload, type UploadProps, type UploadFile } from 'antd';
import { AiOutlinePlus } from 'react-icons/ai';
import { Controller, type Control, type FieldError } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  control: Control<any>;
  label?: string;
  error?: FieldError;
  placeholder?: string;
  type?: 'input' | 'number' | 'select' | 'textarea';
  options?: { value: any; label: string }[];
  multiple?: boolean;
  height?: number;
}

export function FormInput({ name, control, label, error, placeholder, height = 45 }: Omit<FormFieldProps, 'type' | 'options' | 'multiple'>) {
  return (
    <FormFieldWrapper label={label} error={error?.message}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            style={{ height }}
            placeholder={placeholder}
            value={field.value ?? ''}
          />
        )}
      />
    </FormFieldWrapper>
  );
}

export function FormNumber({ name, control, label, error, placeholder, height = 45 }: Omit<FormFieldProps, 'type' | 'options' | 'multiple'>) {
  return (
    <FormFieldWrapper label={label} error={error?.message}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputNumber
            {...field}
            style={{ height, width: '100%' }}
            placeholder={placeholder}
            value={field.value ?? 0}
          />
        )}
      />
    </FormFieldWrapper>
  );
}

export function FormSelect({ name, control, label, error, options = [], multiple = false, height = 45 }: Omit<FormFieldProps, 'type' | 'placeholder'>) {
  return (
    <FormFieldWrapper label={label} error={error?.message}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            mode={multiple ? 'multiple' : undefined}
            style={{ height }}
            options={options}
            allowClear={multiple}
            placeholder="Please select..."
          />
        )}
      />
    </FormFieldWrapper>
  );
}

export function FormTextarea({ name, control, label, error, placeholder }: Omit<FormFieldProps, 'type' | 'options' | 'multiple'>) {
  return (
    <FormFieldWrapper label={label} error={error?.message}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ''}
            className="border p-2 rounded-md border-gray-400 bg-white w-full h-[7vh] resize-none"
            placeholder={placeholder}
          />
        )}
      />
    </FormFieldWrapper>
  );
}

function FormFieldWrapper({ label, error, children }: { label?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col relative h-auto p-1">
      {label && <p className="text-sm">{label}</p>}
      {children}
      {error && <div className="absolute -bottom-6 left-1 text-red-500 text-sm">{error}</div>}
    </div>
  );
}

interface ImageUploadProps {
  fileList: UploadFile[];
  onChange: UploadProps['onChange'];
  onPreview: (file: UploadFile) => void;
  maxCount?: number;
}

export function ImageUpload({ fileList, onChange, onPreview, maxCount = 5 }: ImageUploadProps) {
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <AiOutlinePlus />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Upload
      listType="picture-card"
      beforeUpload={() => false}
      fileList={fileList}
      onPreview={onPreview}
      onChange={onChange}
      className="bg-white rounded-xl justify-between items-center w-full"
    >
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  );
}