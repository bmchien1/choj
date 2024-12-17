import axiosClient from "@/apis/config/axiosClient.ts";

const contestService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/contest/me", {params: query});
	},
	
	getOne: async (contestId: string): Promise<any> => {
		return await axiosClient.get(`/api/contest/${contestId}`);
	},
	
	getOneAdmin: async (contestId: string): Promise<any> => {
		return await axiosClient.get(`/api/contest/admin/${contestId}`);
	},
	
	getAllAdmin: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/contest/admin", {params: query});
	},
	
	create: async (data: any): Promise<any> => {
		return await axiosClient.post("/api/contest", data);
	},
	
	update: async (contestId: string, data: any): Promise<any> => {
		return await axiosClient.put(`/api/contest/${contestId}`, data);
	},
	
	delete: async (contestId: number): Promise<any> => {
		return await axiosClient.delete(`/api/contest/soft/${contestId}`);
	},
	
	
}



export default contestService;