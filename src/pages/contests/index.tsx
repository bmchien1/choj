import {useState, Key, useMemo} from 'react';
import {Table, Tag, Select, Input, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import {useQuery} from "@tanstack/react-query";
import userContestService from "@/apis/service/userContestService.ts";


const { Option } = Select;

interface Contest {
	id: number;
	title: string;
	difficulty: string;
	status: string;
}

// test
const mockUserContests = (params: { page: number; limit: number }) => {
	const allContests = Array.from({ length: 50 }, (_, index) => ({
	  id: index + 1,
	  contest: {
		contestName: `Contest ${index + 1}`,
		difficulty: ['Easy', 'Medium', 'Hard'][index % 3],
		contestCode: `P-${index + 1}`,
		tags: ['Math', 'Graph', 'DP'].filter((_, i) => i <= index % 3),
	  },
	  maxSubmittedPoint: Math.floor(Math.random() * 100),
	}));
  
	const start = params.page * params.limit;
	const end = start + params.limit;
	return {
	  contents: allContests.slice(start, end),
	  totalElements: allContests.length,
	};
  };

const ContestListPage = () => {
	const navigate = useNavigate();
	const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
	});
	
	const {
		data: listUserContestData = {
			contents: [],
			totalElements: 0,
		},
		isLoading: listUserContestLoading,
	} = useQuery({
		queryKey: ['listUserContest', searchParams, difficultyFilter],
		queryFn: async ({queryKey}: any) => {
			const [, pageParams] = queryKey;
			// return await userContestService.getAll({
			// 	page: pageParams.page,
			// 	limit: pageParams.limit,
			// });

			// test
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockUserContests(pageParams);
		},
	})
	
	const {contents: listUserContests = [], totalElements = 0} = listUserContestData || {};
	
	const listContestTableData = useMemo(() => {
		if(!listUserContests) return [];
		return listUserContests.map((contest: any) => ({
			id: contest.id,
			name: contest.contest.contestName,
			difficulty: contest.contest.difficulty,
			code: contest.contest.contestCode,
			point: contest.maxSubmittedPoint,
			tags: contest.contest.tags,
		}));
	} , [listUserContests]);
	
	const columns = [
		{
			title: 'Title',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Tags',
			dataIndex: 'tags',
			key: 'tags',
			render: (tags: any[]) => (
				<>
					{tags.map((tag: any) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</>
			),
		},
	];
	
	return (
		<div style={{ padding: '16px', background: '#fff', minHeight: '100vh' }}>
			<Space style={{ marginBottom: 16 }}>
				<Input
					placeholder="Search by title"
					prefix={<SearchOutlined />}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{ width: 1620 }}
				/>
			</Space>
			<Table
				columns={columns}
				dataSource={listContestTableData}
				loading={listUserContestLoading}
				rowKey="id"
				onRow={(record: any) => {
					return {
						onClick: () => {
							navigate(`/contests/${record.id}`);
						},
					};
				}}
				pagination={{
					current: searchParams.page + 1,
					total: totalElements,
					pageSize: searchParams.limit,
					onChange: (page) => {
						setSearchParams({
							...searchParams,
							page: page - 1,
						});
					},
				}}
				style={{ width: '100%' }}
				scroll={{ x: '100%' }}
			/>
		</div>
	);
};

export default ContestListPage;
