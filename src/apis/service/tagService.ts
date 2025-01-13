import axiosClient from "@/apis/config/axiosClient.ts";
const mockTags = [
	{
	  id: 1,
	  tagName: "Tag 1",
	  creatdAt: "2023-11-10T10:00:00Z",
	  creator: "Admin",
	  status: 1,
	},
	{
	  id: 2,
	  tagName: "Tag 2",
	  creatdAt: "2023-12-01T12:00:00Z",
	  creator: "Admin",
	  status: 0,
	},
	{
	  id: 3,
	  tagName: "Tag 3",
	  creatdAt: "2023-12-05T14:30:00Z",
	  creator: "User",
	  status: 1,
	},
  ];
  
const tagService = {
	// getAll: async (query: any = {}): Promise<any> => {
	// 	return await axiosClient.get("/api/problem-tag", {params: query});
	// },
	
	getOne: async (tagId: string): Promise<any> => {
		return await axiosClient.get(`/api/problem-tag/${tagId}`);
	},
	
	create: async (data: any): Promise<any> => {
		return await axiosClient.post("/api/problem-tag", data);
	},
	
	update: async (tagId: string, data: any): Promise<any> => {
		return await axiosClient.put(`/api/problem-tag/${tagId}`, data);
	},
	
	// delete: async (tagId: number): Promise<any> => {
	// 	return await axiosClient.delete(`/api/problem-tag/soft/${tagId}`);
	// },
	getAll: async (searchParams: any) => {
		return new Promise((resolve) => {
		  setTimeout(() => {
			resolve({
			  contents: mockTags,
			  totalElements: mockTags.length,
			});
		  }, 500);
		});
	  },
	  delete: async (id: number) => {
		return new Promise((resolve, reject) => {
		  setTimeout(() => {
			const index = mockTags.findIndex((tag) => tag.id === id);
			if (index !== -1) {
			  mockTags.splice(index, 1); // Delete the tag from the array
			  resolve({ success: true });
			} else {
			  reject(new Error("Tag not found"));
			}
		  }, 500);
		});
	  },
}

export default tagService;