import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Typography, Button, Modal, Form, Input, Space } from "antd";
import { useGetLessonById, useUpdateLesson } from "@/hooks/useLessonQueries";
import { Lesson } from "@/apis/type";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface LessonContentSection {
  type: "theory" | "example" | "try_it" | "exercise";
  title: string;
  content?: string;
  code?: string;
  defaultInput?: string;
  expectedOutput?: string;
  instructions?: string;
  solution?: string;
}

const ViewLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading, error } = useGetLessonById(lessonId || "");
  const updateLessonMutation = useUpdateLesson();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      const lessonData: Partial<Lesson> = {
        title: values.title,
        description: values.description,
        content: values.content ? JSON.parse(values.content) : undefined,
      };
      updateLessonMutation.mutate(
        { lessonId: lessonId!, data: lessonData },
        {
          onSuccess: () => {
            toast.success("Lesson updated successfully");
            setModalVisible(false);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to update lesson");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update lesson");
    }
  };

  if (isLoading) {
    return <Spin size="large" className="flex justify-center mt-20" />;
  }

  if (error || !lesson) {
    toast.error("Failed to load lesson");
    return <div className="text-center mt-20">Lesson not found</div>;
  }

  const renderContent = (content: LessonContentSection[]) => {
    return content.map((section, index) => {
      switch (section.type) {
        case "theory":
          return (
            <Card 
              key={index} 
              title={<span style={{ color: '#ff6a00' }}>{section.title}</span>} 
              className="mb-4"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <ReactMarkdown>{section.content || ""}</ReactMarkdown>
            </Card>
          );
        case "example":
          return (
            <Card 
              key={index} 
              title={<span style={{ color: '#ff6a00' }}>{section.title}</span>} 
              className="mb-4"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <SyntaxHighlighter language="javascript" style={dracula}>
                {section.content || ""}
              </SyntaxHighlighter>
            </Card>
          );
        case "try_it":
          return (
            <Card 
              key={index} 
              title={<span style={{ color: '#ff6a00' }}>{section.title}</span>} 
              className="mb-4"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <SyntaxHighlighter language="javascript" style={dracula}>
                {section.code || ""}
              </SyntaxHighlighter>
              <Paragraph>Input: {section.defaultInput}</Paragraph>
              <Paragraph>Expected Output: {section.expectedOutput}</Paragraph>
              <Button
                type="primary"
                onClick={() => toast.success("Try it functionality coming soon!")}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              >
                Run Code
              </Button>
            </Card>
          );
        case "exercise":
          return (
            <Card 
              key={index} 
              title={<span style={{ color: '#ff6a00' }}>{section.title}</span>} 
              className="mb-4"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <ReactMarkdown>{section.instructions || ""}</ReactMarkdown>
              <Input.TextArea
                rows={4}
                placeholder="Write your solution here..."
                className="mb-2"
                style={{ borderColor: '#ff6a00' }}
              />
              <Button
                type="primary"
                onClick={() => toast.success("Submit solution coming soon!")}
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              >
                Submit
              </Button>
              {section.solution && (
                <div className="mt-4">
                  <Paragraph>Solution:</Paragraph>
                  <SyntaxHighlighter language="javascript" style={dracula}>
                    {section.solution}
                  </SyntaxHighlighter>
                </div>
              )}
            </Card>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex justify-between items-center">
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/admin/courses/details/${lesson.course.id}`)}
                style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
              >
                Back to Course
              </Button>
              <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>{lesson.title}</Title>
            </Space>
          <Button
            type="primary"
              icon={<EditOutlined />}
            onClick={() => {
              setModalVisible(true);
              form.setFieldsValue({
                title: lesson.title,
                description: lesson.description,
                content: lesson.content
                  ? JSON.stringify(lesson.content, null, 2)
                  : "",
              });
            }}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
          >
            Edit
          </Button>
        </div>
          <Paragraph style={{ fontSize: '16px' }}>{lesson.description}</Paragraph>
        {lesson.file_url && (
            <Button 
              type="link" 
              href={lesson.file_url} 
              target="_blank"
              style={{ color: '#ff6a00' }}
            >
            Download Lesson File
          </Button>
        )}
        </Space>
      </Card>

      {lesson.content && lesson.content.sections ? (
        renderContent(lesson.content.sections)
      ) : (
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Paragraph>No content available for this lesson.</Paragraph>
        </Card>
      )}

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Edit Lesson</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleEdit}
        confirmLoading={updateLessonMutation.isPending}
        okButtonProps={{ style: { background: '#ff6a00', borderColor: '#ff6a00' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input style={{ borderColor: '#ff6a00' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea rows={4} style={{ borderColor: '#ff6a00' }} />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content (JSON)"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject("Invalid JSON format");
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              style={{ borderColor: '#ff6a00' }}
              placeholder='Example: {"sections": [{"type": "theory", "title": "Introduction", "content": "This is a lesson"}]}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewLesson;
