import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import submissionService from "@/apis/service/submissionService";
import axiosClient from "@/apis/config/axiosClient";
import {
  Submission,
  SubmissionCreate,
  SubmissionQuery,
  SubmissionAdminParams,
  SubmissionAdminResponse,
  AssignmentSubmission,
  GradingResult,
  BuildResponse,
  BuildRequest,
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
    mutationFn: (data) =>
      axiosClient.post("/api/submissions", data).then((res) => {
        console.log('API Response:', res.data);
        return res.data;
      }),
    onSuccess: (data) => {
      console.log('Mutation Success:', data);
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Assignment submitted successfully");
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      toast.error("Failed to submit assignment");
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
