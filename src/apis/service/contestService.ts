import { CreateContestData, UpdateContestData } from "../type";
import axiosClient from "../config/axiosClient";


export const contestService = {
    // Create new contest
    createContest: async (data: CreateContestData) => {
        const response = await axiosClient.post(`/api/contests`, data);
        return response.data;
    },

    // Get all public contests
    getPublicContests: async () => {
        const response = await axiosClient.get(`/api/contests/public`);
        return response.data;
    },

    // Get contest by ID
    getContestById: async (id: number) => {
        const response = await axiosClient.get(`/api/contests/${id}`);
        return response.data;
    },

    // Get contest by access URL
    getContestByUrl: async (url: string) => {
        const response = await axiosClient.get(`/api/contests/access/${url}`);
        return response.data;
    },

    // Get contests by teacher
    getContestsByTeacher: async (teacherId: number) => {
        const response = await axiosClient.get(`/api/contests/teacher/${teacherId}`);
        return response.data;
    },

    // Update contest
    updateContest: async (id: number, data: UpdateContestData) => {
        const response = await axiosClient.put(`/api/contests/${id}`, data);
        return response.data;
    },

    // Delete contest
    deleteContest: async (id: number, userId: number) => {
        const response = await axiosClient.delete(`/api/contests/${id}`, {
            data: { userId }
        });
        return response.data;
    },

    // Add question to contest
    addQuestionToContest: async (contestId: number, questionId: number, userId: number) => {
        const response = await axiosClient.post(
            `/api/contests/${contestId}/questions/${questionId}`,
            { userId }
        );
        return response.data;
    },

    // Remove question from contest
    removeQuestionFromContest: async (contestId: number, questionId: number, userId: number) => {
        const response = await axiosClient.delete(
            `/api/contests/${contestId}/questions/${questionId}`,
            { data: { userId } }
        );
        return response.data;
    },

    // Submit contest answers
    submitContestAnswers: async (contestId: number, answers: { [key: number]: string }, userId: number) => {
        const response = await axiosClient.post(
            `/api/contests/${contestId}/submit`,
            { answers, userId }
        );
        return response.data;
    },

    // Add questions by matrix
    addQuestionsByMatrix: async (contestId: number, matrixId: number, userId: number) => {
        const response = await axiosClient.post(
            `/api/contests/${contestId}/add-questions-by-matrix`,
            { matrixId, userId }
        );
        return response.data;
    },

    // New methods for contest attempts
    startAttempt: async (contestId: string): Promise<any> => {
        const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const response = await axiosClient.post(`/api/contests/${contestId}/start`, { userId: user.id });
        return response.data;
    },

    updateAttemptActive: async (attemptId: string): Promise<any> => {
        const response = await axiosClient.put(`/api/contests/attempt/${attemptId}/active`);
        return response.data;
    },

    submitAttempt: async (attemptId: string): Promise<any> => {
        const response = await axiosClient.put(`/api/contests/attempt/${attemptId}/submit`);
        return response.data;
    },

    getActiveAttempt: async (contestId: string): Promise<any> => {
        const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const response = await axiosClient.get(`/api/contests/${contestId}/attempt`, { params: { userId: user.id } });
        return response.data;
    },

    updateTimeLeft: async (attemptId: string, timeLeft: number): Promise<any> => {
        const response = await axiosClient.put(`/api/contests/attempt/${attemptId}/time`, { timeLeft });
        return response.data;
    },

    saveTemporaryAnswers: async (attemptId: string, answers: any): Promise<any> => {
        const response = await axiosClient.put(`/api/contests/attempt/${attemptId}/answers`, { answers });
        return response.data;
    },

    getTemporaryAnswers: async (attemptId: string): Promise<any> => {
        const response = await axiosClient.get(`/api/contests/attempt/${attemptId}/answers`);
        return response.data;
    },

    getAttemptsByUserAndContest: async (userId: number, contestId: number) => {
        const response = await axiosClient.get(`/api/contests/${contestId}/attempts`, {
            params: { userId }
        });
        return response.data;
    },
}; 