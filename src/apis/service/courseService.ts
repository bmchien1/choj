import axiosClient from "@/apis/config/axiosClient.ts";

const courseService = {

  getAll: async (query: any = {}): Promise<any> => {
	// console.log(await axiosClient.get("/api/courses", {params: query}));
	return await axiosClient.get("/api/courses", {params: query});
},

getOne: async (courseId: string): Promise<any> => {
	return await axiosClient.get(`/api/course/${courseId}`);
},

getOneAdmin: async (courseId: string): Promise<any> => {
	return await axiosClient.get(`/api/course/admin/${courseId}`);
},

getAllAdmin: async (query: any = {}): Promise<any> => {
			// console.log(await axiosClient.get("/api/courses", {params: query}));
	return await axiosClient.get("/api/courses", {params: query});
},


  getByUser: async (userId: any) => {
    return await axiosClient.get(`/api/courses/by-user/${userId}`);
  },

  getByCreator: async (creatorId: any) => {
    return await axiosClient.get(`/api/courses/by-creator/${creatorId}`);
  },

  create: async (data: any) => {
    return await axiosClient.post("/api/courses", data);
  },

  update: async (courseId: any, data: any) => {
    return await axiosClient.put(`/api/courses/${courseId}`, data);
  },

  delete: async (courseId: any) => {
    return await axiosClient.delete(`/api/courses/${courseId}`);
  },

  getLessons: async (courseId: any) => {
    return await axiosClient.get(`/api/courses/${courseId}/lessons`);
  },

  getLessonById: async (lessonId: any) => {
    return await axiosClient.get(`/api/courses/lessons/${lessonId}`);
  },

  createLesson: async (courseId: any, data: any) => {
	console.log(data);
    return await axiosClient.post(`/api/courses/${courseId}/lessons`, data);
  },

  updateLesson: async (lessonId: any, data: any) => {
    return await axiosClient.put(`/api/courses/lessons/${lessonId}`, data);
  },

  deleteLesson: async (lessonId: any) => {
    return await axiosClient.delete(`/api/courses/lessons/${lessonId}`);
  },

  getAssignments: async (courseId: any) => {
    return await axiosClient.get(`/api/courses/${courseId}/assignments`);
  },

  getAssignmentById: async (assignmentId: any) => {
    return await axiosClient.get(`/api/courses/assignments/${assignmentId}`);
  },

  createAssignment: async (courseId: any, data: any) => {
    return await axiosClient.post(`/api/courses/${courseId}/assignments`, data);
  },

  updateAssignment: async (assignmentId: any, data: any) => {
    return await axiosClient.put(`/api/courses/assignments/${assignmentId}`, data);
  },

  deleteAssignment: async (assignmentId: any) => {
    return await axiosClient.delete(`/api/courses/assignments/${assignmentId}`);
  },

  uploadFile: async (fileData: FormData) => {
	return await axiosClient.post("/upload", fileData);
  }
  
};

export default courseService;