import { useMemo, useState } from "react";
import { Flex, Popconfirm, Table, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import { formatObject } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import moment from "moment/moment";
import questionService from "@/apis/service/questionService";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import toast from "react-hot-toast";

const { Text } = Typography;

const ListAdminQuestion = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });

  const {
    data: listQuestionData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: listQuestionLoading,
    refetch: refetchListQuestion,
  } = useQuery({
    queryKey: ["allAdminQuestions", searchParams],
    queryFn: async ({ queryKey }: any) => {
      const [, searchParams] = queryKey;
      return await questionService.getAllAdmin(
        formatObject({
          ...searchParams,
        })
      );
    },
  });

  const listQuestions = Array.isArray(listQuestionData) ? listQuestionData : [];
  const totalQuestion = listQuestionData.totalElements || 0;

  const listQuestionTableData = useMemo(() => {
    if (!listQuestions) return [];
    return listQuestions.map((question: any) => ({
      ...question,
      createdAt: moment(question.createdAt).format("YYYY-MM-DD"),
    }));
  }, [listQuestions]);

  const handleDeleteQuestion = async (id: number) => {
    try {
      await questionService.deleteQuestion(id);
      await refetchListQuestion();
      toast.success("Delete question successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete question failed");
    }
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "questionName",
      key: "questionName",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Difficulty",
      key: "difficulty",
      dataIndex: "difficulty_level",
      render: (difficulty: string) => {
        const color =
          difficulty === "easy"
            ? "green"
            : difficulty === "medium"
            ? "orange"
            : "red";
        return <Tag color={color}>{difficulty}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => (
        <span>
          <CalendarOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: string, record: any) => (
        <Flex gap={2}>
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => navigate(`/admin/question/edit/${record.id}`)}
          >
            <HiPencilAlt size={20} />
          </div>
          <Popconfirm
            title="Are you sure to delete this question?"
            onConfirm={() => handleDeleteQuestion(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <BiTrash size={20} className="cursor-pointer hover:text-red-500" />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table
        dataSource={listQuestionTableData}
        columns={columns}
        loading={listQuestionLoading}
        pagination={{
          current: searchParams.page + 1,
          total: totalQuestion,
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

export default ListAdminQuestion;
