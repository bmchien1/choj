import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestQueries } from '../hooks/useContestQueries';
import { useBuildCode, useCreateSubmission } from '../hooks/useSubmissionQueries';
import {
    Card,
    Typography,
    Button,
    Steps,
    Form,
    Radio,
    Input,
    Space,
    Alert,
    Spin,
    Modal,
    Tooltip,
    Select,
    message,
    Menu,
    Badge,
    Affix
} from 'antd';
import { Question } from '../apis/type';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-dracula';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const steps = [
    {
        title: 'Start',
        content: 'First-content',
    },
    {
        title: 'Questions',
        content: 'Second-content',
    },
    {
        title: 'Submit',
        content: 'Last-content',
    },
];

export const ContestPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const contestId = parseInt(id || '0');
    const { getContestById } = useContestQueries();
    const { mutate: createSubmission, isPending: isSubmitting } = useCreateSubmission();
    const { mutate: buildCode, isPending: isBuilding } = useBuildCode();
    const contestQuery = getContestById(contestId);
    const [form] = Form.useForm();

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isTimeUpModalVisible, setIsTimeUpModalVisible] = useState(false);
    const [buildResults, setBuildResults] = useState<{ [key: string]: string }>({});
    const [gradingResults, setGradingResults] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<{ [key: string]: string }>({});
    const [editorCodes, setEditorCodes] = useState<{ [key: string]: string }>({});
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (contestQuery.data) {
            const now = new Date().getTime();
            const start = new Date(contestQuery.data.startTime).getTime();
            const end = new Date(contestQuery.data.endTime).getTime();
            
            // Check if there's a saved start time
            const savedStartTime = localStorage.getItem(`contest_${contestId}_start_time`);
            const savedTimeLeft = localStorage.getItem(`contest_${contestId}_time_left`);
            
            if (now < start || now > end) {
                setTimeLeft(-1); // invalid
            } else {
                if (savedStartTime && savedTimeLeft) {
                    // Calculate remaining time based on saved start time
                    const elapsedTime = Math.floor((now - parseInt(savedStartTime)) / 1000);
                    const remainingTime = Math.max(0, parseInt(savedTimeLeft) - elapsedTime);
                    setTimeLeft(remainingTime);
                    setStartTime(parseInt(savedStartTime));
                } else {
                    // First time starting the contest
                    const initialTime = (contestQuery.data.duration || 60) * 60;
                    setTimeLeft(initialTime);
                    setStartTime(now);
                    localStorage.setItem(`contest_${contestId}_start_time`, now.toString());
                    localStorage.setItem(`contest_${contestId}_time_left`, initialTime.toString());
                }
            }
        }
    }, [contestQuery.data, contestId]);

    useEffect(() => {
        if (timeLeft > 0 && startTime) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTimeLeft = prev - 1;
                    localStorage.setItem(`contest_${contestId}_time_left`, newTimeLeft.toString());
                    return newTimeLeft;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && current === 1 && !isTimeUp) {
            setIsTimeUp(true);
            setIsTimeUpModalVisible(true);
        }
    }, [timeLeft, current, startTime, contestId, isTimeUp]);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        if (current === 2) {
            setCurrent(current - 1);
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleBuild = (
        questionId: string,
        code: string,
        input: string,
        language: string
    ) => {
        if (!code.trim()) {
            message.error("Source code cannot be empty");
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

    const handleSubmit = async () => {
        if (!user) return;
        try {
            // Clear saved time when submitting
            localStorage.removeItem(`contest_${contestId}_start_time`);
            localStorage.removeItem(`contest_${contestId}_time_left`);
            setTimeLeft(0);
            
            // Prepare answers for submission
            const answersArr = questions.map((question: Question) => {
                let answer = answers[question.id || 0] || '';
                if (question.questionType === 'coding') {
                    answer = editorCodes[question.id?.toString() || ''] || answer;
                }
                return {
                    questionId: question.id,
                    sourceCode: answer,
                    language: selectedLanguages[question.id?.toString() || ''] || question.language || 'javascript',
                };
            }).filter((answer: { questionId: number | undefined; sourceCode: string; language: string }) => answer.sourceCode.trim() !== ''); // Only include non-empty answers

            createSubmission(
                {
                    userId: user.id,
                    testId: contestId,
                    answers: answersArr,
                } as any,
                {
                    onSuccess: (data) => {
                        console.log('Submission response:', data);
                        setGradingResults(data);
                        setIsModalVisible(true);
                    },
                    onError: (error) => {
                        console.error('Submission error:', error);
                        message.error(`Submission failed: ${error.message}`);
                    },
                }
            );
        } catch (error) {
            message.error('Failed to submit answers');
        }
    };

    const handleModalOk = () => {
        setIsModalVisible(false);
        navigate('/contest');
    };

    // Add this function to handle question navigation
    const scrollToQuestion = (questionId: number) => {
        const element = document.getElementById(`question-${questionId}`);
        if (element) {
            const offset = 100; // Add some offset to account for the fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Add this effect to track answered questions
    useEffect(() => {
        const checkAnswers = () => {
            const answered = new Set<number>();
            if (contestQuery.data?.questions) {
                contestQuery.data.questions.forEach((question: Question) => {
                    if (question.id && answers[question.id]) {
                        answered.add(question.id);
                    }
                });
            }
            setAnsweredQuestions(answered);
        };

        // Check answers initially
        checkAnswers();

        // Set up an interval to check answers periodically
        const interval = setInterval(checkAnswers, 1000);

        return () => clearInterval(interval);
    }, [contestQuery.data?.questions, answers]);

    const handleTimeUpSubmit = () => {
        setIsTimeUpModalVisible(false);
        handleSubmit();
    };

    if (contestQuery.isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (timeLeft === -1) {
        return (
            <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
                <Alert
                    message="Contest is not available"
                    description="This contest is not currently open. Please check the start and end time."
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    if (contestQuery.error || !contestQuery.data) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    message="Error"
                    description="Error loading contest"
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    const contest = contestQuery.data;
    const questions = contest.questions || [];

    const items = steps.map((item) => ({ key: item.title, title: item.title }));

    const renderStepContent = () => {
        switch (current) {
            case 0:
                return (
                    <Card>
                        <Title level={2}>{contest.title}</Title>
                        <Paragraph>{contest.description}</Paragraph>
                        <Title level={4}>Instructions:</Title>
                        <Paragraph>
                            - This contest contains {questions.length} questions
                        </Paragraph>
                        <Paragraph>
                            - You have {Math.floor(timeLeft / 60)} minutes and {timeLeft % 60} seconds remaining
                        </Paragraph>
                        <Paragraph>
                            - Make sure to submit your answers before the time runs out
                        </Paragraph>
                        <Button
                            type="primary"
                            onClick={next}
                            disabled={timeLeft <= 0}
                            style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                        >
                            Start Contest
                        </Button>
                    </Card>
                );
            case 1:
                return (
                    <Form form={form} layout="vertical">
                        {questions.map((question: Question, index: number) => (
                            <Card 
                                key={question.id} 
                                id={`question-${question.id}`}
                                style={{ marginBottom: 16, scrollMarginTop: '100px' }}
                            >
                                <Title level={4}>Question {index + 1}</Title>
                                <Paragraph>{question.question}</Paragraph>
                                {question.questionType === 'multiple-choice' && question.choices && (
                                    <Form.Item name={`question_${question.id}`}>
                                        <Radio.Group
                                            onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                                            value={answers[question.id || 0]}
                                        >
                                            <Space direction="vertical">
                                                {question.choices.map((choice, idx) => (
                                                    <Radio key={idx} value={choice.choice}>
                                                        {choice.choice}
                                                    </Radio>
                                                ))}
                                            </Space>
                                        </Radio.Group>
                                    </Form.Item>
                                )}
                                {question.questionType === 'short-answer' && (
                                    <Form.Item name={`question_${question.id}`}>
                                        <TextArea
                                            rows={4}
                                            value={answers[question.id || 0]}
                                            onChange={(e) => handleAnswerChange(question.id || 0, e.target.value)}
                                            placeholder="Enter your answer here"
                                        />
                                    </Form.Item>
                                )}
                                {question.questionType === 'coding' && (
                                    <Form.Item name={`question_${question.id}`}>
                                        <div style={{ marginBottom: 8 }}>
                                            <Select
                                                defaultValue={question.language || 'javascript'}
                                                style={{ width: 120, marginBottom: 8 }}
                                                onChange={(value) =>
                                                    setSelectedLanguages((prev) => ({
                                                        ...prev,
                                                        [question.id?.toString() || '']: value,
                                                    }))
                                                }
                                            >
                                                <Select.Option value="java">Java</Select.Option>
                                                <Select.Option value="python">Python</Select.Option>
                                                <Select.Option value="c_cpp">C/C++</Select.Option>
                                            </Select>
                                        </div>
                                        <AceEditor
                                            mode={
                                                selectedLanguages[question.id?.toString() || ''] ||
                                                question.language ||
                                                'javascript'
                                            }
                                            theme="dracula"
                                            name={`editor-${question.id}`}
                                            width="100%"
                                            height="300px"
                                            defaultValue={question.templateCode || ''}
                                            setOptions={{
                                                useWorker: false,
                                                showLineNumbers: true,
                                                tabSize: 2,
                                            }}
                                            onChange={(value) => {
                                                setEditorCodes((prev) => ({
                                                    ...prev,
                                                    [question.id?.toString() || '']: value,
                                                }));
                                                handleAnswerChange(question.id || 0, value);
                                            }}
                                        />
                                        <Input.TextArea
                                            rows={2}
                                            placeholder="Enter custom input for testing..."
                                            id={`input-${question.id}`}
                                            onChange={() =>
                                                setBuildResults((prev) => ({
                                                    ...prev,
                                                    [question.id?.toString() || '']: '',
                                                }))
                                            }
                                        />
                                        <Tooltip title="Run your code with the provided input">
                                            <Button
                                                type="default"
                                                loading={isBuilding}
                                                onClick={() => {
                                                    const code =
                                                        editorCodes[question.id?.toString() || ''] ||
                                                        form.getFieldValue(`question_${question.id}`);
                                                    const input =
                                                        (
                                                            document.getElementById(
                                                                `input-${question.id}`
                                                            ) as HTMLTextAreaElement
                                                        )?.value || '';
                                                    handleBuild(
                                                        question.id?.toString() || '',
                                                        code,
                                                        input,
                                                        selectedLanguages[question.id?.toString() || ''] ||
                                                            question.language ||
                                                            'javascript'
                                                    );
                                                }}
                                                style={{ marginTop: 8 }}
                                            >
                                                Build & Run
                                            </Button>
                                        </Tooltip>
                                        {buildResults[question.id?.toString() || ''] && (
                                            <Paragraph style={{ marginTop: 8 }}>
                                                <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 6 }}>
                                                    {buildResults[question.id?.toString() || '']}
                                                </pre>
                                            </Paragraph>
                                        )}
                                    </Form.Item>
                                )}
                            </Card>
                        ))}
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                            {isTimeUp ? (
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                >
                                    Submit Now
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={next}
                                    disabled={Object.keys(answers).length !== questions.length}
                                    style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                                >
                                    Review Answers
                                </Button>
                            )}
                        </div>
                    </Form>
                );
            case 2:
                return (
                    <Card>
                        <Title level={3}>Review Your Answers</Title>
                        {questions.map((question: Question, index: number) => (
                            <Card key={question.id} style={{ marginBottom: 16 }}>
                                <Title level={5}>
                                    Question {index + 1}: {question.question}
                                </Title>
                                <Text type="secondary">
                                    Your answer: {answers[question.id || 0] || 'Not answered'}
                                </Text>
                            </Card>
                        ))}
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={prev}>Back to Questions</Button>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                            >
                                Submit Contest
                            </Button>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    // Parse gradingResults.results safely before return
    // let parsedResults: any[] = [];
    // if (gradingResults && gradingResults.results) {
    //     try {
    //         parsedResults = Array.isArray(gradingResults.results)
    //             ? gradingResults.results
    //             : JSON.parse(gradingResults.results);
    //     } catch {
    //         parsedResults = [];
    //     }
    // }

    return (
        <div style={{ padding: 24, background: '#fff', minHeight: '100vh', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1, maxWidth: 'calc(100% - 200px)' }}>
                    <Steps current={current} items={items} style={{ marginBottom: 24 }} />
                    <div>{renderStepContent()}</div>
                </div>

                {current === 1 && (
                    <Affix offsetTop={24}>
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
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </Paragraph>
                                </div>
                            </div>
                            <Menu
                                mode="vertical"
                                style={{ border: 'none' }}
                            >
                                {questions.map((question: Question, index: number) => (
                                    <Menu.Item 
                                        key={question.id}
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
                )}
            </div>

            {/* Modal for grading results */}
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
                            Total Score: {gradingResults.score || 0}
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

export default ContestPage;
