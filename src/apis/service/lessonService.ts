import axiosClient from "@/apis/config/axiosClient.ts";
import { Lesson, LessonView } from "../type";

const lessonService = {
	getByCourse: async (courseId: string): Promise<Lesson[]> => {
		const response = await axiosClient.get(`/api/lessons/${courseId}`);
		return response.data;
	},

	getById: async (lessonId: string): Promise<LessonView> => {
		const response = await axiosClient.get(`/api/lessons/single/${lessonId}`);
		return response.data;
	},

	create: async (courseId: string, data: Lesson): Promise<Lesson> => {
		const lessons = await lessonService.getByCourse(courseId);
		const maxOrder = lessons.length ? Math.max(...lessons.map((l) => l.order)) : 0;
		const lessonData = { ...data, order: maxOrder + 1 };
		const response = await axiosClient.post(`/api/lessons/${courseId}`, lessonData);
		return response.data;
	},

	update: async (lessonId: string, data: Partial<Lesson>): Promise<Lesson> => {
		const response = await axiosClient.put(`/api/lessons/${lessonId}`, data);
		return response.data;
	},

	delete: async (lessonId: string): Promise<{ message: string }> => {
		const response = await axiosClient.delete(`/api/lessons/${lessonId}`);
		return response.data;
	},

	updateOrder: async (lessonId: string, order: number, chapterId?: number): Promise<Lesson> => {
		const response = await axiosClient.put(`/api/lessons/${lessonId}`, { order, chapterId });
		return response.data;
	},
};

export default lessonService;