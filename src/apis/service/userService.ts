import axiosClient from "@/apis/config/axiosClient";
import { LoginResponse, User, UserRole, LoginCredentials, ChangePasswordRequest, ChangePasswordResponse } from "@/apis/type";

const userService = {
  login: async (data: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post("/api/auth/login", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (data: LoginCredentials): Promise<User> => {
    const response = await axiosClient.post("/api/auth/register", data);
    return response.data;
  },
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await axiosClient.post("/api/auth/refresh-token", { refreshToken });
    return response.data;
  },
  logout: async (): Promise<{ message: string }> => {
    const response = await axiosClient.post("/api/auth/logout", {});
    return response.data;
  },
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get("/api/auth/users");
    return response.data;
  },
  updateUserRole: async (data: UserRole): Promise<User> => {
    const response = await axiosClient.put("/api/auth/update-user", {
      userId: data.id,
      role: data.role,
    });
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await axiosClient.get("/api/auth/me");
    return response.data;
  },
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await axiosClient.post("/api/auth/change-password", data);
    return response.data;
  },
};

export default userService;