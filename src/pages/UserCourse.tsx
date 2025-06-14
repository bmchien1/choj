import { Card, Typography, Row, Col, Space, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { useGetUserCourses } from "@/hooks/useUserCourseQueries";

const { Title, Text, Paragraph } = Typography;

const UserCourseList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = user.id;

  const { data, isLoading, error } = useGetUserCourses(userId);
  const listCourses = Array.isArray(data) ? data : [];

  if (!userId) {
    return <div style={{ padding: 24 }}><Text>Please log in to view your courses</Text></div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}><Text type="danger">Error loading courses: {error.message}</Text></div>;
  }

  if (isLoading) {
    return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;
  }

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#ff6a00' }}>My Courses</Title>

      {listCourses.length === 0 ? (
        <Text type="secondary">You have not registered for any courses yet.</Text>
      ) : (
        <Row gutter={[16, 16]}>
          {listCourses.map((userInCourse: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={userInCourse.course.id}>
              <Card
                title={<span style={{ color: '#ff6a00' }}>{userInCourse.course.name}</span>}
                extra={
                  <Button
                    type="primary"
                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                    onClick={() => navigate(`/my-courses/${userInCourse.course.id}`)}
                  >
                    Detail
                  </Button>
                }
              >
                <Paragraph>{userInCourse.course.description}</Paragraph>
                <Space direction="vertical">
                  <Text type="secondary">
                    <CalendarOutlined className="mr-2" />
                    Class: {userInCourse.course.class}
                  </Text>
                  <Text type="secondary">
                    <TeamOutlined className="mr-2" />
                    Subject: {userInCourse.course.subject}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default UserCourseList;
