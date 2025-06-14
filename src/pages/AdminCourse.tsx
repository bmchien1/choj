import { Card, Modal, Form, Input, Button, Typography, Table, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  useGetAllCourses,
  useDeleteCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/useCourseQueries";
import { Course } from "@/apis/type";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseService from "@/apis/service/courseService";

const { Title, Text, Paragraph } = Typography;

const ListAdminCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: listCourses = [], isLoading } = useGetAllCourses();
  const deleteCourseMutation = useDeleteCourse();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "edit" | "delete" | null;
    course: Course | null;
  }>({ type: null, course: null });
  const [searchParams, setSearchParams] = useState({
    page: 0,
    limit: 10,
    name: "",
  });

  const { mutate: deleteCourse } = useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete course");
    },
  });

  const handleDeleteCourse = (id: number) => {
    deleteCourse(id.toString(), {
      onSuccess: () => {
        toast.success("Course deleted successfully");
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

    updateCourseMutation.mutate(
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

      createCourseMutation.mutate(courseData, {
        onSuccess: () => {
          form.resetFields();
          setShowCreateForm(false);
          toast.success("Course created successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to create course");
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
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
        </Space>
      ),
    },
  ];

  const filteredCourses = Array.isArray(listCourses) ? [] : (listCourses.courses?.filter((course: any) =>
    course.name.toLowerCase().includes(searchParams.name.toLowerCase())
  ) || []);

  const paginatedCourses = filteredCourses.slice(
    searchParams.page * searchParams.limit,
    (searchParams.page + 1) * searchParams.limit
  );

  if (isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>Courses Management</Title>
        <Space>
          <Input
            placeholder="Search by name"
            value={searchParams.name}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                name: e.target.value,
                page: 0,
              }))
            }
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            onClick={() => navigate("/admin/courses/create")}
            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
          >
            Create Course
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={paginatedCourses}
        loading={isLoading}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: searchParams.page + 1,
          total: filteredCourses.length,
          pageSize: searchParams.limit,
          onChange: (page) => {
            setSearchParams((prev) => ({
              ...prev,
              page: page - 1,
            }));
          },
        }}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>{modalState.type === "edit" ? "Edit Course" : "Confirm Delete"}</span>}
        open={!!modalState.type}
        onCancel={() => {
          setModalState({ type: null, course: null });
          editForm.resetFields();
        }}
        footer={null}
      >
        {modalState.type === "edit" && (
          <Form form={editForm} layout="vertical" onFinish={handleEditCourse}>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: "Please enter the course name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="class"
              label="Class"
              rules={[{ required: true, message: "Please enter the class" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: "Please enter the subject" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateCourseMutation.isPending}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                className="mr-2"
              >
                Update Course
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
                loading={deleteCourseMutation.isPending}
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
