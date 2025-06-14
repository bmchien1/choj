import React, { useState } from 'react';
import { useContestQueries } from '../hooks/useContestQueries';
import { Contest, CreateContestData } from '../apis/type';
import { Button, Table, Modal, Input, Typography, Space, message, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const AdminContestView: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const navigate = useNavigate();
    const { publicContests, createContest, deleteContest } = useContestQueries();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateContestData>({
        title: '',
        description: '',
        isPublic: false,
        startTime: new Date(),
        endTime: new Date(),
        duration: 60,
        userId: user?.id || 0
    });

    const handleCreateSubmit = async () => {
        try {
            const newContest = await createContest.mutateAsync(formData);
            setIsCreateModalOpen(false);
            setFormData({
                title: '',
                description: '',
                isPublic: false,
                startTime: new Date(),
                endTime: new Date(),
                duration: 60,
                userId: user?.id || 0
            });
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
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    if (publicContests.isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    if (publicContests.error) return <div style={{ padding: 24 }}><Text type="danger">Error loading contests</Text></div>;

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Space style={{ marginBottom: 16 }} align="center">
                <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>All Contests</Title>
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
                dataSource={publicContests.data}
                rowKey="id"
                style={{ background: '#fff' }}
            />

            {/* Create Contest Modal */}
            <Modal
                title={<span style={{ color: '#ff6a00' }}>Create Contest</span>}
                open={isCreateModalOpen}
                onOk={handleCreateSubmit}
                onCancel={() => setIsCreateModalOpen(false)}
                okButtonProps={{ style: { background: '#ff6a00', borderColor: '#ff6a00' } }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={{ borderColor: '#ff6a00' }}
                    />
                    <TextArea
                        placeholder="Description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ borderColor: '#ff6a00' }}
                    />
                    <InputNumber
                        min={1}
                        max={600}
                        value={formData.duration}
                        onChange={(value) => setFormData({ ...formData, duration: value || 1 })}
                        style={{ width: '100%', borderColor: '#ff6a00' }}
                        placeholder="Duration (minutes)"
                    />
                </Space>
            </Modal>
        </div>
    );
};

export default AdminContestView;
