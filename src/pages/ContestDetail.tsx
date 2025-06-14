import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestQueries } from '../hooks/useContestQueries';
import { Contest, CreateContestData } from '../apis/type';
import { Button, Card, Modal, Input, Typography, Space, Row, Col, DatePicker, Tabs, Form, Switch, message, InputNumber, Table, Select, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useGetQuestionsByCreator } from '../hooks/useQuestionQueries';
import { useGetMatricesByUser } from '../hooks/useMatrixQueries';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

export const ContestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const { getContestById, updateContest, deleteContest, addQuestionToContest, removeQuestionFromContest, addQuestionsByMatrix } = useContestQueries();
    const contestQuery = getContestById(Number(id));

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

    // --- Question Tab State ---
    const [questionMode, setQuestionMode] = useState<'manual' | 'matrix'>('manual');
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
    const [questionPoints, setQuestionPoints] = useState<{ [key: number]: number }>({});
    const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(null);
    const [isMatrixValid, setIsMatrixValid] = useState(false);
    const [matrixCheckMsg, setMatrixCheckMsg] = useState<string>('');
    const userId = user?.id;
    const { data: allQuestions = [], isLoading: isQuestionsLoading } = useGetQuestionsByCreator(userId);
    const { data: matrices = [], isLoading: isMatricesLoading } = useGetMatricesByUser(userId);
    const [questionsScores, setQuestionsScores] = useState<{ [key: number]: number }>({});
    // ---

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
                                        value={`${window.location.origin}/contests/access/${contest.id}`}
                                        readOnly
                                        style={{ borderColor: '#ff6a00' }}
                                    />
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/contests/access/${contest.id}`);
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
                                    dataSource={contest.questions || []}
                                    columns={[
                                        { title: 'Name', dataIndex: 'questionName', key: 'questionName' },
                                        { title: 'Type', dataIndex: 'questionType', key: 'questionType' },
                                        { title: 'Difficulty', dataIndex: 'difficulty_level', key: 'difficulty_level' },
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
                                                <Button danger onClick={() => handleRemoveQuestion(record)}>Remove</Button>
                                            )
                                        }
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                />
                                <Divider orientation="left">All Questions</Divider>
                                <Table
                                    dataSource={allQuestions}
                                    columns={[
                                        { title: 'Name', dataIndex: 'questionName', key: 'questionName' },
                                        { title: 'Type', dataIndex: 'questionType', key: 'questionType' },
                                        { title: 'Difficulty', dataIndex: 'difficulty_level', key: 'difficulty_level' },
                                        {
                                            title: 'Action',
                                            key: 'action',
                                            render: (_: any, record: any) => (
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
                                    pagination={{ pageSize: 5 }}
                                    loading={isQuestionsLoading}
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
                                    {matrices.map((matrix: any) => (
                                        <Option key={matrix.id} value={matrix.id.toString()}>{matrix.name}</Option>
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
        </div>
    );
};

export default ContestDetail; 