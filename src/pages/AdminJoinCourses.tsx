import { useState, useMemo } from "react";
import { Table, Button, Space, Select, Input, Typography } from "antd";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";
import {
  useGetAllJoinCourseRequests,
  useMutation,
  useQueryClient,
} from "@/hooks/useUserCourseQueries";
import joinCourseService from "@/apis/service/joinCourseService";

const { Option } = Select;
const { Title } = Typography;

const AdminJoinCourseRequestsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    status: "",
    email: "",
    courseId: "",
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

  // Lấy tất cả yêu cầu tham gia khóa học (ADMIN)
  const { data: listRequestsData = [], isLoading: loading } =
    useGetAllJoinCourseRequests();

  // Mutation để approve/reject yêu cầu
  const { mutate: approveOrRejectRequest } = useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: number;
      action: "approve" | "reject";
    }) => joinCourseService.approveRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinCourseRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process request");
    },
  });

  // Xử lý dữ liệu cho bảng
  const requestTableData = useMemo(() => {
    let filteredRequests = Array.isArray(listRequestsData)
      ? listRequestsData
      : [];

    // Lọc theo email
    if (searchParams.email) {
      filteredRequests = filteredRequests.filter((request: any) =>
        request.user.email
          .toLowerCase()
          .includes(searchParams.email.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (searchParams.status) {
      filteredRequests = filteredRequests.filter((request: any) => {
        if (searchParams.status === "0") return !request.approved; // Pending
        if (searchParams.status === "1") return request.approved; // Approved
        return false; // Rejected (not stored, handled implicitly)
      });
    }

    // Phân trang
    const start = searchParams.page * searchParams.limit;
    const end = start + searchParams.limit;
    const paginatedRequests = filteredRequests.slice(start, end);

    return paginatedRequests.map((request: any) => ({
      ...request,
      id: request.id,
      email: request?.user?.email,
      courseName: request?.course?.name,
    }));
  }, [listRequestsData, searchParams]);

  const totalRequest = useMemo(() => {
    let filteredRequests = Array.isArray(listRequestsData)
      ? listRequestsData
      : [];
    if (searchParams.email) {
      filteredRequests = filteredRequests.filter((request: any) =>
        request.user.email
          .toLowerCase()
          .includes(searchParams.email.toLowerCase())
      );
    }
    if (searchParams.status) {
      filteredRequests = filteredRequests.filter((request: any) => {
        if (searchParams.status === "0") return !request.approved;
        if (searchParams.status === "1") return request.approved;
        return false;
      });
    }
    return filteredRequests.length;
  }, [listRequestsData, searchParams]);

  const handleApprove = (id: number) => {
    setIsLoadingApprove({ id, loading: true });
    approveOrRejectRequest(
      { requestId: id, action: "approve" },
      {
        onSuccess: () => {
          toast.success("Request approved successfully!");
        },
        onSettled: () => {
          setIsLoadingApprove({ id: null, loading: false });
        },
      }
    );
  };

  const handleReject = (id: number) => {
    setIsLoadingReject({ id, loading: true });
    approveOrRejectRequest(
      { requestId: id, action: "reject" },
      {
        onSuccess: () => {
          toast.success("Request rejected successfully!");
        },
        onSettled: () => {
          setIsLoadingReject({ id: null, loading: false });
        },
      }
    );
  };

  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => {
      setSearchParams((prev) => ({
        ...prev,
        email: value,
        page: 0, // Reset về trang đầu khi tìm kiếm
      }));
    }, 300);
  }, []);

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleApprove(record.id)}
            loading={
              isLoadingApprove.loading && isLoadingApprove.id === record.id
            }
            disabled={record.approved}
            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
          >
            Approve
          </Button>
          <Button
            type="default"
            danger
            onClick={() => handleReject(record.id)}
            loading={
              isLoadingReject.loading && isLoadingReject.id === record.id
            }
            disabled={record.approved}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>Join Course Requests</Title>
        <Space>
          <Select
            placeholder="Filter by Status"
            allowClear
            onChange={(value) => {
              setSearchParams((prev) => ({
                ...prev,
                status: value,
                page: 0,
              }));
            }}
            style={{ width: 200 }}
          >
            <Option value="">All</Option>
            <Option value="0">Pending</Option>
            <Option value="1">Approved</Option>
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
      </Space>

      <Table
        columns={columns}
        dataSource={requestTableData}
        loading={loading}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: searchParams.page + 1,
          total: totalRequest,
          pageSize: searchParams.limit,
          onChange: (page) => {
            setSearchParams((prev) => ({
              ...prev,
              page: page - 1,
            }));
          },
        }}
      />
    </div>
  );
};

export default AdminJoinCourseRequestsPage;
