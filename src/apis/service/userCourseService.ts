import axiosClient from "@/apis/config/axiosClient.ts";

const userCourseService = {
	getAll: async (id: number): Promise<any> => {
		// const response = await axiosClient.get("/api/user-course/me", {params: query});
		// console.log(response);
		return await axiosClient.get(`/api/courses/by-user/${id}`);
	},
}

export default userCourseService;