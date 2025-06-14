import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Card,
  List,
  Typography,
  Table,
  Select,
  Space,
  Collapse,
  Tooltip,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetCourseContent,
  useGetCourseById,
} from "@/hooks/useCourseQueries";
import { useCreateLesson, useUpdateLessonOrder } from "@/hooks/useLessonQueries";
import {
  useCreateAssignment,
  useCheckMatrixAssignment,
  useCreateAssignmentFromMatrix,
  useUpdateAssignmentOrder,
} from "@/hooks/useAssignmentQueries";
import {
  useGetChaptersByCourse,
  useCreateChapter,
  useDeleteChapter,
} from "@/hooks/useChapterQueries";
import { useGetQuestionsByCreator } from "@/hooks/useQuestionQueries";
import { useGetMatricesByUser } from "@/hooks/useMatrixQueries";
import {
  AssignmentCreate,
  Lesson,
  QuestionTable,
  LessonType,
  Matrix,
  Chapter,
} from "@/apis/type";
import {  PlusOutlined, DeleteOutlined, BookOutlined, FileDoneOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";

const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface ContentItem {
  type: string;
  id: number;
  title: string;
  order: number;
}

interface LessonSection {
  type: "theory" | "example" | "try_it" | "exercise";
  title: string;
  content?: string;
  code?: string;
  defaultInput?: string;
  expectedOutput?: string;
  instructions?: string;
  solution?: string;
}

const AdminCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"lesson" | "assignment" | "chapter" | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedQuestions, setSelectedQuestions] = useState<Array<QuestionTable & { points?: number }>>([]);
  const [, setQuestionPoints] = useState<{ [key: number]: number }>({});
  const [useMatrix, setUseMatrix] = useState(false);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(null);
  const [isMatrixValid, setIsMatrixValid] = useState(false);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const creatorId = user.id;

  if (!id) {
    toast.error("Course ID is missing");
    navigate("/");
    return null;
  }

  if (!creatorId) {
    toast.error("User ID is missing");
    navigate("/");
    return null;
  }

  const { data: course, isLoading: isCourseLoading } = useGetCourseById(id);
  const { data: chapters = [], isLoading: isChaptersLoading } = useGetChaptersByCourse(id);
  const { data: courseContent = [], isLoading: isContentLoading } = useGetCourseContent(id);
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useGetQuestionsByCreator(creatorId);
  const { data: matrices = [], isLoading: isMatricesLoading } = useGetMatricesByUser(creatorId);
  
  const createLessonMutation = useCreateLesson();
  const createAssignmentMutation = useCreateAssignment();
  const createAssignmentFromMatrixMutation = useCreateAssignmentFromMatrix();
  const checkMatrixAssignmentMutation = useCheckMatrixAssignment();
  const createChapterMutation = useCreateChapter();
  const deleteChapterMutation = useDeleteChapter();
  const updateLessonOrderMutation = useUpdateLessonOrder();
  const updateAssignmentOrderMutation = useUpdateAssignmentOrder();

  useEffect(() => {
    console.log("courseContent:", courseContent);
    console.log("matrices:", matrices);
  }, [courseContent, matrices]);

  const handleAddQuestion = (question: QuestionTable) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, { ...question, points: 0 }]);
      setQuestionPoints((prev) => ({ ...prev, [question.id]: 0 }));
    }
  };

  const handleRemoveQuestion = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
    setQuestionPoints((prev) => {
      const newPoints = { ...prev };
      delete newPoints[questionId];
      return newPoints;
    });
  };

  const handlePointsChange = (questionId: number, points: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, points: points >= 0 ? points : 0 } : q
      )
    );
    setQuestionPoints((prev) => ({
      ...prev,
      [questionId]: points >= 0 ? points : 0,
    }));
  };

  const handleAddSection = () => {
    setSections([...sections, { type: "theory", title: "" }]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (
    index: number,
    field: keyof LessonSection,
    value: any
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const checkMatrix = () => {
    if (!id || !selectedMatrixId) {
      toast.error("Please select a matrix");
      return;
    }
    checkMatrixAssignmentMutation.mutate(
      {
        courseId: id,
        matrixId: selectedMatrixId,
        userId: creatorId.toString(),
      },
      {
        onSuccess: (result) => {
          setIsMatrixValid(result.isValid);
          console.log("Matrix check result:", result);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to check matrix");
          console.error("Matrix check error:", error);
        },
      }
    );
  };

  const handleAddOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      const type = form.getFieldValue("type");

      if (type === "chapter") {
        const chapterData: Chapter = {
          title: values.title,
          description: values.description,
          order: chapters.length + 1,
          courseId: parseInt(id),
        };
        createChapterMutation.mutate(
          { courseId: id, data: chapterData },
          {
            onSuccess: () => {
              toast.success("Chapter added successfully");
              setModalVisible(false);
              form.resetFields();
              queryClient.invalidateQueries({ queryKey: ["chapters", id] });
            },
            onError: (error: any) => {
              toast.error(error.message || "Failed to save chapter");
            },
          }
        );
      } else if (type === "lesson") {
        const lessonData: Lesson = {
          title: values.title,
          description: values.description,
          lessonType: values.lessonType,
          content: values.lessonType === LessonType.JSON ? { sections } : null,
          video_url: values.lessonType === LessonType.VIDEO ? values.video_url : undefined,
          courseId: parseInt(id),
          order: selectedChapterId ? 
            (chapters.find(c => c.id === selectedChapterId)?.lessons?.length || 0) + 1 : 
            courseContent.length + 1,
          chapterId: selectedChapterId || undefined,
        };
        createLessonMutation.mutate(
          { courseId: id, data: lessonData },
          {
            onSuccess: () => {
              toast.success("Lesson added successfully");
              setModalVisible(false);
              setSections([]);
              form.resetFields();
              queryClient.invalidateQueries({ queryKey: ["courseContent", id] });
              queryClient.invalidateQueries({ queryKey: ["chapters", id] });
            },
            onError: (error: any) => {
              toast.error(error.message || "Failed to save lesson");
            },
          }
        );
      } else if (type === "assignment") {
        if (useMatrix) {
          if (!selectedMatrixId || !isMatrixValid) {
            toast.error("Please select and verify a valid matrix");
            return;
          }
          const matrixData: Omit<AssignmentCreate, "questionIds" | "question_scores" | "total_points"> = {
            title: values.title,
            description: values.description,
            duration: values.duration ? parseInt(values.duration) : undefined,
            courseId: parseInt(id),
            order: selectedChapterId ? 
              (chapters.find(c => c.id === selectedChapterId)?.assignments?.length || 0) + 1 : 
              courseContent.length + 1,
            chapterId: selectedChapterId || undefined,
          };
          createAssignmentFromMatrixMutation.mutate(
            {
              courseId: id,
              matrixId: selectedMatrixId,
              userId: creatorId.toString(),
              data: matrixData,
            },
            {
              onSuccess: () => {
                toast.success("Assignment added successfully");
                setModalVisible(false);
                setSelectedMatrixId(null);
                setIsMatrixValid(false);
                setUseMatrix(false);
                form.resetFields();
                queryClient.invalidateQueries({ queryKey: ["courseContent", id] });
                queryClient.invalidateQueries({ queryKey: ["chapters", id] });
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to save assignment");
                console.error("Matrix assignment creation error:", error);
              },
            }
          );
        } else {
          if (selectedQuestions.length === 0) {
            toast.error("At least one question must be selected");
            return;
          }
          if (selectedQuestions.some((q) => q.points === undefined || q.points <= 0)) {
            toast.error("All questions must have positive points");
            return;
          }
          const question_scores = selectedQuestions.reduce(
            (acc, q) => ({ ...acc, [q.id]: q.points! }),
            {} as { [key: number]: number }
          );
          const total_points = Object.values(question_scores).reduce(
            (sum, points) => sum + points,
            0
          );

          const assignmentData: AssignmentCreate = {
            title: values.title,
            description: values.description,
            duration: values.duration ? parseInt(values.duration) : undefined,
            courseId: parseInt(id),
            order: selectedChapterId ? 
              (chapters.find(c => c.id === selectedChapterId)?.assignments?.length || 0) + 1 : 
              courseContent.length + 1,
            questionIds: selectedQuestions.map((q) => q.id),
            question_scores,
            total_points,
            chapterId: selectedChapterId || undefined,
          };
          createAssignmentMutation.mutate(
            { courseId: id, data: assignmentData },
            {
              onSuccess: () => {
                toast.success("Assignment added successfully");
                setModalVisible(false);
                setSelectedQuestions([]);
                setQuestionPoints({});
                form.resetFields();
                queryClient.invalidateQueries({ queryKey: ["courseContent", id] });
                queryClient.invalidateQueries({ queryKey: ["chapters", id] });
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to save assignment");
              },
            }
          );
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
      console.error("Form submission error:", error);
    }
  };

  const handleMoveItem = async (item: ContentItem, direction: 'up' | 'down', chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const items = [
      ...(chapter.lessons || []).map(lesson => ({ ...lesson, type: "lesson", id: lesson.id! })),
      ...(chapter.assignments || []).map(assignment => ({ ...assignment, type: "assignment", id: assignment.id! }))
    ].sort((a, b) => a.order - b.order);

    const currentIndex = items.findIndex(i => i.id === item.id && i.type === item.type);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap orders
    const tempOrder = items[currentIndex].order;
    items[currentIndex].order = items[newIndex].order;
    items[newIndex].order = tempOrder;

    try {
      await Promise.all([
        item.type === "lesson"
          ? updateLessonOrderMutation.mutateAsync({
              lessonId: item.id.toString(),
              order: items[currentIndex].order,
              chapterId,
            })
          : updateAssignmentOrderMutation.mutateAsync({
              assignmentId: item.id.toString(),
              order: items[currentIndex].order,
              chapterId,
            }),
        items[newIndex].type === "lesson"
          ? updateLessonOrderMutation.mutateAsync({
              lessonId: items[newIndex].id.toString(),
              order: items[newIndex].order,
              chapterId,
            })
          : updateAssignmentOrderMutation.mutateAsync({
              assignmentId: items[newIndex].id.toString(),
              order: items[newIndex].order,
              chapterId,
            })
      ]);
      queryClient.invalidateQueries({ queryKey: ["chapters", id] });
      toast.success("Order updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const renderItem = useCallback(
    (item: ContentItem, index: number, chapterId: number) => (
      <div
        className="mb-2 w-full transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
        style={{
          background: item.type === "lesson" ? "#e6f7ff" : "#fff7e6",
          borderRadius: 8,
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Card
          size="small"
          style={{ background: "transparent", border: "none", margin: 0 }}
          styles={{ body: { padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" } }}
        >
          <div className="flex items-center min-w-0 pl-2 flex-1">
            {item.type === "lesson" ? (
              <BookOutlined style={{ color: "#1890ff", marginRight: 8 }} className="transition-all duration-200" />
            ) : (
              <FileDoneOutlined style={{ color: "#fa8c16", marginRight: 8 }} className="transition-all duration-200" />
            )}
            <Text strong style={{ marginRight: 8 }} className="transition-all duration-200">
              {item.type === "lesson" ? "Lesson" : "Assignment"}:
            </Text>
            <span
              className={`transition-all duration-200 text-ellipsis whitespace-nowrap overflow-hidden ${
                item.type === "lesson"
                  ? "cursor-pointer hover:text-blue-500 ml-2"
                  : "ml-2"
              }`}
              onClick={() => {
                if (item.type === "lesson") {
                  navigate(`/lessons/${item.id}`);
                }
              }}
              style={{ fontWeight: 500, maxWidth: 180, display: "inline-block" }}
            >
              {item.title}
            </span>
            <Text type="secondary" style={{ marginLeft: 16 }} className="transition-all duration-200">
              Order: {item.order}
            </Text>
          </div>
          <div className="flex items-center gap-1 ml-auto pr-2">
            <Button
              type="text"
              icon={<ArrowUpOutlined />}
              onClick={() => handleMoveItem(item, 'up', chapterId)}
              disabled={index === 0}
              className="transition-all duration-200 hover:bg-blue-50"
            />
            <Button
              type="text"
              icon={<ArrowDownOutlined />}
              onClick={() => handleMoveItem(item, 'down', chapterId)}
              disabled={index === -1}
              className="transition-all duration-200 hover:bg-blue-50"
            />
          </div>
        </Card>
      </div>
    ),
    [navigate, chapters]
  );

  const selectedQuestionsColumns = [
    {
      title: "Question Name",
      dataIndex: "questionName",
      key: "questionName",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Points",
      key: "points",
      render: (_: any, record: QuestionTable & { points?: number }) => (
        <Input
          type="number"
          min={0}
          value={record.points}
          onChange={(e) =>
            handlePointsChange(record.id, parseInt(e.target.value) || 0)
          }
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: QuestionTable) => (
        <Button danger onClick={() => handleRemoveQuestion(record.id)}>
          Remove
        </Button>
      ),
    },
  ];

  const allQuestionsColumns = [
    {
      title: "Question Name",
      dataIndex: "questionName",
      key: "questionName",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: QuestionTable) => (
        <Button
          type="primary"
          onClick={() => handleAddQuestion(record)}
          disabled={!!selectedQuestions.find((q) => q.id === record.id)}
        >
          Add
        </Button>
      ),
    },
  ];

  const renderChapterContent = (chapter: Chapter) => {
    if (!chapter.id) return null;

    const chapterContent = [
      ...(chapter.lessons || []).map(lesson => ({ 
        type: "lesson", 
        id: lesson.id!, 
        title: lesson.title, 
        order: lesson.order 
      })),
      ...(chapter.assignments || []).map(assignment => ({ 
        type: "assignment", 
        id: assignment.id!, 
        title: assignment.title, 
        order: assignment.order 
      }))
    ].sort((a, b) => a.order - b.order);

    return (
      <div>
        {chapterContent.map((item, index) => renderItem(item, index, chapter.id!))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      {isCourseLoading ? (
        <Spin />
      ) : (
        <Card className="mb-4">
          <Title level={2} style={{ margin: 0, color: '#ff6a00' }}>{course?.name}</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Class: {course?.class}</Text>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Description: {course?.description}</Text>
        </Card>
      )}

      <div className="mb-4 flex items-center gap-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalVisible(true);
            setModalType("chapter");
            form.resetFields();
            form.setFieldsValue({ type: "chapter" });
          }}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
        >
          Add Chapter
        </Button>
      </div>

      {isChaptersLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : chapters.length === 0 ? (
        <Card className="mb-4">
          <Title level={3} style={{ margin: 0, color: '#ff6a00' }}>Course Content</Title>
          {isContentLoading ? (
            <Spin />
          ) : courseContent.length === 0 ? (
            <Text type="secondary">No content available.</Text>
          ) : (
            <List
              dataSource={courseContent}
              renderItem={(item, index) => renderItem(item, index, 0)}
            />
          )}
        </Card>
      ) : (
        <Collapse bordered={false} style={{ background: "#f9f9f9" }}>
          {chapters.map((chapter) => (
            <Panel
              key={chapter.id!}
              header={
                <div className="flex items-center justify-between">
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#ff6a00' }}>
                    <BookOutlined style={{ color: "#ff6a00", marginRight: 8 }} />
                    {chapter.title}
                  </span>
                  <Space>
                    <Tooltip title="Add Lesson">
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChapterId(chapter.id!);
                          setModalVisible(true);
                          setModalType("lesson");
                          setSections([]);
                          form.resetFields();
                          form.setFieldsValue({
                            type: "lesson",
                            lessonType: LessonType.JSON,
                          });
                        }}
                        className="transition-all duration-200 hover:bg-orange-50"
                      />
                    </Tooltip>
                    <Tooltip title="Add Assignment">
                      <Button
                        type="text"
                        icon={<FileDoneOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChapterId(chapter.id!);
                          setModalVisible(true);
                          setModalType("assignment");
                          form.resetFields();
                          form.setFieldsValue({ type: "assignment" });
                          setSelectedQuestions([]);
                          setQuestionPoints({});
                          setUseMatrix(false);
                          setSelectedMatrixId(null);
                          setIsMatrixValid(false);
                        }}
                        className="transition-all duration-200 hover:bg-orange-50"
                      />
                    </Tooltip>
                    <Tooltip title="Delete Chapter">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: "Delete Chapter",
                            content: "Are you sure you want to delete this chapter?",
                            onOk: () => {
                              deleteChapterMutation.mutate(chapter.id!.toString(), {
                                onSuccess: () => {
                                  queryClient.invalidateQueries({ queryKey: ["chapters", id] });
                                },
                              });
                            },
                          });
                        }}
                        className="transition-all duration-200 hover:bg-red-50"
                      />
                    </Tooltip>
                  </Space>
                </div>
              }
            >
              {renderChapterContent(chapter)}
            </Panel>
          ))}
        </Collapse>
      )}

      <Modal
        title={
          <span style={{ color: '#ff6a00' }}>
            {modalType === "lesson"
              ? "Add Lesson"
              : modalType === "assignment"
              ? "Add Assignment"
              : "Add Chapter"}
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setModalType(null);
          setSelectedQuestions([]);
          setQuestionPoints({});
          setUseMatrix(false);
          setSelectedMatrixId(null);
          setIsMatrixValid(false);
          setSections([]);
          setSelectedChapterId(null);
        }}
        onOk={handleAddOrUpdate}
        confirmLoading={
          createLessonMutation.isPending ||
          createAssignmentMutation.isPending ||
          createAssignmentFromMatrixMutation.isPending ||
          createChapterMutation.isPending
        }
        width={800}
        okButtonProps={{
          disabled: useMatrix && (!selectedMatrixId || !isMatrixValid),
          style: { background: '#ff6a00', borderColor: '#ff6a00' }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          {modalType === "lesson" && (
            <>
              <Form.Item
                name="lessonType"
                label="Lesson Type"
                rules={[{ required: true, message: "Lesson type is required" }]}
              >
                <Select>
                  <Option value={LessonType.JSON}>JSON Content</Option>
                  <Option value={LessonType.VIDEO}>Video</Option>
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.lessonType !== currentValues.lessonType
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("lessonType") === LessonType.JSON ? (
                    <>
                      <Button type="dashed" onClick={handleAddSection} block>
                        Add Section
                      </Button>
                      {sections.map((section, index) => (
                        <Card
                          key={index}
                          className="mt-4"
                          title={`Section ${index + 1}`}
                        >
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Form.Item
                              label="Section Type"
                              required
                              rules={[
                                {
                                  required: true,
                                  message: "Section type is required",
                                },
                              ]}
                            >
                              <Select
                                value={section.type}
                                onChange={(value) =>
                                  handleSectionChange(index, "type", value)
                                }
                              >
                                <Option value="theory">Theory</Option>
                                <Option value="example">Example</Option>
                                <Option value="try_it">Try It</Option>
                                <Option value="exercise">Exercise</Option>
                              </Select>
                            </Form.Item>
                            <Form.Item
                              label="Section Title"
                              required
                              rules={[
                                {
                                  required: true,
                                  message: "Section title is required",
                                },
                              ]}
                            >
                              <Input
                                value={section.title}
                                onChange={(e) =>
                                  handleSectionChange(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                            {section.type === "theory" && (
                              <Form.Item label="Content (Markdown)">
                                <Input.TextArea
                                  rows={4}
                                  value={section.content}
                                  onChange={(e) =>
                                    handleSectionChange(
                                      index,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter markdown content"
                                />
                              </Form.Item>
                            )}
                            {section.type === "example" && (
                              <Form.Item label="Code (HTML/CSS)">
                                <Input.TextArea
                                  rows={4}
                                  value={section.content}
                                  onChange={(e) =>
                                    handleSectionChange(
                                      index,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter HTML/CSS code"
                                />
                              </Form.Item>
                            )}
                            {section.type === "try_it" && (
                              <>
                                <Form.Item label="Code (HTML/CSS)">
                                  <Input.TextArea
                                    rows={4}
                                    value={section.code}
                                    onChange={(e) =>
                                      handleSectionChange(
                                        index,
                                        "code",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter default HTML/CSS code"
                                  />
                                </Form.Item>
                                <Form.Item label="Instructions (Markdown)">
                                  <Input.TextArea
                                    rows={4}
                                    value={section.instructions}
                                    onChange={(e) =>
                                      handleSectionChange(
                                        index,
                                        "instructions",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter instructions for the student"
                                  />
                                </Form.Item>
                                <Form.Item label="Expected Output (Description)">
                                  <Input.TextArea
                                    rows={2}
                                    value={section.expectedOutput}
                                    onChange={(e) =>
                                      handleSectionChange(
                                        index,
                                        "expectedOutput",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Describe the expected output"
                                  />
                                </Form.Item>
                              </>
                            )}
                            {section.type === "exercise" && (
                              <>
                                <Form.Item label="Instructions (Markdown)">
                                  <Input.TextArea
                                    rows={4}
                                    value={section.instructions}
                                    onChange={(e) =>
                                      handleSectionChange(
                                        index,
                                        "instructions",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter instructions for the exercise"
                                  />
                                </Form.Item>
                                <Form.Item label="Solution (HTML/CSS)">
                                  <Input.TextArea
                                    rows={4}
                                    value={section.solution}
                                    onChange={(e) =>
                                      handleSectionChange(
                                        index,
                                        "solution",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter the solution code"
                                  />
                                </Form.Item>
                              </>
                            )}
                            <Button
                              danger
                              onClick={() => handleRemoveSection(index)}
                            >
                              Remove Section
                            </Button>
                          </Space>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Form.Item
                      name="video_url"
                      label="Video URL"
                      rules={[
                        { required: true, message: "Video URL is required" },
                        { type: "url", message: "Please enter a valid URL" },
                      ]}
                    >
                      <Input placeholder="https://www.youtube.com/watch?v=example" />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </>
          )}
          {modalType === "assignment" && (
            <>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  { required: true, message: "Duration is required" },
                  {
                    type: "number",
                    min: 1,
                    message: "Duration must be a positive number",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Creation Method">
                <Select
                  value={useMatrix ? "matrix" : "manual"}
                  onChange={(value) => {
                    setUseMatrix(value === "matrix");
                    setSelectedQuestions([]);
                    setQuestionPoints({});
                    setSelectedMatrixId(null);
                    setIsMatrixValid(false);
                  }}
                >
                  <Option value="manual">Manual</Option>
                  <Option value="matrix">Matrix</Option>
                </Select>
              </Form.Item>
              {useMatrix ? (
                <>
                  <Form.Item label="Select Matrix">
                    <Select
                      placeholder="Select a matrix"
                      onChange={(value) => {
                        setSelectedMatrixId(value);
                        setIsMatrixValid(false);
                      }}
                      loading={isMatricesLoading}
                    >
                      {matrices.map((matrix: Matrix) => (
                        <Option key={matrix.id} value={matrix.id!.toString()}>
                          {matrix.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="default"
                      onClick={checkMatrix}
                      loading={checkMatrixAssignmentMutation.isPending}
                    >
                      Check Matrix
                    </Button>
                  </Form.Item>
                  {checkMatrixAssignmentMutation.isSuccess && (
                    <div>
                      {isMatrixValid ? (
                        <span className="text-green-500">Matrix is valid</span>
                      ) : (
                        <span className="text-red-500">
                          {checkMatrixAssignmentMutation.data?.message}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3>Selected Questions</h3>
                  <Table
                    dataSource={selectedQuestions}
                    columns={selectedQuestionsColumns}
                    rowKey="id"
                    pagination={false}
                    loading={isQuestionsLoading}
                  />
                  <h3>Your Questions</h3>
                  <Table
                    dataSource={allQuestions}
                    columns={allQuestionsColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={isQuestionsLoading}
                  />
                </>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCourseDetail;
