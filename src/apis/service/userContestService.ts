import axiosClient from "@/apis/config/axiosClient.ts";

const userContestService = {
	getAll: async (query: any = {}): Promise<any> => {
		const response = await axiosClient.get("/api/user-contest/me", {params: query});
		console.log(response);
		return await axiosClient.get("/api/user-contest/me", {params: query});
	},
}

export default userContestService;