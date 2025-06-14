import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  InputNumber,
  Select,
  Row,
  Col,
} from "antd";
import toast from "react-hot-toast";
import { useCreateMatrix } from "@/hooks/useMatrixQueries";
import { Matrix, Tag } from "@/apis/type";

// Assume a hook to fetch tags
import { useGetAllTags } from "@/hooks/useTagQueries";

const CreateMatrix: React.FC = () => {
  const [form] = Form.useForm();
  const createMatrixMutation = useCreateMatrix();
  const { data: tags = [], isLoading: isTagsLoading } = useGetAllTags();
  const [criteriaList, setCriteriaList] = useState<
    {
      questionType: string;
      difficulty_level: string;
      tagIds: number[];
      percentage: number;
    }[]
  >([]);

  const onFinish = async (values: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!user.id) {
        throw new Error("User not logged in");
      }

      const matrixData: Matrix = {
        name: values.name,
        description: values.description,
        total_points: values.total_points,
        criteria: criteriaList,
      };

      createMatrixMutation.mutate(
        { userId: user.id.toString(), data: matrixData },
        {
          onSuccess: () => {
            form.resetFields();
            setCriteriaList([]);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to create matrix");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to create matrix");
    }
  };

  const addCriterion = () => {
    setCriteriaList([
      ...criteriaList,
      {
        questionType: "",
        difficulty_level: "",
        tagIds: [],
        percentage: 0,
      },
    ]);
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    const updatedCriteria = [...criteriaList];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setCriteriaList(updatedCriteria);
  };

  const removeCriterion = (index: number) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== index));
  };

  const validatePercentages = () => {
    const total = criteriaList.reduce(
      (sum, criterion) => sum + criterion.percentage,
      0
    );
    if (total !== 100) {
      throw new Error("Criteria percentages must sum to 100");
    }
  };

  return (
    <div className="w-full">
      <Card title="Create New Matrix">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Matrix Name"
            rules={[
              { required: true, message: "Please enter the matrix name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="total_points" label="Total Points">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Criteria">
            {criteriaList.map((criterion, index) => (
              <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
                <Col span={5}>
                  <Select
                    placeholder="Question Type"
                    onChange={(value) =>
                      updateCriterion(index, "questionType", value)
                    }
                    value={criterion.questionType}
                  >
                    <Select.Option value="multiple-choice">
                      Multiple Choice
                    </Select.Option>
                    <Select.Option value="short-answer">
                      Short Answer
                    </Select.Option>
                    <Select.Option value="true-false">True/False</Select.Option>
                    <Select.Option value="coding">Coding</Select.Option>
                  </Select>
                </Col>
                <Col span={5}>
                  <Select
                    placeholder="Difficulty"
                    onChange={(value) =>
                      updateCriterion(index, "difficulty_level", value)
                    }
                    value={criterion.difficulty_level}
                  >
                    <Select.Option value="Easy">Easy</Select.Option>
                    <Select.Option value="Medium">Medium</Select.Option>
                    <Select.Option value="Hard">Hard</Select.Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    mode="multiple"
                    placeholder="Select Tags"
                    onChange={(value) =>
                      updateCriterion(index, "tagIds", value)
                    }
                    value={criterion.tagIds}
                    loading={isTagsLoading}
                    style={{ width: "100%" }}
                  >
                    {tags.map((tag: Tag) => (
                      <Select.Option key={tag.id} value={tag.id}>
                        {tag.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <InputNumber
                    placeholder="Percentage"
                    min={0}
                    max={100}
                    onChange={(value) =>
                      updateCriterion(index, "percentage", value || 0)
                    }
                    value={criterion.percentage}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    type="link"
                    danger
                    onClick={() => removeCriterion(index)}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addCriterion} block>
              Add Criterion
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMatrixMutation.isPending}
              onClick={validatePercentages}
            >
              Create Matrix
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateMatrix;
