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

type CourseItem = Lesson | Assignment;

const UserCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<CourseItem | null>(null);
  const [form] = Form.useForm();

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

  const lessonColumns = [
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
  ];
  const assignmentColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Assignment) => (
        <span
          className="cursor-pointer text-blue-500 hover:underline"
          onClick={() => navigate(`/my-courses/${id}/assignment/${record.id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];
  return (
    <div className="w-full">
      <h2>Lessons</h2>
      <Table
        dataSource={lessons}
        columns={lessonColumns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <h2>Assignments</h2>
      <Table
        dataSource={assignments}
        columns={assignmentColumns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default UserCourseDetail;
