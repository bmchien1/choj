import { Table, Input, Select, Space, Typography } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAllUsers, useEditUsers } from "@/hooks/useUserQueries";
import { AppRole } from "@/apis/type";
import { debounce } from "lodash";

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const UserManagement = () => {
  const [isLoading, setIsLoading] = useState<{
    id: number | null;
    loading: boolean;
  }>({
    id: null,
    loading: false,
  });
  const [searchEmail, setSearchEmail] = useState<string>("");

  const { data: listUsers = [], isLoading: isFetching } = useGetAllUsers();
  const { mutateAsync: updateUserRole } = useEditUsers();

  const handleRoleChange = async (userId: number, newRole: AppRole) => {
    const newPromise = new Promise(async (resolve, reject) => {
      try {
        setIsLoading({
          id: userId,
          loading: true,
        });
        await updateUserRole({ id: userId, role: newRole });
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

  const handleSearch = debounce((value: string) => {
    setSearchEmail(value);
    // Note: Actual search filtering can be implemented server-side or client-side
  }, 300);

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
      render: (role: AppRole, record: any) => (
        <Select
          value={role}
          onChange={(newRole: AppRole) => handleRoleChange(record.id, newRole)}
          style={{ width: 120 }}
          loading={isLoading.id === record.id && isLoading.loading}
        >
          <Option value="user">Student</Option>
          <Option value="teacher">Teacher</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>User Management</Title>
        <Space className="w-full justify-start">
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
      </Space>

      <Table
        columns={columns}
        dataSource={listUsers}
        rowKey="id"
        loading={isFetching}
        style={{ background: '#fff' }}
      />
    </div>
  );
};

export default UserManagement;
