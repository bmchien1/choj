import React from "react";
import { Form, Input, Button, Card } from "antd";
import toast from "react-hot-toast";
import { useCreateCourse } from "@/hooks/useCourseQueries";
import { Course } from "@/apis/type";

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm();
  const createCourseMutation = useCreateCourse();

  const onFinish = async (values: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
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
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to create course");
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
    }
  };

  return (
    <div className="w-full">
      <Card title="Create New Course">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Course Name"
            rules={[
              { required: true, message: "Please enter the course name" },
            ]}
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
              loading={createCourseMutation.isPending}
            >
              Create Course
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
