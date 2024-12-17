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

export interface CreateProblemRequest {
	problemName: string;
	problemCode: string;
	difficulty: ProblemDifficulty;
	maxPoint: number;
	contestId: number;
	problemStatement: string;
	tags: string[];
	testCases: {
		input: string;
		output: string;
		hidden?: number;
	}[];
	cpuTimeLimit?: number;
	memoryLimit?: number;
	maxTimeCommit?: number;
}

export interface Contest {
	id: number;
	contestName: string;
	isPublic: boolean;
}

export interface ProblemTag {
	id: number;
	tagName: string;
}

export interface TestCase {
	input: string;
	output: string;
}