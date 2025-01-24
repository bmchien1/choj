import "./index.css";
import { Button, Popover, Image } from "antd";
import { useNavigate } from "react-router-dom";
import { GrLogout } from "react-icons/gr";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";
import useWindowSize from "@/hooks/useWindowSize.ts";

const AppHeader = ({
  setCollapsed,
  collapsed,
}: {
  setCollapsed: (value: boolean) => void;
  collapsed: boolean;
}) => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    try {
      localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
      localStorage.removeItem("userInfo");
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };
  // console.log('user', user);
  return (
    <div className="app-header">
      <div className="header-left">
        {width && width < 992 && (
          <div
            onClick={() => setCollapsed(!collapsed)}
            className={
              "bg-black w-10 h-10 flex justify-center items-center hover:opacity-80 cursor-pointer rounded-lg"
            }
          >
            {collapsed ? (
              <MenuUnfoldOutlined className={"text-white"} />
            ) : (
              <MenuFoldOutlined className={"text-white"} />
            )}
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="header-right-item mr-2">
          {user?.role === "admin" && <div>ADMIN</div>}
        </div>
        <Popover
          className="user"
          content={() => (
            <div>
              <div>
                <strong>{user.email}</strong>
              </div>
              <div className={"flex items-center gap-2"}>
                <strong>Total Score:</strong>
                <div className="text-gray-500 text-sm">{user.totalScore}</div>
              </div>
              <div>
                <div className={"flex items-center gap-2"}>
                  <strong>Total Problem Solved:</strong>
                  <div className="text-gray-500 text-sm">
                    {user.totalSolved}
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                block
                className="mb-2"
                onClick={() => navigate("/change-password")} // Navigate to the profile page
              >
                Change Password
              </Button>
              <Button danger block icon={<GrLogout />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
          placement={"bottomRight"}
        >
          <div className="avatar">
            <Image
              src={"/logo.jpg"}
              width={48}
              height={48}
              preview={false}
              className={"flex items-center justify-center rounded-full"}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default AppHeader;
