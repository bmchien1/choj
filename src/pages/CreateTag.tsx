import React, { useState } from "react";
import { Form, Input, Button, Card } from "antd";
import { useCreateTag } from "@/hooks/useTagQueries";
import toast from "react-hot-toast";

const CreateTag: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const createTag = useCreateTag();

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;

  const onFinish = async (values: { name: string }) => {
    try {
      setLoading(true);
      await createTag.mutateAsync({ name: values.name, creatorId });
      form.resetFields();
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
            name="name"
            label="Tag Name"
            rules={[{ required: true, message: "Please enter the tag name" }]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTag;
