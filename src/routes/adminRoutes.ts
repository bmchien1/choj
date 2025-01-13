import {
	CreateProblemPage,
	CreateContestPage,
	EditProblemPage,
	ListAdminProblemPage,
	EditContestPage,
	ListAdminTagPage,
	CreateTagPage,
	EditTagPage,
	ListAdminContestPage, JoinContestRequestsPage, ListAdminSubmissionPage, SubmissionAdminDetailPage, UserManagementPage, CreateCoursePage ,ListAdminCoursePage
} from "@/pages";

const adminRoutes = {
	createProblem: {
		path: '/admin/problem/create',
		component: CreateProblemPage,
	},
	createContest: {
		path: '/admin/contest/create',
		component: CreateContestPage,
	},
	createCourse: {
		path: '/admin/course/create',
		component: CreateCoursePage,
	},
	createTag: {
		path: '/admin/tag/create',
		component: CreateTagPage,
	},
	editProblem: {
		path: '/admin/problem/edit/:id',
		component: EditProblemPage,
	},
	listAdminProblem: {
		path: '/admin/problems',
		component: ListAdminProblemPage
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
	editTag: {
		path: '/admin/tag/edit/:id',
		component: EditTagPage,
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