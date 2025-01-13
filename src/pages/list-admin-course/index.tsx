import { useMemo, useState } from "react";
import { Popconfirm, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { formatObject, getCourseStatusColor } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import courseService from "@/apis/service/courseService.ts";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import toast from "react-hot-toast";

const ListAdminCourse = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });

  const {
    data: listCourseData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: listCourseLoading,
    refetch: refetchListCourse,
  } = useQuery({
    queryKey: ["allAdminCourses", searchParams],
    queryFn: async ({ queryKey }: any) => {
      const [, searchParams] = queryKey;
      //   console.log(await courseService.getAllAdmin(formatObject(searchParams)));
      return await courseService.getAllAdmin(formatObject(searchParams));
    },
  });

  const listCourses = Array.isArray(listCourseData) ? listCourseData : [];
  const totalCourses = listCourseData.totalElements || 0;

  const listCoursesTableData = useMemo(() => {
    if (!listCourses) return [];
    // console.log(listCourses);
    // console.log(listCourseData);
    return listCourses.map((course: any) => ({
      name: course.name,
      description: course.description,
      class: course.class,
      key: course.id,
      id: course.id,
    }));
  }, [listCourses]);

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseService.delete(id);
      await refetchListCourse();
      toast.success("Delete course successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete course failed");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
        <div className={"flex items-center"}>
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => navigate(`/admin/course/edit/${record.id}`)}
          >
            <HiPencilAlt size={20} />
          </div>

          <Popconfirm
            title="Are you sure to delete this course?"
            onConfirm={() => handleDeleteCourse(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <BiTrash size={20} className="cursor-pointer hover:text-red-500" />
          </Popconfirm>
        </div>
      ),
    },
  ];

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

export default ListAdminCourse;
