import axiosClient from "@/apis/config/axiosClient.ts";

const homeService = {
  getStatistics: async (query: any = {}): Promise<any>=> {
    return await axiosClient.get('/api/statistics', {params: query});
  },

  getTopUsers: async (): Promise<{ id: number; totalScore: number; totalSolved: number; email: string }[]> => {
    const response = await axiosClient.get('/api/statistics/top-users');
    const topUsers = Array.isArray(response) ? response : response.data;
    return topUsers.map((user: any) => ({
      id: user.id,
      totalScore: user.totalScore,
      totalSolved: user.totalSolved,
      email: user.email,
    }));
  },

  getRecentContests: async (): Promise<{id: number,
    contestName: string,
    status: string,
    creator: string,
    description: string}[]> => {
    const response = await axiosClient.get('/api/statistics/recent-contests');
    const contests = Array.isArray(response) ? response : response.data;
    return contests.map((contest: any) => ({
      id: contest.id,
      contestName: contest.contestName,
      status: contest.status,
      creator: contest.creator,
      description: contest.description,
    }));
  },

  getRecentProblems: async (): Promise<{ 
    id: number; 
    problemName: string; 
    problemCode: string; 
    difficulty: string;
    cpuTimeLimit: number;
    memoryLimit: number;
    maxTimeCommit: number;
    tags: string; 
  }[]> => {
    const response = await axiosClient.get('/api/statistics/recent-problems');
    const problems = Array.isArray(response) ? response : response.data;
    
    return problems.map((problem: any) => ({
      id: problem.id,
      problemName: problem.problemName,
      problemCode: problem.problemCode,
      difficulty: problem.difficulty,
      cpuTimeLimit: problem.cpuTimeLimit,
      memoryLimit: problem.memoryLimit,
      maxTimeCommit: problem.maxTimeCommit,
      tags: problem.tags,
    }));
  }
};
export default homeService;
