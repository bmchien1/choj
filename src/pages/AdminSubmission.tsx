import React from 'react';
import { useGetAllSubmissions } from '../hooks/useSubmissionQueries';
import { Table, Typography, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Submission } from '../apis/type';

const { Title, Text } = Typography;

export const AdminSubmission: React.FC = () => {
    const { data: submissions, isLoading, error } = useGetAllSubmissions();
    const [searchText, setSearchText] = React.useState('');

    const filteredSubmissions = React.useMemo(() => {
        if (!submissions) return [];
        return submissions.filter(submission => 
            submission.user.email.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [submissions, searchText]);

    const columns = [
        {
            title: 'User',
            dataIndex: ['user', 'email'],
            key: 'user',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
        },
        {
            title: 'Submitted At',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date: string) => new Date(date).toLocaleString(),
        },
    ];

    if (isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    if (error) return <div style={{ padding: 24 }}><Text type="danger">Error loading submissions</Text></div>;

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 16 }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>All Submissions</Title>
                    <Input
                        placeholder="Search by user email"
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={filteredSubmissions}
                rowKey="id"
                style={{ background: '#fff' }}
            />
        </div>
    );
};

export default AdminSubmission;
