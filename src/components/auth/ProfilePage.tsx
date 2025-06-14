import { useState } from "react";
import { Form, Input, Button, Upload, message, Avatar } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ProfilePage = () => {
	const [form] = Form.useForm();
	const [avatar, setAvatar] = useState<string>("/default-avatar.jpg"); // Default avatar

	// Handle avatar upload
	const handleUpload = (file: any) => {
		const reader = new FileReader();
		reader.onload = () => {
			setAvatar(reader.result as string); // Set the uploaded image as avatar
		};
		reader.readAsDataURL(file);
		return false; // Prevent automatic upload
	};

	// Handle form submission
	const onFinish = (values: any) => {
		message.success("Profile updated successfully!");
		console.log("Updated Profile Data:", values);
	};

	return (
		<div className="profile-page">
			<h2>Profile</h2>
			<Form
				form={form}
				layout="vertical"
				onFinish={onFinish}
				initialValues={{
					email: "john.doe@example.com",
					firstName: "John",
					lastName: "Doe",
					phone: "123-456-7890",
				}}
				className="max-w-lg mx-auto"
			>
				<div className="text-center mb-4">
					<Avatar src={avatar} size={128} />
					<Upload
						beforeUpload={handleUpload}
						showUploadList={false}
						className="mt-2"
					>
						<Button icon={<UploadOutlined />}>Change Avatar</Button>
					</Upload>
				</div>

				<Form.Item
					label="Email"
					name="email"
					rules={[{ required: true, type: "email", message: "Enter a valid email!" }]}
				>
					<Input placeholder="Enter your email" disabled />
				</Form.Item>

				<Form.Item
					label="Password"
					name="password"
					rules={[
						{ required: true, message: "Enter your password!" },
						{ min: 6, message: "Password must be at least 6 characters!" },
					]}
				>
					<Input.Password placeholder="Enter your password" />
				</Form.Item>

				<Form.Item
					label="First Name"
					name="firstName"
					rules={[{ required: true, message: "Enter your first name!" }]}
				>
					<Input placeholder="Enter your first name" />
				</Form.Item>

				<Form.Item
					label="Last Name"
					name="lastName"
					rules={[{ required: true, message: "Enter your last name!" }]}
				>
					<Input placeholder="Enter your last name" />
				</Form.Item>

				<Form.Item
					label="Phone Number"
					name="phone"
					rules={[
						{ required: true, message: "Enter your phone number!" },
						{ pattern: /^[0-9-]+$/, message: "Enter a valid phone number!" },
					]}
				>
					<Input placeholder="Enter your phone number" />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" block>
						Update Profile
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

export default ProfilePage;
