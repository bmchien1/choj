import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Spin,
  Typography,
  Space,
  Radio,
  Card,
  Select,
} from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import assignmentService from "@/apis/service/assignmentService";

const { Text } = Typography;

const DoAssignmentPage = () => {
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();

  if (!assignmentId) {
    console.error("Assignment ID is missing");
    return null;
  }

  // Fetch assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: ["assignmentDetails", assignmentId],
    queryFn: async () => {
      return await assignmentService.getAssignmentById(assignmentId);
    },
  });

  // Submit assignment mutation
  const { mutate: submitAssignment } = useMutation({
    mutationFn: async (payload: any) => {
      return await assignmentService.submitAssignment(payload);
    },
    onSuccess: () => {
      toast.success("Assignment submitted successfully!");
      navigate(`/my-courses/${id}`);
    },
    onError: () => {
      toast.error("Failed to submit the assignment. Please try again.");
    },
  });

  // Handle form submission
  const onFinish = (values: any) => {
    const payload = {
      userId: JSON.parse(localStorage.getItem("userInfo") || "{}").id,
      assignmentId: Number(assignmentId),
      answers: Object.keys(values).map((questionId) => ({
        questionId: Number(questionId),
        answer: values[questionId] || 0, // Default to 0 (false) if no answer is provided
      })),
    };
    submitAssignment(payload);
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  const renderQuestion = (question: any) => {
    switch (question.questionType) {
      case "coding":
        return (
          <Card key={question.id} bordered={false} style={{ marginBottom: 20 }}>
            <Typography.Title
              level={4}
            >{`Câu ${question.id}: ${question.questionName}`}</Typography.Title>
            <Form.Item
              name={`${question.id}`}
              rules={[
                { required: true, message: "Please provide a solution." },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Write your code here..."
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          </Card>
        );
      case "multiple-choice":
        console.log(question.details.choices[0].choice);

        return (
          <Card key={question.id} bordered={false} style={{ marginBottom: 20 }}>
            <Typography.Title
              level={4}
            >{`Câu ${question.id}: ${question.questionName}`}</Typography.Title>
            <Form.Item
              name={`${question.id}`}
              rules={[{ required: true, message: "Please select an answer." }]}
            >
              <Radio.Group>
                {question.details?.choices?.map(
                  (choiceObj: { choice: string }, index: number) => (
                    <Radio
                      key={index}
                      value={choiceObj.choice}
                      style={{ display: "block", marginBottom: 10 }}
                    >
                      {choiceObj.choice} {/* Render the 'choice' string */}
                    </Radio>
                  )
                )}
              </Radio.Group>
            </Form.Item>
          </Card>
        );

      case "short-answer":
        return (
          <Card key={question.id} bordered={false} style={{ marginBottom: 20 }}>
            <Typography.Title
              level={4}
            >{`Câu ${question.id}: ${question.questionName}`}</Typography.Title>
            <Form.Item
              name={`${question.id}`}
              rules={[{ required: true, message: "Please provide an answer." }]}
            >
              <Input placeholder="Write your answer here..." />
            </Form.Item>
          </Card>
        );

      case "true-false":
        return (
          <Card key={question.id} bordered={false} style={{ marginBottom: 20 }}>
            <Typography.Title
              level={4}
            >{`Câu ${question.id}: ${question.questionName}`}</Typography.Title>
            {question.details?.choice?.map((index: number, choice: string) => (
              <Form.Item
                key={index}
                name={`${question.id}-${index}`} // Unique name for each choice
                initialValue="0" // Set default value to 'false' (0)
                rules={[
                  {
                    required: true,
                    message: `Please select True or False for "${choice}"`,
                  },
                ]}
              >
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography.Text>{choice}</Typography.Text>
                  <Select
                    style={{ width: 120 }}
                    defaultValue="0" // Set default value to 'false' (0)
                    options={[
                      { label: "True", value: "1" }, // '1' for True
                      { label: "False", value: "0" }, // '0' for False
                    ]}
                  />
                </Space>
              </Form.Item>
            ))}
          </Card>
        );

      default:
        return (
          <Text type="danger">
            Unknown question type: {question.questionType}
          </Text>
        );
    }
  };

  return (
    <div className="w-full p-6">
      <Typography.Title level={2}>{assignment?.title}</Typography.Title>
      <Text type="secondary">{assignment?.description}</Text>

      <Form layout="vertical" onFinish={onFinish} className="mt-6">
        {assignment?.questions?.map((question: any) =>
          renderQuestion(question)
        )}

        <Space style={{ marginTop: 20 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={() => navigate(`/my-courses/${id}`)}>Cancel</Button>
        </Space>
      </Form>
    </div>
  );
};

export default DoAssignmentPage;
