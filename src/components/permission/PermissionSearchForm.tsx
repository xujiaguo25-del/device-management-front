import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';

interface SearchFormData {
    userId?: string;
    deviceId?: string;
}

interface PermissionSearchFormProps {
    onSearch: (data: SearchFormData) => void;
    onReset: () => void;
    onExport?: () => void;
    loading?: boolean;
    isAdmin?: boolean;
}

const PermissionSearchForm: React.FC<PermissionSearchFormProps> = ({ onSearch, onReset, onExport, loading = false, isAdmin = true }) => {
    const { control, handleSubmit, reset } = useForm<SearchFormData>();

    const handleSearchSubmit = handleSubmit((data) => {
        onSearch(data);
    });

    const handleReset = () => {
        reset();
        onReset();
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <Space>
                {isAdmin && (
                    <Form.Item label="ユーザーID" style={{ marginBottom: 0 }}>
                        <Controller
                            name="userId"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder="ユーザーIDを入力してください" style={{ width: 150 }} allowClear />}
                        />
                    </Form.Item>
                )}
                <Form.Item label="デバイスID" style={{ marginBottom: 0 }}>
                    <Controller
                        name="deviceId"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="デバイスIDを入力してください" style={{ width: 150 }} allowClear />}
                    />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                        <Button 
                            type="primary" 
                            icon={<SearchOutlined />}
                            onClick={handleSearchSubmit}
                        >
                            検索
                        </Button>
                        <Button onClick={handleReset} icon={<ReloadOutlined />}>
                            リセット
                        </Button>
                        {isAdmin && onExport && (
                            <Button 
                                icon={<ExportOutlined />} 
                                onClick={onExport} 
                                loading={loading}
                            >
                                Excelにエクスポート
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Space>
        </div>
    );
};

export default PermissionSearchForm;
