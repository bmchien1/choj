import {useMemo, useState} from 'react';
import {Tabs, Card, Table, Tag, Flex, Typography, Input, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import {CalendarOutlined, TeamOutlined} from '@ant-design/icons';
import {useQuery} from "@tanstack/react-query";
import userContestService from "@/apis/service/userContestService.ts";
import moment from "moment";
import {formatObject, getContestStatusColor} from "@/utils";

const {TabPane} = Tabs;

const UserContestList = () => {
	const navigate = useNavigate();
	const [publicContestParams, setPublicContestParams] = useState({
		page: 0,
		limit: 10,
		q: "",
	})
	const [registeredContestParams, setRegisteredContestParams] = useState({
		page: 0,
		limit: 10,
		q: "",
	})
	
	const {
		data: publicContestData = {
			contents: [],
			totalElements: 0,
		},
		isLoading: publicContestLoading,
	} = useQuery({
		queryKey: ['userPublicContest', publicContestParams],
		queryFn: async ({queryKey}: any) => {
			const [, publicContestParams] = queryKey;
			return await userContestService.getAll(formatObject({
				...publicContestParams,
				isPublic: 'true',
			}));
		},
	})
	
	const {
		data: registeredContestData = {
			contents: [],
			totalElements: 0,
		},
		isLoading: registeredContestLoading
	} = useQuery({
		queryKey: ['userRegisteredContest', registeredContestParams],
		queryFn: async ({queryKey}: any) => {
			const [, registeredContestParams] = queryKey;
			return await userContestService.getAll(formatObject({
				...registeredContestParams,
				isPublic: 'false',
			}));
		},
	})
	
	const {contents: publicContests = [], totalElements: totalPublicContests} = publicContestData || {};
	
	const publicContestTableData = useMemo(() => {
		if (!publicContests.length) return [];
		return publicContests.map((contest: any) => ({
			title: contest?.contest?.contestName,
			startTime: moment(contest?.contest?.creatdAt).format('YYYY-MM-DD HH:mm'),
			createdBy: contest?.contest?.creator,
			status: contest?.contest?.status,
			key: contest.id,
			id: contest.id,
			contestId: contest.contestId,
		}))
	}, [publicContests]);
	
	const {contents: registeredContests = [], totalElements: totalRegisteredContests} = registeredContestData || {};
	
	const registeredContestTableData = useMemo(() => {
		if (!registeredContests.length) return [];
		return registeredContests.map((contest: any) => ({
			title: contest?.contest?.contestName,
			startTime: moment(contest?.contest?.creatdAt).format('YYYY-MM-DD HH:mm'),
			createdBy: contest?.contest?.creator,
			status: contest?.contest?.status,
			key: contest.id,
			id: contest.id,
			contestId: contest.contestId,
		}))
	}, [registeredContests]);
	
	const columns = [
		{
			title: 'Contest',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: any) => (
				<div className="cursor-pointer hover:text-blue-500" onClick={() => navigate(`/my-problems/${record.contestId}`)}>
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
	];
	
	return (
		<div className="w-full" style={{height: '100vh'}}>
			<Card style={{
				minHeight: '100vh',
			}}>
				<Tabs defaultActiveKey="1">
					<TabPane tab="Public Contests" key="1">
						<Flex align={'center'} justify={'space-between'}>
							<Typography.Title level={4}>Public Contests</Typography.Title>
							<Space>
								<Input
									allowClear
									placeholder="Search by title"
									size={'middle'}
									value={publicContestParams.q}
									onChange={(e) => {
										setPublicContestParams({
											...publicContestParams,
											q: e.target.value,
										})
									}}
								/>
							</Space>
						</Flex>
						<Table
							loading={publicContestLoading}
							dataSource={publicContestTableData}
							pagination={{
								current: publicContestParams.page + 1,
								total: totalPublicContests,
								pageSize: publicContestParams.limit,
								onChange: (page) => {
									setPublicContestParams({
										...publicContestParams,
										page: page - 1,
									})
								}
							}}
							columns={columns}
							scroll={{ x: '100%' }}
						/>
					</TabPane>
					<TabPane tab="Registered Contests" key="2">
						<Flex align={'center'} justify={'space-between'}>
							<Typography.Title level={4}>Registered Contests</Typography.Title>
							<Space>
								<Input
									allowClear
									placeholder="Search by title"
									size={'middle'}
									value={registeredContestParams.q}
									onChange={(e) => {
										setRegisteredContestParams({
											...registeredContestParams,
											q: e.target.value,
										})
									}}
								/>
							</Space>
						</Flex>
						<Table
							dataSource={registeredContestTableData}
							loading={registeredContestLoading}
							pagination={{
								current: registeredContestParams.page + 1,
								total: totalRegisteredContests,
								pageSize: registeredContestParams.limit,
								onChange: (page) => {
									setRegisteredContestParams({
										...registeredContestParams,
										page: page - 1,
									})
								}
							}}
							columns={columns}
							scroll={{ x: '100%' }}
						/>
					</TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default UserContestList;