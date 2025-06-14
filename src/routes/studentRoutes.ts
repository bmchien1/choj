import {
	AllCourseListPage,
	// UserContestListPage,
	// // ContestListPage,
	// // UserProblemListPage,
	// UserProblemDetailsPage,
	// SubmissionDetailPage,
	// ListProblemPage, ProblemDetailPage, ChangePasswordPage,CourseListPage,UserCourseListPage,
	// UserCourseDetail,
	// DoAssignmentPage,
	UserCourseListPage,
	StudentContestView,
	ContestPage,
} from '@/pages';

import Home from '@/pages/HomePage';
import StudentAssignment from '@/pages/StudentAssignment';
import StudentCourseDetail from '@/pages/StudentCourseDetail';
import StudentViewLesson from '@/pages/StudentViewLesson';
const studentRoutes = {
	home: {
		path: '/',
		component: Home,
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
		component: AllCourseListPage,
	},
	
	viewLesson:{
		path: '/lesson/:lessonId',
		component: StudentViewLesson,
	},
	viewAssignment:{
		path: '/assignment/:assignmentId',
		component: StudentAssignment,
	},
	CourseDetail:{
		path: '/my-courses/:id',
		component: StudentCourseDetail,
	},
	contest:{
		path: '/contest',
		component: StudentContestView
	},
	doContest:{
		path: '/do-contest/:id',
		component: ContestPage
	},
	// // problems: {
	// // 	path: '/my-problems/:contestId',
	// // 	component: UserProblemListPage,
	// // },
	// problemDetails: {
	// 	path: '/my-problems-detail/:problemId',
	// 	component: UserProblemDetailsPage,
	// },
	// submissionDetail: {
	// 	path: '/my-submission-detail/:id',
	// 	component: SubmissionDetailPage,
	// },
	// listProblem: {
	// 	path: '/list-problem',
	// 	component: ListProblemPage,
	// },
	// problemDetail: {
	// 	path: '/problem-detail/:id',
	// 	component: ProblemDetailPage,
	// },
	// profile: {
	// 	path: '/change-password',
	// 	component: ChangePasswordPage,
	// },
	// DoAssignment:{
	// 	path: '/my-courses/:id/assignment/:assignmentId',
	// 	component: DoAssignmentPage,
	// }
}

export default studentRoutes;