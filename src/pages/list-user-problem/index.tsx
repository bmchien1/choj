import {useState, Key, useMemo} from 'react';
import {Table, Tag, Select, Input, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import {useQuery} from "@tanstack/react-query";
import userProblemService from "@/apis/service/userProblemService.ts";


const { Option } = Select;

interface Problem {
	id: number;
	title: string;
	difficulty: string;
	status: string;
}

const ProblemListPage = () => {
	const navigate = useNavigate();
	const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
	});
	
	const {
		data: listUserProblemData = {
			contents: [],
			totalElements: 0,
		},
		isLoading: listUserProblemLoading,
	} = useQuery({
		queryKey: ['listUserProblem', searchParams, difficultyFilter],
		queryFn: async ({queryKey}: any) => {
			const [, pageParams] = queryKey;
			return await userProblemService.getAll({
				page: pageParams.page,
				limit: pageParams.limit,
			});
		},
	})
	
	const {contents: listUserProblems = [], totalElements = 0} = listUserProblemData || {};
	
	const listProblemTableData = useMemo(() => {
		if(!listUserProblems) return [];
		return listUserProblems.map((problem: any) => ({
			id: problem.id,
			name: problem.problem.problemName,
			difficulty: problem.problem.difficulty,
			code: problem.problem.problemCode,
			point: problem.maxSubmittedPoint,
			tags: problem.problem.tags,
		}));
	} , [listUserProblems]);
	
	const columns = [
		{
			title: 'Title',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Code',
			dataIndex: 'code',
			key: 'code',
		},
		{
			title: 'Difficulty',
			dataIndex: 'difficulty',
			key: 'difficulty',
			filters: [
				{ text: 'Easy', value: 'Easy' },
				{ text: 'Medium', value: 'Medium' },
				{ text: 'Hard', value: 'Hard' },
			],
			onFilter: (value: string | Key | boolean, record: Problem) => record.difficulty === value,
			render: (difficulty: string) => {
				const color = difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'orange' : 'red';
				return <Tag color={color}>{difficulty}</Tag>;
			},
		},
		{
			title: 'Point',
			dataIndex: 'point',
			key: 'point',
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
				<Select
					placeholder="Filter by Difficulty"
					allowClear
					onChange={(value) => setDifficultyFilter(value)}
					style={{ width: 200 }}
				>
					<Option value="Easy">Easy</Option>
					<Option value="Medium">Medium</Option>
					<Option value="Hard">Hard</Option>
				</Select>
				<Input
					placeholder="Search by title"
					prefix={<SearchOutlined />}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{ width: 200 }}
				/>
			</Space>
			<Table
				columns={columns}
				dataSource={listProblemTableData}
				loading={listUserProblemLoading}
				rowKey="id"
				onRow={(record: any) => {
					return {
						onClick: () => {
							navigate(`/problems/${record.id}`);
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

export default ProblemListPage;
