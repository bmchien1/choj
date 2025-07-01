import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Progress,
  Badge,
  Button,
  Flex,
  Collapse,
  Tooltip,
  Tag,
  Modal,
  Table,
} from "antd";
import {
  useGetCourseById,
} from "@/hooks/useCourseQueries";
import { useGetChaptersByCourse } from "@/hooks/useChapterQueries";
import {  useGetSubmissionsByAssignmentAndUser } from "@/hooks/useSubmissionQueries";
import toast from "react-hot-toast";
import {
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  RightOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import assignmentService from "@/apis/service/assignmentService";
import { useCompletedLessons } from "@/hooks/useUserLesson";
import { useAllSubmissionsByUser } from "@/hooks/useSubmissionQueries";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const StudentCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

  if (!id) {
    toast.error("Course ID is missing");
    navigate("/");
    return null;
  }

  const { data: course, isLoading: isCourseLoading } = useGetCourseById(id);
  const { data: chapters = [], isLoading: isChaptersLoading } = useGetChaptersByCourse(id);
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const { data: completedLessons } = useCompletedLessons(user.id);
  const completedLessonIds = (completedLessons || []).map((ul: any) => ul.lesson.id);

  const allLessons = chapters.flatMap((c: any) => c.lessons || []);
  const allAssignments = chapters.flatMap((c: any) => c.assignments || []);

  const { data: allSubmissions } = useAllSubmissionsByUser(course?.id ?? 0, user.id);
  // console.log(allSubmissions)
  const submittedAssignmentIds = new Set((allSubmissions || []).map((s: any) => s.assignment.id));
  const completedAssignmentsCount = allAssignments.filter((a: any) => submittedAssignmentIds.has(a.id)).length;

  const totalItems = allLessons.length + allAssignments.length;
  const completedLessonsCount = allLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
  const completedCount = completedLessonsCount + completedAssignmentsCount;

  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleChapterExpand = (chapterId: number) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const checkAssignmentStatus = async (assignment: any) => {
    setIsLoadingAttempt(true);
    try {
      const attempt = await assignmentService.getActiveAttempt(assignment.id.toString());
      setActiveAttempt(attempt);
      setSelectedAssignment(assignment);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error checking assignment status:", error);
      toast.error("Failed to check assignment status");
    } finally {
      setIsLoadingAttempt(false);
    }
  };

  const handleStartAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      if (activeAttempt) {
        // Continue existing attempt
        navigate(`/assignment/${selectedAssignment.id}`);
      } else {
        // Start new attempt
        await assignmentService.startAttempt(selectedAssignment.id.toString());
        navigate(`/assignment/${selectedAssignment.id}`);
      }
    } catch (error) {
      console.error("Error starting assignment:", error);
      toast.error("Failed to start assignment");
    }
  };

  const handleReviewSubmissions = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsReviewModalVisible(true);
  };


  const renderContentItem = (item: any, isLesson: boolean) => {
    const itemColor = isLesson ? 
      (item.completed ? '#52c41a' : 'inherit') : 
      (item.completed ? '#faad14' : '#d46b08');
    const iconColor = isLesson ? 
      (item.completed ? '#52c41a' : '#bfbfbf') : 
      (item.completed ? '#faad14' : '#d46b08');
    
    const navigatePath = isLesson ? `/lesson/${item.id}` : `/assignment/${item.id}`;
    const isLocked = !item.completed && item.requiresCompletion;

    return (
      <Flex
        key={item.id}
        align="center"
        justify="space-between"
        className="cursor-pointer transition-all duration-200 hover:shadow-md"
        style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: '#fff',
          border: `1px solid ${item.completed ? '#b7eb8f' : '#f0f0f0'}`,
          opacity: isLocked ? 0.7 : 1,
        }}
      >
        <Flex align="center" gap="8px">
          {item.completed ? (
            <CheckCircleOutlined style={{ color: iconColor, fontSize: '18px' }} />
          ) : isLocked ? (
            <LockOutlined style={{ color: '#bfbfbf', fontSize: '18px' }} />
          ) : (
            isLesson ? (
              <FileTextOutlined style={{ color: iconColor, fontSize: '18px' }} />
            ) : (
              <BookOutlined style={{ color: iconColor, fontSize: '18px' }} />
            )
          )}
          <Text style={{ color: itemColor, fontSize: '16px' }}>{item.title}</Text>
          {isLocked && (
            <Tag color="default" icon={<LockOutlined />}>
              Locked
            </Tag>
          )}
          {isLesson && completedLessonIds.includes(item.id) && (
            <Tag color="success" icon={<CheckCircleOutlined />}>Đã hoàn thành</Tag>
          )}
        </Flex>
        <Flex align="center" gap="8px">
          {!isLesson && item.duration && (
            <Badge 
              style={{ 
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#8c8c8c'
              }}
            >
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {item.duration || '60 min'}
            </Badge>
          )}
          {!isLesson && item.total_points && (
            <Badge 
              style={{ 
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#8c8c8c'
              }}
            >
              {item.total_points} points
            </Badge>
          )}
          {!isLesson && (
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleReviewSubmissions(item);
              }}
              style={{ color: '#ff6a00' }}
            >
              Review
            </Button>
          )}
          <Button 
            type="text" 
            style={{ color: '#ff6a00', fontWeight: 'bold', fontSize: '16px' }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!isLocked) {
                if (isLesson) {
                  navigate(navigatePath);
                  toast.success(`${item.completed ? 'Reviewing' : 'Starting'} ${item.type}: ${item.title}`);
                } else {
                  checkAssignmentStatus(item);
                }
              } else {
                toast.error('Complete previous content to unlock this item');
              }
            }}
            disabled={isLocked}
          >
            {item.completed ? 'Retake' : 'Start'}
            <RightOutlined style={{ marginLeft: 4 }} />
          </Button>
        </Flex>
      </Flex>
    );
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      {isCourseLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>{course?.name}</Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Class: {course?.class}</Text>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Description: {course?.description}</Text>
            </div>
          </Flex>

          <Card className="mb-4">
            <Title level={3} style={{ margin: 0, color: '#ff6a00' }}>Course Progress</Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {completedCount} of {totalItems} items completed
            </Text>
            <Progress 
              percent={progress} 
              strokeColor="#ff6a00"
              showInfo={false}
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary" style={{ textAlign: 'right', display: 'block' }}>
              {progress}% complete
            </Text>
          </Card>

          {/* Chapters Section */}
          <div>
            {isChaptersLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : chapters.length === 0 ? (
              <Card className="mb-4">
                <Title level={3} style={{ margin: 0, color: '#ff6a00' }}>Course Content</Title>
                <Text type="secondary">No content available.</Text>
              </Card>
            ) : (
              <Collapse 
                bordered={false}
                activeKey={expandedChapters}
                onChange={(keys) => setExpandedChapters(keys.map(Number))}
                style={{ background: "#f9f9f9" }}
              >
                {chapters.map((chapter: any) => {
                  const combinedContent = [
                    ...(chapter.lessons || []).map((lesson: any) => ({ ...lesson, type: 'lesson' })),
                    ...(chapter.assignments || []).map((assignment: any) => ({ ...assignment, type: 'assignment' })),
                  ].sort((a, b) => a.order - b.order);

                  return (
                    <Panel
                      key={chapter.id}
                      header={
                        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                          <div>
                            <Title level={4} style={{ margin: 0, color: '#ff6a00' }}>
                              {chapter.title}
                            </Title>
                            {expandedChapters.includes(chapter.id) && (
                              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                {chapter.description}
                              </Text>
                            )}
                          </div>
                          <Tooltip title={expandedChapters.includes(chapter.id) ? "Collapse" : "Expand"}>
                            <Button
                              type="text"
                              icon={expandedChapters.includes(chapter.id) ? <UnlockOutlined /> : <LockOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChapterExpand(chapter.id);
                              }}
                              className="transition-all duration-200 hover:bg-orange-50"
                            />
                          </Tooltip>
                        </Flex>
                      }
                      style={{ 
                        marginBottom: 16, 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        background: '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {combinedContent.map((item: any) => renderContentItem(item, item.type === 'lesson'))}
                      </div>
                    </Panel>
                  );
                })}
              </Collapse>
            )}
          </div>
        </>
      )}

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Assignment Status</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setIsModalVisible(false)}
            style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
          >
            Cancel
          </Button>,
          <Button
            key="start"
            type="primary"
            onClick={handleStartAssignment}
            loading={isLoadingAttempt}
            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
          >
            {activeAttempt ? 'Continue' : 'Start New'}
          </Button>
        ]}
      >
        {isLoadingAttempt ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <Title level={4} style={{ color: '#ff6a00', marginBottom: 16 }}>
              {selectedAssignment?.title}
            </Title>
            {activeAttempt ? (
              <>
                <Text style={{ display: 'block', marginBottom: 8 }}>
                  You have an ongoing attempt for this assignment.
                </Text>
                <Text type="secondary">
                  Click "Continue" to resume your attempt.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ display: 'block', marginBottom: 8 }}>
                  {selectedAssignment?.completed ? 
                    "You have completed this assignment. You can start a new attempt." :
                    "You haven't started this assignment yet."
                  }
                </Text>
                <Text type="secondary">
                  Click "Start New" to begin your attempt.
                </Text>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Submission History</span>}
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsReviewModalVisible(false)}
            style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
          >
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedAssignment && (
          <SubmissionHistory assignmentId={selectedAssignment.id} />
        )}
      </Modal>
    </div>
  );
};

// New component for submission history
const SubmissionHistory: React.FC<{ assignmentId: number }> = ({ assignmentId }) => {
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const { data: submissions, isLoading } = useGetSubmissionsByAssignmentAndUser(assignmentId, user.id);

  const columns = [
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => `${score} points`,
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

  if (isLoading) {
    return <Spin />;
  }

  return (
    <Table
      columns={columns}
      dataSource={submissions}
      rowKey="id"
      pagination={false}
    />
  );
};

export default StudentCourseDetail;