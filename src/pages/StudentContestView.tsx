import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Row, Col, Space, Modal, Tag, Table } from 'antd';
import { useContestQueries } from '../hooks/useContestQueries';
import { Contest } from '../apis/type';
import { contestService } from '../apis/service/contestService';
import { useGetSubmissionsByContest } from '../hooks/useSubmissionQueries';
import moment from 'moment';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SubmissionHistory: React.FC<{ contestId: number }> = ({ contestId }) => {
    const { data: submissions, isLoading } = useGetSubmissionsByContest(contestId);

    const columns = [
        {
            title: 'Submitted At',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => `${score.toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={
                    status === 'completed' ? 'success' :
                    status === 'evaluating' ? 'processing' :
                    status === 'failed' ? 'error' : 'default'
                }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
    ];

    if (isLoading) return <Text>Loading submission history...</Text>;

    return (
        <Table
            columns={columns}
            dataSource={submissions}
            rowKey="id"
            pagination={false}
        />
    );
};

export const StudentContestView: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'continue' | 'start' | 'review'>('start');
    const { publicContests } = useContestQueries();
    const [contestAttempts, setContestAttempts] = useState<{ [key: number]: any[] }>({});

    useEffect(() => {
        const fetchAttempts = async () => {
            if (publicContests.data) {
                const attempts: { [key: number]: any[] } = {};
                for (const contest of publicContests.data) {
                    try {
                        const contestAttempts = await contestService.getAttemptsByUserAndContest(user.id, contest.id);
                        attempts[contest.id] = contestAttempts;
                    } catch (error) {
                        console.error(`Error fetching attempts for contest ${contest.id}:`, error);
                    }
                }
                setContestAttempts(attempts);
            }
        };

        fetchAttempts();
    }, [publicContests.data, user.id]);

    const handleJoinContest = (contest: Contest) => {
        setSelectedContest(contest);
        const attempts = contestAttempts[contest.id] || [];
        const activeAttempt = attempts.find(a => !a.isSubmitted);
        if (activeAttempt) {
            setModalType('continue');
        } else {
            setModalType('start');
        }
        setIsModalVisible(true);
    };

    const handleViewResults = (contest: Contest) => {
        setSelectedContest(contest);
        setModalType('review');
        setIsModalVisible(true);
    };

    const handleStartContest = () => {
        if (selectedContest) {
            navigate(`/do-contest/${selectedContest.id}`);
        }
    };

    const getContestStatus = (contest: Contest) => {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        const attempts = contestAttempts[contest.id] || [];
        const submittedAttempt = attempts.find(a => a.isSubmitted);
        const activeAttempt = attempts.find(a => !a.isSubmitted);

        // If there's a submitted attempt, show Submitted status regardless of contest time
        if (submittedAttempt) {
            return {
                status: 'submitted',
                text: 'Submitted',
                color: 'success',
                icon: <CheckCircleOutlined />
            };
        }

        if (now < startTime) {
            return {
                status: 'upcoming',
                text: 'Upcoming',
                color: 'blue',
                icon: <ClockCircleOutlined />
            };
        } else if (now > endTime) {
            return {
                status: 'ended',
                text: 'Ended',
                color: 'error',
                icon: <CloseCircleOutlined />
            };
        } else {
            if (activeAttempt) {
                return {
                    status: 'in_progress',
                    text: 'In Progress',
                    color: 'processing',
                    icon: <ClockCircleOutlined />
                };
            }
            return {
                status: 'available',
                text: 'Available',
                color: 'green',
                icon: <CheckCircleOutlined />
            };
        }
    };

    if (publicContests.isLoading) {
        return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    }

    if (publicContests.error) {
        return <div style={{ padding: 24 }}><Text type="danger">Error loading contests</Text></div>;
    }

    const contests = publicContests.data || [];

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Title level={2} style={{ color: '#ff6a00', marginBottom: 24 }}>Available Contests</Title>
            <Row gutter={[16, 16]}>
                {contests.map((contest: Contest) => {
                    const status = getContestStatus(contest);
                    const attempts = contestAttempts[contest.id] || [];
                    const submittedAttempt = attempts.find(a => a.isSubmitted);
                    const activeAttempt = attempts.find(a => !a.isSubmitted);

                    return (
                        <Col xs={24} sm={12} md={8} lg={6} key={contest.id}>
                            <Card
                                style={{ marginBottom: 16 }}
                                hoverable
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <Title level={4}>{contest.title}</Title>
                                        <Paragraph>{contest.description}</Paragraph>
                                        <Space direction="vertical">
                                            <Text>Start: {moment(contest.startTime).format('YYYY-MM-DD HH:mm')}</Text>
                                            <Text>End: {moment(contest.endTime).format('YYYY-MM-DD HH:mm')}</Text>
                                            <Text>Duration: {contest.duration} minutes</Text>
                                            <Tag icon={status.icon} color={status.color}>
                                                {status.text}
                                            </Tag>
                                            {activeAttempt && !submittedAttempt && (
                                                <Text type="warning">
                                                    Time left: {Math.floor(activeAttempt.timeLeft / 60)}:{(activeAttempt.timeLeft % 60).toString().padStart(2, '0')}
                                                </Text>
                                            )}
                                            {!contest.isPublic && (
                                                <Space>
                                                    <Tag icon={<LockOutlined />} color="warning">Private Contest</Tag>
                                                    <Space>
                                                        <Text copyable={{ 
                                                            text: `${window.location.origin}/contests/access/${contest.accessUrl}`,
                                                            tooltips: ['Copy URL', 'Copied!']
                                                        }}>
                                                            Access URL
                                                        </Text>
                                                    </Space>
                                                </Space>
                                            )}
                                        </Space>
                                    </div>
                                    <div>
                                        {(() => {
                                            const now = new Date();
                                            const startTime = new Date(contest.startTime);
                                            const endTime = new Date(contest.endTime);
                                            
                                            if (submittedAttempt) {
                                                return (
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleViewResults(contest)}
                                                        style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                                    >
                                                        View Results
                                                    </Button>
                                                );
                                            }
                                            
                                            if (activeAttempt) {
                                                return (
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleJoinContest(contest)}
                                                        style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                                    >
                                                        Continue Contest
                                                    </Button>
                                                );
                                            }
                                            
                                            if (now >= startTime && now <= endTime) {
                                                return (
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleJoinContest(contest)}
                                                        style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                                    >
                                                        Join Contest
                                                    </Button>
                                                );
                                            }
                                            
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <Modal
                title={
                    <span style={{ color: '#ff6a00' }}>
                        {modalType === 'continue' ? 'Continue Contest' : 
                         modalType === 'start' ? 'Start Contest' : 
                         'Submission History'}
                    </span>
                }
                open={isModalVisible}
                onOk={modalType === 'review' ? undefined : handleStartContest}
                onCancel={() => setIsModalVisible(false)}
                okText={modalType === 'continue' ? 'Continue' : 'Start'}
                okButtonProps={modalType === 'review' ? undefined : { style: { background: '#ff6a00', borderColor: '#ff6a00' } }}
                width={modalType === 'review' ? 800 : 520}
                footer={modalType === 'review' ? null : undefined}
            >
                {modalType === 'review' ? (
                    selectedContest && <SubmissionHistory contestId={selectedContest.id} />
                ) : (
                    <>
                        <p>
                            {modalType === 'continue'
                                ? 'You have an ongoing attempt. Would you like to continue?'
                                : 'Are you sure you want to start this contest?'}
                        </p>
                        {modalType === 'continue' && (
                            <p style={{ color: '#ff4d4f' }}>
                                Note: Your previous progress will be saved.
                            </p>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default StudentContestView;
