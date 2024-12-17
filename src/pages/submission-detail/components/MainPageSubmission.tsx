import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import submissionService from "@/apis/service/submissionService.ts";
import {Card, Descriptions, Table, Tag} from "antd";
import {useEffect, useMemo, useState} from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-monokai";
import {FaCircleInfo} from "react-icons/fa6";
import {LIST_LANGUAGE} from "@/constants/data.ts";
import {getSubmissionStatusTagColor} from "@/utils";
import {SubmissionStatus} from "@/constants/types.ts";
import moment from "moment";
import {CopyableBox} from "@/components";
import SubmissionTestCaseDetail from "@/pages/submission-detail/components/SubmissionTestCaseDetail.tsx";

const MainPageSubmission = ({isAdmin}: {isAdmin: boolean}) => {
	
	const {id: submissionHash} = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [sourceCodeHeight, setSourceCodeHeight] = useState('auto');
	const [submissionTestCaseSelected, setSubmissionTestCaseSelected] = useState({
		open: false,
		userInput: '',
		expectedOutput: '',
		userOutput: '',
	});
	
	const {
		data: submissionData,
		error: submissionError,
		isLoading: submissionLoading,
	} = useQuery({
		queryKey: ['submissionDetail', submissionHash, isAdmin],
		queryFn: async ({queryKey}) => {
			const [, _submissionHash, _isAdmin] = queryKey;
			if (!_submissionHash) return null;
			if(_isAdmin) {
				return await submissionService.getByHashAdmin(_submissionHash as string);
			}
			return await submissionService.getByHash(_submissionHash as string);
		},
		enabled: !!submissionHash
	})
	
	useEffect(() => {
		if (!submissionData) return;
		const lineHeight = 20;
		
		const sourceCodeText = submissionData.sourceCode || '';
		const sourceCodeNumberOfLines = (sourceCodeText.match(/\n/g) || []).length + 1;
		const sourceCodeNewHeight = sourceCodeNumberOfLines * lineHeight;
		if (sourceCodeNewHeight > 500) {
			setSourceCodeHeight('500px');
		} else {
			setSourceCodeHeight(`${sourceCodeNewHeight}px`);
		}
	}, [submissionData]);
	
	const testCaseColumns = [
		{
			title: 'Point',
			dataIndex: 'point',
			key: 'point',
		},
		{
			title: 'Message',
			dataIndex: 'message',
			key: 'message',
		},
		{
			title: 'Passed',
			dataIndex: 'isSuccess',
			key: 'isSuccess',
			render: (isSuccess: boolean) => isSuccess ? 'Yes' : 'No'
		},
		{
			title: 'Detail',
			key: 'detail',
			render: (_: string, record: any) => {
				return (
					<FaCircleInfo
						className={'cursor-pointer'}
						size={20}
						color={'#1890ff'}
						onClick={() => {
							setSubmissionTestCaseSelected({
								open: true,
								userInput: record?.input,
								expectedOutput: record?.expectedOutput,
								userOutput: record?.userOutput,
							});
						}}
					/>
				)
			}
		},
	]
	
	const {languageMode, languageName} = useMemo(() => {
		if (!submissionData) return {
			languageMode: 'text',
			languageName: 'Custom'
		};
		const languageFound = LIST_LANGUAGE.find((lang: any) => lang.id === submissionData.languageId);
		return {
			languageMode: languageFound?.mode || 'text',
			languageName: languageFound?.name || 'Custom'
		};
	}, [submissionData]);
	
	
	if (submissionLoading) {
		return <div>Loading...</div>
	}
	
	if (submissionError) {
		return <div>Submission not found</div>
	}
	
	return (
		<div className={'w-full'}>
			<Card title={'Submission detail'} className={'mb-6'}>
				<Descriptions>
					<Descriptions.Item label={'Status'}>
						<Tag color={getSubmissionStatusTagColor(submissionData?.status || SubmissionStatus.PENDING)}>
							{submissionData?.status.toUpperCase()}
						</Tag>
					</Descriptions.Item>
					<Descriptions.Item label={'Pass'}>
						{submissionData?.testCasePassed} / {submissionData?.testCases?.length}
					</Descriptions.Item>
					<Descriptions.Item label={'Point'}>
						{submissionData?.point}
					</Descriptions.Item>
					<Descriptions.Item label={'Language'}>
						{languageName}
					</Descriptions.Item>
					<Descriptions.Item label={'Submitted by'}>
						{submissionData?.user?.email}
					</Descriptions.Item>
					<Descriptions.Item label={'Submitted at'}>
						{moment(submissionData?.submissionDate).format('DD/MM/YYYY HH:mm:ss')}
					</Descriptions.Item>
					<Descriptions.Item label={'Last modified'}>
						{moment(submissionData?.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
					</Descriptions.Item>
					<Descriptions.Item label={'Problem'}>
						<div className="cursor-pointer hover:text-blue-500"
						     onClick={() => {
									 if(!isAdmin) {
										 navigate(`/my-problems-detail/${submissionData?.problemId}`)
									 }
						     }}>
							{submissionData?.problem?.problemName}
						</div>
					</Descriptions.Item>
					<Descriptions.Item label={'Contest'}>
						<div
							className="cursor-pointer hover:text-blue-500"
							onClick={() => {
								if(!isAdmin) {
									navigate(`/my-contest-detail/${submissionData?.contestId}`)
								}
							}}
						>
							{submissionData?.contest?.contestName}
						</div>
					</Descriptions.Item>
				</Descriptions>
			</Card>
			<Card className="mb-6" title={'Message'}>
				<CopyableBox
					text={submissionData?.error || submissionData?.message}
					displayText={submissionData?.error || submissionData?.message}
				/>
			</Card>
			
			<Card title="Test Cases" className="mb-6">
				<Table
					dataSource={submissionData?.testCases}
					columns={testCaseColumns}
					pagination={false}
					rowKey={'id'}
				/>
			</Card>
			
			<Card
				title={"Source code"}
				className={'mb-6'}
			>
				<AceEditor
					mode={languageMode}
					theme="monokai"
					value={submissionData?.sourceCode}
					fontSize={14}
					highlightActiveLine={true}
					readOnly={true}
					setOptions={{
						showLineNumbers: true,
						tabSize: 2,
					}}
					editorProps={{$blockScrolling: false}}
					style={{width: '100%', height: sourceCodeHeight}}
				/>
			</Card>
			<SubmissionTestCaseDetail
				open={submissionTestCaseSelected.open}
				onClose={() => {
					setSubmissionTestCaseSelected({
						open: false,
						userInput: '',
						expectedOutput: '',
						userOutput: '',
					});
				}}
				input={submissionTestCaseSelected.userInput}
				expectedOutput={submissionTestCaseSelected.expectedOutput}
				userOutput={submissionTestCaseSelected.userOutput}
			/>
		</div>
	)
}

export default MainPageSubmission;