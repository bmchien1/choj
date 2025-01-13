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
	
	create: async (data: any): Promise<any> => {
		return await axiosClient.post("/api/courses", data);
	},
	
	update: async (courseId: string, data: any): Promise<any> => {
		return await axiosClient.put(`/api/course/${courseId}`, data);
	},
	
	delete: async (courseId: number): Promise<any> => {
		return await axiosClient.delete(`/api/course/soft/${courseId}`);
	},
	
}

export default courseService;