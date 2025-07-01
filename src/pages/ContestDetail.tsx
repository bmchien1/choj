import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestQueries } from '../hooks/useContestQueries';
import { CreateContestData, Matrix, QuestionTable, Tag } from '../apis/type';
import { Button, Card, Modal, Input, Typography, Space, Row, Col, DatePicker, Tabs, Form, Switch, message, InputNumber, Table, Select, Divider } from 'antd';
import { DeleteOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useGetQuestionsByCreator } from '../hooks/useQuestionQueries';
import { useGetMatricesByUser } from '../hooks/useMatrixQueries';
import { useGetAllTags } from '../hooks/useTagQueries';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';

const { Title, Text,  } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: SortOrder;
    filters?: Record<string, FilterValue | null>;
}

interface MatricesResponse {
    matrices: Matrix[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

export const ContestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const { getContestById, updateContest, deleteContest, addQuestionToContest, removeQuestionFromContest, addQuestionsByMatrix } = useContestQueries();
    const contestQuery = getContestById(Number(id));

    // Add more detailed debug logs
    useEffect(() => {
        if (contestQuery.data) {
            console.log('Contest data:', contestQuery.data);
            console.log('Questions array:', contestQuery.data.questions);
            console.log('Questions type:', typeof contestQuery.data.questions);
            console.log('Is questions array:', Array.isArray(contestQuery.data.questions));
            if (contestQuery.data.questions) {
                console.log('First question:', contestQuery.data.questions[0]);
            }
        }
    }, [contestQuery.data]);

    // Initialize questionsScores from contest data
    useEffect(() => {
        if (contestQuery.data?.questions_scores) {
            setQuestionsScores(contestQuery.data.questions_scores);
        }
    }, [contestQuery.data]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateContestData>({
        title: '',
        description: '',
        isPublic: false,
        startTime: new Date(),
        endTime: new Date(),
        duration: 60,
        userId: user?.id || 0
    });
    const [hasChanges, setHasChanges] = useState(false);

    // Add tableParams state first
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
        sortField: undefined,
        sortOrder: undefined,
        filters: {},
    });

    // --- Question Tab State ---
    const [questionMode, setQuestionMode] = useState<'manual' | 'matrix'>('manual');
    const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(null);
    const userId = user?.id;
    const { data: questionsData = { questions: [], pagination: { total: 0 } }, isLoading: isQuestionsLoading } = useGetQuestionsByCreator(userId, {
        page: tableParams.pagination?.current || 1,
        limit: tableParams.pagination?.pageSize || 10,
        search: tableParams.filters?.questionName?.[0] as string,
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder as 'ascend' | 'descend',
        difficulty: tableParams.filters?.difficulty_level?.[0] as string,
        type: tableParams.filters?.questionType?.[0] as string,
        tags: tableParams.filters?.tags as number[]
    });

    // Add debug log for questions data
    useEffect(() => {
        console.log('Questions Data:', questionsData);
        console.log('Questions Array:', questionsData.questions);
    }, [questionsData]);

    const { data: matrices = { matrices: [], pagination: { total: 0, page: 1, limit: 10 } }, isLoading: isMatricesLoading } = useGetMatricesByUser(userId);
    const [questionsScores, setQuestionsScores] = useState<{ [key: number]: number }>({});

    const { data: tagsData = { tags: [] } } = useGetAllTags();

    useEffect(() => {
        if (contestQuery.data) {
            setFormData({
                title: contestQuery.data.title,
                description: contestQuery.data.description,
                isPublic: contestQuery.data.isPublic,
                startTime: new Date(contestQuery.data.startTime),
                endTime: new Date(contestQuery.data.endTime),
                duration: contestQuery.data.duration || 60,
                userId: user?.id || 0
            });
        }
    }, [contestQuery.data]);

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleEditSubmit = async () => {
        if (id) {
            try {
                await updateContest.mutateAsync({
                    id: Number(id),
                    data: {
                        ...formData,
                        id: Number(id),
                        questions_scores: questionsScores
                    }
                });
                setIsEditModalOpen(false);
                setHasChanges(false);
                message.success('Contest updated successfully');
            } catch (error) {
                message.error('Failed to update contest');
            }
        }
    };

