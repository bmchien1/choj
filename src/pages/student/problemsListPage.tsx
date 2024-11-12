import { useState, useEffect, Key } from 'react';
import { Table, Tag, Select, Input, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';


const { Option } = Select;

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    status: string;
}

const ProblemListPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchProblems();
    }, [difficultyFilter, searchTerm]);

    const fetchProblems = async () => {
        try {
            // Replace with API call to fetch problems
            const data: Problem[] = [
                { id: 1, title: 'Problem 1', difficulty: 'Easy', status: 'Solved' },
                { id: 2, title: 'Problem 2', difficulty: 'Medium', status: 'Attempted' },
                { id: 3, title: 'Problem 3', difficulty: 'Hard', status: 'Unsolved' },
            ];
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Problem) => (
                <a onClick={() => navigate(`/problems/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Difficulty',
            dataIndex: 'difficulty',
            key: 'difficulty',
            filters: [
                { text: 'Easy', value: 'Easy' },
                { text: 'Medium', value: 'Medium' },
                { text: 'Hard', value: 'Hard' },
            ],
            onFilter: (value: string | Key | boolean, record: Problem) => record.difficulty === value,
            render: (difficulty: string) => {
                let color = difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'orange' : 'red';
                return <Tag color={color}>{difficulty}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span>{status}</span>
            ),
        },
    ];

    return (
        <div style={{ padding: '16px', background: '#fff', minHeight: '100vh' }}>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Filter by Difficulty"
                    allowClear
                    onChange={(value) => setDifficultyFilter(value)}
                    style={{ width: 200 }}
                >
                    <Option value="Easy">Easy</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Hard">Hard</Option>
                </Select>
                <Input
                    placeholder="Search by title"
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 200 }}
                />
            </Space>
            <Table
                columns={columns}
                dataSource={problems}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    total: problems.length,
                    showSizeChanger: true,
                }}
                style={{ width: '100%' }}
                scroll={{ x: '100%' }}
            />
        </div>
    );
};

export default ProblemListPage;
