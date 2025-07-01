import axiosClient from "@/apis/config/axiosClient";

const userLessonService = {
  markCompleted: async (userId: number, lessonId: number, completed: boolean) => {
    const response = await axiosClient.post("/api/user-lesson/mark", { userId, lessonId, completed });
    return response.data;
  },
  getCompletedLessons: async (userId: number) => {
    const response = await axiosClient.get(`/api/user-lesson/completed/${userId}`);
    return response.data;
  },
  isLessonCompleted: async (userId: number, lessonId: number) => {
    const response = await axiosClient.get(`/api/user-lesson/is-completed`, { params: { userId, lessonId } });
    return response.data.completed;
  }
};

export default userLessonService; 