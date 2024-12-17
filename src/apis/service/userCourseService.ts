import axiosClient from "@/apis/config/axiosClient.ts";

const userCourseService = {
	getAll: async (query: any = {}): Promise<any> => {
		const response = await axiosClient.get("/api/user-course/me", {params: query});
		console.log(response);
		return await axiosClient.get("/api/user-course/me", {params: query});
	},
}

export default userCourseService;