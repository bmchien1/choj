import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Typography, Button, Input, Space } from "antd";
import { useGetLessonById } from "@/hooks/useLessonQueries";
import { LessonType } from "@/apis/type";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Controlled as CodeMirror } from "react-codemirror2";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed";

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

const StudentViewLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading, error } = useGetLessonById(lessonId || "");
  const [codeStates, setCodeStates] = useState<{ [key: number]: string }>({});

  if (isLoading) {
    return <Spin size="large" className="flex justify-center mt-20" />;
  }

  if (error || !lesson) {
    toast.error("Failed to load lesson");
    return <div className="text-center mt-20">Lesson not found</div>;
  }

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
              <SyntaxHighlighter language="html" style={dracula}>
                {section.content || ""}
              </SyntaxHighlighter>
            </Card>
          );
        case "try_it":
          const code = codeStates[index] || section.code || "";
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
              <ReactMarkdown>{section.instructions || ""}</ReactMarkdown>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <CodeMirror
                    value={code}
                    options={{
                      mode: "htmlmixed",
                      theme: "dracula",
                      lineNumbers: true,
                    }}
                    onBeforeChange={(value) => {
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
                disabled
                style={{ borderColor: '#ff6a00' }}
              />
              <Button
                type="primary"
                onClick={() => toast.success("Submit solution coming soon!")}
                disabled
                style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
              >
                Submit
              </Button>
              {section.solution && (
                <div className="mt-4">
                  <Paragraph>Solution:</Paragraph>
                  <SyntaxHighlighter language="html" style={dracula}>
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

  const transformVideoUrl = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let videoId: string | null = null;

      if (parsedUrl.hostname.includes("youtube.com")) {
        videoId = parsedUrl.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.split("/")[1];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (parsedUrl.hostname.includes("vimeo.com")) {
        videoId = parsedUrl.pathname.split("/")[1];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }

      if (url.endsWith(".mp4") || url.endsWith(".webm")) {
        return url;
      }

      return null;
    } catch {
      return null;
    }
  };

  const renderVideo = (videoUrl: string) => {
    const transformedUrl = transformVideoUrl(videoUrl);

    if (!transformedUrl) {
      return (
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Paragraph>Invalid or unsupported video URL provided.</Paragraph>
        </Card>
      );
    }

    if (transformedUrl.endsWith(".mp4") || transformedUrl.endsWith(".webm")) {
      return (
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <video controls className="w-full rounded">
            <source
              src={transformedUrl}
              type={
                transformedUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"
              }
            />
            Your browser does not support the video tag.
          </video>
        </Card>
      );
    }

    return (
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={transformedUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded"
          />
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/my-courses/${lesson.course.id}`)}
          style={{ borderColor: '#ff6a00', color: '#ff6a00' }}
        >
          Back to Course
        </Button>
      </div>

      <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="flex justify-between items-center">
            <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>{lesson.title}</Title>
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

      {lesson.lessonType === LessonType.VIDEO && lesson.video_url ? (
        renderVideo(lesson.video_url)
      ) : lesson.lessonType === LessonType.JSON &&
        lesson.content &&
        lesson.content.sections ? (
        renderContent(lesson.content.sections)
      ) : (
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Paragraph>No content available for this lesson.</Paragraph>
        </Card>
      )}

      <Card bordered={false} style={{ marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => navigate(`/my-courses/${lesson.course.id}`)}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Mark as Complete
        </Button>
      </Card>
    </div>
  );
};

export default StudentViewLesson;
