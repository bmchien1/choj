// Mock in-memory database
const mockDB = {
  requests: [
    {
      id: 1,
      user: { email: "user1@example.com" },
      contest: { contestName: "Contest A" },
      status: 0, // Pending
    },
    {
      id: 2,
      user: { email: "user2@example.com" },
      contest: { contestName: "Contest B" },
      status: 1, // Approved
    },
    {
      id: 3,
      user: { email: "user3@example.com" },
      contest: { contestName: "Contest C" },
      status: 2, // Rejected
    },
  ] as Array<{
    id: number;
    user: { email: string };
    contest: { contestName: string };
    status: 0 | 1 | 2; // 0: Pending, 1: Approved, 2: Rejected
  }>,
  currentRequestId: 3,
  currentUserEmail: "user1@example.com", // Mocked logged-in user for `getMyRequests`
};

// Mocked joinContestService
const joinContestService = {
  getMyRequests: async (query: any): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("query", query); // Keep your console.log for debugging
        let filteredRequests = mockDB.requests.filter(
          (req) => req.user.email === mockDB.currentUserEmail
        );
        if (query.status !== undefined) {
          filteredRequests = filteredRequests.filter((req) => req.status === Number(query.status));
        }
        if (query.contestName) {
          filteredRequests = filteredRequests.filter((req) =>
            req.contest.contestName.toLowerCase().includes(query.contestName.toLowerCase())
          );
        }
        resolve({
          contents: filteredRequests,
          totalElements: filteredRequests.length,
        });
      }, 500); // Simulate network delay
    });
  },

  getAllRequests: async (query: any = {}): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredRequests = [...mockDB.requests];
        if (query.status !== undefined) {
          filteredRequests = filteredRequests.filter((req) => req.status === Number(query.status));
        }
        if (query.contestName) {
          filteredRequests = filteredRequests.filter((req) =>
            req.contest.contestName.toLowerCase().includes(query.contestName.toLowerCase())
          );
        }
        resolve({
          contents: filteredRequests,
          totalElements: filteredRequests.length,
        });
      }, 500);
    });
  },

  approveRequest: async (id: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockDB.requests.find((req) => req.id === id);
        if (!request) {
          reject(new Error("Request not found"));
        } else {
          request.status = 1; // Approved
          resolve({ success: true, message: `Request ${id} approved` });
        }
      }, 500);
    });
  },

  rejectRequest: async (id: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockDB.requests.find((req) => req.id === id);
        if (!request) {
          reject(new Error("Request not found"));
        } else {
          request.status = 2; // Rejected
          resolve({ success: true, message: `Request ${id} rejected` });
        }
      }, 500);
    });
  },

  create: async (contestId: number): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDB.currentRequestId += 1;
        const newRequest = {
          id: mockDB.currentRequestId,
          user: { email: mockDB.currentUserEmail },
          contest: { contestName: `Contest ${contestId}` }, // Mock contest name based on ID
          status: 0 as const, // Pending
        };
        mockDB.requests.push(newRequest);
        resolve({
          request: newRequest,
          message: "Join contest request created successfully",
        });
      }, 500);
    });
  },
};

export default joinContestService;