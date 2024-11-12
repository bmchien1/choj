import {ForgotPasswordPage, LoginPage, RegisterPage} from '@/pages';

const publicRoutes = {
	login: {
		path: '/login',
		component: LoginPage,
	},
	register: {
		path: '/register',
		component: RegisterPage,
	},
	forgotPassword: {
		path: '/forgot-password',
		component: ForgotPasswordPage
	}
}

export default publicRoutes;