import {useMemo, useState} from 'react';
import {Popconfirm, Table, Tag} from 'antd';
import {useNavigate} from 'react-router-dom';
import {CalendarOutlined, TeamOutlined} from '@ant-design/icons';
import {formatObject, getContestStatusColor} from "@/utils";
import {useQuery} from "@tanstack/react-query";
import contestService from "@/apis/service/contestService.ts";
import moment from "moment/moment";
import {HiPencilAlt} from "react-icons/hi";
import {BiTrash} from "react-icons/bi";
import toast from "react-hot-toast";

const ListAdminContest = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
		q: ""
	})
	
	const {
		data: listContestData = {
			contents: [],
			totalElements: 0
		},
		isLoading: listContestLoading,
		refetch: refetchListContest
	} = useQuery({
		queryKey: ['allAdminContests', searchParams],
		queryFn: async ({queryKey}: any) => {
			const [, searchParams] = queryKey;
			return await contestService.getAllAdmin(formatObject(searchParams));
		}
	})
	
	const {contents: listContests = [], totalElements: totalContests} = listContestData || {};
	
	const listContestsTableData = useMemo(() => {
		if (!listContests) return [];
		return listContests.map((contest: any) => ({
			title: contest?.contestName,
			startTime: moment(contest?.creatdAt).format('YYYY-MM-DD HH:mm'),
			createdBy: contest?.creator,
			status: contest?.status,
			key: contest.id,
			id: contest.id
		}));
	}, [listContests]);
	
	
	const handleDeleteContest = async (id: number) => {
		try {
			await contestService.delete(id);
			await refetchListContest();
			toast.success('Delete contest successfully')
		} catch (error) {
			console.log(error)
			toast.error('Delete contest failed')
		}
	}
	
	const columns = [
		{
			title: 'Contest',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: any) => (
				<div className="cursor-pointer hover:text-blue-500"
				     onClick={() => navigate(`/list-problem?contest=${record.id}`)}>
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
				<div className={'flex items-center'}>
					<div className="cursor-pointer hover:text-blue-500"
					     onClick={() => navigate(`/admin/contest/edit/${record.id}`)}>
						<HiPencilAlt size={20}/>
					</div>
					
					<Popconfirm
						title="Are you sure to delete this contest?"
						onConfirm={() => handleDeleteContest(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<BiTrash
							size={20}
							className="cursor-pointer hover:text-red-500"
						/>
					</Popconfirm>
				</div>
			),
		},
	];
	
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

export default ListAdminContest;