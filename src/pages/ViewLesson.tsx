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
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";

const { Title, Paragraph, Text } = Typography;

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
  const [codeStates, setCodeStates] = useState<{ [key: number]: string }>({});

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

  const handleCodeChange = (index: number, value: string) => {
    setCodeStates((prev) => ({ ...prev, [index]: value }));
  };

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
              <ReactMarkdown>{section.content?.replace(/\\n/g, '\n') || ""}</ReactMarkdown>
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
              <ReactMarkdown>{section.instructions?.replace(/\\n/g, '\n') || ""}</ReactMarkdown>
              <SyntaxHighlighter language="javascript" style={dracula}>
                {section.code?.replace(/\\n/g, '\n') || ""}
              </SyntaxHighlighter>
              <div className="mt-4">
                <Text strong>Live Preview:</Text>
                <div className="mt-2">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>${section.code?.replace(/\\n/g, '\n')?.includes("<style>") ? "" : section.code?.replace(/\\n/g, '\n')}</style>
                        </head>
                        <body>${section.code?.replace(/\\n/g, '\n')?.includes("<body>") ? "" : section.code?.replace(/\\n/g, '\n')}</body>
                      </html>
                    `}
                    title="preview"
                    className="w-full h-64 border rounded"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </Card>
          );
        case "try_it":
          const code = codeStates[index] || section.code?.replace(/\\n/g, '\n') || "";
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <style>${code.includes("<style>") ? "" : code}</style>
              </head>
              <body>${code.includes("<body>") ? "" : code}</body>
            </html>
          `;
          return (
            <Card 
              key={index} 
              title={<span style={{ color: '#ff6a00' }}>{section.title}</span>} 
              className="mb-4"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <ReactMarkdown>{section.instructions?.replace(/\\n/g, '\n') || ""}</ReactMarkdown>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <CodeMirror
                    value={code}
                    options={{
                      mode: "htmlmixed",
                      theme: "dracula",
                      lineNumbers: true,
                    }}
                    onBeforeChange={(_editor, _data, value) => {
                      handleCodeChange(index, value);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <iframe
                    srcDoc={htmlContent}
                    title="preview"
                    className="w-full h-64 border rounded"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
              {section.expectedOutput && (
                <Paragraph className="mt-2">
                  Expected Output: {section.expectedOutput}
                </Paragraph>
              )}
            </Card>
          );
        default:
          return null;
      }
    });
  };

  if (isLoading) {
    return <Spin size="large" className="flex justify-center mt-20" />;
  }

  if (error || !lesson) {
    toast.error("Failed to load lesson");
    return <div className="text-center mt-20">Lesson not found</div>;
  }

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
