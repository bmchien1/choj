// import "./index.css";
// import { Button, Form, Input, Image } from "antd";
// import { useTranslation } from "react-i18next";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import userService from "@/apis/service/userService";
// import { AxiosError } from 'axios';
// import { useState, useEffect } from "react";
// import {isEmail} from "@/utils";

// const ResetPassword = () => {
// 	const [form] = Form.useForm();
// 	const { t } = useTranslation();
// 	const navigate = useNavigate();
// 	const [searchParams] = useSearchParams();
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [isResending, setIsResending] = useState(false);
// 	const [countdown, setCountdown] = useState(60);
// 	const [canResend, setCanResend] = useState(false);
	
// 	const email = searchParams.get('email');
	
// 	useEffect(() => {
// 		if (!email) {
// 			toast.error(t('Email not found!'));
// 			navigate('/login');
// 		} else {
// 			form.setFieldValue('email', email);
// 		}
// 	}, [email, navigate, t, form]);
	
// 	useEffect(() => {
// 		const timer = setInterval(() => {
// 			setCountdown((prev) => {
// 				if (prev <= 1) {
// 					setCanResend(true);
// 					clearInterval(timer);
// 					return 0;
// 				}
// 				return prev - 1;
// 			});
// 		}, 1000);
		
// 		return () => clearInterval(timer);
// 	}, []);
	
// 	const formatTime = (seconds: number) => {
// 		const minutes = Math.floor(seconds / 60);
// 		const remainingSeconds = seconds % 60;
// 		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// 	};
	
// 	const handleResetPassword = async (values: {
// 		email: string,
// 		token: string,
// 		password: string,
// 		confirmPassword: string
// 	}) => {
// 		const { token, password, confirmPassword } = values;
		
// 		if (password !== confirmPassword) {
// 			form.setFields([{
// 				name: 'confirmPassword',
// 				errors: [t('Passwords do not match!')]
// 			}]);
// 			return;
// 		}
		
// 		if(!email) {
// 			form.setFields([{
// 				name: 'email',
// 				errors: [t('Email not found!')]
// 			}]);
// 			return;
// 		}
		
// 		if(email && !isEmail(email)) {
// 			form.setFields([{
// 				name: 'email',
// 				errors: [t('The input is not valid E-mail!')]
// 			}]);
// 			return;
// 		}
		
// 		try {
// 			setIsLoading(true);
// 			await userService.resetPassword(email, password, token);
// 			toast.success(t('Password reset successful!'));
// 			navigate('/login');
// 		} catch (error) {
// 			const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || t('Failed to reset password!');
// 			toast.error(errorMessage);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};
	
// 	const handleResendEmail = async () => {
// 		try {
// 			setIsResending(true);
// 			await userService.forgotPassword(email!);
// 			toast.success(t('Password reset email resent!'));
// 			setCanResend(false);
// 			setCountdown(60);
// 		} catch (error) {
// 			const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || t('Failed to resend email!');
// 			toast.error(errorMessage);
// 		} finally {
// 			setIsResending(false);
// 		}
// 	};
	
// 	return (
// 		<main className="auth-page">
// 			<div className="auth-card">
// 				<div className="auth-card-header">
// 					<div className={'flex justify-center'}>
// 						<Image
// 							width={150}
// 							src={'/logo.jpg'}
// 							preview={false}
// 							className={'rounded-full'}
// 						/>
// 					</div>
// 					<p className="auth-title">{t('Reset Password')}</p>
// 					<p className="auth-description">
// 						{t("Enter the reset code and new password")}
// 					</p>
// 				</div>
// 				<Form
// 					form={form}
// 					name="reset-password"
// 					layout="vertical"
// 					onFinish={handleResetPassword}
// 				>
// 					<Form.Item
// 						style={{
// 							marginBottom: "2.5rem",
// 						}}
// 						label={<span className="text-base font-medium">{t("Email")}</span>}
// 						name="email"
// 					>
// 						<Input
// 							disabled
// 							className="auth-form-input border-black"
// 						/>
// 					</Form.Item>
					
// 					<Form.Item
// 						style={{
// 							marginBottom: "2.5rem",
// 						}}
// 						label={<span className="text-base font-medium">{t("Reset Code")}</span>}
// 						name="token"
// 						rules={[
// 							{ required: true, message: t("Please input reset code!") },
// 						]}
// 					>
// 						<Input
// 							placeholder={t("Enter reset code from email")}
// 							className="auth-form-input border-black"
// 						/>
// 					</Form.Item>
					
// 					<Form.Item
// 						style={{
// 							marginBottom: "2.5rem",
// 						}}
// 						label={<span className="text-base font-medium">{t("New Password")}</span>}
// 						name="password"
// 						rules={[
// 							{ required: true, message: t("Please input your new password!") },
// 						]}
// 					>
// 						<Input.Password
// 							placeholder={t("Enter new password")}
// 							className="auth-form-input border-black"
// 						/>
// 					</Form.Item>
					
// 					<Form.Item
// 						label={<span className="text-base font-medium">{t("Confirm New Password")}</span>}
// 						name="confirmPassword"
// 						rules={[
// 							{ required: true, message: t("Please confirm your new password!") },
// 						]}
// 					>
// 						<Input.Password
// 							placeholder={t("Confirm new password")}
// 							className="auth-form-input border-black"
// 						/>
// 					</Form.Item>
// 				</Form>
				
// 				<div className="flex flex-col gap-3">
// 					<Button
// 						type="primary"
// 						onClick={form.submit}
// 						className="auth-btn bg-black"
// 						size="large"
// 						loading={isLoading}
// 					>
// 						{t("Reset Password")}
// 					</Button>
					
// 					<Button
// 						onClick={handleResendEmail}
// 						disabled={!canResend}
// 						loading={isResending}
// 						className="auth-btn bg-black text-white"
// 						size="large"
// 						type={'primary'}
// 					>
// 						{canResend
// 							? t("Resend Reset Code")
// 							: `${t("Resend Reset Code")} (${formatTime(countdown)})`
// 						}
// 					</Button>
// 				</div>
				
// 				<div className={'mt-3 text-center'}>
// 					<span className={'text-sm'}>{t("Remember your password?")}</span>
// 					<Link to={'/login'} className={'text-blue-500 text-sm'}>
// 						{t(" Login")}
// 					</Link>
// 				</div>
// 			</div>
// 		</main>
// 	);
// };

// export default ResetPassword;