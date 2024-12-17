import "./index.css";
import {Button, Form, Input, Image} from "antd";
import {useTranslation} from "react-i18next";
import {Link, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import userService from "@/apis/service/userService";
import { AxiosError } from 'axios';
import {useState} from "react";

const ForgotPassword = () => {
	const [form] = Form.useForm();
	const {t} = useTranslation()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false);
	const handleForgotPassword = async (values: { email: string }) => {
		try {
			setIsLoading(true);
			await userService.forgotPassword(values.email);
			toast.success(t('Password reset email sent!'));
			navigate('/reset-password?email=' + values.email);
		} catch (error) {
			const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || t('Failed to send password reset email!');
			toast.error(errorMessage);	
		} finally {
			setIsLoading(false);
		}
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
					<p className="auth-title">{t('Welcome')}</p>
					<p className="auth-description">{t("Enter your email to reset password")}</p>
				</div>
				<Form
					form={form}
					name="forgot-password"
					layout="vertical"
					onFinish={handleForgotPassword}
				>
					<Form.Item
						label={<span className="text-base font-medium">{t("Email")}</span>}
						name="email"
						rules={[
							{required: true, message: t("Please input your email!")},
						]}
					>
						<Input placeholder={t("Email")} className="auth-form-input border-black"/>
					</Form.Item>
				</Form>
				
				<Button
					type="primary"
					onClick={form.submit}
					className="auth-btn bg-black mt-3"
					size="large"
					loading={isLoading}
				>
					{t("Forgot Password")}
				</Button>
				<div className={'mt-3 text-center'}>
					<span className={'text-sm'}>{t("Already have an account?")}</span>
					<Link to={'/login'} className={'text-blue-500 text-sm'}>
						{t(" Login")}
					</Link>
				</div>
			</div>
		</main>
	);
};

export default ForgotPassword;