    const handleDelete = async () => {
        if (id && user?.id) {
            try {
                await deleteContest.mutateAsync({ id: Number(id), userId: user.id });
                message.success('Contest deleted successfully');
                navigate('/contests');
            } catch (error) {
                message.error('Failed to delete contest');
            }
        }
    };

    // Update contest questions_scores
    const updateContestScores = async (newScores: { [key: number]: number }) => {
        try {
            await updateContest.mutateAsync({
                id: contest.id,
                data: {
                    ...formData,
                    id: contest.id,
                    questions_scores: newScores
                }
            });
            setHasChanges(false);
            message.success('Scores updated');
        } catch (error) {
            message.error('Failed to update scores');
        }
    };

    // Add question to contest
    const handleAddQuestion = async (question: any) => {
        try {
            await addQuestionToContest.mutateAsync({ contestId: contest.id, questionId: question.id, userId });
            setQuestionsScores((prev) => ({ ...prev, [question.id]: 1 })); // default 1 point
            updateContestScores({ ...questionsScores, [question.id]: 1 });
            message.success('Question added to contest');
        } catch (e: any) {
            message.error(e.message || 'Failed to add question');
        }
    };
    // Remove question from contest
    const handleRemoveQuestion = async (question: any) => {
        try {
            await removeQuestionFromContest.mutateAsync({ contestId: contest.id, questionId: question.id, userId });
            const newScores = { ...questionsScores };
            delete newScores[question.id];
            setQuestionsScores(newScores);
            updateContestScores(newScores);
            message.success('Question removed from contest');
        } catch (e: any) {
            message.error(e.message || 'Failed to remove question');
        }
    };
    // Change points for a question
    const handlePointsChange = (questionId: number, points: number) => {
        const newScores = { ...questionsScores, [questionId]: points };
        setQuestionsScores(newScores);
        updateContestScores(newScores);
    };
    // Add questions by matrix
    const handleAddByMatrix = async () => {
        if (!selectedMatrixId) return;
        try {
            await addQuestionsByMatrix.mutateAsync({ contestId: contest.id, matrixId: Number(selectedMatrixId), userId });
            message.success('Questions added by matrix');
        } catch (e: any) {
            message.error(e.message || 'Failed to add by matrix');
        }
    };

