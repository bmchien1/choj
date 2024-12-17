import axiosClient from "@/apis/config/axiosClient.ts";

const tagService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/problem-tag", {params: query});
	},
	
	getOne: async (tagId: string): Promise<any> => {
		return await axiosClient.get(`/api/problem-tag/${tagId}`);
	},
	
	create: async (data: any): Promise<any> => {
		return await axiosClient.post("/api/problem-tag", data);
	},
	
	update: async (tagId: string, data: any): Promise<any> => {
		return await axiosClient.put(`/api/problem-tag/${tagId}`, data);
	},
	
	delete: async (tagId: number): Promise<any> => {
		return await axiosClient.delete(`/api/problem-tag/soft/${tagId}`);
	},
}

export default tagService;