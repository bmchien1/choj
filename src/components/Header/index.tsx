import "./index.css";
import {Button, Popover, Image} from "antd";
import {useNavigate} from "react-router-dom";
import {GrLogout} from "react-icons/gr";
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
} from '@ant-design/icons';
import {JWT_LOCAL_STORAGE_KEY} from "@/constants/data.ts";
import useWindowSize from "@/hooks/useWindowSize.ts";

const AppHeader = ({setCollapsed, collapsed}: { setCollapsed: (value: boolean) => void, collapsed: boolean }) => {
	const navigate = useNavigate();
	const {width} = useWindowSize();
	
	const handleLogout = () => {
		try {
			localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
			navigate("/login");
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<div className="app-header">
			<div className="header-left">
				{
					width && width < 992 && (
						<div
							onClick={() => setCollapsed(!collapsed)}
							className={'bg-black w-10 h-10 flex justify-center items-center hover:opacity-80 cursor-pointer rounded-lg'}
						>
							{
								collapsed ? <MenuUnfoldOutlined className={'text-white'}/> :
									<MenuFoldOutlined className={'text-white'}/>
							}
						</div>
					)
				}
			</div>
			<div className="header-right">
				{/*<div className="header-right-item">*/}
				{/*    <Select*/}
				{/*        options={[*/}
				{/*            {value: 'en', label: 'English'},*/}
				{/*            {value: 'vi', label: 'Vietnamese'}*/}
				{/*        ]}*/}
				{/*        className={'mr-3 w-32'}*/}
				{/*    >*/}
				{/*    <LiaFlagUsaSolid/>*/}
				{/*    </Select>*/}
				{/*</div>*/}
				<Popover
					className="user"
					content={() => {
						return (
							<Button onClick={handleLogout} icon={<GrLogout/>}>
								{"Logout"}
							</Button>
						)
					}}
					placement={"bottomRight"}
				>
					<div className="user-info">
						<div>ADMIN</div>
					</div>
					<div className="avatar">
						<Image
							src={'/logo.jpg'}
							width={48}
							height={48}
							preview={false}
							className={'flex items-center justify-center'}
						/>
					</div>
				</Popover>
			</div>
		</div>
	);
};

export default AppHeader;