    // Update table change handler
    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<QuestionTable> | SorterResult<QuestionTable>[]
    ) => {
        const sortField = Array.isArray(sorter) ? sorter[0]?.field : sorter.field;
        const sortOrder = Array.isArray(sorter) ? sorter[0]?.order : sorter.order;
        
        setTableParams({
            pagination,
            sortField: typeof sortField === 'string' ? sortField : undefined,
            sortOrder: sortOrder || undefined,
            filters,
        });
    };

    if (contestQuery.isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    if (contestQuery.error) return <div style={{ padding: 24 }}><Text type="danger">Error loading contest</Text></div>;

    const contest = contestQuery.data;

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ color: '#ff6a00', margin: 0 }}>{contest.title}</Title>
                </Col>
                <Col>
                    <Space>
                        {hasChanges && (
                            <Text type="warning">You have unsaved changes</Text>
                        )}
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleEditSubmit}
                            disabled={!hasChanges}
                            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                        >
                            Save Changes
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                            style={{ background: '#fff0e6', color: '#ff6a00', borderColor: '#ff6a00' }}
                        >
                            Delete Contest
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Tabs defaultActiveKey="1">
                <TabPane tab="General Information" key="1">
                    <Card>
                        <Form layout="vertical">
                            <Form.Item label="Title">
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label="Description">
                                <TextArea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleFormChange('description', e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label="Public">
                                <Switch
                                    checked={formData.isPublic}
                                    onChange={(checked) => handleFormChange('isPublic', checked)}
                                />
                            </Form.Item>
                            <Form.Item label="Access Link">
                                <Space>
                                    <Input
                                        value={`${window.location.origin}/contests/access/${contest.accessUrl}`}
                                        readOnly
                                        style={{ borderColor: '#ff6a00' }}
                                    />
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/contests/access/${contest.accessUrl}`);
                                            message.success('Link copied to clipboard');
                                        }}
                                        style={{ background: '#ff6a00', borderColor: '#ff6a00', color: '#fff' }}
                                    >
                                        Copy
                                    </Button>
                                </Space>
                            </Form.Item>
                            <Form.Item label="Duration (minutes)">
                                <InputNumber
                                    min={1}
                                    max={600}
                                    value={formData.duration}
                                    onChange={(value) => handleFormChange('duration', value || 1)}
                                    style={{ width: '100%', borderColor: '#ff6a00' }}
                                    placeholder="Duration (minutes)"
                                />
                            </Form.Item>
                            <Form.Item label="Start Time">
                                <DatePicker
                                    showTime
                                    value={moment(formData.startTime)}
                                    onChange={(date) => date && handleFormChange('startTime', date.toDate())}
                                    style={{ width: '100%', borderColor: '#ff6a00' }}
                                />
                            </Form.Item>
                            <Form.Item label="End Time">
                                <DatePicker
                                    showTime
                                    value={moment(formData.endTime)}
                                    onChange={(date) => date && handleFormChange('endTime', date.toDate())}
                                    style={{ width: '100%', borderColor: '#ff6a00' }}
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>
                <TabPane tab="Questions" key="2">
                    <Card>
                        <Row justify="space-between" style={{ marginBottom: 16 }}>
                            <Col>
                                <Title level={4}>Questions</Title>
                            </Col>
                            <Col>
                                <Select value={questionMode} onChange={setQuestionMode} style={{ width: 180, marginRight: 8 }}>
                                    <Option value="manual">Add Manually</Option>
                                    <Option value="matrix">Add by Matrix</Option>
                                </Select>
                            </Col>
                        </Row>
                        {questionMode === 'manual' ? (
                            <>
                                <Divider orientation="left">Selected Questions</Divider>
                                <Table
                                    dataSource={Array.isArray(contest.questions) ? contest.questions : []}
                                    columns={[
                                        { 
                                            title: 'Name', 
                                            dataIndex: 'questionName', 
                                            key: 'questionName',
                                            render: ( record: any) => {
                                                console.log('Rendering question:', record);
                                                return record || record.questionName || 'No name';
                                            }
                                        },
                                        { 
                                            title: 'Type', 
                                            dataIndex: 'questionType', 
                                            key: 'questionType',
                                            render: (text: string) => {
                                                if (!text) return 'Unknown';
                                                return text.charAt(0).toUpperCase() + text.slice(1).replace('-', ' ');
                                            }
                                        },
                                        { 
                                            title: 'Difficulty', 
                                            dataIndex: 'difficulty_level', 
                                            key: 'difficulty_level',
                                            render: (text: string) => text || 'Not specified'
                                        },
                                        {
                                            title: 'Points',
                                            key: 'points',
                                            render: (_: any, record: any) => (
                                                <InputNumber
                                                    min={1}
                                                    value={questionsScores[record.id] || 1}
                                                    onChange={(value) => handlePointsChange(record.id, value || 1)}
                                                    style={{ width: 80 }}
                                                />
                                            )
                                        },
                                        {
                                            title: 'Action',
                                            key: 'action',
                                            render: (_: any, record: any) => (
                                                <Button 
                                                    danger 
                                                    onClick={() => handleRemoveQuestion(record)}
                                                    style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
                                                >
                                                    Remove
                                                </Button>
                                            )
                                        }
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                />
                                <Divider orientation="left">All Questions</Divider>
                                <Card style={{ marginBottom: 16 }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Input.Search
                                            placeholder="Search questions..."
                                            allowClear
                                            enterButton="Search"
                                            size="large"
                                            value={String(tableParams.filters?.questionName?.[0] || '')}
                                            onChange={(e) => setTableParams(prev => ({
                                                ...prev,
                                                filters: { ...prev.filters, questionName: e.target.value ? [e.target.value] : null }
                                            }))}
                                            onSearch={(value) => setTableParams(prev => ({
                                                ...prev,
                                                filters: { ...prev.filters, questionName: value ? [value] : null }
                                            }))}
                                            style={{ width: 300 }}
                                            className="custom-search"
                                        />
                                        <Space wrap>
                                            <Select
                                                placeholder="Question Type"
                                                allowClear
                                                style={{ width: 200 }}
                                                onChange={(value) => setTableParams(prev => ({
                                                    ...prev,
                                                    filters: { ...prev.filters, questionType: value ? [value] : null }
                                                }))}
                                                value={tableParams.filters?.questionType?.[0]}
                                                className="custom-select"
                                            >
                                                <Option value="multiple-choice">Multiple Choice</Option>
                                                <Option value="short-answer">Short Answer</Option>
                                                <Option value="coding">Coding</Option>
                                            </Select>
                                            <Select
                                                placeholder="Difficulty Level"
                                                allowClear
                                                style={{ width: 200 }}
                                                onChange={(value) => setTableParams(prev => ({
                                                    ...prev,
                                                    filters: { ...prev.filters, difficulty_level: value ? [value] : null }
                                                }))}
                                                value={tableParams.filters?.difficulty_level?.[0]}
                                                className="custom-select"
                                            >
                                                <Option value="Easy">Easy</Option>
                                                <Option value="Medium">Medium</Option>
                                                <Option value="Hard">Hard</Option>
                                            </Select>
                                            <Select
                                                placeholder="Tags"
                                                allowClear
                                                mode="multiple"
                                                style={{ width: 300 }}
                                                onChange={(value) => setTableParams(prev => ({
                                                    ...prev,
                                                    filters: { ...prev.filters, tags: value }
                                                }))}
                                                value={tableParams.filters?.tags}
                                                className="custom-select"
                                            >
                                                {tagsData.tags.map((tag: Tag) => (
                                                    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                                                ))}
                                            </Select>
                                            <Button 
                                                onClick={() => {
                                                    setTableParams(prev => ({
                                                        ...prev,
                                                        filters: {},
                                                        pagination: { current: 1, pageSize: 10 },
                                                        sortField: undefined,
                                                        sortOrder: undefined
                                                    }));
                                                }}
                                                style={{ 
                                                    borderColor: '#ff6a00',
                                                    color: '#ff6a00'
                                                }}
                                            >
                                                Reset Filters
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                                <Table
                                    dataSource={questionsData.questions || []}
                                    columns={[
                                        { 
                                            title: 'Name', 
                                            dataIndex: 'questionName', 
                                            key: 'questionName',
                                            render: (text: string) => text || 'No name',
                                            sorter: (a: QuestionTable, b: QuestionTable) => (a.questionName || '').localeCompare(b.questionName || ''),
                                            sortOrder: tableParams.sortField === 'questionName' ? tableParams.sortOrder : undefined
                                        },
                                        { 
                                            title: 'Question', 
                                            dataIndex: 'question', 
                                            key: 'question',
                                            render: (text: string) => text || 'No question',
                                            ellipsis: true
                                        },
                                        { 
                                            title: 'Type', 
                                            dataIndex: 'questionType', 
                                            key: 'questionType',
                                            render: (text: string) => {
                                                if (!text) return 'Unknown';
                                                return text.charAt(0).toUpperCase() + text.slice(1).replace('-', ' ');
                                            },
                                            filters: [
                                                { text: 'Multiple Choice', value: 'multiple-choice' },
                                                { text: 'Short Answer', value: 'short-answer' },
                                                { text: 'Coding', value: 'coding' }
                                            ],
                                            filteredValue: tableParams.filters?.questionType
                                        },
                                        { 
                                            title: 'Difficulty', 
                                            dataIndex: 'difficulty_level', 
                                            key: 'difficulty_level',
                                            render: (text: string) => text || 'Not specified',
                                            filters: [
                                                { text: 'Easy', value: 'Easy' },
                                                { text: 'Medium', value: 'Medium' },
                                                { text: 'Hard', value: 'Hard' }
                                            ],
                                            filteredValue: tableParams.filters?.difficulty_level
                                        },
                                        {
                                            title: 'Tags',
                                            dataIndex: 'tags',
                                            key: 'tags',
                                            render: (tags: Tag[]) => (
                                                <Space wrap>
                                                    {tags?.map((tag) => (
                                                        <span key={tag.id} style={{ 
                                                            background: '#fff1e6', 
                                                            color: '#ff6a00',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ff6a00'
                                                        }}>
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </Space>
                                            ),
                                            filters: tagsData.tags.map((tag: Tag) => ({
                                                text: tag.name,
                                                value: tag.id
                                            })),
                                            filteredValue: tableParams.filters?.tags,
                                            filterMultiple: true
                                        },
                                        {
                                            title: 'Action',
                                            key: 'action',
                                            render: (_: any, record: QuestionTable) => (
                                                <Button
                                                    type="primary"
                                                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                                    onClick={() => handleAddQuestion(record)}
                                                    disabled={!!(contest.questions || []).find((q: any) => q.id === record.id)}
                                                >
                                                    Add
                                                </Button>
                                            )
                                        }
                                    ]}
                                    rowKey="id"
                                    pagination={{
                                        ...tableParams.pagination,
                                        total: questionsData.pagination?.total || 0,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} items`
                                    }}
                                    loading={isQuestionsLoading}
                                    onChange={handleTableChange}
                                    scroll={{ x: 1200 }}
                                />
                            </>
                        ) : (
                            <>
                                <Divider orientation="left">Add by Matrix</Divider>
                                <Select
                                    placeholder="Select a matrix"
                                    style={{ width: 300, marginBottom: 16 }}
                                    onChange={setSelectedMatrixId}
                                    loading={isMatricesLoading}
                                >
                                    {(matrices as MatricesResponse).matrices.map((matrix: Matrix) => (
                                        <Option key={matrix.id} value={matrix.id?.toString()}>{matrix.name}</Option>
                                    ))}
                                </Select>
                                <Button
                                    type="primary"
                                    style={{ background: '#ff6a00', borderColor: '#ff6a00', marginLeft: 8 }}
                                    onClick={handleAddByMatrix}
                                    disabled={!selectedMatrixId}
                                >
                                    Add All Questions by Matrix
                                </Button>
                            </>
                        )}
                    </Card>
                </TabPane>
            </Tabs>

            {/* Edit Contest Modal */}
            <Modal
                title="Edit Contest"
                open={isEditModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => setIsEditModalOpen(false)}
            >
                <Form layout="vertical">
                    <Form.Item label="Title">
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Description">
                        <TextArea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Public">
                        <Switch
                            checked={formData.isPublic}
                            onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                        />
                    </Form.Item>
                    <Form.Item label="Start Time">
                        <DatePicker
                            showTime
                            value={moment(formData.startTime)}
                            onChange={(date) => date && setFormData({ ...formData, startTime: date.toDate() })}
                            style={{ width: '100%', borderColor: '#ff6a00' }}
                        />
                    </Form.Item>
                    <Form.Item label="End Time">
                        <DatePicker
                            showTime
                            value={moment(formData.endTime)}
                            onChange={(date) => date && setFormData({ ...formData, endTime: date.toDate() })}
                            style={{ width: '100%', borderColor: '#ff6a00' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style>
                {`
                    .custom-search .ant-input-affix-wrapper:hover,
                    .custom-search .ant-input-affix-wrapper-focused {
                        border-color: #ff6a00 !important;
                        box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.2) !important;
                    }
                    .custom-search .ant-input-search-button {
                        background-color: #ff6a00 !important;
                        border-color: #ff6a00 !important;
                    }
                    .custom-search .ant-input-search-button:hover {
                        background-color: #e65c00 !important;
                        border-color: #e65c00 !important;
                    }
                    .custom-select .ant-select-selector:hover,
                    .custom-select.ant-select-focused .ant-select-selector {
                        border-color: #ff6a00 !important;
                        box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.2) !important;
                    }
                    .custom-select .ant-select-arrow {
                        color: #ff6a00 !important;
                    }
                    .custom-select .ant-select-selection-item {
                        background-color: #fff1e6 !important;
                        border-color: #ff6a00 !important;
                        color: #ff6a00 !important;
                    }
                    .custom-select .ant-select-selection-item-remove {
                        color: #ff6a00 !important;
                    }
                    .custom-select .ant-select-selection-item-remove:hover {
                        color: #e65c00 !important;
                    }
                `}
            </style>
        </div>
    );
};

export default ContestDetail; 