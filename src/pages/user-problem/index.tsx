import {useEffect, useMemo, useState} from 'react';
import {Typography, Card, Table, Upload, Button, Tabs, Select, Flex} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import CodeEditor from "@/pages/user-problem/components/CodeEditor.tsx";
import {defaultCode} from "@/pages/user-problem/constant";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import userProblemService from "@/apis/service/userProblemService.ts";
import submissionService from "@/apis/service/submissionService.ts";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const ProblemDetail = () => {
	const {problemId} = useParams();
	const [code, setCode] = useState('// Write your code here');
	const [language, setLanguage] = useState('cpp');
	const [submissionParams] = useState({
		page: 0,
		limit: 10,
	});
	
	const {
		data: problemData,
		error: problemError,
	} = useQuery({
		queryKey: ['userProblem', problemId],
		queryFn: async ({queryKey}) => {
			const [, _problemId] = queryKey;
			if(!_problemId) return null;
			return await userProblemService.getByProblemId(_problemId);
		},
		enabled: !!problemId
	})
	
	const {
		data: submissionData = {
			contents: [],
		}
	} = useQuery({
		queryKey: ['userSubmission', problemId, submissionParams],
		queryFn: async ({queryKey}: any) => {
			const [, _problemId, pageParams] = queryKey;
			if(!_problemId) return null;
			return await submissionService.getAll({
				page: pageParams.page,
				limit: pageParams.limit,
			});
		},
		enabled: !!problemId
	})
	
	
	useEffect(() => {
		setCode(defaultCode[language as keyof typeof defaultCode].code);
	}, [language]);
	
	// Mock data for test cases
	const testCases = useMemo(() => {
		if(!problemData) return [];
		return problemData?.problem?.testCases.map((testCase: any, index: number) => ({
			key: index,
			input: testCase.input,
			expectedOutput: testCase.output,
		}));
	}, [problemData]);
	
	const {contents: submissions} = submissionData;
	
	const submissionTableData = useMemo(() => {
		if (!submissions) return [];
		return submissions.map((submission: any, index: number) => ({
			key: index,
			id: submission.submissionHash,
			timestamp: submission.submissionDate,
			status: submission.status,
			message: submission.message,
			point: submission.point,
		}));
	}, [submissions]);
	
	const testCaseColumns = [
		{
			title: 'Input',
			dataIndex: 'input',
			key: 'input',
		},
		{
			title: 'Expected Output',
			dataIndex: 'expectedOutput',
			key: 'expectedOutput',
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
					<Text>{shortId}</Text>
				);
			}
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Text className={status === 'Accepted' ? 'text-green-500' : 'text-red-500'}>
					{status}
				</Text>
			),
		},
		{
			title: 'Message',
			dataIndex: 'message',
			key: 'message',
		},
		{
			title: 'Point',
			dataIndex: 'point',
			key: 'point',
		},
		{
			title: 'At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (timestamp: string) => {
				const date = new Date(timestamp);
				return (
					<Text>{date.toLocaleString()}</Text>
				);
			}
		}
	];
	
	if(problemError) {
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
				<Text className="block mb-4">
					{problemData ? problemData?.problem?.problemStatement : 'Problem Description'}
				</Text>
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
								defaultValue="cpp"
								style={{width: 120}}
								onChange={setLanguage}
							>
								{Object.keys(defaultCode).map((lang: any) => (
									<Select.Option key={lang} value={lang}>
										{lang.mode}
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
						<Upload>
							<Button icon={<UploadOutlined/>}>Upload Solution File</Button>
						</Upload>
					</TabPane>
				</Tabs>
				<div className="mt-4">
					<Button type="primary" className="mr-4">
						Submit Solution
					</Button>
				</div>
			</Card>
			
			{/* Submissions */}
			<Card title="Submissions">
				<Table
					dataSource={submissionTableData}
					columns={submissionColumns}
				/>
			</Card>
		</div>
	);
};

export default ProblemDetail;