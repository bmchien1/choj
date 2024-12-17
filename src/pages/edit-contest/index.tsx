import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
	Form,
	Input,
	Button,
	Card, Select,
} from 'antd';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import contestService from "@/apis/service/contestService.ts";
import {ContestStatus} from "@/constants/types.ts";

const EditContest: React.FC = () => {
	const { id: contestId } = useParams<{ id: string }>();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	
	// Fetch contest data
	const { data: contestData, isLoading: isLoadingContest, isError } = useQuery({
		queryKey: ['contest', contestId],
		queryFn: async ({queryKey}: any) => {
			const [, _id] = queryKey;
			return await contestService.getOneAdmin(_id);
		},
		enabled: !!contestId,
	});
	
	// Update form when data is fetched
	useEffect(() => {
		if (contestData) {
			form.setFieldsValue({
				contestName: contestData.contestName,
				creator: contestData.creator,
				description: contestData.description,
				status: contestData.status,
			});
		}
	}, [contestData, form]);
	
	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (data: any) => contestService.update(contestId as string, data),
		onSuccess: () => {
			toast.success('Contest updated successfully');
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Failed to update contest');
		},
	});
	
	const onFinish = async (values: any) => {
		try {
			setLoading(true);
			
			const contestUpdateData = {
				contestName: values.contestName,
				creator: values.creator,
				description: values.description,
				status: values.status,
			};
			
			await updateMutation.mutateAsync(contestUpdateData);
		} catch (error: any) {
			toast.error(error?.message || 'Failed to update contest');
		} finally {
			setLoading(false);
		}
	};
	
	if (isLoadingContest) {
		return <div>Loading...</div>;
	}
	
	if(isError) {
		return <div>Contest not found</div>;
	}
	
	return (
		<div className="w-full">
			<Card title="Edit Contest">
				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
				>
					<Form.Item
						name="contestName"
						label="Contest Name"
						rules={[{ required: true, message: 'Please enter the contest name' }]}
					>
						<Input />
					</Form.Item>
					
					<Form.Item
						name="creator"
						label="Creator"
						rules={[{ required: true, message: 'Please enter the creator name' }]}
					>
						<Input />
					</Form.Item>
					
					<Form.Item
						name="description"
						label="Description"
					>
						<Input.TextArea rows={4} />
					</Form.Item>
					
					<Form.Item
						name={'status'}
						label={'Status'}
					>
						<Select>
							{Object.values(ContestStatus).map((status) => (
								<Select.Option key={status} value={status}>
									{status.toUpperCase()}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading || updateMutation.isPending}
						>
							Update Contest
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default EditContest;