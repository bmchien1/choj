import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Progress,
  Badge,
  Button,
  Flex,
} from "antd";
import {
  useGetCourseById,
} from "@/hooks/useCourseQueries";
import { useGetChaptersByCourse } from "@/hooks/useChapterQueries";
import toast from "react-hot-toast";
import {
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const StudentCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    toast.error("Course ID is missing");
    navigate("/");
    return null;
  }

  const { data: course, isLoading: isCourseLoading } = useGetCourseById(id);
  const { data: chapters = [], isLoading: isChaptersLoading } = useGetChaptersByCourse(id);

  // Placeholder for actual progress tracking
  const totalChapters = chapters.length;
  const completedChapters = Math.min(2, totalChapters); // For demo, assuming 2 completed chapters
  const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {isCourseLoading ? (
        <Spin />
      ) : (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ margin: 0, color: '#ff6a00', fontSize: '32px' }}>
                {course?.name}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '18px' }}>
                {course?.description}
              </Text>
            </div>
          </Flex>

          <Card style={{ marginBottom: 24, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px' }}>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontWeight: 'bold', fontSize: '22px' }}>Course Progress</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '16px' }}>
                {completedChapters} of {totalChapters} chapters completed
              </Text>
              <Progress 
                percent={progress} 
                strokeColor="#ff6a00"
                showInfo={false}
                style={{ marginBottom: 8 }}
              />
              <Text type="secondary" style={{ textAlign: 'right', display: 'block', fontSize: '16px' }}>
                {progress}% complete
              </Text>
            </div>
          </Card>

          {/* Chapters Section */}
          <div style={{ /* No gap here, individual cards will have margin-bottom */ }}>
            {isChaptersLoading ? (
              <Spin />
            ) : chapters.length === 0 ? (
              <Text type="secondary" style={{ fontSize: '18px' }}>No content available.</Text>
            ) : (
              chapters.map((chapter: any) => {
                const combinedContent = [
                  ...(chapter.lessons || []).map((lesson: any) => ({ ...lesson, type: 'lesson' })),
                  ...(chapter.assignments || []).map((assignment: any) => ({ ...assignment, type: 'assignment' })),
                ].sort((a, b) => a.order - b.order);

                return (
                  <Card key={chapter.id} style={{ marginBottom: 16, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '16px' }}>
                      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                        <div>
                          <Title level={4} style={{ margin: 0, color: '#000', fontWeight: 'bold', fontSize: '22px' }}>
                            {chapter.title}
                          </Title>
                          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: '16px' }}>
                            {chapter.description}
                          </Text>
                        </div>
                      </Flex>

                      {(combinedContent.length > 0) && (
                        <div style={{ marginTop: 24 }}>
                          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: '18px' }}>Content</Text>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {combinedContent.map((item: any) => {
                              const isLesson = item.type === 'lesson';
                              const itemColor = isLesson ? 
                                (item.completed ? '#52c41a' : 'inherit') : 
                                (item.completed ? '#faad14' : '#d46b08'); // Orange shades for assignments
                              const iconColor = isLesson ? 
                                (item.completed ? '#52c41a' : '#bfbfbf') : 
                                (item.completed ? '#faad14' : '#d46b08');
                              
                              const navigatePath = isLesson ? `/lesson/${item.id}` : `/assignment/${item.id}`;

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
                                  }}
                                >
                                  <Flex align="center" gap="8px">
                                    {item.completed ? (
                                      <CheckCircleOutlined style={{ color: iconColor, fontSize: '18px' }} />
                                    ) : (
                                      isLesson ? (
                                        <FileTextOutlined style={{ color: iconColor, fontSize: '18px' }} />
                                      ) : (
                                        <BookOutlined style={{ color: iconColor, fontSize: '18px' }} /> // Using BookOutlined for assignments for visual distinction
                                      )
                                    )}
                                    <Text style={{ color: itemColor, fontSize: '16px' }}>{item.title}</Text>
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
                                    <Button 
                                      type="text" 
                                      style={{ color: '#ff6a00', fontWeight: 'bold', fontSize: '16px' }}
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate(navigatePath); // Navigation moved here
                                        toast.success(`${item.completed ? 'Reviewing' : 'Starting'} ${item.type}: ${item.title}`); 
                                      }}
                                    >
                                      {item.completed ? 'Review' : 'Start'}
                                    </Button>
                                  </Flex>
                                </Flex>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCourseDetail;