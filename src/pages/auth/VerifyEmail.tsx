import "./index.css";
import { Button, Form, Input, Image } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import userService from "@/apis/service/userService";
import { AxiosError } from 'axios';
import { useEffect, useState } from "react";

const VerifyEmail = () => {
	const [form] = Form.useForm();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const email = searchParams.get('email');
	const [countdown, setCountdown] = useState(60);
	const [canResend, setCanResend] = useState(false);
	
	const [isLoading, setIsLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	
	useEffect(() => {
		if (email) {
			form.setFieldValue('email', email);
		}
	}, [email, form]);
	
	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					setCanResend(true);
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		
		return () => clearInterval(timer);
	}, []);
	
	const handleVerify = async (values: { email: string, code: string }) => {
		try {
			setIsLoading(true);
			await userService.verifyEmail(values.email, values.code);
			toast.success(t('Email verified successfully!'));
			navigate('/login');
		} catch (error) {
			const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || t('Verification failed!');
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleResendEmail = async () => {
		try {
			setIsResending(true);
			await userService.resendVerificationEmail(email!);
			toast.success(t('Verification email resent!'));
			setCanResend(false);
			setCountdown(60);
		} catch (error) {
			const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || t('Failed to resend verification email!');
			toast.error(errorMessage);
		} finally {
			setIsResending(false);
		}
	};
	
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};
	
	return (
		<main className="auth-page">
			<div className="auth-card">
				<div className="auth-card-header">
					<div className={'flex justify-center'}>
						<Image
							width={150}
							src={'/logo.jpg'}
							preview={false}
							className={'rounded-full'}
						/>
					</div>
					<div className="auth-title">{t('Verify Email')}</div>
					<p className="auth-description">
						{t("Please enter the verification code sent to your email")}
					</p>
				</div>
				<Form
					form={form}
					name="verify-email"
					layout="vertical"
					onFinish={handleVerify}
				>
					<Form.Item
						style={{
							marginBottom: "2.5rem",
						}}
						label={<span className="text-base font-medium">{t("Email")}</span>}
						name="email"
					>
						<Input
							disabled
							className="auth-form-input border-black"
						/>
					</Form.Item>
					
					<Form.Item
						label={<span className="text-base font-medium">{t("Verification Code")}</span>}
						name="code"
						rules={[
							{ required: true, message: t("Please input verification code!") },
						]}
					>
						<Input
							placeholder={t("Enter verification code")}
							className="auth-form-input border-black"
						/>
					</Form.Item>
				</Form>
				
				<div className="flex flex-col gap-3">
					<Button
						type="primary"
						onClick={form.submit}
						className="auth-btn bg-black"
						size="large"
						loading={isLoading}
					>
						{t("Verify")}
					</Button>
					
					<Button
						onClick={handleResendEmail}
						disabled={!canResend}
						className="auth-btn bg-black text-white"
						size="large"
						type={'primary'}
						loading={isResending}
					>
						{canResend
							? t("Resend Code")
							: `${t("Resend Code")} (${formatTime(countdown)})`
						}
					</Button>
				</div>
			</div>
		</main>
	);
};

export default VerifyEmail;