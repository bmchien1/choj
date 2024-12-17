import {useMemo, useState} from 'react';
import {Flex, Input, Popconfirm, Select, Spin, Table, Tag, Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import {CalendarOutlined} from '@ant-design/icons';
import {formatObject} from "@/utils";
import {useQuery} from "@tanstack/react-query";
import moment from "moment/moment";
import problemService from "@/apis/service/problemService.ts";
import debounce from "lodash/debounce";
import {Contest} from "@/apis/type.ts";
import contestService from "@/apis/service/contestService.ts";
import {HiPencilAlt} from 'react-icons/hi';
import {BiTrash} from "react-icons/bi";
import toast from "react-hot-toast";

const {Text} = Typography
const {Option} = Select

const ListAdminProblem = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useState({
		page: 0,
		limit: 10,
		problemName: "",
		difficulty: "",
		contestId: "",
	})
	const [searchText, setSearchText] = useState<string>("")
	
	const {
		data: listProblemData = {
			contents: [],
			totalElements: 0
		},
		isLoading: listProblemLoading,
		refetch: refetchListProblem
	} = useQuery({
		queryKey: ['allAdminProblems', searchParams],
		queryFn: async ({queryKey}: any) => {
			const [, searchParams] = queryKey;
			return await problemService.getAllAdmin(formatObject({
				...searchParams,
			}));
		}
	})
	
	const {
		data: contestsData = {
			contents: [],
		},
		isFetching: isContestsFetching,
	} = useQuery({
		queryKey: ['contests', searchText],
		queryFn: async ({queryKey}) => {
			const [, searchText] = queryKey;
			return await contestService.getAllAdmin({
				page: 0,
				limit: 100,
				q: searchText,
			})
		}
	})
	
	const {contents: listProblems = [], totalElements: totalProblem} = listProblemData || {};
	
	const listProblemTableData = useMemo(() => {
		if (!listProblems) return [];
		return listProblems.map((problem: any) => ({
			...problem,
			createdAt: moment(problem.createdAt).format('YYYY-MM-DD'),
			contest: problem.contest?.contestName
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
	
	
	const contests = useMemo(() => {
		return contestsData.contents;
	}, [contestsData]);
	
	const debouncedSearchContest = useMemo(
		() =>
			debounce((value: string) => {
				setSearchText(value);
			}, 500),
		[]
	);
	
	const handleDeleteProblem = async (id: number) => {
		try {
			await problemService.deleteProblem(id);
			await refetchListProblem();
			toast.success('Delete problem successfully')
		} catch (error) {
			console.log(error)
			toast.error('Delete problem failed')
		}
	}
	
	const columns = [
		{
			title: 'Problem',
			dataIndex: 'problemName',
			key: 'problemName',
			render: (text: string) => (
				<Text>
					{text}
				</Text>
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
			title: 'Contest',
			dataIndex: 'contest',
			key: 'contest',
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
				<div>
					{text ? text : 'Unlimited'}
				</div>
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
		},
		{
			title: 'Action',
			key: 'action',
			render: (_: string, record: any) => (
				<Flex gap={2}>
					<div className="cursor-pointer hover:text-blue-500"
					     onClick={() => navigate(`/admin/problem/edit/${record.id}`)}>
						<HiPencilAlt size={20}/>
					</div>
					<Popconfirm
						title="Are you sure to delete this problem?"
						onConfirm={() => handleDeleteProblem(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<BiTrash
							size={20}
							className="cursor-pointer hover:text-red-500"
						/>
					</Popconfirm>
				</Flex>
			),
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
				<Select
					showSearch
					placeholder="Search contest"
					notFoundContent={isContestsFetching ? <Spin size="small"/> : 'No contest found'}
					onSearch={debouncedSearchContest}
					loading={isContestsFetching}
					defaultActiveFirstOption={false}
					showArrow={false}
					allowClear={true}
					className={'w-60'}
					value={searchParams.contestId}
					onChange={(value) => {
						setSearchParams({
							...searchParams,
							contestId: value
						})
					}}
				>
					{contests.map((contest: Contest) => (
						<Option key={contest.id} value={contest.id}>
							{contest?.contestName} ({contest?.isPublic ? 'Public' : 'Private'})
						</Option>
					))}
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

export default ListAdminProblem;