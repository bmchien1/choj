export interface Choice {
  choice: string;
}

export interface LoginResponse {
  jwt: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: AppRole;
}

export interface ForgotPasswordResponse {
  message: string;
}

export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface CreateQuestionRequest {
  question: string;
  questionType: "multiple-choice" | "short-answer" | "true-false" | "coding";
  difficulty_level: string;
  choices?: { choice: string }[];
  correctAnswer?: string | boolean;
  templateCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
  tagIds?: number[];
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  accessUrl?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  creator: User;
  questions?: Question[];
  attempts?: Array<{
    id: number;
    userId: number;
    isSubmitted: boolean;
    startTime: Date;
    endTime?: Date;
    timeLeft: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  creatorId: number;
  creatorName: string;
}

export interface QuestionTag {
  id: number;
  tagName: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export enum AppRole {
  USER = "user",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: AppRole;
  avatar_url?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface UserRole {
  id: number;
  role: string;
}

export interface Course {
  id?: number;
  name: string;
  description: string;
  class: string;
  subject: string;
  creatorId: number;
}

export interface Assignment {
  id?: number;
  title: string;
  description: string;
  duration?: number;
  total_points?: number;
  order: number;
  course: Course;
  questions: Question[];
  question_scores?: { [questionId: number]: number };
  chapterId?: number;
}

export interface AssignmentCreate {
  title: string;
  description: string;
  duration: number | undefined;
  total_points?: number;
  order: number;
  courseId: number;
  questionIds: number[];
  question_scores?: { [questionId: number]: number };
  chapterId?: number;
}

export enum LessonType {
  JSON = "json",
  VIDEO = "video",
}

export interface Lesson {
  id?: number;
  title: string;
  description: string;
  file_url?: string;
  order: number;
  lessonType: LessonType;
  content?: {
    sections: Array<{
      type: "theory" | "example" | "try_it" | "exercise";
      title: string;
      content?: string;
      code?: string;
      defaultInput?: string;
      expectedOutput?: string;
      instructions?: string;
      solution?: string;
    }>;
  } | null;
  video_url?: string;
  courseId: number;
  chapterId?: number;
}

export interface LessonView {
  id?: number;
  title: string;
  description: string;
  file_url?: string;
  order: number;
  lessonType: LessonType;
  content?: {
    sections: Array<{
      type: "theory" | "example" | "try_it" | "exercise";
      title: string;
      content?: string;
      code?: string;
      defaultInput?: string;
      expectedOutput?: string;
      instructions?: string;
      solution?: string;
    }>;
  } | null;
  video_url?: string;
  course: Course;
}

export interface Question {
  id?: number;
  questionName: string;
  questionType: "multiple-choice" | "short-answer" | "true-false" | "coding";
  difficulty_level: string;
  creatorId: number;
  question: string;
  question_image_url?: string;
  templateCode?: string;
  cpuTimeLimit?: number;
  memoryLimit?: number;
  maxPoint?: number;
  testCases?: TestCase[] | null;
  language?: string | null;
  correctAnswer?: string | null;
  choices?: Choice[] | null;
  tags?: Tag[] | null;
  tagIds?: number[];
}

export interface QuestionTable {
  id: number;
  questionName: string;
  questionType: string;
  question: string;
  difficulty_level: string;
  creatorName: string;
  tags: Tag[];
  choices?: Choice[] | null;
  correctAnswer?: string | null;
  language?: string | null;
  memoryLimit?: number;
  cpuTimeLimit?: number;
  templateCode?: string;
  testCases?: TestCase[] | null;
}

export interface Test {
  creator: User;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
  questions_scores: any;
  total_points: number;
}

export interface Matrix {
  id?: number;
  name: string;
  description?: string;
  total_points?: number;
  criteria: {
    questionType: string;
    difficulty_level: string;
    tagIds: number[];
    percentage: number;
  }[];
  user?: User;
}

export interface JoinCourseRequest {
  userId: string;
  courseId: string;
}

export interface Submission {
  submissionHash: string;
  status: string;
  message: string;
  error: string;
  point: number;
  testCasePassed: number;
  testCases: number;
  languageId: number;
  user: {
    email: string;
  };
  assignment?: {
    id: number;
  };
}

export interface SubmissionCreate {
  problemId: number;
  contestId: number;
  languageId: number;
  sourceCode: string;
}

export interface SubmissionQuery {
  [key: string]: any;
}

export interface SubmissionAdminParams {
  page: number;
  limit: number;
  userEmail?: string;
}

export interface SubmissionAdminResponse {
  contents: Submission[];
  totalElements: number;
}

export interface AssignmentSubmission {
  userId: number;
  assignmentId: number;
  answers: Array<{
    questionId: number;
    sourceCode: string;
    language: string;
  }>;
}

export interface GradingResult {
  score: number;
  testCasePassed: number;
  status: string;
  results: string;
}

export interface BuildRequest {
  language: string;
  sourceCode: string;
  input: string;
}

export interface BuildResponse {
  output?: string;
  error?: string;
}

export interface Chapter {
  id?: number;
  title: string;
  description: string;
  order: number;
  courseId: number;
  lessons?: Lesson[];
  assignments?: Assignment[];
}

export interface CreateContestData {
  title: string;
  description: string;
  isPublic: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  userId: number;
}

export interface UpdateContestData extends Omit<CreateContestData, 'userId'> {
  id: number;
  questions_scores?: { [key: number]: number };
}

export interface ContestSubmission {
  userId: number;
  contestId: number;
  testId: number;
  problemId: number;
  languageId: number;
  sourceCode: string;
  answers: Array<{
    questionId: number;
    sourceCode: string;
    language: string;
  }>;
}
