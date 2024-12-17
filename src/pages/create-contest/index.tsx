import React, { useState } from 'react';
import {
    Form,
    Input,
    Switch,
    Button,
    Card,
} from 'antd';
import toast from 'react-hot-toast';
import contestService from "@/apis/service/contestService.ts";

const CreateContest: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);

            const contestData = {
                contestName: values.contestName,
                creator: values.creator,
                description: values.description,
                isPublic: values.isPublic || false,
            };

            const response = await contestService.create(contestData);

            if (response) {
                toast.success('Contest created successfully');
                form.resetFields();
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Card title="Create New Contest">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="contestName"
                        label="Contest Name"
                        rules={[{ required: true, message: 'Please enter the contest name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="creator"
                        label="Creator"
                        rules={[{ required: true, message: 'Please enter the creator name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="isPublic"
                        label="Is Public"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create Contest
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateContest;
