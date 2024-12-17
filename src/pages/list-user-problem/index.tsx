import { useState, Key, useMemo } from "react";
import { Table, Tag, Select, Input, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import userProblemService from "@/apis/service/userProblemService.ts";

const { Option } = Select;

const UserProblemListPage = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
  });

  const {
    data: listUserProblemData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: listUserProblemLoading,
  } = useQuery({
    queryKey: ["listUserProblem", contestId, searchParams, difficultyFilter],
    queryFn: async ({ queryKey }: any) => {
      const [, contestId, pageParams] = queryKey;
      if (!contestId) return null;
      return await userProblemService.getAll({
        page: pageParams.page,
        limit: pageParams.limit,
        contestId: contestId,
      });
    },
  });

  const { contents: listUserProblems = [], totalElements = 0 } =
    listUserProblemData || {};

  const listProblemTableData = useMemo(() => {
    if (!listUserProblems) return [];
    return listUserProblems.map((problem: any) => ({
      id: problem.id,
      name: problem.problem.problemName,
      difficulty: problem.problem.difficulty,
      code: problem.problem.problemCode,
      point: problem.maxSubmittedPoint,
      tags: problem.problem.tags,
      problemId: problem.problemId,
      maxTimeCommit: problem.problem.maxTimeCommit,
    }));
  }, [listUserProblems]);

  const columns = [
    {
      title: "Title",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => navigate(`/my-problems-detail/${record.problemId}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      filters: [
        { text: "Easy", value: "Easy" },
        { text: "Medium", value: "Medium" },
        { text: "Hard", value: "Hard" },
      ],
      onFilter: (value: string | Key | boolean, record: any) =>
        record.difficulty === value,
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
      title: "Point",
      dataIndex: "point",
      key: "point",
    },
    {
      title: "Max Submissions Count",
      dataIndex: "maxTimeCommit",
      key: "maxTimeCommit",
      render: (text: any) => <div>{text ? text : "Unlimited"}</div>,
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: any[]) => (
        <>
          {tags.map((tag: any) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px", background: "#fff", minHeight: "100vh" }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by Difficulty"
          allowClear
          onChange={(value) => setDifficultyFilter(value)}
          style={{ width: 200 }}
        >
          <Option value="Easy">Easy</Option>
          <Option value="Medium">Medium</Option>
          <Option value="Hard">Hard</Option>
        </Select>
        <Input
          placeholder="Search by title"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={listProblemTableData}
        loading={listUserProblemLoading}
        rowKey="id"
        pagination={{
          current: searchParams.page + 1,
          total: totalElements,
          pageSize: searchParams.limit,
          onChange: (page) => {
            setSearchParams({
              ...searchParams,
              page: page - 1,
            });
          },
        }}
        style={{ width: "100%" }}
        scroll={{ x: "100%" }}
      />
    </div>
  );
};

export default UserProblemListPage;
