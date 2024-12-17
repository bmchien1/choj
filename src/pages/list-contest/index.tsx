import {useMemo, useState} from 'react';
import {Table, Tag, Button} from 'antd';
import {useNavigate} from 'react-router-dom';
import {CalendarOutlined, TeamOutlined} from '@ant-design/icons';
import {formatObject, getContestStatusColor} from "@/utils";
import {useQuery} from "@tanstack/react-query";
import contestService from "@/apis/service/contestService.ts";
import {ContestStatus} from "@/constants/types.ts";
import moment from "moment/moment";
import joinContestService from "@/apis/service/joinContestService.ts";
import toast from "react-hot-toast";

const UserContestList = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
		q: ""
	})
	const [isLoadingData, setIsLoadingData] = useState<{
		id: number | null,
		loading: boolean
	}>({
		id: null,
		loading: false
	});
	
	const {
		data: listContestData = {
			contents: [],
			totalElements: 0
		},
		isLoading: listContestLoading,
		refetch: refetchContest
	} = useQuery({
		queryKey: ['allContests', searchParams],
		queryFn: async ({queryKey}: any) => {
			const [, searchParams] = queryKey;
			return await contestService.getAll(formatObject(searchParams));
		}
	})
	
	const {listContests, totalContests} = useMemo(() => {
		return {
			listContests: listContestData?.contents || [],
			totalContests: listContestData?.totalElements || 0
		}
	}, [listContestData]);
	
	const {
		data: listRequestData = {
			contents: [],
		},
		refetch: refetchRequest
	} = useQuery({
		queryKey: ['allUserRequests', listContests],
		queryFn: async ({queryKey}: any) => {
			const [, _listContests] = queryKey;
			const listContestIds = _listContests.map((contest: any) => contest.id).join(',');
			const res = await joinContestService.getMyRequests({
				page: 0,
				limit: _listContests.length,
				listContestIds: listContestIds,
				status: 0
			})
			return res;
		},
		enabled: !!listContests
	})
	
	const listContestsTableData = useMemo(() => {
		if (!listContests) return [];
		const listRequests = listRequestData?.contents || [];
		return listContests.map((contest: any) => ({
			title: contest?.contestName,
			startTime: moment(contest?.creatdAt).format('YYYY-MM-DD HH:mm'),
			createdBy: contest?.creator,
			status: contest?.status,
			key: contest.id,
			isJoined: contest?.isJoined,
			id: contest.id,
			isWaiting: listRequests.some((request: any) => request.contestId === contest.id && request.status === 0)
		}));
	}, [listContests, listRequestData]);
	
	const columns = [
		{
			title: 'Contest',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: any) => (
				<div className="cursor-pointer hover:text-blue-500" onClick={() => navigate(`/list-problem?contest=${record.id}`)}>
					{text}
				</div>
			),
		},
		{
			title: 'Start Time',
			dataIndex: 'startTime',
			key: 'startTime',
			render: (text: string) => (
				<span>
          <CalendarOutlined className="mr-2"/>
					{text}
        </span>
			),
		},
		{
			title: 'Created By',
			dataIndex: 'createdBy',
			key: 'createdBy',
			render: (text: string) => (
				<span>
					<TeamOutlined className="mr-2"/>
					{text}
				</span>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={getContestStatusColor(status)}>
					{status}
				</Tag>
			),
		},
		{
			title: 'Action',
			key: 'action',
			render: (_: any, record: any) => (
				<Button
					type="primary"
					disabled={record.status === ContestStatus.COMPLETED || record.isJoined || record.isWaiting}
					onClick={() => handleRegister(record.id).then()}
					loading={isLoadingData.loading && isLoadingData.id === record.id}
				>
					{record.isJoined ? 'Registered' : record.isWaiting ? 'Waiting' : 'Register'}
				</Button>
			),
		},
	];
	
	const handleRegister = async (contestId: number) => {
		try {
			const isWaiting = listContestsTableData.find((contest: any) => contest.id === contestId)?.isWaiting;
			if (isWaiting) return toast.error('You are already in the waiting list');
			
			setIsLoadingData({
				id: contestId,
				loading: true
			});
			
			await joinContestService.create(contestId);
			await refetchContest();
			await refetchRequest();
			toast.success('Your request has been sent');
		} catch (error) {
			console.error('Error registering contest:', error);
			toast.error('Failed to register contest');
		} finally {
			setIsLoadingData({
				id: null,
				loading: false
			});
		}
	};
	
	return (
		<div className="w-full">
			<Table
				dataSource={listContestsTableData}
				columns={columns}
				loading={listContestLoading}
				pagination={{
					current: searchParams.page + 1,
					total: totalContests,
					pageSize: searchParams.limit,
					onChange: (page) => {
						setSearchParams({
							...searchParams,
							page: page - 1,
						})
					}
				}}
			/>
		</div>
	);
};

export default UserContestList;