import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Table,
  Tag as AntTag,
  Typography,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  useGetQuestionsByCreator,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestionQueries";
import { useGetAllTags, useAddTagToQuestion } from "@/hooks/useTagQueries";
import { Question, Choice, Tag, QuestionTable } from "@/apis/type";
import { MinusCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const ListTeacherQuestion = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;
  const userRole = user.role?.toLowerCase();

  if (!creatorId || !["teacher", "admin"].includes(userRole)) {
    navigate("/login");
    return null;
  }

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "edit" | "delete" | null;
    question: QuestionTable | null;
  }>({ type: null, question: null });
  const [questionType, setQuestionType] = useState<string>("multiple-choice");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null
  );
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: paginatedQuestions, isLoading } = useGetQuestionsByCreator(
    creatorId,
    page,
    limit
  );
  const { data: tags = [] } = useGetAllTags();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const addTagToQuestion = useAddTagToQuestion();

  const handleCreateQuestion = async (values: any) => {
    try {
      const commonData: Partial<Question> = {
        questionName: values.questionName,
        questionType: values.questionType,
        difficulty_level: values.difficulty_level,
        question: values.question,
        creatorId,
        templateCode: "",
        cpuTimeLimit: 0,
        memoryLimit: 0,
        maxPoint: 0,
        testCases: [],
        language: null,
        correctAnswer: null,
        choices: null,
      };

      let specificData: Partial<Question> = {};
      switch (values.questionType) {
        case "multiple-choice":
          specificData = {
            choices: values.choices?.map((choice: any) => ({
              choice: choice.choice,
            })),
            correctAnswer:
              values.choices?.[correctAnswerIndex || 0]?.choice || "",
          };
          break;
        case "short-answer":
          specificData = { correctAnswer: values.correctAnswer };
          break;
        case "coding":
          specificData = {
            language: values.language,
            memoryLimit: values.memoryLimit,
            cpuTimeLimit: values.cpuTimeLimit,
            templateCode: values.templateCode,
            testCases: values.testCases?.map((testCase: any) => ({
              input: testCase.input,
              expectedOutput: testCase.output,
            })),
          };
          break;
        default:
          throw new Error("Unsupported question type");
      }

      const payload: Question = { ...commonData, ...specificData } as Question;
      const response = await createQuestionMutation.mutateAsync(payload);

      if (response && values.tagIds?.length) {
        for (const tagId of values.tagIds) {
          await addTagToQuestion.mutateAsync({
            questionId: response.id!,
            tagId,
          });
        }
      }

      form.resetFields();
      setShowCreateForm(false);
      setCorrectAnswerIndex(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create question");
    }
  };

  const handleEditQuestion = async (values: any) => {
    if (!modalState.question?.id) return;

    try {
      const commonData: Partial<Question> = {
        questionName: values.questionName,
        questionType: values.questionType,
        difficulty_level: values.difficulty_level,
        question: values.question,
      };

      let specificData: Partial<Question> = {};
      switch (values.questionType) {
        case "multiple-choice":
          specificData = {
            choices: values.choices?.map((choice: any) => ({
              choice: choice.choice,
            })),
            correctAnswer:
              values.choices?.[correctAnswerIndex || 0]?.choice || "",
          };
          break;
        case "short-answer":
          specificData = { correctAnswer: values.correctAnswer };
          break;
        case "coding":
          specificData = {
            language: values.language,
            memoryLimit: values.memoryLimit,
            cpuTimeLimit: values.cpuTimeLimit,
            templateCode: values.templateCode,
            testCases: values.testCases?.map((testCase: any) => ({
              input: testCase.input,
              expectedOutput: testCase.output,
            })),
          };
          break;
        default:
          throw new Error("Unsupported question type");
      }

      const payload: Partial<Question> = { ...commonData, ...specificData };
      await updateQuestionMutation.mutateAsync({
        questionId: modalState.question.id.toString(),
        data: payload,
      });

      if (values.tagIds?.length) {
        for (const tagId of values.tagIds) {
          await addTagToQuestion.mutateAsync({
            questionId: modalState.question.id!,
            tagId,
          });
        }
      }

      setModalState({ type: null, question: null });
      editForm.resetFields();
      setCorrectAnswerIndex(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update question");
    }
  };

  const handleDeleteQuestion = (id: number) => {
    deleteQuestionMutation.mutate(id, {
      onSuccess: () => {
        setModalState({ type: null, question: null });
      },
      onError: () => {
        toast.error("Failed to delete question");
      },
    });
  };

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value);
    setCorrectAnswerIndex(null);
  };

  const handleCorrectAnswerChange = (index: number) => {
    setCorrectAnswerIndex(index);
  };

  const columns = [
    {
      title: "Question Name",
      dataIndex: "questionName",
      key: "questionName",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      render: (difficulty: string) => {
        const color =
          difficulty === "Easy"
            ? "green"
            : difficulty === "Medium"
            ? "orange"
            : "red";
        return <AntTag color={color}>{difficulty}</AntTag>;
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: Tag[]) => (
        <Flex gap={4} wrap="wrap">
          {tags?.map((tag) => (
            <AntTag key={tag.id} color="blue">
              {tag.name}
            </AntTag>
          ))}
        </Flex>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: QuestionTable) => (
        <Flex gap={2}>
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setModalState({ type: "edit", question: record });
              setQuestionType(record.questionType);
              setCorrectAnswerIndex(
                record.choices?.findIndex(
                  (choice: Choice) => choice.choice === record.correctAnswer
                ) || 0
              );
              editForm.setFieldsValue({
                questionName: record.questionName,
                questionType: record.questionType,
                question: record.question,
                difficulty_level: record.difficulty_level,
                tagIds: record.tags?.map((tag) => tag.id) || [],
                choices: record.choices?.map((choice) => ({
                  choice: choice.choice,
                  statement:
                    record.questionType === "true-false" &&
                    choice.choice === record.correctAnswer,
                })),
                correctAnswer: record.correctAnswer,
                language: record.language,
                memoryLimit: record.memoryLimit,
                cpuTimeLimit: record.cpuTimeLimit,
                templateCode: record.templateCode,
                testCases: record.testCases?.map((tc) => ({
                  input: tc.input,
                  output: tc.expectedOutput,
                })),
              });
            }}
          >
            <HiPencilAlt size={20} />
          </div>
          <div
            className="cursor-pointer hover:text-red-500"
            onClick={() => setModalState({ type: "delete", question: record })}
          >
            <BiTrash size={20} />
          </div>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>My Questions</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          {showCreateForm ? "Cancel" : "Create New Question"}
        </Button>
      </Space>

      {showCreateForm && (
        <Card 
          title={<span style={{ color: '#ff6a00' }}>Create New Question</span>} 
          className="mb-4"
          style={{ background: '#fff' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateQuestion}
            initialValues={{ questionType: "multiple-choice" }}
          >
            <Form.Item
              name="questionName"
              label="Question Name"
              rules={[
                { required: true, message: "Please enter the question name" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="questionType"
              label="Question Type"
              rules={[
                { required: true, message: "Please select a question type" },
              ]}
            >
              <Select onChange={handleQuestionTypeChange}>
                <Option value="multiple-choice">Multiple Choice</Option>
                <Option value="short-answer">Short Answer</Option>
                <Option value="coding">Coding</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="question"
              label="Question"
              rules={[{ required: true, message: "Please enter the question" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="difficulty_level"
              label="Difficulty Level"
              rules={[
                { required: true, message: "Please select difficulty level" },
              ]}
            >
              <Select placeholder="Select difficulty level">
                <Option value="Easy">Easy</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Hard">Hard</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="tagIds"
              label="Tags"
              rules={[
                { required: true, message: "Please select at least one tag" },
              ]}
            >
              <Select mode="multiple" placeholder="Select tags">
                {tags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {questionType === "multiple-choice" && (
              <Form.List name="choices">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Flex
                        key={key}
                        style={{ marginBottom: 8 }}
                        align="baseline"
                        gap={8}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "choice"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter a choice",
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="Choice" />
                        </Form.Item>
                        <Form.Item>
                          <Radio
                            checked={correctAnswerIndex === key}
                            onChange={() => handleCorrectAnswerChange(key)}
                          >
                            Correct
                          </Radio>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Flex>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Choice
                    </Button>
                  </>
                )}
              </Form.List>
            )}
            {questionType === "short-answer" && (
              <Form.Item
                name="correctAnswer"
                label="Correct Answer"
                rules={[
                  {
                    required: true,
                    message: "Please enter the correct answer",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            )}
            {questionType === "coding" && (
              <>
                <Form.Item
                  name="language"
                  label="Programming Language"
                  rules={[
                    { required: true, message: "Please select a language" },
                  ]}
                >
                  <Select placeholder="Select language">
                    <Option value="javascript">JavaScript</Option>
                    <Option value="python">Python</Option>
                    <Option value="java">Java</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="cpuTimeLimit"
                  label="CPU Time Limit (ms)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the CPU time limit",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="memoryLimit"
                  label="Memory Limit (MB)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the memory limit",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="templateCode"
                  label="Template Code"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the template code",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.List name="testCases">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            marginBottom: 16,
                            border: "1px solid #f0f0f0",
                            padding: 16,
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "input"]}
                            label="Input"
                            rules={[
                              { required: true, message: "Input is required" },
                            ]}
                          >
                            <Input placeholder="Input" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "output"]}
                            label="Output"
                            rules={[
                              { required: true, message: "Output is required" },
                            ]}
                          >
                            <Input placeholder="Output" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Test Case
                      </Button>
                    </>
                  )}
                </Form.List>
              </>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createQuestionMutation.isPending}
                style={{ background: '#ff6a00', borderColor: '#ff6a00', marginTop: 20 }}
              >
                Create Question
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Table<QuestionTable>
        dataSource={paginatedQuestions || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        style={{ background: '#fff' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: paginatedQuestions?.length || 0,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setLimit(newPageSize);
          },
        }}
      />

      <Modal
        title={<span style={{ color: '#ff6a00' }}>{modalState.type === "edit" ? "Edit Question" : "Confirm Delete"}</span>}
        open={!!modalState.type}
        onCancel={() => {
          setModalState({ type: null, question: null });
          editForm.resetFields();
          setCorrectAnswerIndex(null);
        }}
        footer={null}
      >
        {modalState.type === "edit" && (
          <Form form={editForm} layout="vertical" onFinish={handleEditQuestion}>
            <Form.Item
              name="questionName"
              label="Question Name"
              rules={[
                { required: true, message: "Please enter the question name" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="questionType"
              label="Question Type"
              rules={[
                { required: true, message: "Please select a question type" },
              ]}
            >
              <Select onChange={handleQuestionTypeChange}>
                <Option value="multiple-choice">Multiple Choice</Option>
                <Option value="short-answer">Short Answer</Option>
                <Option value="coding">Coding</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="question"
              label="Question"
              rules={[{ required: true, message: "Please enter the question" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="difficulty_level"
              label="Difficulty Level"
              rules={[
                { required: true, message: "Please select difficulty level" },
              ]}
            >
              <Select placeholder="Select difficulty level">
                <Option value="Easy">Easy</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Hard">Hard</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="tagIds"
              label="Tags"
              rules={[
                { required: true, message: "Please select at least one tag" },
              ]}
            >
              <Select mode="multiple" placeholder="Select tags">
                {tags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {questionType === "multiple-choice" && (
              <Form.List name="choices">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Flex
                        key={key}
                        style={{ marginBottom: 8 }}
                        align="baseline"
                        gap={8}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "choice"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter a choice",
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="Choice" />
                        </Form.Item>
                        <Form.Item>
                          <Radio
                            checked={correctAnswerIndex === key}
                            onChange={() => handleCorrectAnswerChange(key)}
                          >
                            Correct
                          </Radio>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Flex>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Choice
                    </Button>
                  </>
                )}
              </Form.List>
            )}
            {questionType === "short-answer" && (
              <Form.Item
                name="correctAnswer"
                label="Correct Answer"
                rules={[
                  {
                    required: true,
                    message: "Please enter the correct answer",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            )}
            {questionType === "coding" && (
              <>
                <Form.Item
                  name="language"
                  label="Programming Language"
                  rules={[
                    { required: true, message: "Please select a language" },
                  ]}
                >
                  <Select placeholder="Select language">
                    <Option value="javascript">JavaScript</Option>
                    <Option value="python">Python</Option>
                    <Option value="java">Java</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="cpuTimeLimit"
                  label="CPU Time Limit (ms)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the CPU time limit",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="memoryLimit"
                  label="Memory Limit (MB)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the memory limit",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="templateCode"
                  label="Template Code"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the template code",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.List name="testCases">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            marginBottom: 16,
                            border: "1px solid #f0f0f0",
                            padding: 16,
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "input"]}
                            label="Input"
                            rules={[
                              { required: true, message: "Input is required" },
                            ]}
                          >
                            <Input placeholder="Input" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "output"]}
                            label="Output"
                            rules={[
                              { required: true, message: "Output is required" },
                            ]}
                          >
                            <Input placeholder="Output" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Test Case
                      </Button>
                    </>
                  )}
                </Form.List>
              </>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateQuestionMutation.isPending}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                className="mr-2"
              >
                Update Question
              </Button>
              <Button
                onClick={() => {
                  setModalState({ type: null, question: null });
                  editForm.resetFields();
                  setCorrectAnswerIndex(null);
                }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        )}

        {modalState.type === "delete" && (
          <div>
            <Text>
              Are you sure you want to delete the question "
              {modalState.question?.questionName}"?
            </Text>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setModalState({ type: null, question: null })}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                onClick={() =>
                  modalState.question?.id &&
                  handleDeleteQuestion(modalState.question.id)
                }
                loading={deleteQuestionMutation.isPending}
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

export default ListTeacherQuestion;
