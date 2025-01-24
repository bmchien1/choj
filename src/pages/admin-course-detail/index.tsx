import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Spin,
  Select,
  Upload,
} from "antd";
import { HiPencilAlt } from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import courseService from "@/apis/service/courseService.ts";
import { useQuery } from "@tanstack/react-query";
import { RcFile } from "antd/es/upload/interface";

// Types for lessons, assignments, and matrix configuration
interface Lesson {
  id: number;
  title: string;
  description: string;
  file_url?: string;
  type: "lesson";
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: "assignment";
  total_points: number; // Added total_points field
}

interface MatrixCriteria {
  grade: string;
  subject: string;
  questionType: string;
  difficulty_level: string;
  number_of_questions: number;
  percent_points: number;
}

type CourseItem = Lesson | Assignment;

const AdminCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<CourseItem | null>(null);
  const [form] = Form.useForm();
  const [matrix, setMatrix] = useState<MatrixCriteria[]>([]); // State to hold matrix configuration
  const [total_points, setTotalPoints] = useState<number>(0); // State to manage total points for assignments

  const { data: lessonsData = { contents: [] } } = useQuery({
    queryKey: ["allLessons"],
    queryFn: async () => {
      return await courseService.getLessons(id);
    },
  });

  const { data: assignmentsData = { contents: [] } } = useQuery({
    queryKey: ["allAssignments"],
    queryFn: async () => {
      return await courseService.getAssignments(id);
    },
  });

  const lessons = Array.isArray(lessonsData) ? lessonsData : [];
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];

  const handleAddOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Check if lesson or assignment is being submitted
      if (form.getFieldValue("type") === "lesson") {
        // if (values.file) {
        //   const formData = new FormData();
        //   formData.append("file", values.file);

        //   // Upload file to your server
        //   console.log(formData);
        //   // const response = await courseService.uploadFile(formData);
        //   // fileUrl = response.data.url; // Assuming server returns the URL
        // }
        console.log(values);
        const lessonData = {
          ...values,
        };

        if (currentItem) {
          await courseService.updateLesson(currentItem.id, lessonData);
          toast.success("Lesson updated successfully");
        } else {
          await courseService.createLesson(id, lessonData);
          toast.success("Lesson added successfully");
        }
      } else if (form.getFieldValue("type") === "assignment") {
        const assignmentData = {
          ...values,
          matrix,
          total_points,
        };

        if (currentItem) {
          await courseService.updateAssignment(currentItem.id, assignmentData);
          toast.success("Assignment updated successfully");
        } else {
          await courseService.createAssignment(id, assignmentData);
          toast.success("Assignment added successfully");
        }
      }

      // Reset state and close modal
      setModalVisible(false);
      setCurrentItem(null);
      form.resetFields();
      setMatrix([]);
      setTotalPoints(0);
    } catch (error) {
      toast.error("Operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: CourseItem) => {
    try {
      setLoading(true);
      if (item.type === "lesson") {
        await courseService.deleteLesson(item.id);
        toast.success("Lesson deleted successfully");
      } else if (item.type === "assignment") {
        await courseService.deleteAssignment(item.id);
        toast.success("Assignment deleted successfully");
      }
    } catch (error) {
      toast.error("Delete operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatrixChange = (value: MatrixCriteria[]) => {
    setMatrix(value); // Update matrix configuration
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: CourseItem) => (
        <div className="flex items-center space-x-2">
          <HiPencilAlt
            size={20}
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setCurrentItem(record);
              form.setFieldsValue(record);
              setModalVisible(true);
              if (record.type === "assignment") {
                setTotalPoints(record.total_points); // Set total points if it's an assignment
              }
            }}
          />
          <Popconfirm
            title={`Are you sure to delete this ${record.type}?`}
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <BiTrash size={20} className="cursor-pointer hover:text-red-500" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Button
        type="primary"
        onClick={() => {
          setModalVisible(true);
          setCurrentItem(null);
          form.resetFields();
          form.setFieldsValue({ type: "lesson" }); // Ensure the type is set correctly
        }}
        style={{ marginRight: 8 }} // Added margin-top for spacing above matrix fields
      >
        Add Lesson
      </Button>

      <Button
        type="primary"
        onClick={() => {
          setModalVisible(true);
          setCurrentItem(null);
          form.resetFields();
          form.setFieldsValue({ type: "assignment" }); // Ensure the type is set correctly
        }}
      >
        Add Assignment
      </Button>

      <h2>Lessons</h2>
      <Table
        dataSource={lessons}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <h2>Assignments</h2>
      <Table
        dataSource={assignments}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={currentItem ? `Edit` : "Add"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddOrUpdate}
      >
        <Form form={form} layout="vertical">
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

          {/* File Upload for Lesson Only */}
          {form.getFieldValue("type") === "lesson" && (
            <Form.Item
              // name="file"
              label="File Upload"
              valuePropName="file"
              getValueFromEvent={(e) => (Array.isArray(e) ? e[0] : e?.file)}
            >
              <Upload
                // name="file"
                showUploadList={true}
                beforeUpload={() => false} // Prevent auto upload
                accept="application/pdf"
              >
                <Button>Upload PDF File</Button>
              </Upload>
            </Form.Item>
          )}

          {/* Matrix Configuration for Assignment Only */}
          {form.getFieldValue("type") === "assignment" && (
            <>
              <Form.Item
                label="Total Points"
                name="total_points"
                rules={[
                  { required: true, message: "Total points are required" },
                ]}
              >
                <Input
                  type="number"
                  value={total_points}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  placeholder="Total Points"
                />
              </Form.Item>
              <Form.Item
                label="Question Matrix Configuration"
                rules={[{ required: true, message: "Matrix is required" }]}
                style={{ marginTop: 16 }} // Added margin-top for spacing above matrix fields
              >
                <MatrixConfigurator
                  value={matrix}
                  onChange={handleMatrixChange}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

// Matrix Configuration Component
const MatrixConfigurator = ({
  value,
  onChange,
}: {
  value: MatrixCriteria[];
  onChange: (value: MatrixCriteria[]) => void;
}) => {
  const handleAdd = () => {
    const newMatrix = [
      ...value,
      {
        grade: "",
        subject: "",
        questionType: "",
        difficulty_level: "",
        number_of_questions: 1,
        percent_points: 100,
      },
    ];
    onChange(newMatrix);
  };

  const handleRemove = (index: number) => {
    const newMatrix = value.filter((_, i) => i !== index);
    onChange(newMatrix);
  };

  const handleChange = (
    index: number,
    key: keyof MatrixCriteria,
    val: string | number
  ) => {
    const newMatrix = [...value];
    newMatrix[index] = { ...newMatrix[index], [key]: val };
    onChange(newMatrix);
  };

  return (
    <div>
      {value.map((item, index) => (
        <div key={index} className="matrix-row" style={{ marginBottom: 16 }}>
          {/* Grade Input */}
          <Input
            value={item.grade}
            onChange={(e) => handleChange(index, "grade", e.target.value)}
            placeholder="Grade"
            style={{ marginTop: 8 }}
          />

          {/* Subject Input */}
          <Input
            value={item.subject}
            onChange={(e) => handleChange(index, "subject", e.target.value)}
            placeholder="Subject"
            style={{ marginTop: 8 }}
          />

          {/* Question Type Input */}
          <Input
            value={item.questionType}
            onChange={(e) =>
              handleChange(index, "questionType", e.target.value)
            }
            placeholder="Question Type"
            style={{ marginTop: 8 }}
          />

          {/* Difficulty Level Input */}
          <Input
            value={item.difficulty_level}
            onChange={(e) =>
              handleChange(index, "difficulty_level", e.target.value)
            }
            placeholder="Difficulty Level"
            style={{ marginTop: 8 }}
          />

          {/* Number of Questions Input */}
          <Input
            value={item.number_of_questions}
            onChange={(e) =>
              handleChange(index, "number_of_questions", +e.target.value)
            }
            placeholder="Number of Questions"
            type="number"
            style={{ marginTop: 8 }}
          />

          {/* Percentage of Total Points Input */}
          <Input
            value={item.percent_points}
            onChange={(e) =>
              handleChange(index, "percent_points", +e.target.value)
            }
            max={100}
            placeholder="Percentage of Points"
            type="number"
            style={{ marginTop: 8 }}
          />

          <Button
            type="link"
            onClick={() => handleRemove(index)}
            danger
            style={{ marginTop: 8 }}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button type="dashed" onClick={handleAdd} block style={{ marginTop: 16 }}>
        Add Matrix Item
      </Button>
    </div>
  );
};

export default AdminCourseDetail;
