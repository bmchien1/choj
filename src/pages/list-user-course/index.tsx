import { useMemo, useState } from "react";
import { Tabs, Card, Table, Tag, Flex, Typography, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import userCourseService from "@/apis/service/userCourseService";
import moment from "moment";
import { formatObject, getCourseStatusColor } from "@/utils";

const UserCourseList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [registeredCourseParams, setRegisteredCourseParams] = useState({
    page: 0,
    limit: 10,
    q: "",
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
      return await userCourseService.getAll(user.id);
    },
  });

  const registeredCourses = Array.isArray(registeredCourseData)
    ? registeredCourseData
    : [];
  const totalRegisteredCourses = registeredCourseData.totalElements || 0;

  const registeredCourseTableData = useMemo(() => {
    if (!registeredCourses.length) return [];
    return registeredCourses.map((course: any) => ({
      name: course?.name,
      class: course?.class,
      subject: course?.subject,
      description: course?.description,
      key: course.id,
      id: course.id,
    }));
  }, [registeredCourses]);

  const columns = [
    {
      title: "Course",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => navigate(`/my-courses/${record.id}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text: string) => (
        <span>
          <TeamOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text: string) => (
        <span>
          <TeamOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span>
          <TeamOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table
        dataSource={registeredCourseTableData}
        columns={columns}
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
      />
    </div>
  );
};

export default UserCourseList;
