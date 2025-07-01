import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import submissionService from "@/apis/service/submissionService";
import axiosClient from "@/apis/config/axiosClient";
import {
  Submission,
  SubmissionCreate,
  SubmissionQuery,
  AssignmentSubmission,
  GradingResult,
  BuildResponse,
  BuildRequest,
  ContestSubmission,
} from "@/apis/type";
import toast from "react-hot-toast";

export const useGetSubmissions = (query: SubmissionQuery = {}) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", query],
    queryFn: () => submissionService.getAll(query),
    enabled: !!Object.keys(query).length,
  });
};

export const useGetAllSubmissions = () => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "all"],
    queryFn: () => submissionService.getAllAdmin(),
  });
};

export const useGetSubmissionsByCourse = (courseId: number) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "course", courseId],
    queryFn: () => submissionService.getByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useGetSubmissionsByContest = (contestId: number) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "contest", contestId],
    queryFn: () => submissionService.getByContest(contestId),
    enabled: !!contestId,
  });
};

export const useGetSubmissionsByUser = (userId: number) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "user", userId],
    queryFn: () => submissionService.getByUser(userId),
    enabled: !!userId,
  });
};

export const useGetSubmissionsByAssignment = (assignmentId: number) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "assignment", assignmentId],
    queryFn: () => submissionService.getByAssignment(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useGetSubmissionsByAssignmentAndUser = (assignmentId: number, userId: number) => {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "assignment", assignmentId, "user", userId],
    queryFn: () => submissionService.getByAssignmentAndUser(assignmentId, userId),
    enabled: !!assignmentId && !!userId,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation<Submission, Error, SubmissionCreate>({
    mutationFn: (data) => submissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission created successfully");
    },
    onError: () => {
      toast.error("Failed to create submission");
    },
  });
};

export const useGetSubmissionByHash = (hash: string) => {
  return useQuery<Submission>({
    queryKey: ["submission", hash],
    queryFn: () => submissionService.getByHash(hash),
    enabled: !!hash,
  });
};

// export const useGetSubmissionsAdmin = (
//   params: SubmissionAdminParams = { page: 0, limit: 10, userEmail: "" }
// ) => {
//   return useQuery<SubmissionAdminResponse>({
//     queryKey: ["submissionsAdmin", params],
//     queryFn: () => submissionService.getAllAdmin(params),
//     enabled: params.page !== undefined && params.limit !== undefined,
//   });
// };

export const useGetSubmissionByHashAdmin = (hash: string) => {
  return useQuery<Submission>({
    queryKey: ["submissionAdmin", hash],
    queryFn: () => submissionService.getByHashAdmin(hash),
    enabled: !!hash,
  });
};

export const useCreateAssignmentSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation<GradingResult, Error, AssignmentSubmission>({
    mutationFn: async (data) => {
      try {
        console.log('Creating submission with data:', data);
        const response = await axiosClient.post("/api/submissions", data);
        console.log('Submission response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Submission error:', error.response?.data || error);
        throw new Error(error.response?.data?.message || error.message || "Failed to submit assignment");
      }
    },
    onSuccess: (data) => {
      console.log('Submission success:', data);
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to submit assignment");
    },
  });
};

export const useBuildCode = () => {
  return useMutation<BuildResponse, Error, BuildRequest>({
    mutationFn: (data) => submissionService.build(data),
    onSuccess: () => {
      toast.success("Code built successfully");
    },
    onError: () => {
      toast.error("Failed to build code");
    },
  });
};

export const useCreateContestSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation<Submission, Error, ContestSubmission>({
    mutationFn: (data) => submissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
};

export const useAllSubmissionsByUser = (courseId: number, userId: number) => {
  return useQuery({
    queryKey: ["all-submissions", courseId, userId],
    queryFn: () => submissionService.getAllByCourseAndUser(courseId, userId),
    enabled: !!courseId && !!userId,
  });
}; 
