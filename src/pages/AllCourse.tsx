import { useMemo, useState } from "react";
import { Card, Button, Spin, Modal, Typography, Row, Col, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  useJoinCourse,
  useGetJoinCourseRequestsByUser,
  useGetUserCourses,
} from "@/hooks/useUserCourseQueries";
import { useGetAllCourses } from "@/hooks/useCourseQueries";
import { Course } from "@/apis/type";

const { Title, Text, Paragraph } = Typography;

interface CourseTableData {
  key: number;
  id: number;
  name: string;
  description: string;
  class: string;
  subject: string;
  isJoined: boolean;
  isWaiting: boolean;
}

const AllCourseList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllCourses();
  const listCourses: Course[] = data?.courses || [];
  const [isLoadingData, setIsLoadingData] = useState<{ id: number | null; loading: boolean }>({
    id: null,
    loading: false,
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = user.id;

  const { data: listUserInCourseData = [], refetch: refetchUserInCourse } = useGetUserCourses(userId);
  const { data: listRequestsData = [], refetch: refetchRequest } = useGetJoinCourseRequestsByUser(userId);
  const { mutate: joinCourse, isPending: isJoining } = useJoinCourse();

  const listCoursesTableData = useMemo((): CourseTableData[] => {
    return listCourses.map((course: Course) => ({
      name: course.name,
      description: course.description,
      class: course.class,
      subject: course.subject,
      key: course.id!,
      id: course.id!,
      isJoined: listUserInCourseData.some(
        (userInCourse: any) => userInCourse.course.id === course.id
      ),
      isWaiting: listRequestsData.some(
        (request: any) =>
          request.course.id === course.id && request.approved === false
      ),
    }));
  }, [listCourses, listUserInCourseData, listRequestsData]);

  const handleRegister = (courseId: number) => {
    const isWaiting = listCoursesTableData.find(
      (course) => course.id === courseId
    )?.isWaiting;
    if (isWaiting) {
      toast.error("You are already in the waiting list");
      return;
    }

    setIsLoadingData({ id: courseId, loading: true });
    joinCourse(
      { userId: userId.toString(), courseId: courseId.toString() },
      {
        onSuccess: () => {
          refetchRequest();
          toast.success("Your request has been sent");
        },
        onError: (error: any) => {
          console.error("Error registering course:", error);
          toast.error(error.message || "Failed to register course");
        },
        onSettled: () => {
          setIsLoadingData({ id: null, loading: false });
        },
      }
    );
  };

  if (isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#ff6a00' }}>All Courses</Title>

      <Row gutter={[16, 16]}>
        {listCoursesTableData.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              title={<span style={{ color: '#ff6a00' }}>{course.name}</span>}
              extra={
                <Button
                  type="primary"
                  style={{
                    background: course.isJoined ? '#52c41a' : course.isWaiting ? '#1890ff' : '#ff6a00',
                    borderColor: course.isJoined ? '#52c41a' : course.isWaiting ? '#1890ff' : '#ff6a00',
                    color: '#fff',
                    opacity: course.isJoined || course.isWaiting ? 0.8 : 1
                  }}
                  disabled={course.isJoined || course.isWaiting}
                  onClick={() => handleRegister(course.id)}
                  loading={isLoadingData.loading && isLoadingData.id === course.id}
                >
                  {course.isJoined ? "Registered" : course.isWaiting ? "Waiting" : "Register"}
                </Button>
              }
            >
              <Paragraph>{course.description}</Paragraph>
              <Space direction="vertical">
                <Text type="secondary">
                  <CalendarOutlined className="mr-2" />
                  Class: {course.class}
                </Text>
                <Text type="secondary">
                  <TeamOutlined className="mr-2" />
                  Subject: {course.subject}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Course Information</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedCourse && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4} style={{ color: '#ff6a00', margin: 0 }}>{selectedCourse.name}</Title>
            <Paragraph>{selectedCourse.description}</Paragraph>
            <Text type="secondary">
              <CalendarOutlined className="mr-2" />
              Class: {selectedCourse.class}
            </Text>
            <Text type="secondary">
              <TeamOutlined className="mr-2" />
              Subject: {selectedCourse.subject}
            </Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AllCourseList;