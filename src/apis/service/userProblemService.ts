import axiosClient from "@/apis/config/axiosClient.ts";

const userProblemService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/user-problem/me", { params: query });
	},
	getByProblemId: async (problemId: string): Promise<any> => {
		return await axiosClient.get(`/api/user-problem/me/${problemId}`);
	}
}

export default userProblemService;