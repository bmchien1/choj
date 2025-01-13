import { Table, Input, Select, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import userService from "@/apis/service/userService";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import { formatObject } from "@/utils";

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchParams, setSearchParams] = useState({
    page: 0,
    email: "",
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState<{
    id: number | null;
    loading: boolean;
  }>({
    id: null,
    loading: false,
  });

  const {
    data,
    isLoading: isLoadingUsers,
    refetch,
  } = useQuery({
    queryKey: ["users", searchParams],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      return userService.getUsers(formatObject(params));
    },
  });

  console.log(data);

  const handleSearch = debounce((value: string) => {
    setSearchParams({
      ...searchParams,
      email: value,
    });
  }, 500);

  const handleRoleChange = async (
    userId: number,
    newRole: "admin" | "teacher" | "user"
  ) => {
    const newPromise = new Promise(async (resolve, reject) => {
      try {
        setIsLoading({
          id: userId,
          loading: true,
        });
        await userService.updateUserRole(userId, newRole);
        await refetch();
        resolve(null);
      } catch (error) {
        reject(error);
      } finally {
        setIsLoading({
          id: null,
          loading: false,
        });
      }
    });

    await toast.promise(newPromise, {
      loading: "Updating role...",
      success: "Role updated successfully!",
      error: "Failed to update role!",
    });
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "60%",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: "40%",
      render: (role: string, record: any) => (
        <Select
          value={role}
          onChange={(newRole: string) =>
            handleRoleChange(record.id, newRole as "admin" | "teacher" | "user")
          }
          style={{ width: 120 }}
          loading={isLoading.id === record.id && isLoading.loading}
        >
          <Option value="user">User</Option>
          <Option value="teacher">Teacher</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        <Space className="w-full justify-start mb-4">
          <Search
            placeholder="Search by email"
            allowClear
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              handleSearch(e.target.value);
            }}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.contents}
        rowKey="id"
        pagination={{
          total: data?.totalElements,
          pageSize: searchParams.limit,
          current: searchParams.page + 1,
          onChange: (page) => {
            setSearchParams({
              ...searchParams,
              page: page - 1,
            });
          },
        }}
        loading={isLoadingUsers}
        className="bg-white rounded-lg shadow-sm"
      />
    </div>
  );
};

export default UserManagement;
