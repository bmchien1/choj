import { HomePage, ProblemListPage, ProblemDetailsPage } from '@/pages';

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
}

export default privateRoutes;