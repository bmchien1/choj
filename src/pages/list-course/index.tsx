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
import axiosClient from "@/apis/config/axiosClient";

const AllCourseList = () => {
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
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  // console.log(user);
  // const { data: user, isLoading: userLoading } = useQuery({
  //   queryKey: ["currentUser"],
  //   queryFn: async () => {
  //     const response = await axiosClient.get("/api/auth/me");
  //     return response.data;
  //   },
  // });

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
      return await courseService.getAllAdmin(formatObject(searchParams));
    },
  });

  const listCourses = Array.isArray(listCourseData) ? listCourseData : [];
  const totalCourses = listCourseData.totalElements || 0;

  const {
    data: listUserInCourseData = {
      contents: [],
    },
    refetch: refetchUserInCourse,
  } = useQuery({
    queryKey: ["allUserRequests", listCourses],
    queryFn: async () => {
      return await joinCourseService.getUserInCourseByUser(user.id);
    },
    enabled: !!listCourses,
  });

  const {
    data: listRequestsData = {
      contents: [],
    },
    refetch: refetchRequest,
  } = useQuery({
    queryKey: ["allUserRequests", listCourses],
    queryFn: async () => {
      return await joinCourseService.getJoinRequestsByUser(user.id);
    },
    enabled: !!listCourses,
  });

  const listCoursesTableData = useMemo(() => {
    if (!listCourses) return [];
    const listUserInCourses = Array.isArray(listUserInCourseData)
      ? listUserInCourseData
      : [];

    const listRequestsData = Array.isArray(listUserInCourseData)
      ? listUserInCourseData
      : [];
    return listCourses.map((course: any) => ({
      name: course.name,
      description: course.description,
      class: course.class,
      key: course.id,
      id: course.id,
      isJoined: listUserInCourses.some(
        (request: any) => request.course.id === course.id
      ),
      isWaiting: listUserInCourses.some(
        (request: any) =>
          request.course.id === course.id && request.approve === false
      ),
    }));
  }, [listCourses, listUserInCourseData]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => <div>{text}</div>,
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text: string) => (
        <span>
          <CalendarOutlined className="mr-2" />
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

      await joinCourseService.create(user.id, courseId);
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

export default AllCourseList;
