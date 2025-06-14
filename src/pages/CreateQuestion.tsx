import React, { useState } from "react";
import { Form, Input, Select, Button, Card, Space, Radio } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import questionService from "@/apis/service/questionService.ts";
import toast from "react-hot-toast";
import { Question } from "@/apis/type";
import { useGetAllTags, useAddTagToQuestion } from "@/hooks/useTagQueries";

const { Option } = Select;

const CreateQuestion: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<string>("multiple-choice");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null
  );
  const { data: tags = [] } = useGetAllTags();
  const addTagToQuestion = useAddTagToQuestion();

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const commonData = {
        questionName: values.questionName,
        questionType: values.questionType,
        difficulty_level: values.difficulty_level,
        question: values.question,
        creatorId: creatorId,
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
            choices: values.choices.map((choice: any) => ({
              choice: choice.choice,
            })),
            correctAnswer:
              values.choices[correctAnswerIndex ? correctAnswerIndex : 0]
                ?.choice || "",
          };
          break;
        case "short-answer":
          specificData = { correctAnswer: values.correctAnswer };
          break;
        case "true-false":
          specificData = {
            choices: values.choices.map((choice: any) => ({
              choice: choice.choice,
            })),
            correctAnswer:
              values.choices.find((choice: any) => choice.statement === true)
                ?.choice || "",
          };
          break;
        case "coding":
          specificData = {
            language: values.language,
            memoryLimit: values.memoryLimit,
            cpuTimeLimit: values.cpuTimeLimit,
            templateCode: values.templateCode,
            testCases: values.testCases.map((testCase: any) => ({
              input: testCase.input,
              output: testCase.output,
            })),
          };
          break;
        default:
          throw new Error("Unsupported question type");
      }

      const payload: Question = { ...commonData, ...specificData, tags: [] };
      const response = await questionService.createQuestion(payload);

      if (response && values.tagIds?.length) {
        for (const tagId of values.tagIds) {
          await addTagToQuestion.mutateAsync({
            questionId: response.id!,
            tagId,
          });
        }
      }

      toast.success("Question created successfully");
      form.resetFields();
      setCorrectAnswerIndex(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value);
    setCorrectAnswerIndex(null);
  };

  const handleCorrectAnswerChange = (index: number) => {
    setCorrectAnswerIndex(index);
  };

  return (
    <div className="w-full">
      <Card title="Create New Question">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            questionType: "multiple-choice",
            difficulty_level: "",
          }}
          onValuesChange={() => setCorrectAnswerIndex(null)}
        >
          <Form.Item
            name="questionName"
            label="Question Name"
            rules={[
              { required: true, message: "Please enter the question Name" },
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
              <Option value="true-false">True/False</Option>
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
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "choice"]}
                        rules={[
                          { required: true, message: "Please enter a choice" },
                        ]}
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
                    </Space>
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
                { required: true, message: "Please enter the correct answer" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          {questionType === "true-false" && (
            <Form.List name="choices">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "choice"]}
                        rules={[
                          { required: true, message: "Please enter a choice" },
                        ]}
                      >
                        <Input placeholder="Choice" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "statement"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select true or false",
                          },
                        ]}
                      >
                        <Select placeholder="True/False">
                          <Option value={true}>True</Option>
                          <Option value={false}>False</Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
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
                  { required: true, message: "Please enter the memory limit" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="templateCode"
                label="Template Code"
                rules={[
                  { required: true, message: "Please enter the template code" },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.List name="testCases">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        title={`Test Case #${name + 1}`}
                        extra={
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        }
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
                      </Card>
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

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="mt-4"
          >
            Submit
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateQuestion;
