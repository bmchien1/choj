import { useMemo, useState } from "react";
import { Tabs, Card, Table, Tag, Flex, Typography, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import userCourseService from "@/apis/service/userCourseService";
import moment from "moment";
import { formatObject, getCourseStatusColor } from "@/utils";

const { TabPane } = Tabs;

const UserCourseList = () => {
  const navigate = useNavigate();
  const [publicCourseParams, setPublicCourseParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });
  const [registeredCourseParams, setRegisteredCourseParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });

  const {
    data: publicCourseData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: publicCourseLoading,
  } = useQuery({
    queryKey: ["userPublicCourse", publicCourseParams],
    queryFn: async ({ queryKey }: any) => {
      const [, publicCourseParams] = queryKey;
      return await userCourseService.getAll(
        formatObject({
          ...publicCourseParams,
          isPublic: "true",
        })
      );
    },
  });

  const {
    data: registeredCourseData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: registeredCourseLoading,
  } = useQuery({
    queryKey: ["userRegisteredCourse", registeredCourseParams],
    queryFn: async ({ queryKey }: any) => {
      const [, registeredCourseParams] = queryKey;
      return await userCourseService.getAll(
        formatObject({
          ...registeredCourseParams,
          isPublic: "false",
        })
      );
    },
  });

  const { contents: publicCourses = [], totalElements: totalPublicCourses } =
    publicCourseData || {};

  const publicCourseTableData = useMemo(() => {
    if (!publicCourses.length) return [];
    return publicCourses.map((course: any) => ({
      title: course?.course?.courseName,
      startTime: moment(course?.course?.creatdAt).format("YYYY-MM-DD HH:mm"),
      createdBy: course?.course?.creator,
      status: course?.course?.status,
      key: course.id,
      id: course.id,
      courseId: course.courseId,
    }));
  }, [publicCourses]);

  const {
    contents: registeredCourses = [],
    totalElements: totalRegisteredCourses,
  } = registeredCourseData || {};

  const registeredCourseTableData = useMemo(() => {
    if (!registeredCourses.length) return [];
    return registeredCourses.map((course: any) => ({
      title: course?.course?.courseName,
      startTime: moment(course?.course?.creatdAt).format("YYYY-MM-DD HH:mm"),
      createdBy: course?.course?.creator,
      status: course?.course?.status,
      key: course.id,
      id: course.id,
      courseId: course.courseId,
    }));
  }, [registeredCourses]);

  const columns = [
    {
      title: "Course",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => navigate(`/my-problems/${record.courseId}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => (
        <span>
          <CalendarOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text: string) => (
        <span>
          <TeamOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getCourseStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="w-full" style={{ height: "100vh" }}>
      <Card
        style={{
          minHeight: "100vh",
        }}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Public Courses" key="1">
            <Flex align={"center"} justify={"space-between"}>
              <Typography.Title level={4}>Public Courses</Typography.Title>
              <Space>
                <Input
                  allowClear
                  placeholder="Search by title"
                  size={"middle"}
                  value={publicCourseParams.q}
                  onChange={(e) => {
                    setPublicCourseParams({
                      ...publicCourseParams,
                      q: e.target.value,
                    });
                  }}
                />
              </Space>
            </Flex>
            <Table
              loading={publicCourseLoading}
              dataSource={publicCourseTableData}
              pagination={{
                current: publicCourseParams.page + 1,
                total: totalPublicCourses,
                pageSize: publicCourseParams.limit,
                onChange: (page) => {
                  setPublicCourseParams({
                    ...publicCourseParams,
                    page: page - 1,
                  });
                },
              }}
              columns={columns}
              scroll={{ x: "100%" }}
            />
          </TabPane>
          <TabPane tab="Registered Courses" key="2">
            <Flex align={"center"} justify={"space-between"}>
              <Typography.Title level={4}>Registered Courses</Typography.Title>
              <Space>
                <Input
                  allowClear
                  placeholder="Search by title"
                  size={"middle"}
                  value={registeredCourseParams.q}
                  onChange={(e) => {
                    setRegisteredCourseParams({
                      ...registeredCourseParams,
                      q: e.target.value,
                    });
                  }}
                />
              </Space>
            </Flex>
            <Table
              dataSource={registeredCourseTableData}
              loading={registeredCourseLoading}
              pagination={{
                current: registeredCourseParams.page + 1,
                total: totalRegisteredCourses,
                pageSize: registeredCourseParams.limit,
                onChange: (page) => {
                  setRegisteredCourseParams({
                    ...registeredCourseParams,
                    page: page - 1,
                  });
                },
              }}
              columns={columns}
              scroll={{ x: "100%" }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserCourseList;
