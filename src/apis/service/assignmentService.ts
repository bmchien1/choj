import axiosClient from "@/apis/config/axiosClient.ts";
import questionService from "@/apis/service/questionService"; // Assume this service has getQuestionById implemented

const assignmentService = {
  /**
   * Get assignment details by ID
   * @param assignmentId - The ID of the assignment
   * @returns Assignment details with enriched questions
   */
  getAssignmentById: async (assignmentId: number | string): Promise<any> => {
    const response = await axiosClient.get(`/api/courses/assignments/${assignmentId}`);
    const assignment = Array.isArray(response)
    ? response
    : [];
    // console.log(assignment[0].questions)

    // Enrich the questions by fetching full details using the question IDs
    const enrichedQuestions = await Promise.all(
        assignment[0].questions.map(async (id: number) => {
            const question=await questionService.getOne(id);

            return question;
        })
    );
    // console.log(enrichedQuestions);
    // Return the assignment with enriched questions
    return {
      ...assignment,
      questions: enrichedQuestions,
    };
  },

  /**
   * Submit assignment answers
   * @param data - The submission payload
   * @returns Submission result
   */
  submitAssignment: async (data: {
    userId: number;
    assignmentId: number;
    answers: { questionId: number; answer: any }[];
  }): Promise<any> => {
    console.log(data);
    return await axiosClient.post(`/api/submissions`, data);
  },

  /**
   * Get all submissions for a specific assignment
   * @param assignmentId - The ID of the assignment
   * @returns List of submissions
   */
  getSubmissionsByAssignment: async (
    assignmentId: number | string
  ): Promise<any> => {
    return await axiosClient.get(`/api/assignments/${assignmentId}/submissions`);
  },

  /**
   * Get submission details by submission ID
   * @param submissionId - The ID of the submission
   * @returns Submission details
   */
  getSubmissionById: async (
    submissionId: number | string
  ): Promise<any> => {
    return await axiosClient.get(`/api/submissions/${submissionId}`);
  },
};

export default assignmentService;
