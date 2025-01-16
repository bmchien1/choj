import {
	CreateQuestionPage,
	CreateContestPage,
	EditProblemPage,
	ListAdminQuestionPage,
	EditContestPage,
	ListAdminTagPage,
	ListAdminContestPage, JoinContestRequestsPage, ListAdminSubmissionPage, SubmissionAdminDetailPage, UserManagementPage, CreateCoursePage ,ListAdminCoursePage
} from "@/pages";

const adminRoutes = {
	createProblem: {
		path: '/admin/question/create',
		component: CreateQuestionPage,
	},
	createContest: {
		path: '/admin/contest/create',
		component: CreateContestPage,
	},
	createCourse: {
		path: '/admin/course/create',
		component: CreateCoursePage,
	},
	editProblem: {
		path: '/admin/problem/edit/:id',
		component: EditProblemPage,
	},
	listAdminProblem: {
		path: '/admin/questions',
		component: ListAdminQuestionPage
	},
	editContest: {
		path: '/admin/contest/edit/:id',
		component: EditContestPage,
	},
	listAdminContest: {
		path: '/admin/contests',
		component: ListAdminContestPage
	},
	listAdminCourse: {
		path: '/admin/courses',
		component: ListAdminCoursePage
	},
	listAdminTag: {
		path: '/admin/tags',
		component: ListAdminTagPage
	},
	joinContest:{
		path: '/admin/join-contest-request',
		component: JoinContestRequestsPage
	},
	listAdminSubmission: {
		path: '/admin/submissions',
		component: ListAdminSubmissionPage
	},
	submissionDetailAdmin: {
		path: '/admin/submission-detail/:id',
		component: SubmissionAdminDetailPage
	},
	listUsers: {
		path: '/admin/users',
		component: UserManagementPage
	}
}

export default adminRoutes;