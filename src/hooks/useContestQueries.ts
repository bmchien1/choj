import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contestService } from "../apis/service/contestService";
import { CreateContestData, UpdateContestData } from "../apis/type"

export const useContestQueries = (userId?: number) => {
    const queryClient = useQueryClient();

    // Get all public contests
    const publicContests = useQuery({
        queryKey: ["publicContests"],
        queryFn: contestService.getPublicContests
    });

    // Get teacher's contests
    const teacherContests = useQuery({
        queryKey: ["teacherContests", userId],
        queryFn: () => userId ? contestService.getContestsByTeacher(userId) : null,
        enabled: !!userId
    });

    // Get contest by ID
    const getContestById = (id: number) => useQuery({
        queryKey: ["contest", id],
        queryFn: () => contestService.getContestById(id)
    });

    // Create contest mutation
    const createContest = useMutation({
        mutationFn: (data: CreateContestData) => contestService.createContest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacherContests"] });
        }
    });

    // Update contest mutation
    const updateContest = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateContestData }) =>
            contestService.updateContest(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["contest", id] });
            queryClient.invalidateQueries({ queryKey: ["teacherContests"] });
        }
    });

    // Delete contest mutation
    const deleteContest = useMutation({
        mutationFn: ({ id, userId }: { id: number; userId: number }) =>
            contestService.deleteContest(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacherContests"] });
        }
    });

    // Add question to contest mutation
    const addQuestionToContest = useMutation({
        mutationFn: ({ contestId, questionId, userId }: { contestId: number; questionId: number; userId: number }) =>
            contestService.addQuestionToContest(contestId, questionId, userId),
        onSuccess: (_, { contestId }) => {
            queryClient.invalidateQueries({ queryKey: ["contest", contestId] });
        }
    });

    // Remove question from contest mutation
    const removeQuestionFromContest = useMutation({
        mutationFn: ({ contestId, questionId, userId }: { contestId: number; questionId: number; userId: number }) =>
            contestService.removeQuestionFromContest(contestId, questionId, userId),
        onSuccess: (_, { contestId }) => {
            queryClient.invalidateQueries({ queryKey: ["contest", contestId] });
        }
    });

    // Add questions by matrix mutation
    const addQuestionsByMatrix = useMutation({
        mutationFn: ({ contestId, matrixId, userId }: { contestId: number; matrixId: number; userId: number }) =>
            contestService.addQuestionsByMatrix(contestId, matrixId, userId),
        onSuccess: (_, { contestId }) => {
            queryClient.invalidateQueries({ queryKey: ["contest", contestId] });
        }
    });

    // Submit contest answers mutation
    const submitContestAnswers = useMutation({
        mutationFn: ({ contestId, answers, userId }: { contestId: number; answers: { [key: number]: string }; userId: number }) =>
            contestService.submitContestAnswers(contestId, answers, userId),
        onSuccess: (_, { contestId }) => {
            queryClient.invalidateQueries({ queryKey: ["contest", contestId] });
        }
    });

    return {
        publicContests,
        teacherContests,
        getContestById,
        createContest,
        updateContest,
        deleteContest,
        addQuestionToContest,
        removeQuestionFromContest,
        addQuestionsByMatrix,
        submitContestAnswers
    };
}; 