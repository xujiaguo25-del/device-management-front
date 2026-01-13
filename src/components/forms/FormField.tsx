/**
 * 汎用フォームフィールドコンポーネント
 * react-hook-form と Ant Design を統合
 */

import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import { Controller } from 'react-hook-form';
import type { Control, FieldError, RegisterOptions, FieldValues } from 'react-hook-form';

export interface FormFieldProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  labelCol?: { span: number; style?: React.CSSProperties };
  wrapperCol?: { span: number };
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'password' | 'number' | 'textarea';
  prefix?: React.ReactNode;
  rules?: RegisterOptions<FieldValues>;
  disabled?: boolean;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  label,
  labelCol,
  wrapperCol,
  error,
  required = false,
  placeholder,
  type = 'text',
  prefix,
  rules,
  disabled = false,
  autoComplete,
}) => {
  // ラベルがない場合は、自動でレイアウトを調整
  const finalLabelCol = label ? (labelCol || { span: 6 }) : { span: 0 };
  const finalWrapperCol = label ? (wrapperCol || { span: 18 }) : { span: 24 };
  const validationRules: RegisterOptions<FieldValues> = required
    ? { required: label ? `${label}を入力してください` : 'この項目を入力してください', ...rules }
    : rules || {};

  const renderInput = (field: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<unknown>;
  }) => {
    const commonProps = {
      placeholder: placeholder || (label ? `${label}を入力してください` : '入力してください'),
      prefix,
      disabled,
      autoComplete,
    };

    switch (type) {
      case 'password':
        return (
          <Input.Password
            {...commonProps}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
          />
        );
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            style={{ width: '100%' }}
            value={field.value as number}
            onChange={(value) => field.onChange(value ?? 0)}
            onBlur={field.onBlur}
          />
        );
      case 'textarea':
        return (
          <Input.TextArea
            rows={4}
            placeholder={placeholder || (label ? `${label}を入力してください` : '入力してください')}
            disabled={disabled}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
          />
        );
      default:
        return (
          <Input
            {...commonProps}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
          />
        );
    }
  };

  return (
    <Form.Item
      label={label}
      labelCol={finalLabelCol}
      wrapperCol={finalWrapperCol}
      validateStatus={error ? 'error' : ''}
      help={error?.message}
    >
      <Controller
        name={name}
        control={control}
        rules={validationRules}
        render={({ field }) => renderInput(field)}
      />
    </Form.Item>
  );
};

export default FormField;
