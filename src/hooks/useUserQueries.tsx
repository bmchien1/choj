import { useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "@/apis/service/userService";
import useMutationAction from "../providers/queryGlobal";
import {
  AppRole,
  LoginResponse,
  User,
  UserRole,
  LoginCredentials,
} from "@/apis/type";
import toast from "react-hot-toast";

export const useGetAllUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const users = await userService.getAllUsers();
      return users.map((user) => ({
        ...user,
        role: user.role as AppRole,
      }));
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutationAction<User, LoginCredentials>(
    ["users"],
    userService.register,
    {
      onSuccess: (newUser) => {
        queryClient.setQueryData<User[]>(["users"], (oldData) => {
          return oldData ? [...oldData, newUser] : [newUser];
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: () => {
        toast.error("Failed to create application");
      },
    }
  );
};

export const useLogin = () => {
  return useMutationAction<LoginResponse, LoginCredentials>(
    ["users"],
    userService.login
  );
};

export const useEditUsers = () => {
  const queryClient = useQueryClient();
  return useMutationAction<User, UserRole>(
    ["users"],
    userService.updateUserRole,
    {
      onSuccess: (updatedUser) => {
        queryClient.setQueryData<User[]>(["users"], (oldData) => {
          return oldData
            ? oldData.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
              )
            : [updatedUser];
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User role updated successfully");
      },
      onError: () => {
        toast.error("Failed to update user role");
      },
    }
  );
};
