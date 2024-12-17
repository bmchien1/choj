import {useState, useMemo} from "react";
import {Table, Button, Tag, message, Space, Select, Input} from "antd";
import joinContestService from "@/apis/service/joinContestService";
import {useQuery} from "@tanstack/react-query";
import {formatObject} from "@/utils";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";

const { Option } = Select;

const JoinContestRequestsPage = () => {
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    status: "",
    email: "",
    contestId: "",
  });
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoadingApprove, setIsLoadingApprove] = useState<{
    id: number | null;
    loading: boolean;
  }>({
    id: null,
    loading: false,
  });
  const [isLoadingReject, setIsLoadingReject] = useState<{
    id: number | null;
    loading: boolean;
  }>({
    id: null,
    loading: false,
  });
  const {
    data: listRequestsData = {
      contents: [],
      totalElements: 0,
    },
    refetch: fetchRequests,
    isLoading: loading,
  } = useQuery({
    queryKey: ["allJoinRequests", searchParams],
    queryFn: async ({ queryKey }: any) => {
      const [, searchParams] = queryKey;
      return await joinContestService.getAllRequests(formatObject(searchParams));
    },
  });

  const { totalElements: totalRequest } = listRequestsData || {};
  const requestTableData = useMemo(() => {
    const listRequests = listRequestsData?.contents || [];
    return listRequests.map((request: any) => ({
      ...request,
      id: request.id,
      email: request?.user?.email,
      contestName: request?.contest?.contestName,
      status: request.status,
    }));
  }, [listRequestsData]);
  const handleApprove = async (id: number) => {
    try {
      setIsLoadingApprove({
        id: id,
        loading: true,
      });
      await joinContestService.approveRequest(id);
      toast.success("Request approved successfully!");
      await fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Failed to approve the request.");
    } finally {
      setIsLoadingApprove({
        id: null,
        loading: false,
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      setIsLoadingReject({
        id: id,
        loading: true,
      });
      await joinContestService.rejectRequest(id);
      toast.success("Request rejected successfully!");
      await fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("Failed to reject the request.");
    } finally {
      setIsLoadingReject({
        id: null,
        loading: false,
      });
    }
  };
  
  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => {
      setSearchParams({
        ...searchParams,
        email: value,
      });
    }, 300);
  }, []);

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contest Name",
      dataIndex: "contestName",
      key: "contestName",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: number) => {
          const statusMap: Record<number, { text: string; color: string }> = {
            0: { text: "Pending", color: "blue" },
            1: { text: "Approved", color: "green" },
            2: { text: "Rejected", color: "red" },
          };
          const statusData = statusMap[status as keyof typeof statusMap];
          return <Tag color={statusData?.color}>{statusData?.text}</Tag>;
        },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            disabled={record.status !== 0}
            onClick={() => handleApprove(record.id)}
            loading={isLoadingApprove.loading && isLoadingApprove.id === record.id}
          >
            Approve
          </Button>
          <Button
            type="default"
            danger
            disabled={record.status !== 0}
            loading={isLoadingReject.loading && isLoadingReject.id === record.id}
            onClick={() => handleReject(record.id)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px", background: "#fff", minHeight: "100vh" }}>
      <h2>Join Contest Requests</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by Status"
          allowClear
          onChange={(value) => {
            setSearchParams({
              ...searchParams,
              status: value,
            });
          }}
          style={{ width: 200 }}
        >
          <Option value={undefined}>All</Option>
          <Option value={0}>Pending</Option>
          <Option value={1}>Approved</Option>
          <Option value={2}>Rejected</Option>
        </Select>
        
        <Input
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => {
            setSearchEmail(e.target.value);
            debouncedSearch(e.target.value);
          }}
          style={{ width: 200 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={requestTableData}
        loading={loading}
        rowKey="id"
        pagination={{
          current: searchParams.page + 1,
          total: totalRequest,
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

export default JoinContestRequestsPage;
