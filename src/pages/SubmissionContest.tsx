import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSubmissionsByContest } from '../hooks/useSubmissionQueries';
import { Table, Typography, Space } from 'antd';

const { Title, Text } = Typography;

export const SubmissionContest: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const { data: submissions, isLoading, error } = useGetSubmissionsByContest(Number(contestId));
    console.log(submissions);
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
            <Space style={{ marginBottom: 16 }} align="center">
                <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>Contest Submissions</Title>
            </Space>

            <Table
                columns={columns}
                dataSource={submissions}
                rowKey="id"
                style={{ background: '#fff' }}
            />
        </div>
    );
};

export default SubmissionContest;
