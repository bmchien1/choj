import {
	HomePage,
	UserContestListPage,
	// ContestListPage,
	// UserProblemListPage,
	UserProblemDetailsPage,
	SubmissionDetailPage,
	ListProblemPage, ProblemDetailPage, ChangePasswordPage,CourseListPage,UserCourseListPage,
	UserCourseDetail,
	DoAssignmentPage
} from '@/pages';

const privateRoutes = {
	home: {
		path: '/',
		component: HomePage,
	},
	// myContests: {
	// 	path: '/my-contests',
	// 	component: UserContestListPage,
	// },
	// allContests: {
	// 	path: '/contests',
	// 	component: ContestListPage,
	// },
	myCourses: {
		path: '/my-courses',
		component: UserCourseListPage,
	},
	allCourses: {
		path: '/courses',
		component: CourseListPage,
	},
	// problems: {
	// 	path: '/my-problems/:contestId',
	// 	component: UserProblemListPage,
	// },
	problemDetails: {
		path: '/my-problems-detail/:problemId',
		component: UserProblemDetailsPage,
	},
	submissionDetail: {
		path: '/my-submission-detail/:id',
		component: SubmissionDetailPage,
	},
	listProblem: {
		path: '/list-problem',
		component: ListProblemPage,
	},
	problemDetail: {
		path: '/problem-detail/:id',
		component: ProblemDetailPage,
	},
	profile: {
		path: '/change-password',
		component: ChangePasswordPage,
	},
	CourseDetail:{
		path: '/my-courses/:id',
		component: UserCourseDetail,
	},
	DoAssignment:{
		path: '/my-courses/:id/assignment/:assignmentId',
		component: DoAssignmentPage,
	}
}

export default privateRoutes;