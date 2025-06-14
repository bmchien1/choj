import { Button, Card, Form, Input, Modal, Select, Table, Typography, Space, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useGetMatricesByUser, useDeleteMatrix, useCreateMatrix } from "@/hooks/useMatrixQueries";
import { useGetAllTags } from "@/hooks/useTagQueries";
import { useGetAllQuestions } from "@/hooks/useQuestionQueries";
import toast from "react-hot-toast";
import { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

const ListTeacherMatrix = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;
  const { data: listMatrices = [], isLoading } = useGetMatricesByUser(creatorId);
  const { data: tags = [] } = useGetAllTags();
  const { data: questions = [] } = useGetAllQuestions();
  const deleteMatrix = useDeleteMatrix();
  const createMatrix = useCreateMatrix();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateMatrix = async (values: any) => {
    try {
      const matrixData = {
        name: values.name,
        description: values.description,
        totalPoints: values.totalPoints,
        criteria: values.criteria.map((criterion: any) => ({
          questionType: criterion.questionType,
          difficultyLevel: criterion.difficultyLevel,
          tagId: criterion.tagId,
          percentage: criterion.percentage,
        })),
        creatorId,
      };

      await createMatrix.mutateAsync({ userId: creatorId.toString(), data: matrixData });
      form.resetFields();
      setIsCreateModalOpen(false);
      toast.success("Matrix created successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create matrix");
    }
  };

  const validatePercentages = (_: any, value: number) => {
    const criteria = form.getFieldValue('criteria');
    const total = criteria.reduce((sum: number, item: any) => sum + (item.percentage || 0), 0);
    if (total > 100) {
      return Promise.reject('Total percentage cannot exceed 100%');
    }
    return Promise.resolve();
  };

  const columns = [
    {
      title: "Matrix Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Total Points",
      dataIndex: "totalPoints",
      key: "totalPoints",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<HiPencilAlt size={20} />}
            onClick={() => navigate(`/teacher/matrix/edit/${record.id}`)}
          />
          <Button
            type="text"
            danger
            icon={<BiTrash size={20} />}
            onClick={() => handleDeleteMatrix(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleDeleteMatrix = (id: number) => {
    deleteMatrix.mutate(id.toString(), {
      onSuccess: () => {
        toast.success("Matrix deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete matrix");
      },
    });
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>My Matrices</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Create Matrix
        </Button>
      </Space>

      <Table
        dataSource={listMatrices}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        style={{ background: '#fff' }}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Create New Matrix</span>}
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMatrix}
        >
          <Form.Item
            name="name"
            label="Matrix Name"
            rules={[{ required: true, message: "Please enter the matrix name" }]}
          >
            <Input placeholder="Enter matrix name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter the description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter matrix description" />
          </Form.Item>

          <Form.Item
            name="totalPoints"
            label="Total Points"
            rules={[
              { required: true, message: "Please enter total points" },
              { type: 'number', min: 1, message: "Points must be greater than 0" }
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter total points" />
          </Form.Item>

          <Form.List
            name="criteria"
            rules={[
              {
                validator: async (_, criteria) => {
                  if (!criteria || criteria.length < 1) {
                    return Promise.reject(new Error('At least one criterion is required'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    style={{ marginBottom: 16, background: '#fafafa' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'questionType']}
                      label="Question Type"
                      rules={[{ required: true, message: 'Please select question type' }]}
                    >
                      <Select placeholder="Select question type">
                        <Option value="multiple-choice">Multiple Choice</Option>
                        <Option value="short-answer">Short Answer</Option>
                        <Option value="true-false">True/False</Option>
                        <Option value="coding">Coding</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'difficultyLevel']}
                      label="Difficulty Level"
                      rules={[{ required: true, message: 'Please select difficulty level' }]}
                    >
                      <Select placeholder="Select difficulty level">
                        <Option value="Easy">Easy</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="Hard">Hard</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'tagId']}
                      label="Tag"
                      rules={[{ required: true, message: 'Please select a tag' }]}
                    >
                      <Select placeholder="Select tag">
                        {tags.map((tag) => (
                          <Option key={tag.id} value={tag.id}>
                            {tag.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'percentage']}
                      label="Percentage"
                      rules={[
                        { required: true, message: 'Please enter percentage' },
                        { type: 'number', min: 1, max: 100, message: 'Percentage must be between 1 and 100' },
                        { validator: validatePercentages }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter percentage"
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 16 }}
                >
                  Add Criterion
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMatrix.isPending}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              className="mr-2"
            >
              Create Matrix
            </Button>
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListTeacherMatrix;
