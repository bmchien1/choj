import {ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, VerifyEmailPage} from '@/pages';

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
	verifyEmail: {
		path: '/verify-email',
		component: VerifyEmailPage
	},
	resetPassword: {
		path: '/reset-password',
		component: ResetPasswordPage
	}
}

export default publicRoutes;