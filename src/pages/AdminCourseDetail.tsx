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
  Tag,
  Radio,
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
  useUpdateChapterOrder,
} from "@/hooks/useChapterQueries";
import { useGetQuestionsByCreator } from "@/hooks/useQuestionQueries";
import { useGetMatricesByUser } from "@/hooks/useMatrixQueries";
import { useGetAllTags } from "@/hooks/useTagQueries";
import {
  AssignmentCreate,
  Lesson,
  QuestionTable,
  LessonType,
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>();
  const [filters, setFilters] = useState<{
    difficulty_level?: string;
    questionType?: string;
    tags?: number[];
  }>({});

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
  const { data: paginatedQuestions, isLoading: isQuestionsLoading } = useGetQuestionsByCreator(creatorId, {
    page,
    limit,
    search: search,
    sortField,
    sortOrder,
    difficulty: filters.difficulty_level,
    type: filters.questionType,
    tags: filters.tags
  });
  const { data: matrices = { matrices: [], pagination: {} }, isLoading: isMatricesLoading } = useGetMatricesByUser(creatorId);
  const { data: tags = { tags: [], pagination: { total: 0 } } } = useGetAllTags();
  
  const createLessonMutation = useCreateLesson();
  const createAssignmentMutation = useCreateAssignment();
  const createAssignmentFromMatrixMutation = useCreateAssignmentFromMatrix();
  const checkMatrixAssignmentMutation = useCheckMatrixAssignment();
  const createChapterMutation = useCreateChapter();
  const deleteChapterMutation = useDeleteChapter();
  const updateLessonOrderMutation = useUpdateLessonOrder();
  const updateAssignmentOrderMutation = useUpdateAssignmentOrder();
  const updateChapterOrderMutation = useUpdateChapterOrder();

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
          if (result.isValid) {
            toast.success("Matrix is valid and ready to use");
          } else {
            toast.error(result.message || "Matrix is not valid");
          }
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to check matrix");
          setIsMatrixValid(false);
        },
      }
    );
  };

  const calculateNextOrder = (chapterId: number | null) => {
    console.log("Calculating next order for chapterId:", chapterId);
    console.log("Current chapters:", chapters);
    
    if (chapterId) {
      const chapter = chapters.find(c => c.id === chapterId);
      console.log("Found chapter:", chapter);
      if (chapter) {
        const lessonOrders = (chapter.lessons || []).map(l => l.order || 0);
        const assignmentOrders = (chapter.assignments || []).map(a => a.order || 0);
        console.log("Lesson orders:", lessonOrders);
        console.log("Assignment orders:", assignmentOrders);
        const maxOrder = Math.max(...lessonOrders, ...assignmentOrders, 0);
        console.log("Max order:", maxOrder);
        return maxOrder + 1;
      }
    }
    console.log("Using courseContent length:", courseContent.length);
    return courseContent.length + 1;
  };

  const handleAddOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      const type = form.getFieldValue("type");
      console.log("Form values:", values);
      console.log("Selected chapter ID:", selectedChapterId);

      if (type === "chapter") {
        const chapterData: Chapter = {
          title: values.title,
          description: values.description,
          order: chapters.length + 1,
          courseId: parseInt(id),
        };
        console.log("Creating chapter with data:", chapterData);
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
        const nextOrder = calculateNextOrder(selectedChapterId);
        console.log("Calculated next order for lesson:", nextOrder);
        
        const lessonData: Lesson = {
          title: values.title,
          description: values.description,
          lessonType: values.lessonType,
          content: values.lessonType === LessonType.JSON ? { sections } : null,
          video_url: values.lessonType === LessonType.VIDEO ? values.video_url : undefined,
          courseId: parseInt(id),
          order: nextOrder,
          chapterId: selectedChapterId || undefined,
        };
        console.log("Creating lesson with data:", lessonData);
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
          const nextOrder = calculateNextOrder(selectedChapterId);
          console.log("Calculated next order for matrix assignment:", nextOrder);
          
          const matrixData: Omit<AssignmentCreate, "questionIds" | "question_scores" | "total_points"> = {
            title: values.title,
            description: values.description,
            duration: values.duration ? parseInt(values.duration) : undefined,
            courseId: parseInt(id),
            order: nextOrder,
            chapterId: selectedChapterId || undefined,
          };
          console.log("Creating matrix assignment with data:", matrixData);
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

          const nextOrder = calculateNextOrder(selectedChapterId);
          console.log("Calculated next order for manual assignment:", nextOrder);
          
          const assignmentData: AssignmentCreate = {
            title: values.title,
            description: values.description,
            duration: values.duration ? parseInt(values.duration) : undefined,
            courseId: parseInt(id),
            order: nextOrder,
            questionIds: selectedQuestions.map((q) => q.id),
            question_scores,
            total_points,
            chapterId: selectedChapterId || undefined,
          };
          console.log("Creating manual assignment with data:", assignmentData);
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

  const handleMoveChapter = async (chapter: Chapter, direction: 'up' | 'down') => {
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
    const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedChapters.length) return;

    // Swap orders
    const tempOrder = sortedChapters[currentIndex].order;
    sortedChapters[currentIndex].order = sortedChapters[newIndex].order;
    sortedChapters[newIndex].order = tempOrder;

    try {
      await Promise.all([
        updateChapterOrderMutation.mutateAsync({
          chapterId: sortedChapters[currentIndex].id!.toString(),
          order: sortedChapters[currentIndex].order,
        }),
        updateChapterOrderMutation.mutateAsync({
          chapterId: sortedChapters[newIndex].id!.toString(),
          order: sortedChapters[newIndex].order,
        })
      ]);
      queryClient.invalidateQueries({ queryKey: ["chapters", id] });
      toast.success("Chapter order updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update chapter order");
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


  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    setSortField(sorter.field);
    setSortOrder(sorter.order);
    setFilters({
      difficulty_level: filters.difficulty_level?.[0],
      questionType: filters.questionType?.[0],
      tags: filters.tags,
    });
  };

  const allQuestionsColumns = [
    {
      title: "Question Name",
      dataIndex: "questionName",
      key: "questionName",
      render: (text: string) => <Text>{text}</Text>,
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      render: (text: string) => <Text>{text}</Text>,
      filters: [
        { text: "Multiple Choice", value: "multiple_choice" },
        { text: "True/False", value: "true_false" },
        { text: "Short Answer", value: "short_answer" },
        { text: "Long Answer", value: "long_answer" },
      ],
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      render: (text: string) => <Text>{text}</Text>,
      filters: [
        { text: "Easy", value: "easy" },
        { text: "Medium", value: "medium" },
        { text: "Hard", value: "hard" },
      ],
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: any[]) => (
        <Space size={[0, 8]} wrap>
          {tags.map((tag) => (
            <Tag key={tag.id} color="blue">
              {tag.name}
            </Tag>
          ))}
        </Space>
      ),
      filters: paginatedQuestions?.questions
        ?.flatMap((q: QuestionTable) => q.tags)
        .filter((tag: any, index: number, self: any[]) => 
          index === self.findIndex((t) => t.id === tag.id)
        )
        .map((tag: any) => ({
          text: tag.name,
          value: tag.id,
        })) || [],
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: QuestionTable) => (
        <Button
          type="primary"
          onClick={() => handleAddQuestion(record)}
          disabled={!!selectedQuestions.find((q) => q.id === record.id)}
          style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
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

  const renderChapterHeader = (chapter: Chapter) => (
    <div className="flex items-center justify-between">
      <span style={{ fontWeight: 600, fontSize: 18, color: '#ff6a00' }}>
        <BookOutlined style={{ color: "#ff6a00", marginRight: 8 }} />
        {chapter.title}
      </span>
      <Space>
        <Tooltip title="Move Up">
          <Button
            type="text"
            icon={<ArrowUpOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveChapter(chapter, 'up');
            }}
            className="transition-all duration-200 hover:bg-orange-50"
          />
        </Tooltip>
        <Tooltip title="Move Down">
          <Button
            type="text"
            icon={<ArrowDownOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveChapter(chapter, 'down');
            }}
            className="transition-all duration-200 hover:bg-orange-50"
          />
        </Tooltip>
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
  );

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
          {chapters.sort((a, b) => a.order - b.order).map((chapter) => (
            <Panel
              key={chapter.id!}
              header={renderChapterHeader(chapter)}
            >
              {renderChapterContent(chapter)}
            </Panel>
          ))}
        </Collapse>
      )}

      <Modal
        title={<span style={{ color: '#ff6a00' }}>Create Assignment</span>}
        open={modalVisible && modalType === "assignment"}
        onCancel={() => {
          setModalVisible(false);
          setModalType(null);
          form.resetFields();
          setSelectedQuestions([]);
          setQuestionPoints({});
          setUseMatrix(false);
          setSelectedMatrixId(null);
          setIsMatrixValid(false);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdate}
          initialValues={{ type: "assignment" }}
        >
          <Form.Item
            name="title"
            label="Assignment Title"
            rules={[{ required: true, message: "Please enter the assignment title" }]}
          >
            <Input placeholder="Enter assignment title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter the description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter assignment description" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[
              { 
                type: 'number',
                transform: (value) => Number(value),
                min: 1,
                message: 'Duration must be at least 1 minute'
              }
            ]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="creationType"
            label="Creation Method"
            rules={[{ required: true, message: "Please select creation method" }]}
          >
            <Radio.Group onChange={(e) => {
              setUseMatrix(e.target.value === 'matrix');
              setIsMatrixValid(false);
              setSelectedMatrixId(null);
            }}>
              <Radio value="manual">Manual Question Selection</Radio>
              <Radio value="matrix">Use Matrix</Radio>
            </Radio.Group>
          </Form.Item>

          {useMatrix ? (
            <div>
              <Form.Item
                name="matrixId"
                label="Select Matrix"
                rules={[{ required: true, message: "Please select a matrix" }]}
              >
                <Select
                  placeholder="Select a matrix"
                  onChange={(value) => {
                    setSelectedMatrixId(value);
                    setIsMatrixValid(false);
                  }}
                  loading={isMatricesLoading}
                >
                  {matrices.matrices.map((matrix) => (
                    <Option key={matrix.id} value={matrix.id?.toString()}>
                      {matrix.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  onClick={checkMatrix}
                  loading={checkMatrixAssignmentMutation.isPending}
                  style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
                >
                  Test Matrix
                </Button>
                {isMatrixValid && (
                  <Tag color="success">Matrix is valid</Tag>
                )}
              </Space>
            </div>
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
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <Input.Search
                  placeholder="Search questions..."
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                  className="custom-search"
                />
                <Select
                  placeholder="Question Type"
                  allowClear
                  style={{ width: 200 }}
                  onChange={(value) => setFilters(prev => ({ ...prev, questionType: value }))}
                  value={filters.questionType}
                  className="custom-select"
                >
                  <Option value="multiple-choice">Multiple Choice</Option>
                  <Option value="short-answer">Short Answer</Option>
                  <Option value="coding">Coding</Option>
                </Select>
                <Select
                  placeholder="Difficulty Level"
                  allowClear
                  style={{ width: 200 }}
                  onChange={(value) => setFilters(prev => ({ ...prev, difficulty_level: value }))}
                  value={filters.difficulty_level}
                  className="custom-select"
                >
                  <Option value="Easy">Easy</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Hard">Hard</Option>
                </Select>
                <Select
                  placeholder="Tags"
                  allowClear
                  mode="multiple"
                  style={{ width: 300 }}
                  onChange={(value) => setFilters(prev => ({ ...prev, tags: value }))}
                  value={filters.tags}
                  className="custom-select"
                >
                  {tags.tags.map(tag => (
                    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                  ))}
                </Select>
                <Button 
                  onClick={() => {
                    setSearch("");
                    setFilters({});
                    setSortField(undefined);
                    setSortOrder(undefined);
                  }}
                  style={{ 
                    borderColor: '#ff6a00',
                    color: '#ff6a00'
                  }}
                >
                  Reset Filters
                </Button>
              </div>
              <Table
                dataSource={paginatedQuestions?.questions || []}
                columns={allQuestionsColumns}
                rowKey="id"
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: paginatedQuestions?.pagination?.total || 0,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`,
                }}
                loading={isQuestionsLoading}
                onChange={handleTableChange}
                scroll={{ y: 400 }}
              />
            </>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={createAssignmentMutation.isPending || createAssignmentFromMatrixMutation.isPending}
              disabled={useMatrix && (!selectedMatrixId || !isMatrixValid)}
              style={{ background: '#ff6a00', borderColor: '#ff6a00' }}
            >
              Create Assignment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCourseDetail;