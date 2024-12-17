import React, { useState } from "react";
import { Form, Input, Button, Card } from "antd";
import toast from "react-hot-toast";
import tagService from "@/apis/service/tagService.ts";

const CreateTag: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const tagData = {
        tagName: values.tagName,
      };

      const response = await tagService.create(tagData);

      if (response) {
        toast.success("Tag created successfully");
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card title="Create New Tag">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="tagName"
            label="Tag Name"
            rules={[{ required: true, message: "Please enter the tag name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Tag
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTag;
