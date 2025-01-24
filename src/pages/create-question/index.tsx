import React, { useState } from "react";
import { Form, Input, Select, Button, Card, Space, Radio } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import questionService from "@/apis/service/questionService.ts";
import toast from "react-hot-toast";

const { Option } = Select;

const CreateQuestion: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<string | null>(
    "multiple-choice"
  );

  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null
  );

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const commonData = {
        question: values.question,
        questionType: values.questionType,
        grade: values.grade,
        subject: values.subject,
        difficulty_level: values.difficulty_level,
      };

      let specificData = {};
      switch (values.questionType) {
        case "multiple-choice":
          specificData = {
            choices: values.choices.map((choice: any) => ({
              choice: choice.choice,
            })),
            correct_answer: correctAnswerIndex?.toString(),
          };
          break;
        case "short-answer":
          specificData = { correct_answer: values.correct_answer };
          break;
        case "true-false":
          specificData = {
            choices: values.choices.map((choice: any) => ({
              choice: choice.choice,
              statement: choice.statement, // Store true/false for each choice
            })),
          };
          break;
        case "coding":
          specificData = {
            memoryLimit: values.memoryLimit,
            cpuTimeLimit: values.cpuTimeLimit,
            templateCode: values.templateCode,
            testCases: values.testCases,
          };
          break;
        default:
          throw new Error("Unsupported question type");
      }

      const payload = { ...commonData, ...specificData };

      const response = await questionService.createQuestion(payload);

      if (response) {
        toast.success("Question created successfully");
        form.resetFields();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value);
  };

  const handleCorrectAnswerChange = (index: number) => {
    setCorrectAnswerIndex(index);
    const choices = form.getFieldValue("choices") || [];
    const updatedChoices = choices.map((choice: any, i: number) => ({
      ...choice,
      correct_answer: i === index,
    }));
    form.setFieldsValue({ choices: updatedChoices });
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
            grade: "",
            subject: "",
            difficulty_level: "",
          }}
          onValuesChange={() => setCorrectAnswerIndex(null)}
        >
          {/* Question Text */}
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* Question Type */}
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

          {/* Grade */}
          <Form.Item
            name="grade"
            label="Grade"
            rules={[{ required: true, message: "Please select a grade" }]}
          >
            <Select placeholder="Select grade">
              <Option value="Grade 1">Grade 1</Option>
              <Option value="Grade 2">Grade 2</Option>
              <Option value="Grade 3">Grade 3</Option>
            </Select>
          </Form.Item>

          {/* Subject */}
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please select a subject" }]}
          >
            <Select placeholder="Select subject">
              <Option value="Math">Math</Option>
              <Option value="Science">Science</Option>
              <Option value="English">English</Option>
            </Select>
          </Form.Item>

          {/* Difficulty Level */}
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

          {/* Multiple Choice Choices */}
          {questionType === "multiple-choice" && (
            <Form.List name="choices">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
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
                      >
                        <Input placeholder="Choice" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "correct_answer"]}
                        valuePropName="checked"
                        style={{ display: "inline-block", marginLeft: 8 }}
                      >
                        <Radio
                          checked={correctAnswerIndex === key}
                          onChange={() => handleCorrectAnswerChange(key)}
                        ></Radio>
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

          {/* Short Answer */}
          {questionType === "short-answer" && (
            <Form.Item
              name="correct_answer"
              label="Correct Answer"
              rules={[
                { required: true, message: "Please enter the correct answer" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          {/* True/False Choices */}
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

          {/* Coding */}
          {questionType === "coding" && (
            <>
              <Form.Item
                name="cpuTimeLimit"
                label="CpuTimeLimit"
                rules={[
                  { required: true, message: "Please enter the CpuTimeLimit" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="memoryLimit"
                label="MemoryLimit"
                rules={[
                  { required: true, message: "Please enter the Memory Limit" },
                ]}
              >
                <Input.TextArea />
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
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
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
                          label="Expected Output"
                          rules={[
                            {
                              required: true,
                              message: "Expected output is required",
                            },
                          ]}
                        >
                          <Input placeholder="Expected Output" />
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
