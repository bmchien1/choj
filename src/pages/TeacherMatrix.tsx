import { Button, Card, Form, Input, Modal, Select, Table, Typography, Space, InputNumber } from "antd";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useGetMatricesByUser, useDeleteMatrix, useCreateMatrix, useUpdateMatrix } from "@/hooks/useMatrixQueries";
import { useGetTagsByCreator } from "@/hooks/useTagQueries";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";
import debounce from "lodash/debounce";

const { Title } = Typography;
const { Option } = Select;

const ListTeacherMatrix = () => {
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;
  
  console.log('TeacherMatrix - User ID:', creatorId);
  console.log('TeacherMatrix - User Info:', user);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [localSearch, setLocalSearch] = useState("");
  const [apiSearch, setApiSearch] = useState("");
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>();
 

  const { data: listMatrices = { matrices: [], pagination: { total: 0 } }, isLoading, refetch } = useGetMatricesByUser(creatorId, {
    page,
    limit,
    search: apiSearch,
    sortField,
    sortOrder,
  });

  console.log('TeacherMatrix - List Matrices:', listMatrices);
  console.log('TeacherMatrix - Is Loading:', isLoading);

  const { data: tags = { tags: [], pagination: { total: 0 } } } = useGetTagsByCreator(creatorId);
  const deleteMatrix = useDeleteMatrix();
  const createMatrix = useCreateMatrix();
  const updateMatrix = useUpdateMatrix();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Debounced search function
  const debouncedSetApiSearch = useMemo(
    () =>
      debounce((value: string) => {
        setApiSearch(value);
      }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSetApiSearch(value);
  };

  const handleCreateMatrix = async (values: any) => {
    try {
      console.log('handleCreateMatrix - Form values:', values);
      const matrixData = {
        name: values.name,
        description: values.description,
        total_points: values.totalPoints,
        criteria: values.criteria.map((criterion: any) => ({
          questionType: criterion.questionType,
          difficulty_level: criterion.difficultyLevel,
          tagIds: [criterion.tagId],
          percentage: criterion.percentage,
          quantity: criterion.quantity,
        })),
      };

      console.log('handleCreateMatrix - Matrix data to send:', matrixData);
      await createMatrix.mutateAsync(matrixData);
      console.log('handleCreateMatrix - Matrix created successfully');
      form.resetFields();
      setIsCreateModalOpen(false);
      toast.success("Matrix created successfully");
      refetch();
    } catch (error: any) {
      console.error('handleCreateMatrix - Error:', error);
      toast.error(error?.message || "Failed to create matrix");
    }
  };

  const handleEditMatrix = async (values: any) => {
    try {
      const matrixData = {
        name: values.name,
        description: values.description,
        total_points: values.totalPoints,
        criteria: values.criteria.map((criterion: any) => ({
          questionType: criterion.questionType,
          difficulty_level: criterion.difficultyLevel,
          tagIds: [criterion.tagId],
          percentage: criterion.percentage,
          quantity: criterion.quantity,
        })),
      };

      await updateMatrix.mutateAsync({ matrixId: selectedMatrix.id.toString(), data: matrixData });
      editForm.resetFields();
      setIsEditModalOpen(false);
      setSelectedMatrix(null);
      toast.success("Matrix updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update matrix");
    }
  };

  const validatePercentages = (_: any) => {
    const criteria = editForm.getFieldValue('criteria') || [];
    const total = criteria.reduce((sum: number, item: any) => sum + (item.percentage || 0), 0);
    if (total > 100) {
      return Promise.reject('Total percentage cannot exceed 100%');
    }
    return Promise.resolve();
  };

  const handleTableChange = (pagination: any, _: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
  };

  const columns = [
    {
      title: "Matrix Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<HiPencilAlt size={20} />}
            onClick={() => {
              setSelectedMatrix(record);
              editForm.setFieldsValue({
                name: record.name,
                description: record.description,
                totalPoints: record.total_points,
                criteria: record.criteria.map((c: any) => ({
                  questionType: c.questionType,
                  difficultyLevel: c.difficulty_level,
                  tagId: c.tagIds[0],
                  percentage: c.percentage,
                  quantity: c.quantity,
                })),
              });
              setIsEditModalOpen(true);
            }}
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
        refetch();
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

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search matrices..."
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
        </Space>
      </Card>

      <Table
        dataSource={listMatrices?.matrices || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: listMatrices?.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
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
                      rules={[{ required: true, message: 'Question type is required' }]}
                    >
                      <Select>
                        <Option value="multiple-choice">Multiple Choice</Option>
                        <Option value="short-answer">Short Answer</Option>
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
                        {tags.tags?.map((tag) => (
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
                        min={1}
                        max={100}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="Quantity"
                      rules={[
                        { required: true, message: 'Please enter quantity' },
                        { type: 'number', min: 1, message: 'Quantity must be greater than 0' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter quantity"
                        min={1}
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Criterion
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMatrix.isPending}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
            >
              Create Matrix
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Edit Matrix</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedMatrix(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditMatrix}
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
                      rules={[{ required: true, message: 'Question type is required' }]}
                    >
                      <Select>
                        <Option value="multiple-choice">Multiple Choice</Option>
                        <Option value="short-answer">Short Answer</Option>
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
                        {tags.tags?.map((tag) => (
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
                        min={1}
                        max={100}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="Quantity"
                      rules={[
                        { required: true, message: 'Please enter quantity' },
                        { type: 'number', min: 1, message: 'Quantity must be greater than 0' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter quantity"
                        min={1}
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Criterion
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMatrix.isPending}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
            >
              Update Matrix
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListTeacherMatrix;
