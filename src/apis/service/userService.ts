import axiosClient from "@/apis/config/axiosClient";
import { LoginResponse, RegisterResponse, ForgotPasswordResponse } from "@/apis/type";

const userService = {
	login: async (email: string, password: string): Promise<LoginResponse> => {
		return await axiosClient.post("/api/auth/login", { email, password });
	},
	register: async (email: string, password: string): Promise<RegisterResponse> => {
		return await axiosClient.post("/api/auth/register", { email, password });
	},
	forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
		return await axiosClient.post("/api/auth/forgot-password", { email });
	}
};

export default userService;
