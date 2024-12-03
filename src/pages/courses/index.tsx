import {useState, Key, useMemo} from 'react';
import {Table, Tag, Select, Input, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import {useQuery} from "@tanstack/react-query";
import userCourseService from "@/apis/service/userCourseService.ts";


const { Option } = Select;

interface Course {
	id: number;
	title: string;
	difficulty: string;
	status: string;
}

// test
const mockUserCourses = (params: { page: number; limit: number }) => {
	const allCourses = Array.from({ length: 50 }, (_, index) => ({
	  id: index + 1,
	  course: {
		courseName: `Course ${index + 1}`,
		difficulty: ['Easy', 'Medium', 'Hard'][index % 3],
		courseCode: `P-${index + 1}`,
		tags: ['Math', 'Graph', 'DP'].filter((_, i) => i <= index % 3),
	  },
	  maxSubmittedPoint: Math.floor(Math.random() * 100),
	}));
  
	const start = params.page * params.limit;
	const end = start + params.limit;
	return {
	  contents: allCourses.slice(start, end),
	  totalElements: allCourses.length,
	};
  };

const CourseListPage = () => {
	const navigate = useNavigate();
	const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
	});
	
	const {
		data: listUserCourseData = {
			contents: [],
			totalElements: 0,
		},
		isLoading: listUserCourseLoading,
	} = useQuery({
		queryKey: ['listUserCourse', searchParams, difficultyFilter],
		queryFn: async ({queryKey}: any) => {
			const [, pageParams] = queryKey;
			// return await userCourseService.getAll({
			// 	page: pageParams.page,
			// 	limit: pageParams.limit,
			// });

			// test
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockUserCourses(pageParams);
		},
	})
	
	const {contents: listUserCourses = [], totalElements = 0} = listUserCourseData || {};
	
	const listCourseTableData = useMemo(() => {
		if(!listUserCourses) return [];
		return listUserCourses.map((course: any) => ({
			id: course.id,
			name: course.course.courseName,
			difficulty: course.course.difficulty,
			code: course.course.courseCode,
			point: course.maxSubmittedPoint,
			tags: course.course.tags,
		}));
	} , [listUserCourses]);
	
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
				dataSource={listCourseTableData}
				loading={listUserCourseLoading}
				rowKey="id"
				onRow={(record: any) => {
					return {
						onClick: () => {
							navigate(`/courses/${record.id}`);
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

export default CourseListPage;
