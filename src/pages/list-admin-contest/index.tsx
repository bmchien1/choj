import { useMemo, useState } from "react";
import { Popconfirm, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { formatObject, getContestStatusColor } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import contestService from "@/apis/service/contestService.ts";
import moment from "moment/moment";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import toast from "react-hot-toast";

const ListAdminContest = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    q: "",
  });

  const {
    data: listContestData = {
      contents: [],
      totalElements: 0,
    },
    isLoading: listContestLoading,
    refetch: refetchListContest,
  } = useQuery({
    queryKey: ["allAdminContests", searchParams],
    queryFn: async ({ queryKey }: any) => {
      const [, searchParams] = queryKey;
      // console.log(await contestService.getAllAdmin(formatObject(searchParams)));
      return await contestService.getAllAdmin(formatObject(searchParams));
    },
  });
  const listContests = Array.isArray(listContestData) ? listContestData : [];
  const totalContests = listContestData.totalElements || 0;

  const listContestsTableData = useMemo(() => {
    if (!listContests) return [];
    return listContests.map((contest: any) => ({
      test_name: contest?.test_name,
      //   startTime: moment(contest?.creatdAt).format("YYYY-MM-DD HH:mm"),
      //   createdBy: contest?.creator,
      grade: contest?.grade,
      description: contest?.description,
      key: contest.id,
      id: contest.id,
    }));
  }, [listContests]);

  const handleDeleteContest = async (id: number) => {
    try {
      await contestService.delete(id);
      await refetchListContest();
      toast.success("Delete contest successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete contest failed");
    }
  };

  const columns = [
    {
      title: "Contest",
      dataIndex: "test_name",
      key: "test_name",
      render: (text: string, record: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => navigate(`/list-problem?contest=${record.id}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
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
            onClick={() => navigate(`/admin/contest/edit/${record.id}`)}
          >
            <HiPencilAlt size={20} />
          </div>

          <Popconfirm
            title="Are you sure to delete this contest?"
            onConfirm={() => handleDeleteContest(record.id)}
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
        dataSource={listContestsTableData}
        columns={columns}
        loading={listContestLoading}
        pagination={{
          current: searchParams.page + 1,
          total: totalContests,
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

export default ListAdminContest;
