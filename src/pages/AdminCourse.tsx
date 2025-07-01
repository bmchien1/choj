import { Button, Form, Input, Modal, Table, Typography, Space, Card, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { useGetAllCourses, useDeleteCourse, useCreateCourse, useUpdateCourse } from "@/hooks/useCourseQueries";
import { Course } from "@/apis/type";
import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ListAdminCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [localSearch, setLocalSearch] = useState("");
  const [apiSearch, setApiSearch] = useState("");
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>();
  const [filters, setFilters] = useState<{
    class?: string;
    subject?: string;
  }>({});

  const { data: listCourses = { courses: [], pagination: { total: 0 } }, isLoading } = useGetAllCourses({
    page,
    limit,
    search: apiSearch,
    sortField,
    sortOrder,
    class: filters.class,
    subject: filters.subject
  });

  const deleteCourse = useDeleteCourse();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalState, setModalState] = useState<{
    type: "edit" | "delete" | null;
    course: Course | null;
  }>({ type: null, course: null });

  useEffect(() => {
    if (modalState.type === "edit" && modalState.course) {
      editForm.setFieldsValue(modalState.course);
    }
  }, [modalState, editForm]);

  // Debounced search function
  const debouncedSetApiSearch = useMemo(
    () =>
      debounce((value: string) => {
        setApiSearch(value);
      }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetApiSearch.cancel();
    };
  }, [debouncedSetApiSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSetApiSearch(value);
  };

  const handleDeleteCourse = (id: number) => {
    deleteCourse.mutate(id.toString(), {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        setModalState({ type: null, course: null });
      },
      onError: () => {
        toast.error("Failed to delete course");
      },
    });
  };

  const handleEditCourse = (values: any) => {
    if (!modalState.course?.id) return;

    const courseData: Partial<Course> = {
      name: values.name,
      description: values.description,
      class: values.class,
      subject: values.subject,
    };

    updateCourse.mutate(
      { courseId: modalState.course.id.toString(), data: courseData },
      {
        onSuccess: () => {
          toast.success("Course updated successfully");
          setModalState({ type: null, course: null });
          editForm.resetFields();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update course");
        },
      }
    );
  };

  const onCreateFinish = async (values: any) => {
    try {
      if (!user.id) {
        throw new Error("User not logged in");
      }

      const courseData: Course = {
        name: values.name,
        description: values.description,
        class: values.class,
        subject: values.subject,
        creatorId: user.id,
      };

      await createCourse.mutateAsync(courseData);
      form.resetFields();
      setModalState({ type: null, course: null });
      toast.success("Course created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortField(sorter.field);
    setSortOrder(sorter.order);
    setFilters({
      class: filters.class?.[0],
      subject: filters.subject?.[0]
    });
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
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      filters: [
        { text: '10', value: '10' },
        { text: '11', value: '11' },
        { text: '12', value: '12' },
      ],
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      filters: [
        { text: 'Toán', value: 'Toán' },
        { text: 'Lý', value: 'Lý' },
        { text: 'Hóa', value: 'Hóa' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => (
        <Space>
          <Button
            type="text"
            icon={<HiPencilAlt size={20} />}
            onClick={() => {
              setModalState({ type: "edit", course: record });
              editForm.setFieldsValue(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<BiTrash size={20} />}
            onClick={() => setModalState({ type: "delete", course: record })}
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/courses/details/${record.id}`)}
          />
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/admin/submission/course/${record.id}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>Courses Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalState({ type: "edit", course: null })}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Create New Course
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search courses..."
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
          <Space wrap>
            <Select
              placeholder="Class"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => setFilters(prev => ({ ...prev, class: value }))}
              value={filters.class}
              className="custom-select"
            >
              <Option value="10">Class 10</Option>
              <Option value="11">Class 11</Option>
              <Option value="12">Class 12</Option>
            </Select>
            <Select
              placeholder="Subject"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
              value={filters.subject}
              className="custom-select"
            >
              <Option value="Toán">Toán</Option>
              <Option value="Lý">Lý</Option>
              <Option value="Hóa">Hóa</Option>
            </Select>
            <Button 
              onClick={() => {
                setLocalSearch("");
                setFilters({});
                setSortField(undefined);
                setSortOrder(undefined);
              }}
              style={{ 
                borderColor: '#ff6a00',
                color: '#ff6a00'
              }}
            >
              Reset Filters
            </Button>
          </Space>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={listCourses.courses}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: listCourses.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
        loading={isLoading}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>{modalState.type === "edit" ? (modalState.course ? "Edit Course" : "Create New Course") : "Confirm Delete"}</span>}
        open={!!modalState.type}
        onCancel={() => {
          setModalState({ type: null, course: null });
          editForm.resetFields();
        }}
        footer={null}
      >
        {modalState.type === "edit" && (
          <Form
            form={modalState.course ? editForm : form}
            layout="vertical"
            onFinish={modalState.course ? handleEditCourse : onCreateFinish}
          >
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: "Please enter the course name" }]}
            >
              <Input placeholder="Enter course name" />
            </Form.Item>
            <Form.Item
              name="class"
              label="Class"
              rules={[{ required: true, message: "Please enter the class" }]}
            >
              <Input placeholder="Enter class" />
            </Form.Item>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: "Please enter the subject" }]}
            >
              <Input placeholder="Enter subject" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter the description" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter course description" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={modalState.course ? updateCourse.isPending : createCourse.isPending}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                className="mr-2"
              >
                {modalState.course ? "Update Course" : "Create Course"}
              </Button>
              <Button
                onClick={() => {
                  setModalState({ type: null, course: null });
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
              Are you sure you want to delete the course "{modalState.course?.name}"?
            </Paragraph>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setModalState({ type: null, course: null })}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                onClick={() =>
                  modalState.course?.id &&
                  handleDeleteCourse(modalState.course.id)
                }
                loading={deleteCourse.isPending}
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

export default ListAdminCourse;
