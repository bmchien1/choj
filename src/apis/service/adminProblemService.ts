import axiosClient from "@/apis/config/axiosClient.ts";

const userProblemService = {
    createProblem: async (data: any): Promise<any> => {
        return await axiosClient.post("/api/problem", data);
      },
}

export default userProblemService;