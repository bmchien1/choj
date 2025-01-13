import axiosClient from "@/apis/config/axiosClient.ts";

const mockSubmissions = Array.from({ length: 50 }, (_, i) => {
	const statusOptions = ["passed", "failed", "pending"];
	return {
	  submissionHash: `sub_${Math.random().toString(36).substring(2, 8)}`,
	  submissionDate: new Date().toISOString(),
	  status: statusOptions[i % 3],
	  message: `Test case ${i + 1} completed.`,
	  error: i % 5 === 0 ? "Timeout error" : "",
	  point: Math.floor(Math.random() * 100),
	  testCasePassed: i % 3 + 1,
	  testCases: Array(5).fill(0), // 5 test cases total
	  languageId: (i % 3) + 1,
	  user: {
		email: `user${i + 1}@example.com`,
	  },
	};
  });
const submissionService = {
	getAll: async (query: any = {}): Promise<any> => {
		return await axiosClient.get("/api/submissions/me", { params: query });
	},
	create: async (data: {
		problemId: number;
		contestId: number;
		languageId: number;
		sourceCode: string;
	}): Promise<any> => {
		return await axiosClient.post("/api/submissions", data);
	},
	
	getByHash: async (hash: string): Promise<any> => {
		return await axiosClient.get(`/api/submissions/get-by-hash/${hash}`);
	},
	
	// getAllAdmin: async (query: any = {}): Promise<any> => {
	// 	return await axiosClient.get("/api/submissions/admin", { params: query });
	// },
	getAllAdmin: async (params: { page: number; limit: number; userEmail: string }) => {
		const { page = 0, limit = 10, userEmail = "" } = params;
	
		// Simulate search by email
		let filteredData = mockSubmissions;
		if (userEmail) {
		  filteredData = filteredData.filter((sub) =>
			sub.user.email.toLowerCase().includes(userEmail.toLowerCase())
		  );
		}
	
		// Simulate pagination
		const start = page * limit;
		const end = start + limit;
		const contents = filteredData.slice(start, end);
	
		return {
		  contents,
		  totalElements: filteredData.length,
		};
	  },
	
	getByHashAdmin: async (hash: string): Promise<any> => {
		return await axiosClient.get(`/api/submissions/admin/get-by-hash/${hash}`);
	}
}

export default submissionService;