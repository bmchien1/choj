import React, { useState } from 'react';
import { useContestQueries } from '../hooks/useContestQueries';
import { Contest } from '../apis/type';
import { Card, Typography, Button, Modal, Space, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export const StudentContestView: React.FC = () => {
    const { publicContests,  } = useContestQueries();
    const navigate = useNavigate();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

    const handleJoinContest = (contest: Contest) => {
        setSelectedContest(contest);
        setIsJoinModalOpen(true);
    };

    const handleStartContest = () => {
        if (selectedContest) {
            navigate(`/do-contest/${selectedContest.id}`);
        }
    };

    if (publicContests.isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
    if (publicContests.error) return <div style={{ padding: 24 }}><Text type="danger">Error loading contests</Text></div>;

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
            <Title level={2} style={{ marginBottom: 24, color: '#ff6a00' }}>Available Contests</Title>

            <Row gutter={[16, 16]}>
                {publicContests.data?.map((contest: Contest) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={contest.id}>
                        <Card
                            title={<span style={{ color: '#ff6a00' }}>{contest.title}</span>}
                            extra={
                                <Button
                                    type="primary"
                                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                    onClick={() => handleJoinContest(contest)}
                                >
                                    Join Contest
                                </Button>
                            }
                        >
                            <Paragraph>{contest.description}</Paragraph>
                            <Text type="secondary">
                                Start: {new Date(contest.startTime).toLocaleString()}
                            </Text>
                            <br />
                            <Text type="secondary">
                                End: {new Date(contest.endTime).toLocaleString()}
                            </Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Join Contest Modal */}
            <Modal
                title={<span style={{ color: '#ff6a00' }}>Contest Information</span>}
                open={isJoinModalOpen}
                onOk={handleStartContest}
                onCancel={() => setIsJoinModalOpen(false)}
                okText="Bắt đầu"
                okButtonProps={{ style: { background: '#ff6a00', borderColor: '#ff6a00' } }}
            >
                {selectedContest && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={4} style={{ color: '#ff6a00', margin: 0 }}>{selectedContest.title}</Title>
                        <Paragraph>{selectedContest.description}</Paragraph>
                        <Text type="secondary">
                            {selectedContest.isPublic ? 'Public' : 'Private'}
                        </Text>
                        <Text type="secondary">
                            Start: {new Date(selectedContest.startTime).toLocaleString()}
                        </Text>
                        <Text type="secondary">
                            End: {new Date(selectedContest.endTime).toLocaleString()}
                        </Text>
                        <Text type="secondary">
                            Duration: {selectedContest.duration} minutes
                        </Text>
                    </Space>
                )}
            </Modal>
        </div>
    );
}; 

export default StudentContestView;
