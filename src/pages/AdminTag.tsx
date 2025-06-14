import { Button, Form, Input, Modal, Table, Typography, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined } from "@ant-design/icons";
import { useGetAllTags, useDeleteTag, useCreateTag } from "@/hooks/useTagQueries";
import toast from "react-hot-toast";
import { useState } from "react";

const { Title,  } = Typography;

const ListAdminTag = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;
  const { data: listTags = [], isLoading } = useGetAllTags();
  const deleteTag = useDeleteTag();
  const createTag = useCreateTag();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateTag = async (values: { name: string }) => {
    try {
      await createTag.mutateAsync({ name: values.name, creatorId });
      form.resetFields();
      setIsCreateModalOpen(false);
      toast.success("Tag created successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create tag");
    }
  };

  const columns = [
    {
      title: "Tag Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Creator",
      dataIndex: "creatorName",
      key: "creatorName",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<HiPencilAlt size={20} />}
            onClick={() => navigate(`/admin/tag/edit/${record.id}`)}
          />
          <Button
            type="text"
            danger
            icon={<BiTrash size={20} />}
            onClick={() => deleteTag.mutate(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>All Tags</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Create Tag
        </Button>
      </Space>

      <Table
        dataSource={listTags}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        style={{ background: '#fff' }}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Create New Tag</span>}
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTag}
        >
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[
              { required: true, message: "Please enter the tag name" },
              { min: 2, message: "Tag name must be at least 2 characters" }
            ]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createTag.isPending}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              className="mr-2"
            >
              Create Tag
            </Button>
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListAdminTag;
