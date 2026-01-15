import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';

interface SearchFormData {
    userId?: string;
    deviceId?: string;
}

interface PermissionSearchFormProps {
    onSearch: (data: SearchFormData) => void;
    onReset: () => void;
    isAdmin?: boolean;
}

const PermissionSearchForm: React.FC<PermissionSearchFormProps> = ({ onSearch, onReset, isAdmin = true }) => {
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
                    <Form.Item label="用户ID" style={{ marginBottom: 0 }}>
                        <Controller
                            name="userId"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder="请输入用户ID" style={{ width: 150 }} />}
                        />
                    </Form.Item>
                )}
                <Form.Item label="设备ID" style={{ marginBottom: 0 }}>
                    <Controller
                        name="deviceId"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="请输入设备ID" style={{ width: 150 }} />}
                    />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                        <Button 
                            type="primary" 
                            icon={<SearchOutlined />}
                            onClick={handleSearchSubmit}
                        >
                            搜索
                        </Button>
                        <Button onClick={handleReset} icon={<ReloadOutlined />}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Space>
        </div>
    );
};

export default PermissionSearchForm;
