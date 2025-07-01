import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Modal, message } from 'antd';
import { contestService } from '../apis/service/contestService';
import { Contest } from '../apis/type';
import moment from 'moment';
import { useGetSubmissionsByContest } from '../hooks/useSubmissionQueries';
import { Table, Tag } from 'antd';

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

export const ContestAccess: React.FC = () => {
    const { url } = useParams<{ url: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'continue' | 'start' | 'review'>('start');
    const [attempts, setAttempts] = useState<any[]>([]);

    useEffect(() => {
        const fetchContest = async () => {
            try {
                if (!url) {
                    message.error('Invalid contest URL');
                    navigate('/contests');
                    return;
                }

                const contestData = await contestService.getContestByUrl(url);
                if (!contestData) {
                    message.error('Contest not found');
                    navigate('/contests');
                    return;
                }

                setContest(contestData);

                // Fetch attempts for this contest
                const contestAttempts = await contestService.getAttemptsByUserAndContest(user.id, contestData.id);
                setAttempts(contestAttempts);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching contest:', error);
                message.error('Failed to load contest');
                navigate('/contests');
            }
        };

        fetchContest();
    }, [url, user.id, navigate]);

    const handleJoinContest = () => {
        if (!contest) return;

        const activeAttempt = attempts.find(a => !a.isSubmitted);
        const submittedAttempt = attempts.find(a => a.isSubmitted);

        if (submittedAttempt) {
            message.info('You have already submitted this contest');
            return;
        }

        if (activeAttempt) {
            setModalType('continue');
        } else {
            setModalType('start');
        }
        setIsModalVisible(true);
    };

    const handleStartContest = () => {
        if (contest) {
            navigate(`/do-contest/${contest.id}`);
        }
    };

    const handleViewResults = () => {
        setModalType('review');
        setIsModalVisible(true);
    };

    if (loading) {
        return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    }

    if (!contest) {
        return <div style={{ padding: 24 }}><Text type="danger">Contest not found</Text></div>;
    }

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    const activeAttempt = attempts.find(a => !a.isSubmitted);
    const submittedAttempt = attempts.find(a => a.isSubmitted);

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ color: '#ff6a00', marginBottom: 16 }}>{contest.title}</Title>
                        <Paragraph>{contest.description}</Paragraph>
                    </div>

                    <Space direction="vertical">
                        <Text>Start: {moment(contest.startTime).format('YYYY-MM-DD HH:mm')}</Text>
                        <Text>End: {moment(contest.endTime).format('YYYY-MM-DD HH:mm')}</Text>
                        <Text>Duration: {contest.duration} minutes</Text>
                        {activeAttempt && !submittedAttempt && (
                            <Text type="warning">
                                Time left: {Math.floor(activeAttempt.timeLeft / 60)}:{(activeAttempt.timeLeft % 60).toString().padStart(2, '0')}
                            </Text>
                        )}
                    </Space>

                    <div>
                        {(() => {
                            if (now < startTime) {
                                return (
                                    <Text type="warning">
                                        Contest has not started yet
                                    </Text>
                                );
                            }

                            if (now > endTime) {
                                if (submittedAttempt) {
                                    return (
                                        <Button
                                            type="primary"
                                            onClick={handleViewResults}
                                            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                        >
                                            View Results
                                        </Button>
                                    );
                                }
                                return (
                                    <Text type="danger">
                                        Contest has ended
                                    </Text>
                                );
                            }

                            if (submittedAttempt) {
                                return (
                                    <Button
                                        type="primary"
                                        onClick={handleViewResults}
                                        style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                    >
                                        View Results
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    type="primary"
                                    onClick={handleJoinContest}
                                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                >
                                    {activeAttempt ? 'Continue Contest' : 'Join Contest'}
                                </Button>
                            );
                        })()}
                    </div>
                </Space>
            </Card>

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
                    <SubmissionHistory contestId={contest.id} />
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

export default ContestAccess; 