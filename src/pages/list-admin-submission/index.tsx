import {Flex, Input, Table, Tag} from "antd";
import {formatObject, getSubmissionStatusTagColor} from "@/utils";
import {FaCircleInfo} from "react-icons/fa6";
import {useQuery} from "@tanstack/react-query";
import submissionService from "@/apis/service/submissionService.ts";
import {useNavigate} from "react-router-dom";
import {useMemo, useState} from "react";
import moment from "moment/moment";
import {LIST_LANGUAGE} from "@/constants/data.ts";
import debounce from "lodash/debounce";
import SubmissionMessageModal from "@/pages/user-problem/components/SubmissionMessageModal.tsx";

const ListAdminSubmission = () => {
	const navigate = useNavigate()
	const [submissionMessage, setSubmissionMessage] = useState({
		open: false,
		error: '',
		message: '',
	});
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
		userEmail: ''
	})
	
	const [searchText, setSearchText] = useState<string>("")
	
	const {
		data: submissionData = {
			contents: [],
			totalElements: 0
		},
		isLoading: submissionLoading,
	} = useQuery({
		queryKey: ['allSubmission', searchParams],
		queryFn: async ({queryKey}: any) => {
			const [, _searchParams] = queryKey;
			return await submissionService.getAllAdmin(formatObject(_searchParams));
		},
	})
	
	const {totalElements: totalCommissions} = submissionData || {}
	
	const submissionTableData = useMemo(() => {
		const submissions = submissionData?.contents || []
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
			userEmail: submission.user.email,
		}));
	}, [submissionData]);
	
	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				setSearchParams({
					...searchParams,
					userEmail: value
				})
			}, 500),
		[]
	);
	
	const submissionColumns = [
		{
			title: 'Id',
			dataIndex: 'id',
			key: 'id',
			render: (id: string) => {
				const shortId = id.slice(0, 6);
				return (
					<div className="cursor-pointer hover:text-blue-500"
					     onClick={() => navigate(`/admin/submission-detail/${id}`)}>
						{shortId}
					</div>
				);
			}
		},
		{
			title: 'Owner',
			dataIndex: 'userEmail',
			key: 'userEmail',
			render: (email: string) => {
				return (
					<div>{email}</div>
				)
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
					<div className={'font-semibold'}>{point}</div>
				);
			}
		},
		{
			title: 'Submitted at',
			dataIndex: 'timestamp',
			key: 'timestamp',
		}
	];
	
	return (
		<div className="w-full">
			<Flex className={'mb-3'} gap={10}>
				<Input
					placeholder={"Search by email"}
					className={'w-96'}
					value={searchText}
					onChange={(e) => {
						setSearchText(e.target.value)
						debouncedSearch(e.target.value)
					}}
				/>
			</Flex>
			<Table
				dataSource={submissionTableData}
				columns={submissionColumns}
				loading={submissionLoading}
				pagination={{
					current: searchParams.page + 1,
					total: totalCommissions,
					pageSize: searchParams.limit,
					onChange: (page) => {
						setSearchParams({
							...searchParams,
							page: page - 1,
						})
					}
				}}
			/>
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
	)
}

export default ListAdminSubmission