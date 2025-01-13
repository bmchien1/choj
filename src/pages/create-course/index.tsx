import React, { useState } from "react";
import { Form, Input, Switch, Button, Card } from "antd";
import toast from "react-hot-toast";
import courseService from "@/apis/service/courseService.ts";

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const courseData = {
        name: values.name,
        description: values.description,
        class: values.class,
      };

      const response = await courseService.create(courseData);

      if (response) {
        toast.success("Course created successfully");
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create course");
    } finally {
      setLoading(false);
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

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Course
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
