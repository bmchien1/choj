import { HomePage, ProblemListPage, ProblemDetailsPage, ProfilePage, CreateProblemPage, ContestListPage, CourseListPage} from '@/pages';

const privateRoutes = {
	home: {
		path: '/',
		component: HomePage,
	},
	problems:{
		path:'/problems',
		component: ProblemListPage,
	},
	problemDetails: {
		path: '/problems/:problemId',
		component: ProblemDetailsPage,
	},
	profile: {
		path: '/profile',
		component: ProfilePage,
	},
	admin: {
		path: '/admin',
		component: CreateProblemPage,
	},
	contests:{
		path:'/contests',
		component: ContestListPage,
	},
	courses:{
		path:'/courses',
		component: CourseListPage,
	},
}

export default privateRoutes;