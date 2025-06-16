import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestQueries } from '../hooks/useContestQueries';
import { useBuildCode, useCreateSubmission, useCreateContestSubmission } from '../hooks/useSubmissionQueries';
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
import { contestService } from "@/apis/service/contestService";
import { toast } from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Map language string to number
const languageMap: { [key: string]: number } = {
    'python': 1,
    'java': 2,
    'cpp': 3
};

const steps = [
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
    const {  isPending: isSubmitting } = useCreateSubmission();
    const { mutate: buildCode, isPending: isBuilding } = useBuildCode();
    const { mutate: createContestSubmission } = useCreateContestSubmission();
    const contestQuery = getContestById(contestId);
    const [form] = Form.useForm();

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isTimeUpModalVisible, setIsTimeUpModalVisible] = useState(false);
    const [buildResults, setBuildResults] = useState<{ [key: string]: string }>({});
    const [gradingResults, ] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<{ [key: string]: string }>({});
    const [editorCodes, setEditorCodes] = useState<{ [key: string]: string }>({});
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [attempt, setAttempt] = useState<any>(null);
    const [, setIsLoadingAttempt] = useState(true);

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

    // Load attempt when component mounts
    useEffect(() => {
        const loadAttempt = async () => {
            try {
                const activeAttempt = await contestService.getActiveAttempt(contestId?.toString() || "");
                if (activeAttempt) {
                    setAttempt(activeAttempt);
                    // Update time left first
                    await contestService.updateTimeLeft(activeAttempt.id.toString(), activeAttempt.timeLeft);
                    setTimeLeft(activeAttempt.timeLeft);
                    setStartTime(new Date(activeAttempt.startTime).getTime());
                } else {
                    // Start new attempt if none exists
                    const newAttempt = await contestService.startAttempt(contestId?.toString() || "");
                    setAttempt(newAttempt);
                    setTimeLeft(newAttempt.timeLeft);
                    setStartTime(new Date(newAttempt.startTime).getTime());
                }
            } catch (error) {
                console.error("Error loading attempt:", error);
                toast.error("Failed to load contest attempt");
            } finally {
                setIsLoadingAttempt(false);
            }
        };

        if (contestId) {
            loadAttempt();
        }
    }, [contestId]);

    // Timer logic
    useEffect(() => {
        if (contestQuery.data?.duration && attempt && startTime) {
            const timer = setInterval(() => {
                const now = Date.now();
                const elapsedTime = Math.floor((now - startTime) / 1000);
                const secondsLeft = Math.max(0, (contestQuery.data.duration || 60) * 60 - elapsedTime);
                setTimeLeft(secondsLeft);

                if (secondsLeft <= 60 && secondsLeft > 59) {
                    toast.error("1 minute remaining!");
                }

                if (secondsLeft <= 0 && !isTimeUp) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    setIsTimeUpModalVisible(true);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [contestQuery.data?.duration, startTime, attempt, isTimeUp]);

    // Update time left periodically
    useEffect(() => {
        if (attempt && timeLeft !== null) {
            const updateTimeLeft = async () => {
                try {
                    await contestService.updateTimeLeft(attempt.id.toString(), timeLeft);
                } catch (error) {
                    console.error("Error updating time left:", error);
                }
            };

            const interval = setInterval(updateTimeLeft, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [attempt, timeLeft]);

    const handleSubmit = async () => {
        if (!attempt) {
            toast.error("No active attempt found");
            return;
        }

        try {
            // Submit the attempt first
            await contestService.submitAttempt(attempt.id.toString());
            
            // Collect all answers from both form and editor
            const submissionAnswers = contestQuery.data.questions.map((question: Question) => {
                const questionId = question.id?.toString() || '';
                let answer = '';
                let language = '';

                if (question.questionType === 'coding') {
                    answer = editorCodes[questionId] || '';
                    language = selectedLanguages[questionId] || question.language || 'python';
                } else {
                    answer = answers[question.id || 0] || '';
                }

                return {
                    questionId: question.id || 0,
                    sourceCode: answer,
                    language: language
                };
            }).filter((answer: { questionId: number; sourceCode: string; language: string }) => 
                answer.sourceCode && answer.sourceCode.trim() !== ''
            );

            console.log('Submitting answers:', submissionAnswers);

            if (submissionAnswers.length === 0) {
                toast.error("Please provide at least one answer before submitting");
                return;
            }

            // Create submission
            createContestSubmission(
                {
                    userId: user.id,
                    contestId: parseInt(contestId?.toString() || "0"),
                    testId: parseInt(contestId?.toString() || "0"),
                    problemId: submissionAnswers[0].questionId,
                    languageId: languageMap[submissionAnswers[0].language || 'python'] || 1,
                    sourceCode: submissionAnswers[0].sourceCode,
                    answers: submissionAnswers
                },
                {
                    onSuccess: () => {
                        toast.success("Contest submitted successfully. Results will be available soon.");
                        navigate(`/contest`);
                    },
                    onError: (error: any) => {
                        console.error("Submission error:", error);
                        toast.error(`Submission failed: ${error.message || "Unknown error"}`);
                    },
                }
            );
        } catch (error: any) {
            console.error("Error submitting attempt:", error);
            toast.error(`Failed to submit attempt: ${error.message || "Unknown error"}`);
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
                                                defaultValue={question.language || 'cpp'}
                                                style={{ width: 120, marginBottom: 8 }}
                                                onChange={(value) =>
                                                    setSelectedLanguages((prev) => ({
                                                        ...prev,
                                                        [question.id?.toString() || '']: value,
                                                    }))
                                                }
                                            >
                                                <Select.Option value="cpp">C++</Select.Option>
                                                <Select.Option value="java">Java</Select.Option>
                                                <Select.Option value="python">Python</Select.Option>
                                            </Select>
                                        </div>
                                        <AceEditor
                                            mode={
                                                selectedLanguages[question.id?.toString() || ''] ||
                                                question.language ||
                                                'cpp'
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
                                                            'cpp'
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
            case 1:
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

                {current === 0 && (
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
