import {useQuery} from "@tanstack/react-query";
import {Card, Row, Col, Statistic, Button, Table, List, Tag, Typography} from "antd";
import {
    UserOutlined,
    CodeOutlined,
    TrophyOutlined,
    SolutionOutlined,
    TeamOutlined, CalendarOutlined,
} from "@ant-design/icons";
import {Link} from "react-router-dom";
import homeService from "@/apis/service/homeService";
import {getContestStatusColor} from "@/utils";
import moment from "moment";

const Home = () => {
    // Fetch statistics
    const {data: stats} = useQuery({
        queryKey: ["home-statistics"],
        queryFn: () => homeService.getStatistics(),
    });

    // Fetch recent contests
    const {data: recentContests} = useQuery({
        queryKey: ["recent-contests"],
        queryFn: () => homeService.getRecentContests(),
    });

    // Fetch recent problems
    const {data: recentProblems} = useQuery({
        queryKey: ["recent-problems"],
        queryFn: () => homeService.getRecentProblems(),
    });

    // Fetch top users
    const {data: topUsers} = useQuery({
        queryKey: ["top-users"],
        queryFn: () => homeService.getTopUsers(),
    });

    return (
        <div className="p-6">
            {/* Statistics Cards */}
            <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        className="hover:shadow-md transition-shadow"
                        style={{
                            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                        }}
                    >
                        <Statistic
                            title={<span className="text-white">Total Problems</span>}
                            value={stats?.totalProblems || 0}
                            prefix={<CodeOutlined/>}
                            valueStyle={{color: "white"}}
                        />
                        <div className="mt-4">
                            <Link to="/list-problem">
                                <Button type="link" className="text-white p-0">
                                    View All Problems →
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        className="hover:shadow-md transition-shadow"
                        style={{
                            background: "linear-gradient(135deg, #faad14 0%, #d48806 100%)",
                        }}
                    >
                        <Statistic
                            title={<span className="text-white">Active Contests</span>}
                            value={stats?.totalContests || 0}
                            prefix={<TrophyOutlined/>}
                            valueStyle={{color: "white"}}
                        />
                        <div className="mt-4">
                            <Link to="/contests">
                                <Button type="link" className="text-white p-0">
                                    View All Contests →
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        className="hover:shadow-md transition-shadow h-full"
                        style={{
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        }}
                    >
                        <Statistic
                            title={<span className="text-white">Total Users</span>}
                            value={stats?.totalUsers || 0}
                            prefix={<UserOutlined/>}
                            valueStyle={{color: "white"}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        className="hover:shadow-md transition-shadow h-full"
                        style={{
                            background: "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
                        }}
                    >
                        <Statistic
                            title={<span className="text-white">Total Submissions</span>}
                            value={stats?.totalSubmissions || 0}
                            prefix={<SolutionOutlined/>}
                            valueStyle={{color: "white"}}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span className="text-lg">
                                <TrophyOutlined className="mr-2"/>
                                Recent Contests
                            </span>
                        }
                        className="mb-6 hover:shadow-md transition-shadow h-full"
                    >
                        <Table
                            dataSource={recentContests} // Array of contests
                            pagination={false}
                            columns={[
                                {
                                    title: "Contest Name",
                                    dataIndex: "contestName",
                                    key: "contestName",
                                    render: (text, record) => (
                                        <Link
                                            to={`/list-problem?contest=${record.id}`}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            {text}
                                        </Link>
                                    ),
                                },
                                {
                                    title: "Creator",
                                    dataIndex: "creator",
                                    key: "creator",
                                },
                                {
                                    title: "Description",
                                    dataIndex: "description",
                                    key: "description",
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    key: "status",
                                    render: (status) => (
                                        <Tag color={getContestStatusColor(status)}>
                                            {status}
                                        </Tag>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span className="text-lg">
                                <TeamOutlined className="mr-2"/>
                                Top Users
                            </span>
                        }
                        className="mb-6 hover:shadow-md transition-shadow h-full"
                    >
                        <List
                            dataSource={topUsers}
                            renderItem={(user, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    index === 0
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : index === 1
                                                            ? "bg-gray-100 text-gray-600"
                                                            : index === 2
                                                                ? "bg-orange-100 text-orange-600"
                                                                : "bg-blue-100 text-blue-600"
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                        }
                                        title={
                                            <Typography.Text
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                {user.email.slice(0, user.email.indexOf("@"))}
                                            </Typography.Text>
                                        }
                                        description={`Score: ${user.totalScore} | Solved: ${user.totalSolved}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card
                        title={
                            <span className="text-lg">
                                <CodeOutlined className="mr-2"/>
                                Recent Problems
                            </span>
                        }
                        className="mb-6 hover:shadow-md transition-shadow"
                    >
                        <Table
                            dataSource={recentProblems}
                            pagination={false}
                            columns={[
                                {
                                    title: "Problem Name",
                                    dataIndex: "problemName",
                                    key: "problemName",
                                    render: (text, record) => (
                                        <Link
                                            to={`/problem-detail/${record.id}`}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            {text}
                                        </Link>
                                    ),
                                },
                                {
                                    title: "Problem Code",
                                    dataIndex: "problemCode",
                                    key: "problemCode",
                                },
                                {
                                    title: 'Created At',
                                    dataIndex: 'createdAt',
                                    key: 'createdAt',
                                    render: (text: string) => {
                                        const time = moment(text).format('YYYY-MM-DD HH:mm')
                                        return (
                                            <span>
                                              <CalendarOutlined className="mr-2"/>
                                                {time}
                                        </span>
                                        )
                                    },
                                },
                                {
                                    title: "Difficulty",
                                    dataIndex: "difficulty",
                                    key: "difficulty",
                                    render: (difficulty: string) => {
                                        const color = difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'orange' : 'red';
                                        return (
                                            <Tag color={color}>{difficulty}</Tag>
                                        )
                                    },
                                },
                                {
                                    title: "Tags",
                                    dataIndex: "tags",
                                    key: "tags",
                                    render: (tags: string) => {
                                        const listTag = tags.split(',');
                                        return (
                                            <div className={'flex flex-wrap'}>
                                                {listTag.map((tag: string, index: number) => (
                                                    <Tag key={index}>{tag}</Tag>
                                                ))}
                                            </div>
                                        )
                                    },
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;
