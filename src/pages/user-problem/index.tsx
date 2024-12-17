import {useEffect, useMemo, useState} from 'react';
import {Typography, Card, Table, Upload, Button, Tabs, Select, Flex, Tag, Input} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import CodeEditor from "@/pages/user-problem/components/CodeEditor.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import userProblemService from "@/apis/service/userProblemService.ts";
import submissionService from "@/apis/service/submissionService.ts";
import {LIST_LANGUAGE} from "@/constants/data.ts";
import toast from "react-hot-toast";
import moment from "moment";
import {getSubmissionStatusTagColor, readFileContent} from "@/utils";
import {IoReload} from "react-icons/io5";
import SubmissionMessageModal from "@/pages/user-problem/components/SubmissionMessageModal.tsx";
import {FaCircleInfo} from "react-icons/fa6";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const UserProblemDetail = () => {
	const {problemId} = useParams<{ problemId: string }>();
	const navigate = useNavigate();
	const [code, setCode] = useState('// Write your code here');
	const [language, setLanguage] = useState('c_cpp');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submissionParams, setSubmissionParams] = useState({
		page: 0,
		limit: 10,
	});
	const [submissionMessage, setSubmissionMessage] = useState({
		open: false,
		error: '',
		message: '',
	});
	const [uploadFile, setUploadFile] = useState<File | undefined | null>(null);
	
	const {
		data: problemData,
		error: problemError,
	} = useQuery({
		queryKey: ['userProblem', problemId],
		queryFn: async ({queryKey}) => {
			const [, _problemId] = queryKey;
			if (!_problemId) return null;
			return await userProblemService.getByProblemId(_problemId);
		},
		enabled: !!problemId
	})
	
	const {
		data: submissionData = {
			contents: [],
		},
		refetch: refetchSubmission,
		isLoading: submissionLoading,
	} = useQuery({
		queryKey: ['userSubmission', problemId, submissionParams],
		queryFn: async ({queryKey}: any) => {
			const [, _problemId, pageParams] = queryKey;
			if (!_problemId) return null;
			return await submissionService.getAll({
				page: pageParams.page,
				limit: pageParams.limit,
				problemId: _problemId,
			});
		},
		enabled: !!problemId
	})
	
	useEffect(() => {
		const defaultCodeData = LIST_LANGUAGE.find((lang: any) => lang.mode === language);
		setCode(defaultCodeData ? defaultCodeData?.code : 'c_cpp');
	}, [language]);
	
	// Mock data for test cases
	const testCases = useMemo(() => {
		if (!problemData) return [];
		return problemData?.problem?.testCases.map((testCase: any, index: number) => ({
			key: index,
			input: testCase.input,
			expectedOutput: testCase.output,
		}));
	}, [problemData]);
	
	const {contents: submissions} = submissionData;
	
	const submissionTableData = useMemo(() => {
		if (!submissions) return [];
		return submissions.map((submission: any) => ({
			...submission,
			key: submission.submissionHash,
			id: submission.submissionHash,
			timestamp: moment(submission.submissionDate).format('YYYY-MM-DD HH:mm:ss'),
			status: submission.status,
			message: submission.message,
			point: submission.point,
			testCases: submission.testCasePassed + ' / ' + submission.testCases.length,
			language: LIST_LANGUAGE.find((lang: any) => lang.id === submission.languageId)?.name,
		}));
	}, [submissions]);
	
	const testCaseColumns = [
		{
			title: 'Input',
			dataIndex: 'input',
			key: 'input',
			render: (input: string) => {
				return (
					<div className="whitespace-pre-wrap max-w-2xl max-h-40 overflow-auto">{input}</div>
				);
			}
		},
		{
			title: 'Expected Output',
			dataIndex: 'expectedOutput',
			key: 'expectedOutput',
			render: (expectedOutput: string) => {
				return (
					<div className="whitespace-pre-wrap max-w-2xl max-h-40 overflow-auto">{expectedOutput}</div>
				);
			}
		},
	];
	
	const submissionColumns = [
		{
			title: 'Id',
			dataIndex: 'id',
			key: 'id',
			render: (id: string) => {
				const shortId = id.slice(0, 6);
				return (
					<div className="cursor-pointer hover:text-blue-500"
					     onClick={() => navigate(`/my-submission-detail/${id}`)}>
						{shortId}
					</div>
				);
			}
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => {
				const tagColor = getSubmissionStatusTagColor(status);
				return (
					<Tag
						color={tagColor}
						className={'font-semibold'}
					>{status.toUpperCase()}</Tag>
				);
			}
		},
		{
			title: 'Message',
			dataIndex: 'message',
			key: 'message',
			render: (message: string, record: any) => {
				return (
					<FaCircleInfo
						className={'cursor-pointer'}
						size={20}
						color={'#1890ff'}
						onClick={() => {
							setSubmissionMessage({
								open: true,
								error: record?.error,
								message,
							});
						}}
					/>
				)
			}
		},
		{
			title: 'Language',
			dataIndex: 'language',
			key: 'language',
		},
		{
			title: 'Test cases',
			dataIndex: 'testCases',
			key: 'testCases',
		},
		{
			title: 'Point',
			dataIndex: 'point',
			key: 'point',
			render: (point: number) => {
				return (
					<Text className={'font-semibold'}>{point}</Text>
				);
			}
		},
		{
			title: 'Submitted at',
			dataIndex: 'timestamp',
			key: 'timestamp',
		}
	];
	
	const handleSubmit = async () => {
		if (!code) {
			return toast.error('Please write your code');
		}
		const languageSubmit = LIST_LANGUAGE.find((lang: any) => lang.mode === language)
		if (!languageSubmit) {
			return toast.error('Please select language');
		}
		
		if (!problemId) {
			return toast.error('Problem not found');
		}
		
		if (!problemData || !problemData?.contestId) {
			return toast.error('Contest not found');
		}
		try {
			setIsSubmitting(true);
			await submissionService.create({
				problemId: +problemId as number,
				contestId: problemData?.contestId,
				languageId: languageSubmit.id,
				sourceCode: code,
			});
			
			toast.success('Submitted successfully');
			await refetchSubmission();
		} catch (error: any) {
			toast.error(error?.message || 'Failed to submit solution');
		} finally {
			setIsSubmitting(false);
		}
	}
	const handleUploadFile = async (info: any) => {
		// check file type
		const allowFileExtension = LIST_LANGUAGE.find((lang: any) => lang.mode === language)?.fileExtension;
		if (!allowFileExtension) {
			return toast.error('Invalid file type');
		}
		
		if (info.file.name.split('.').pop() !== allowFileExtension) {
			return toast.error('Invalid file type');
		}
		const file = info.file;
		const fileContent = await readFileContent(file);
		setCode(fileContent as string);
		setUploadFile(file);
	}
	
	if (problemError) {
		return (
			<div>
				<Title level={2}>Problem not found</Title>
			</div>
		);
	}
	
	return (
		<div className="w-full">
			<Card className="mb-6">
				<Title level={2}>{
					problemData ? problemData?.problem?.problemName : 'Problem Title'
				}</Title>
				<div className="block mb-4"
				     dangerouslySetInnerHTML={{
					     __html: problemData ?
						     problemData?.problem?.problemStatement :
						     'Problem Description'
				     }}
				/>
			</Card>
			
			{/* Test Cases */}
			<Card title="Test Cases" className="mb-6">
				<Table
					dataSource={testCases}
					columns={testCaseColumns}
					pagination={false}
				/>
			</Card>
			
			{/* Code Editor Section */}
			<Card title="Solution" className="mb-6">
				<Tabs defaultActiveKey="1">
					<TabPane tab="Code Editor" key="1">
						<Flex justify={'space-between'} className={'mb-3'}>
							<Typography.Title level={4}>Source Code</Typography.Title>
							<Select
								style={{width: 200}}
								onChange={setLanguage}
								value={language}
							>
								{LIST_LANGUAGE.map((lang: any) => (
									<Select.Option key={lang.id} value={lang.mode}>
										{lang.name}
									</Select.Option>
								))}
							</Select>
						</Flex>
						<CodeEditor
							code={code}
							setCode={setCode}
							mode={language === 'cpp' ? 'c_cpp' : language}
						/>
					</TabPane>
					<TabPane tab="Upload File" key="2">
						<Flex gap={5}>
							<Upload
								beforeUpload={() => false}
								fileList={uploadFile ? [uploadFile as any] : []}
								maxCount={1}
								onChange={handleUploadFile}
							>
								<Button icon={<UploadOutlined/>}>Upload Solution File</Button>
							</Upload>
							<Select
								style={{width: 200}}
								onChange={setLanguage}
								value={language}
							>
								{LIST_LANGUAGE.map((lang: any) => (
									<Select.Option key={lang.id} value={lang.mode}>
										{lang.name}
									</Select.Option>
								))}
							</Select>
						</Flex>
					</TabPane>
				</Tabs>
				<div className="mt-4">
					<Button
						type="primary"
						className="mr-4"
						onClick={handleSubmit}
						loading={isSubmitting}
					>
						Submit Solution
					</Button>
				</div>
			</Card>
			
			{/* Submissions */}
			<Card title="Submissions">
				<Flex className={'align-self-end'}>
					<Input
						placeholder="Search by submission id"
						className="mr-4"
					/>
					<Button
						type="primary"
						className="mr-4"
						onClick={() => refetchSubmission()}
						icon={<IoReload/>}
					/>
				</Flex>
				<Table
					dataSource={submissionTableData}
					columns={submissionColumns}
					loading={submissionLoading}
					pagination={{
						current: submissionParams.page + 1,
						pageSize: submissionParams.limit,
						total: submissionData?.totalElements || 0,
						onChange: (page) => {
							setSubmissionParams({
								...submissionParams,
								page: page - 1,
							});
						}
					}}
				/>
			</Card>
			<SubmissionMessageModal
				open={submissionMessage.open}
				onClose={() => {
					setSubmissionMessage({
						open: false,
						error: '',
						message: '',
					});
				}}
				error={submissionMessage.error}
				message={submissionMessage.message}
			/>
		</div>
	);
};

export default UserProblemDetail;