import axiosClient from "@/apis/config/axiosClient.ts";

const courseService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/course/me", {params: query});
	},
	
	getOne: async (courseId: string): Promise<any> => {
		return await axiosClient.get(`/api/course/${courseId}`);
	},
	
	getOneAdmin: async (courseId: string): Promise<any> => {
		return await axiosClient.get(`/api/course/admin/${courseId}`);
	},
	
	getAllAdmin: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/course/admin", {params: query});
	},
	
	create: async (data: any): Promise<any> => {
		return await axiosClient.post("/api/course", data);
	},
	
	update: async (courseId: string, data: any): Promise<any> => {
		return await axiosClient.put(`/api/course/${courseId}`, data);
	},
	
	delete: async (courseId: number): Promise<any> => {
		return await axiosClient.delete(`/api/course/soft/${courseId}`);
	},
	
}

export default courseService;