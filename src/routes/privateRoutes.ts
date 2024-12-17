import {
	HomePage,
	UserContestListPage,
	ContestListPage,
	UserProblemListPage,
	UserProblemDetailsPage,
	SubmissionDetailPage,
	ListProblemPage, ProblemDetailPage, ChangePasswordPage,
} from '@/pages';

const privateRoutes = {
	home: {
		path: '/',
		component: HomePage,
	},
	myContests: {
		path: '/my-contests',
		component: UserContestListPage,
	},
	allContests: {
		path: '/contests',
		component: ContestListPage,
	},
	myCourses: {
		path: '/my-courses',
		component: UserContestListPage,
	},
	allCourses: {
		path: '/courses',
		component: ContestListPage,
	},
	problems: {
		path: '/my-problems/:contestId',
		component: UserProblemListPage,
	},
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
}

export default privateRoutes;