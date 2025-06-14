import React, { useState } from 'react';
import { useContestQueries } from '../hooks/useContestQueries';
import { Contest, CreateContestData } from '../apis/type';
import { Button, Table, Modal, Input, Typography, Space, message, InputNumber, Form, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const TeacherContestView: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const navigate = useNavigate();
    const { teacherContests, createContest, deleteContest } = useContestQueries(user?.id);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleCreateSubmit = async (values: any) => {
        try {
            const formData: CreateContestData = {
                title: values.title,
                description: values.description,
                isPublic: values.isPublic || false,
                startTime: values.startTime.toDate(),
                endTime: values.endTime.toDate(),
                duration: values.duration,
                userId: user?.id || 0
            };

            const newContest = await createContest.mutateAsync(formData);
            setIsCreateModalOpen(false);
            form.resetFields();
            message.success('Contest created successfully');
            navigate(`/contests/${newContest.id}`);
        } catch (error) {
            message.error('Failed to create contest');
        }
    };

    const handleDelete = async (contestId: number) => {
        try {
            await deleteContest.mutateAsync({ id: contestId, userId: user.id });
            message.success('Contest deleted successfully');
        } catch (error) {
            message.error('Failed to delete contest');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'isPublic',
            key: 'isPublic',
            render: (isPublic: boolean) => (
                <Text type={isPublic ? 'success' : 'warning'}>
                    {isPublic ? 'Public' : 'Private'}
                </Text>
            ),
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Contest) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/contests/${record.id}`)}
                    />
                    <Button
                        type="text"
                        icon={<FileTextOutlined />}
                        onClick={() => navigate(`/teacher/submission/contest/${record.id}`)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    if (teacherContests.isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    if (teacherContests.error) return <div style={{ padding: 24 }}><Text type="danger">Error loading contests</Text></div>;

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Space style={{ marginBottom: 16 }} align="center">
                <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>My Contests</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                >
                    Create Contest
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={teacherContests.data}
                rowKey="id"
                style={{ background: '#fff' }}
            />

            <Modal
                title={<span style={{ color: '#ff6a00' }}>Create Contest</span>}
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateSubmit}
                    initialValues={{
                        duration: 60,
                        startTime: dayjs(),
                        endTime: dayjs().add(1, 'day'),
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter the contest title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter the contest description' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="startTime"
                        label="Start Time"
                        rules={[{ required: true, message: 'Please select the start time' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="End Time"
                        rules={[{ required: true, message: 'Please select the end time' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Duration (minutes)"
                        rules={[{ required: true, message: 'Please enter the duration' }]}
                    >
                        <InputNumber min={1} max={600} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createContest.isPending}
                            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                            className="mr-2"
                        >
                            Create Contest
                        </Button>
                        <Button
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherContestView;
