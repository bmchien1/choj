import { AdminContestView, AdminCourseDetail, AdminCourseListPage,AdminJoinCoursesPage,AdminQuestionListPage,AdminSubmission,AdminTagListPage, SubmissionCourse, SubmissionContest, UserListPage } from "@/pages";
import ListAdminMatrix from "@/pages/AdminMatrix";

const adminRoutes = {

	listUser: {
		path: '/admin/users',
		component: UserListPage,
	},
	
	listAdminCourse: {
		path: '/admin/courses',
		component: AdminCourseListPage
	},
	courseDetail: {
		path: '/admin/courses/details/:id',
		component: AdminCourseDetail
	},
	
	
	listAdminQuestion: {
		path: '/admin/questions',
		component: AdminQuestionListPage
	},


	listAdminTag: {
		path: '/admin/tags',
		component: AdminTagListPage
	},
	joinCourse:{
		path: '/admin/join-course-request',
		component: AdminJoinCoursesPage
	},

	contest:{
		path: '/admin/contest',
		component: AdminContestView
	},
	submission:{
		path: '/admin/submission',
		component: AdminSubmission
	},
	submissionCourse:{
		path: '/admin/submission/course/:id',
		component: SubmissionCourse
	},
	submissionContest:{
		path: '/admin/submission/contest/:id',
		component: SubmissionContest
	},   
	 listAdminMatrix: {
		path: '/admin/matrices',
		component: ListAdminMatrix
	  },
	// createContest: {
	// 	path: '/admin/contest/create',
	// 	component: CreateContestPage,
	// },
	// editProblem: {
	// 	path: '/admin/problem/edit/:id',
	// 	component: EditProblemPage,
	// },
	// listAdminProblem: {
	// 	path: '/admin/questions',
	// 	component: ListAdminQuestionPage
	// },
	// editContest: {
	// 	path: '/admin/contest/edit/:id',
	// 	component: EditContestPage,
	// },
	// listAdminContest: {
	// 	path: '/admin/contests',
	// 	component: ListAdminContestPage
	// },
	// listAdminTag: {
	// 	path: '/admin/tags',
	// 	component: ListAdminTagPage
	// },
	// listAdminSubmission: {
	// 	path: '/admin/submissions',
	// 	component: ListAdminSubmissionPage
	// },
	// submissionDetailAdmin: {
	// 	path: '/admin/submission-detail/:id',
	// 	component: SubmissionAdminDetailPage
	// },
	// listUsers: {
	// 	path: '/admin/users',
	// 	component: UserManagementPage
	// },
}

export default adminRoutes;