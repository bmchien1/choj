import {useMemo, useState} from 'react';
import {Flex, Input, Select, Table, Tag, Typography} from 'antd';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {CalendarOutlined} from '@ant-design/icons';
import {formatObject} from "@/utils";
import {useQuery} from "@tanstack/react-query";
import moment from "moment/moment";
import problemService from "@/apis/service/problemService.ts";
import debounce from "lodash/debounce";
const {Text} = Typography
const {Option} = Select

const ListProblem = () => {
	const navigate = useNavigate();
	const [urlParams] = useSearchParams()
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
		problemName: "",
		difficulty: ""
	})
	const [searchText, setSearchText] = useState<string>("")
	
	const {
		data: listProblemData = {
			contents: [],
			totalElements: 0
		},
		isLoading: listProblemLoading,
	} = useQuery({
		queryKey: ['allProblems', searchParams, urlParams.get("contest")],
		queryFn: async ({queryKey}: any) => {
			const [, searchParams, contestId] = queryKey;
			return await problemService.getAll(formatObject({
				...searchParams,
				contestId
			}));
		}
	})
	
	const {contents: listProblems = [], totalElements: totalProblem} = listProblemData || {};
	
	const listProblemTableData = useMemo(() => {
		if (!listProblems) return [];
		return listProblems.map((problem: any) => ({
			...problem,
			createdAt: moment(problem.createdAt).format('YYYY-MM-DD HH:mm')
		}));
	}, [listProblems]);
	
	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				setSearchParams({
					...searchParams,
					problemName: value
				})
			}, 500),
		[]
	);
	
	const columns = [
		{
			title: 'Problem',
			dataIndex: 'problemName',
			key: 'problemName',
			render: (text: string, record: any) => (
				<div className="cursor-pointer hover:text-blue-500" onClick={() => navigate(`/problem-detail/${record.id}`)}>
					{text}
				</div>
			),
		},
		{
			title: 'Code',
			dataIndex: 'problemCode',
			key: 'problemCode',
			render: (text: string) => (
				<Text>
					{text}
				</Text>
			),
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (text: string) => (
				<span>
          <CalendarOutlined className="mr-2"/>
					{text}
        </span>
			),
		},
		{
			title: 'Difficulty',
			key: 'difficulty',
			dataIndex: 'difficulty',
			render: (difficulty: string) => {
				const color = difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'orange' : 'red';
				return (
					<Tag color={color}>{difficulty}</Tag>
				)
			},
		},
		{
			title: 'Max Submissions Count',
			dataIndex: 'maxTimeCommit',
			key: 'maxTimeCommit',
			render: (text: any) => (
				<Text>
					{text ? text : 'Unlimited'}
				</Text>
			),
		},
		{
			title: 'Tag',
			key: 'tags',
			dataIndex: 'tags',
			render: (tags: string[]) => {
				return (
					<div className={'flex flex-wrap'}>
						{tags.map((tag: string, index: number) => (
							<Tag key={index}>{tag}</Tag>
						))}
					</div>
				)
			},
			width: 150
		}
	];
	
	return (
		<div className="w-full">
			<Flex className={'mb-3'} gap={10}>
					<Input
							placeholder={"Search by name"}
							className={'w-96'}
							value={searchText}
							onChange={(e) => {
									setSearchText(e.target.value)
									debouncedSearch(e.target.value)
							}}
					/>
				<Select
					value={searchParams.difficulty}
					className={'w-32'}
					onChange={(value) => {
						 setSearchParams({
							 ...searchParams,
							 difficulty: value
						 })
					}}
				>
						<Option value={""}>All</Option>
						<Option value={'easy'}>Easy</Option>
						<Option value={'medium'}>Medium</Option>
						<Option value={'hard'}>Hard</Option>
				</Select>
			</Flex>
			<Table
				dataSource={listProblemTableData}
				columns={columns}
				loading={listProblemLoading}
				pagination={{
					current: searchParams.page + 1,
					total: totalProblem,
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

export default ListProblem;