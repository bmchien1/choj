import {Button, Form, Input} from "antd";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import userService from "@/apis/service/userService";
import {AxiosError} from 'axios';
import {useState} from "react";

const ChangePassword = () => {
	const [form] = Form.useForm();
	const {t} = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	
	const handleChangePassword = async (values: {
		currentPassword: string,
		newPassword: string,
		confirmPassword: string
	}) => {
		const {currentPassword, newPassword, confirmPassword} = values;
		
		if (newPassword !== confirmPassword) {
			form.setFields([{
				name: 'confirmPassword',
				errors: [t('Passwords do not match!')]
			}]);
			return;
		}
		
		try {
			setIsLoading(true);
			await userService.changePassword(currentPassword, newPassword);
			toast.success(t('Password changed successfully!'));
			form.resetFields();
		} catch (error) {
			const errorMessage = (error as AxiosError<{
				message: string
			}>)?.response?.data?.message || t('Failed to change password!');
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};
	
	return (
		<div className="w-full mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				{t('Change Password')}
			</h1>
			
			<div className="bg-white rounded-lg shadow-sm p-6">
				<Form
					form={form}
					layout="vertical"
					onFinish={handleChangePassword}
					className="space-y-4"
				>
					<Form.Item
						label={<span className="text-gray-700 font-medium">{t("Current Password")}</span>}
						name="currentPassword"
						rules={[
							{required: true, message: t("Please input your current password!")}
						]}
					>
						<Input.Password
							placeholder={t("Enter current password")}
							className="w-full rounded-md"
						/>
					</Form.Item>
					
					<Form.Item
						label={<span className="text-gray-700 font-medium">{t("New Password")}</span>}
						name="newPassword"
						rules={[
							{required: true, message: t("Please input your new password!")},
						]}
					>
						<Input.Password
							placeholder={t("Enter new password")}
							className="w-full rounded-md"
						/>
					</Form.Item>
					
					<Form.Item
						label={<span className="text-gray-700 font-medium">{t("Confirm New Password")}</span>}
						name="confirmPassword"
						rules={[
							{required: true, message: t("Please confirm your new password!")}
						]}
					>
						<Input.Password
							placeholder={t("Confirm new password")}
							className="w-full rounded-md"
						/>
					</Form.Item>
					
					<div className="flex justify-end">
						<Button
							type="default"
							className="mr-4"
							onClick={() => form.resetFields()}
						>
							{t("Cancel")}
						</Button>
						<Button
							type="primary"
							onClick={() => form.submit()}
							loading={isLoading}
							className="bg-blue-500 text-white hover:bg-blue-600"
						>
							{t("Change Password")}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default ChangePassword;