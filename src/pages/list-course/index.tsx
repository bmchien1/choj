import { useMemo, useState } from "react";
import { Table, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { formatObject, getCourseStatusColor } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import courseService from "@/apis/service/courseService";
import { CourseStatus } from "@/constants/types.ts";
import moment from "moment/moment";
import joinCourseService from "@/apis/service/joinCourseService.ts";
import toast from "react-hot-toast";

const UserCourseList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });
  const [isLoadingData, setIsLoadingData] = useState<{
    id: number | null;
    loading: boolean;
  }>({
    id: null,
    loading: false,
  });

  const {
    data: listCourseData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: listCourseLoading,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["allCourses", searchParams],
    queryFn: async ({ queryKey }: any) => {
      const [, searchParams] = queryKey;
      return await courseService.getAll(formatObject(searchParams));
    },
  });

  const { listCourses, totalCourses } = useMemo(() => {
    return {
      listCourses: listCourseData?.contents || [],
      totalCourses: listCourseData?.totalElements || 0,
    };
  }, [listCourseData]);

  const {
    data: listRequestData = {
      contents: [],
    },
    refetch: refetchRequest,
  } = useQuery({
    queryKey: ["allUserRequests", listCourses],
    queryFn: async ({ queryKey }: any) => {
      const [, _listCourses] = queryKey;
      const listCourseIds = _listCourses
        .map((course: any) => course.id)
        .join(",");
      const res = await joinCourseService.getMyRequests({
        page: 0,
        limit: _listCourses.length,
        listCourseIds: listCourseIds,
        status: 0,
      });
      return res;
    },
    enabled: !!listCourses,
  });

  const listCoursesTableData = useMemo(() => {
    if (!listCourses) return [];
    const listRequests = listRequestData?.contents || [];
    return listCourses.map((course: any) => ({
      title: course?.courseName,
      startTime: moment(course?.creatdAt).format("YYYY-MM-DD HH:mm"),
      createdBy: course?.creator,
      status: course?.status,
      key: course.id,
      isJoined: course?.isJoined,
      id: course.id,
      isWaiting: listRequests.some(
        (request: any) => request.courseId === course.id && request.status === 0
      ),
    }));
  }, [listCourses, listRequestData]);

  const columns = [
    {
      title: "Course",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => navigate(`/list-problem?course=${record.id}`)}
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
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          disabled={
            record.status === CourseStatus.COMPLETED ||
            record.isJoined ||
            record.isWaiting
          }
          onClick={() => handleRegister(record.id).then()}
          loading={isLoadingData.loading && isLoadingData.id === record.id}
        >
          {record.isJoined
            ? "Registered"
            : record.isWaiting
            ? "Waiting"
            : "Register"}
        </Button>
      ),
    },
  ];

  const handleRegister = async (courseId: number) => {
    try {
      const isWaiting = listCoursesTableData.find(
        (course: any) => course.id === courseId
      )?.isWaiting;
      if (isWaiting) return toast.error("You are already in the waiting list");

      setIsLoadingData({
        id: courseId,
        loading: true,
      });

      await joinCourseService.create(courseId);
      await refetchCourse();
      await refetchRequest();
      toast.success("Your request has been sent");
    } catch (error) {
      console.error("Error registering course:", error);
      toast.error("Failed to register course");
    } finally {
      setIsLoadingData({
        id: null,
        loading: false,
      });
    }
  };

  return (
    <div className="w-full">
      <Table
        dataSource={listCoursesTableData}
        columns={columns}
        loading={listCourseLoading}
        pagination={{
          current: searchParams.page + 1,
          total: totalCourses,
          pageSize: searchParams.limit,
          onChange: (page) => {
            setSearchParams({
              ...searchParams,
              page: page - 1,
            });
          },
        }}
      />
    </div>
  );
};

export default UserCourseList;
