import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Input, Button, Card } from "antd";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import tagService from "@/apis/service/tagService.ts";

const EditTag: React.FC = () => {
  const { id: tagId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch tag data
  const {
    data: tagData,
    isLoading: isLoadingTag,
    isError,
  } = useQuery({
    queryKey: ["tag", tagId],
    queryFn: async ({ queryKey }: any) => {
      const [, _id] = queryKey;
      return await tagService.getOne(_id);
    },
    enabled: !!tagId,
  });

  // Update form when data is fetched
  useEffect(() => {
    if (tagData) {
      form.setFieldsValue({
        tagName: tagData.tagName,
        creator: tagData.creator,
        description: tagData.description,
        status: tagData.status,
      });
    }
  }, [tagData, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => tagService.update(tagId as string, data),
    onSuccess: () => {
      toast.success("Tag updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update tag");
    },
  });

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const tagUpdateData = {
        tagName: values.tagName,
        creator: values.creator,
        description: values.description,
        status: values.status,
      };

      await updateMutation.mutateAsync(tagUpdateData);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update tag");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingTag) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Tag not found</div>;
  }

  return (
    <div className="w-full">
      <Card title="Edit Tag">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="tagName"
            label="Tag Name"
            rules={[{ required: true, message: "Please enter the tag name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || updateMutation.isPending}
            >
              Update Tag
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditTag;
