import axiosClient from "@/apis/config/axiosClient";
import { LoginResponse, RegisterResponse } from "@/apis/type";

const userService = {
	login: async (email: string, password: string): Promise<LoginResponse> => {
		return await axiosClient.post("/api/auth/login", { email, password });
	},
	register: async (email: string, password: string): Promise<RegisterResponse> => {
		//console.log( { email, password });
		return await axiosClient.post("/api/auth/register", { email, password });
	},
	resendVerificationEmail: async (email: string): Promise<any> => {
		return await axiosClient.post("/api/auth/resend-verification-email", { email });
	},
	forgotPassword: async (email: string): Promise<any> => {
		return await axiosClient.post("/api/auth/forgot-password", { email });
	},
	resetPassword: async (email: string, password: string, code: string): Promise<any> => {
		return await axiosClient.post("/api/auth/reset-password", { email, password, code });
	},
	changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
		return await axiosClient.post("/api/auth/change-password", { oldPassword, newPassword });
	},
	getUsers: async (params: any = {}): Promise<any> => {
		return await axiosClient.get("/api/auth/users", { params });
	},
	updateUserRole: async (userId: number, role: 'user' |'teacher'| 'admin'): Promise<any> => {
		return await axiosClient.put(`/api/auth/update-user/`, {
			userId,
			role: role,
		});
	}
};

export default userService;
