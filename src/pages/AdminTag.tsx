import { Button, Form, Input, Modal, Table, Typography, Space, Card } from "antd";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined } from "@ant-design/icons";
import { useGetAllTags, useDeleteTag, useCreateTag, useUpdateTag } from "@/hooks/useTagQueries";
import { Tag } from "@/apis/type";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const { Title, Paragraph } = Typography;

const ListAdminTag = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [localSearch, setLocalSearch] = useState("");
  const [apiSearch, setApiSearch] = useState("");
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>();

  const { data: listTags = { tags: [], pagination: { total: 0 } }, isLoading } = useGetAllTags({
    page,
    limit,
    search: apiSearch,
    sortField,
    sortOrder
  });

  // Debounced search function
  const debouncedSetApiSearch = useMemo(
    () =>
      debounce((value: string) => {
        setApiSearch(value);
      }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSetApiSearch(value);
  };

  const deleteTag = useDeleteTag();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalState, setModalState] = useState<{
    type: "edit" | "delete" | null;
    tag: Tag | null;
  }>({ type: null, tag: null });

  const handleDeleteTag = (id: number) => {
    deleteTag.mutate(id.toString(), {
      onSuccess: () => {
        toast.success("Tag deleted successfully");
        setModalState({ type: null, tag: null });
      },
      onError: () => {
        toast.error("Failed to delete tag");
      },
    });
  };

  const handleEditTag = (values: any) => {
    if (!modalState.tag?.id) return;

    const tagData: Partial<Tag> = {
      name: values.name,
      description: values.description,
    };

    updateTag.mutate(
      { tagId: modalState.tag.id.toString(), data: tagData },
      {
        onSuccess: () => {
          toast.success("Tag updated successfully");
          setModalState({ type: null, tag: null });
          editForm.resetFields();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update tag");
        },
      }
    );
  };

  const onCreateFinish = async (values: any) => {
    try {
      const tagData: Partial<Tag> = {
        name: values.name,
        description: values.description,
      };

      await createTag.mutateAsync(tagData);
      form.resetFields();
      setModalState({ type: null, tag: null });
      toast.success("Tag created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    }
  };

  const handleTableChange = (pagination: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortField(sorter.field);
    setSortOrder(sorter.order);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tag) => (
        <Space>
          <Button
            type="text"
            icon={<HiPencilAlt size={20} />}
            onClick={() => {
              setModalState({ type: "edit", tag: record });
              editForm.setFieldsValue(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<BiTrash size={20} />}
            onClick={() => setModalState({ type: "delete", tag: record })}
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
          onClick={() => setModalState({ type: "edit", tag: null })}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Create New Tag
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search tags..."
            allowClear
            enterButton={
              <Button 
                type="primary" 
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              >
                Search
              </Button>
            }
            size="large"
            value={localSearch}
            onChange={handleSearchChange}
            style={{ width: 300 }}
            className="custom-search"
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={listTags.tags}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: listTags.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
        loading={isLoading}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>{modalState.type === "edit" ? (modalState.tag ? "Edit Tag" : "Create New Tag") : "Confirm Delete"}</span>}
        open={!!modalState.type}
        onCancel={() => {
          setModalState({ type: null, tag: null });
          editForm.resetFields();
        }}
        footer={null}
      >
        {modalState.type === "edit" && (
          <Form
            form={modalState.tag ? editForm : form}
            layout="vertical"
            onFinish={modalState.tag ? handleEditTag : onCreateFinish}
          >
            <Form.Item
              name="name"
              label="Tag Name"
              rules={[{ required: true, message: "Please enter the tag name" }]}
            >
              <Input placeholder="Enter tag name" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter the description" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter tag description" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalState.tag ? updateTag.isPending : createTag.isPending}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                className="mr-2"
              >
                {modalState.tag ? "Update Tag" : "Create Tag"}
              </Button>
              <Button
                onClick={() => {
                  setModalState({ type: null, tag: null });
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        )}

        {modalState.type === "delete" && (
          <div>
            <Paragraph>
              Are you sure you want to delete the tag "{modalState.tag?.name}"?
            </Paragraph>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setModalState({ type: null, tag: null })}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                onClick={() =>
                  modalState.tag?.id &&
                  handleDeleteTag(modalState.tag.id)
                }
                loading={deleteTag.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListAdminTag;
