export interface LoginResponse {
	jwt: string;
	user: {
		id: number,
		email: string,
		role: string,
	}
}

export interface RegisterResponse {
	message: string;
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
	grade: string;
	subject: string;
	difficulty_level: string;
	choices?: { choice: string }[]; // For multiple-choice
	correctAnswer?: string | boolean; // For short-answer and true-false
	templateCode?: string; // For coding
	testCases?: { input: string; expectedOutput: string }[]; // For coding
  }
  
  

export interface Contest {
	id: number;
	contestName: string;
	isPublic: boolean;
}

export interface QuestionTag {
	id: number;
	tagName: string;
}

export interface TestCase {
	input: string;
	output: string;
}