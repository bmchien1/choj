import {ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage} from '@/pages';

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
	},
	resetPassword: {
		path: '/reset-password',
		component: ResetPasswordPage
	}
}

export default publicRoutes;