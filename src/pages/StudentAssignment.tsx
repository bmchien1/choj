import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Button,
  Input,
  Radio,
  Form,
  Select,
  Modal,
  Tooltip,
  Space,
  Affix,
  Menu,
  Badge,
} from "antd";
import { useGetAssignmentById } from "@/hooks/useAssignmentQueries";
import {
  useCreateAssignmentSubmission,
  useBuildCode,
} from "@/hooks/useSubmissionQueries";
import { Question, GradingResult } from "@/apis/type";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-dracula";
import * as ace from "ace-builds";
import {
  CodeOutlined,
  CheckSquareOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

ace.config.set("basePath", "/node_modules/ace-builds/src-noconflict");

const { Title, Paragraph } = Typography;
const { Option } = Select;

const StudentAssignment: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const {
    data: assignment,
    isLoading,
    error,
  } = useGetAssignmentById(assignmentId || "");
  const [form] = Form.useForm();
  const [buildResults, setBuildResults] = useState<{ [key: string]: string }>(
    {}
  );
  const [gradingResults, setGradingResults] = useState<GradingResult | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<{
    [key: string]: string;
  }>({});
  const [editorCodes, setEditorCodes] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimeUpModalVisible, setIsTimeUpModalVisible] = useState(false);
  const { mutate: createSubmission, isPending: isSubmitting } =
    useCreateAssignmentSubmission();
  const { mutate: buildCode, isPending: isBuilding } = useBuildCode();
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  // Timer logic
  useEffect(() => {
    if (assignment?.duration) {
      // Check if there's a saved start time
      const savedStartTime = localStorage.getItem(`assignment_${assignmentId}_start_time`);
      const savedTimeLeft = localStorage.getItem(`assignment_${assignmentId}_time_left`);
      
      if (savedStartTime && savedTimeLeft) {
        // Calculate remaining time based on saved start time
        const now = Date.now();
        const elapsedTime = Math.floor((now - parseInt(savedStartTime)) / 1000);
        const remainingTime = Math.max(0, parseInt(savedTimeLeft) - elapsedTime);
        setTimeLeft(remainingTime);
        setStartTime(parseInt(savedStartTime));
      } else {
        // First time starting the assignment
        const now = Date.now();
        const endTime = now + assignment.duration * 60 * 1000;
        const initialTime = assignment.duration * 60;
        setTimeLeft(initialTime);
        setStartTime(now);
        localStorage.setItem(`assignment_${assignmentId}_start_time`, now.toString());
        localStorage.setItem(`assignment_${assignmentId}_time_left`, initialTime.toString());
      }

      const timer = setInterval(() => {
        if (startTime) {
          const now = Date.now();
          const elapsedTime = Math.floor((now - startTime) / 1000);
          const secondsLeft = Math.max(0, (assignment?.duration || 60) * 60 - elapsedTime);
          setTimeLeft(secondsLeft);
          localStorage.setItem(`assignment_${assignmentId}_time_left`, secondsLeft.toString());

          if (secondsLeft <= 60 && secondsLeft > 59) {
            toast.error("1 minute remaining!");
          }

          if (secondsLeft <= 0 && !isTimeUp) {
            clearInterval(timer);
            setIsTimeUp(true);
            setIsTimeUpModalVisible(true);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assignment, form, startTime, assignmentId, isTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBuild = (
    questionId: string,
    code: string,
    input: string,
    language: string
  ) => {
    if (!code.trim()) {
      toast.error("Source code cannot be empty");
      return;
    }
    if (code === input) {
      toast.error("Source code cannot be the same as input");
      return;
    }
    buildCode(
      { language, sourceCode: code, input },
      {
        onSuccess: (data) => {
          setBuildResults((prev) => ({
            ...prev,
            [questionId]: data.output || data.error || "No output",
          }));
        },
        onError: (error) => {
          setBuildResults((prev) => ({
            ...prev,
            [questionId]: `Error running code: ${error.message}`,
          }));
        },
      }
    );
  };

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleSubmit = async (values: any) => {
    // Clear saved time when submitting
    localStorage.removeItem(`assignment_${assignmentId}_start_time`);
    localStorage.removeItem(`assignment_${assignmentId}_time_left`);
    setTimeLeft(0);
    
    const answers = Object.keys(values)
      .map((key) => {
        const questionId = key.replace("question-", "");
        const sourceCode = editorCodes[questionId] || values[key];
        return {
          questionId: parseInt(questionId),
          sourceCode,
          language: selectedLanguages[questionId] || "javascript",
        };
      })
      .filter((answer: { questionId: number; sourceCode: string; language: string }) => 
        answer.sourceCode && answer.sourceCode.trim() !== ''
      );

    createSubmission(
      {
        userId: user.id,
        assignmentId: parseInt(assignmentId || "0"),
        answers,
      },
      {
        onSuccess: (data) => {
          setGradingResults(data);
          setIsModalVisible(true);
        },
        onError: (error) => {
          toast.error(`Submission failed: ${error.message}`);
        },
      }
    );
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    navigate(`/my-courses/${assignment?.course.id}`);
  };

  // Add this function to handle question navigation
  const scrollToQuestion = (questionId: number) => {
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add this function to check if a question is answered
  const checkQuestionAnswered = (questionId: number) => {
    const value = form.getFieldValue(`question-${questionId}`);
    return value !== undefined && value !== '';
  };

  // Add this effect to track answered questions
  useEffect(() => {
    const checkAnswers = () => {
      const answered = new Set<number>();
      assignment?.questions?.forEach(question => {
        if (question.id && checkQuestionAnswered(question.id)) {
          answered.add(question.id);
        }
      });
      setAnsweredQuestions(answered);
    };

    // Check answers initially
    checkAnswers();

    // Set up an interval to check answers periodically
    const interval = setInterval(checkAnswers, 1000);

    return () => clearInterval(interval);
  }, [assignment, form]);

  const handleTimeUpSubmit = () => {
    setIsTimeUpModalVisible(false);
    handleSubmit(form.getFieldsValue());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !assignment) {
    toast.error("Failed to load assignment");
    return (
      <div className="text-center mt-20 text-gray-600">
        Assignment not found
      </div>
    );
  }

  const renderQuestion = (question: Question, index: number) => {
    if (question.questionType === "true-false") return null;
    if (!question.id) return null;

    const questionIdStr = question.id.toString();

    switch (question.questionType) {
      case "multiple-choice":
        return (
          <Card
            key={questionIdStr}
            id={`question-${question.id}`}
            bordered={false}
            style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            title={
              <div className="flex items-center space-x-2">
                <CheckSquareOutlined style={{ color: '#ff6a00' }} />
                <span style={{ color: '#ff6a00' }}>Question {index + 1}</span>
              </div>
            }
          >
            <Paragraph style={{ fontSize: '16px', marginBottom: 16 }}>
              {question.question}
            </Paragraph>
            <Form.Item
              name={`question-${question.id}`}
              rules={[{ required: true, message: "Please select an answer" }]}
            >
              <Radio.Group className="space-y-2">
                {question.choices && Array.isArray(question.choices) ? (
                  question.choices.map(
                    (choice: { choice: string }, idx: number) => (
                      <Radio key={idx} value={choice.choice} className="block">
                        {choice.choice}
                      </Radio>
                    )
                  )
                ) : (
                  <Paragraph className="text-gray-500">
                    No choices available
                  </Paragraph>
                )}
              </Radio.Group>
            </Form.Item>
          </Card>
        );
      case "short-answer":
        return (
          <Card
            key={questionIdStr}
            id={`question-${question.id}`}
            bordered={false}
            style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            title={
              <div className="flex items-center space-x-2">
                <EditOutlined style={{ color: '#ff6a00' }} />
                <span style={{ color: '#ff6a00' }}>Question {index + 1}</span>
              </div>
            }
          >
            <Paragraph style={{ fontSize: '16px', marginBottom: 16 }}>
              {question.question}
            </Paragraph>
            <Form.Item
              name={`question-${question.id}`}
              rules={[{ required: true, message: "Please provide an answer" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter your answer here..."
                style={{ borderColor: '#ff6a00' }}
              />
            </Form.Item>
          </Card>
        );
      case "coding":
        return (
          <Card
            key={questionIdStr}
            id={`question-${question.id}`}
            bordered={false}
            style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            title={
              <div className="flex items-center space-x-2">
                <CodeOutlined style={{ color: '#ff6a00' }} />
                <span style={{ color: '#ff6a00' }}>Question {index + 1}</span>
              </div>
            }
          >
            <Paragraph style={{ fontSize: '16px', marginBottom: 16 }}>
              {question.question}
            </Paragraph>
            <div className="space-y-4">
              <Space>
                <Paragraph style={{ margin: 0 }}>
                  Time Limit: {question.cpuTimeLimit}s
                </Paragraph>
                <Paragraph style={{ margin: 0 }}>
                  Memory Limit: {question.memoryLimit}MB
                </Paragraph>
              </Space>
              <Form.Item
                name={`question-${question.id}`}
                rules={[
                  { required: true, message: "Please provide a solution" },
                ]}
              >
                <div className="space-y-4">
                  <Select
                    defaultValue={question.language || "javascript"}
                    style={{ width: 120, borderColor: '#ff6a00' }}
                    onChange={(value) =>
                      setSelectedLanguages((prev) => ({
                        ...prev,
                        [questionIdStr]: value,
                      }))
                    }
                  >
                    <Option value="java">Java</Option>
                    <Option value="python">Python</Option>
                    <Option value="c_cpp">C/C++</Option>
                  </Select>
                  <AceEditor
                    mode={
                      selectedLanguages[questionIdStr] ||
                      question.language ||
                      "javascript"
                    }
                    theme="dracula"
                    name={`editor-${questionIdStr}`}
                    width="100%"
                    height="300px"
                    defaultValue={question.templateCode || ""}
                    setOptions={{
                      useWorker: false,
                      showLineNumbers: true,
                      tabSize: 2,
                    }}
                    className="rounded-md border border-gray-300"
                    onChange={(value) => {
                      setEditorCodes((prev) => ({
                        ...prev,
                        [questionIdStr]: value,
                      }));
                      form.setFieldsValue({
                        [`question-${question.id}`]: value,
                      });
                    }}
                  />
                  <Input.TextArea
                    rows={2}
                    placeholder="Enter custom input for testing..."
                    style={{ borderColor: '#ff6a00' }}
                    id={`input-${questionIdStr}`}
                    onChange={(e) =>
                      setBuildResults((prev) => ({
                        ...prev,
                        [questionIdStr]: "",
                      }))
                    }
                  />
                  <Tooltip title="Run your code with the provided input">
                    <Button
                      type="primary"
                      loading={isBuilding}
                      onClick={() => {
                        const code =
                          editorCodes[questionIdStr] ||
                          form.getFieldValue(`question-${question.id}`);
                        const input =
                          (
                            document.getElementById(
                              `input-${questionIdStr}`
                            ) as HTMLTextAreaElement
                          )?.value || "";
                        handleBuild(
                          questionIdStr,
                          code,
                          input,
                          selectedLanguages[questionIdStr] ||
                            question.language ||
                            "javascript"
                        );
                      }}
                      style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                    >
                      Build & Run
                    </Button>
                  </Tooltip>
                  {buildResults[questionIdStr] && (
                    <Card bordered={false} style={{ background: '#1e1e1e' }}>
                      <pre style={{ color: '#fff', margin: 0 }}>
                        {buildResults[questionIdStr]}
                      </pre>
                    </Card>
                  )}
                </div>
              </Form.Item>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh', position: 'relative' }}>
      <div style={{ 
        background: '#fff', 
        padding: '16px 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/my-courses/${assignment?.course.id}`)}
          style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
        >
          Back to Course
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1, maxWidth: 'calc(100% - 200px)' }}>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="flex justify-between items-center">
                  <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>{assignment.title}</Title>
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined style={{ color: '#ff6a00' }} />
                    <span style={{ color: '#ff6a00', fontWeight: 'bold' }}>
                      {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                    </span>
                  </div>
                </div>
                <Paragraph style={{ fontSize: '16px' }}>{assignment.description}</Paragraph>
                <Space>
                  <Paragraph style={{ margin: 0 }}>
                    Duration: {assignment.duration} minutes
                  </Paragraph>
                  {assignment.total_points && (
                    <Paragraph style={{ margin: 0 }}>
                      Total Points: {assignment.total_points}
                    </Paragraph>
                  )}
                </Space>
              </Space>
            </Card>
          )}

          <Form form={form} onFinish={handleSubmit} className="space-y-6">
            {assignment.questions && assignment.questions.length > 0 ? (
              assignment.questions.map((question, index) => (
                <Card
                  key={question.id}
                  id={`question-${question.id}`}
                  bordered={false}
                  style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  title={
                    <div className="flex items-center space-x-2">
                      {question.questionType === "multiple-choice" ? (
                        <CheckSquareOutlined style={{ color: '#ff6a00' }} />
                      ) : question.questionType === "short-answer" ? (
                        <EditOutlined style={{ color: '#ff6a00' }} />
                      ) : (
                        <CodeOutlined style={{ color: '#ff6a00' }} />
                      )}
                      <span style={{ color: '#ff6a00' }}>Question {index + 1}</span>
                    </div>
                  }
                >
                  <Paragraph style={{ fontSize: '16px', marginBottom: 16 }}>
                    {question.question}
                  </Paragraph>

                  {question.questionType === "multiple-choice" && (
                    <Form.Item
                      name={`question-${question.id}`}
                      rules={[{ required: true, message: "Please select an answer" }]}
                    >
                      <Radio.Group className="space-y-2">
                        {question.choices?.map((choice: { choice: string }, idx: number) => (
                          <Radio key={idx} value={choice.choice} className="block">
                            {choice.choice}
                          </Radio>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  )}

                  {question.questionType === "short-answer" && (
                    <Form.Item
                      name={`question-${question.id}`}
                      rules={[{ required: true, message: "Please provide an answer" }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Enter your answer here..."
                        style={{ borderColor: '#ff6a00' }}
                      />
                    </Form.Item>
                  )}

                  {question.questionType === "coding" && (
                    <div className="space-y-4">
                      <Space>
                        <Paragraph style={{ margin: 0 }}>
                          Time Limit: {question.cpuTimeLimit}s
                        </Paragraph>
                        <Paragraph style={{ margin: 0 }}>
                          Memory Limit: {question.memoryLimit}MB
                        </Paragraph>
                      </Space>

                      <Form.Item
                        name={`question-${question.id}`}
                        rules={[{ required: true, message: "Please provide a solution" }]}
                      >
                        <div className="space-y-4">
                          <Select
                            defaultValue={question.language || "javascript"}
                            style={{ width: 120, borderColor: '#ff6a00' }}
                            onChange={(value) =>
                              setSelectedLanguages((prev) => ({
                                ...prev,
                                [question.id!.toString()]: value,
                              }))
                            }
                          >
                            <Option value="java">Java</Option>
                            <Option value="python">Python</Option>
                            <Option value="c_cpp">C/C++</Option>
                          </Select>

                          <AceEditor
                            mode={selectedLanguages[question.id!.toString()] || question.language || "javascript"}
                            theme="dracula"
                            name={`editor-${question.id}`}
                            width="100%"
                            height="300px"
                            defaultValue={question.templateCode || ""}
                            setOptions={{
                              useWorker: false,
                              showLineNumbers: true,
                              tabSize: 2,
                            }}
                            className="rounded-md border border-gray-300"
                            onChange={(value) => {
                              setEditorCodes((prev) => ({
                                ...prev,
                                [question.id!.toString()]: value,
                              }));
                              form.setFieldsValue({
                                [`question-${question.id}`]: value,
                              });
                            }}
                          />

                          <Input.TextArea
                            rows={2}
                            placeholder="Enter custom input for testing..."
                            style={{ borderColor: '#ff6a00' }}
                            id={`input-${question.id}`}
                            onChange={(e) =>
                              setBuildResults((prev) => ({
                                ...prev,
                                [question.id!.toString()]: "",
                              }))
                            }
                          />

                          <Button
                            type="primary"
                            loading={isBuilding}
                            onClick={() => {
                              const code = editorCodes[question.id!.toString()] ||
                                form.getFieldValue(`question-${question.id}`);
                              const input = (document.getElementById(
                                `input-${question.id}`
                              ) as HTMLTextAreaElement)?.value || "";
                              handleBuild(
                                question.id!.toString(),
                                code,
                                input,
                                selectedLanguages[question.id!.toString()] ||
                                  question.language ||
                                  "javascript"
                              );
                            }}
                            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                          >
                            Build & Run
                          </Button>

                          {buildResults[question.id!.toString()] && (
                            <Card bordered={false} style={{ background: '#1e1e1e' }}>
                              <pre style={{ color: '#fff', margin: 0 }}>
                                {buildResults[question.id!.toString()]}
                              </pre>
                            </Card>
                          )}
                        </div>
                      </Form.Item>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Paragraph>No questions available for this assignment.</Paragraph>
              </Card>
            )}

            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              >
                {isTimeUp ? 'Submit Now' : 'Submit Assignment'}
              </Button>
            </Card>
          </Form>
        </div>

        <Affix offsetTop={80}>
          <Card 
            bordered={false} 
            style={{ 
              width: '180px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: '#fff'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={4} style={{ margin: '0 0 8px 0', color: '#ff6a00' }}>
                Questions
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#ff6a00' }} />
                <Paragraph style={{ margin: 0, color: '#ff6a00', fontWeight: 'bold' }}>
                  {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
                </Paragraph>
              </div>
            </div>
            <Menu
              mode="vertical"
              style={{ border: 'none' }}
            >
              {assignment?.questions?.map((question, index) => (
                <Menu.Item 
                  key={question.id?.toString()}
                  onClick={() => scrollToQuestion(question.id!)}
                  style={{ 
                    marginBottom: '8px',
                    borderRadius: '4px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: answeredQuestions.has(question.id!) ? '#52c41a' : '#ff6a00',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    height: '40px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#646464';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Badge 
                    status={answeredQuestions.has(question.id!) ? "success" : "default"}
                    text={`Question ${index + 1}`}
                  />
                </Menu.Item>
              ))}
            </Menu>
          </Card>
        </Affix>
      </div>

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Submission Results</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        width={800}
        okButtonProps={{ style: { background: '#ff6a00', borderColor: '#ff6a00' } }}
      >
        {gradingResults ? (
          <div className="space-y-4">
            <Title level={4} style={{ color: '#ff6a00' }}>
              Total Score: {gradingResults.score}
            </Title>
            {gradingResults.results && (
              <div className="space-y-4">
                {JSON.parse(gradingResults.results).map(
                  (result: any, idx: number) => (
                    <Card
                      key={idx}
                      title={<span style={{ color: '#ff6a00' }}>Question {result.questionId}</span>}
                      bordered={false}
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Paragraph>
                          Score: {result.score} / {result.maxPoints}
                        </Paragraph>
                        <Paragraph>
                          Status: {result.passed ? "Passed" : "Failed"}
                        </Paragraph>
                        {result.results && (
                          <div>
                            <Paragraph style={{ fontWeight: 'bold' }}>
                              Test Cases:
                            </Paragraph>
                            {result.results.map((tc: any, tcIdx: number) => (
                              <Card
                                key={tcIdx}
                                bordered={false}
                                style={{ 
                                  marginBottom: 8,
                                  background: tc.passed ? '#f6ffed' : '#fff2f0',
                                  border: `1px solid ${tc.passed ? '#b7eb8f' : '#ffccc7'}`
                                }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <Paragraph style={{ margin: 0 }}>
                                    Test Case {tc.testCase}:{" "}
                                    <span style={{ color: tc.passed ? '#52c41a' : '#ff4d4f' }}>
                                      {tc.passed ? "Passed" : "Failed"}
                                    </span>
                                  </Paragraph>
                                  {!tc.passed && (
                                    <>
                                      <Paragraph style={{ margin: 0 }}>
                                        Output: {tc.output || "N/A"}
                                      </Paragraph>
                                      <Paragraph style={{ margin: 0 }}>
                                        Expected: {tc.expected}
                                      </Paragraph>
                                      {tc.error && (
                                        <Paragraph style={{ margin: 0, color: '#ff4d4f' }}>
                                          Error: {tc.error}
                                        </Paragraph>
                                      )}
                                    </>
                                  )}
                                </Space>
                              </Card>
                            ))}
                          </div>
                        )}
                        {result.output && !result.results && (
                          <Paragraph>Answer: {result.output}</Paragraph>
                        )}
                        {result.error && (
                          <Paragraph style={{ color: '#ff4d4f' }}>
                            Error: {result.error}
                          </Paragraph>
                        )}
                      </Space>
                    </Card>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <Paragraph>No results available.</Paragraph>
        )}
      </Modal>

      {/* Time Up Modal */}
      <Modal
        title={<span style={{ color: '#ff6a00' }}>Time's Up!</span>}
        open={isTimeUpModalVisible}
        closable={false}
        maskClosable={false}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={handleTimeUpSubmit}
            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
          >
            Submit Now
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ClockCircleOutlined style={{ fontSize: '48px', color: '#ff6a00', marginBottom: '16px' }} />
          <Title level={4}>Your time is up!</Title>
          <Paragraph>
            Please submit your answers now. You won't be able to make any changes after submission.
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignment;
