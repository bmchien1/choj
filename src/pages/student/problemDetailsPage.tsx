import {useState} from 'react';
import {Typography, Card, Table, Upload, Button, Tabs} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const ProblemDetail = () => {
	const [code, setCode] = useState('// Write your code here');
	
	// Mock data for test cases
	const testCases = [
		{
			key: '1',
			input: '1 2',
			expectedOutput: '3',
			explanation: 'Sum of 1 and 2'
		},
		{
			key: '2',
			input: '5 3',
			expectedOutput: '8',
			explanation: 'Sum of 5 and 3'
		}
	];
	
	// Mock data for submissions
	const submissions = [
		{
			key: '1',
			timestamp: '2023-07-20 10:30',
			status: 'Accepted',
			runtime: '0.5s',
			memory: '5.2MB'
		},
		{
			key: '2',
			timestamp: '2023-07-20 10:25',
			status: 'Wrong Answer',
			runtime: '0.3s',
			memory: '5.0MB'
		}
	];
	
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
		{
			title: 'Explanation',
			dataIndex: 'explanation',
			key: 'explanation',
		}
	];
	
	const submissionColumns = [
		{
			title: 'Timestamp',
			dataIndex: 'timestamp',
			key: 'timestamp',
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
			title: 'Runtime',
			dataIndex: 'runtime',
			key: 'runtime',
		},
		{
			title: 'Memory',
			dataIndex: 'memory',
			key: 'memory',
		}
	];
	
	return (
			<div className="w-full">
				{/* Problem Title and Description */}
				<Card className="mb-6">
					<Title level={2}>Two Sum</Title>
					<Text className="block mb-4">
						Given an array of integers nums and an integer target, return indices of the two numbers such that they add
						up to target. You may assume that each input would have exactly one solution, and you may not use the same
						element twice.
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
							<div className="h-96">
								<AceEditor
									mode="javascript"
									theme="monokai"
									onChange={setCode}
									value={code}
									fontSize={14}
									editorProps={{$blockScrolling: true}}
									setOptions={{
										enableBasicAutocompletion: true,
										enableLiveAutocompletion: true,
										enableSnippets: true,
										showLineNumbers: true,
										tabSize: 2,
									}}
									style={{width: '100%', height: '100%'}}
								/>
							</div>
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
						<Button>Run Test Cases</Button>
					</div>
				</Card>
				
				{/* Submissions */}
				<Card title="Submissions">
					<Table
						dataSource={submissions}
						columns={submissionColumns}
					/>
				</Card>
			</div>
	);
};

export default ProblemDetail;