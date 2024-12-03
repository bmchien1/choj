import axiosClient from "@/apis/config/axiosClient.ts";

const submissionService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/submissions/me", { params: query });
	}
}

export default submissionService;