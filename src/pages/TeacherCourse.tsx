import { Button, Form, Input, Modal, Table, Typography, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { useGetCoursesByCreator, useDeleteCourse, useCreateCourse, useUpdateCourse } from "@/hooks/useCourseQueries";
import { Course } from "@/apis/type";
import { useState } from "react";
import toast from "react-hot-toast";

const { Title, Text, Paragraph } = Typography;

const ListTeacherCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;
  const { data: listCourses = [], isLoading } = useGetCoursesByCreator(creatorId);
  const deleteCourse = useDeleteCourse();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [modalState, setModalState] = useState<{
    type: "edit" | "delete" | null;
    course: Course | null;
  }>({ type: null, course: null });

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
      toast.success("Course created successfully");
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
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/teacher/courses/details/${record.id}`)}
          />
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/teacher/submission/course/${record.id}`)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading) return <div style={{ padding: 24 }}><Text>Loading...</Text></div>;

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>My Courses</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalState({ type: "edit", course: null })}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Create New Course
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={listCourses}
        rowKey="id"
        style={{ background: '#fff' }}
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

export default ListTeacherCourse;