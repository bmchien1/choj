import React, { useEffect, useMemo, useState } from "react";
import { MenuProps, Image } from "antd";
import { Layout, Menu } from "antd";
import "./index.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header as AppHeader } from "@/components";
import { FaCode, FaRegUser, FaTag } from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import { CiViewList } from "react-icons/ci";
import {
  MdManageAccounts,
  MdOutlineEmojiEvents,
  MdOutlineTask,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";
import useWindowSize from "@/hooks/useWindowSize.ts";
import { GrPersonalComputer } from "react-icons/gr";
import { FaLaptopCode } from "react-icons/fa6";
import { BsChatSquareQuote } from "react-icons/bs";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const itemRoute = {
  "1": "/",
  // "2.1": "/my-contests",
  // "2.2": "/contests",
  "2.3": "/my-courses",
  "2.4": "/courses",
  "2.5": "/list-problem",
  "3.1": "/admin/users",
  "3.2.1": "/admin/question/create",
  "3.2.2": "/admin/questions",
  "3.2.3": "/admin/tags",
  "3.3.1": "/admin/contest/create",
  "3.3.2": "/admin/contests",
  "3.4": "/admin/join-contest-request",
  "3.5": "/admin/submissions",
  "3.6.1": "/admin/course/create",
  "3.6.2": "/admin/courses",
};

const PrivateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState(["1"]);
  const [openKey, setOpenKey] = useState<any[] | undefined>(undefined);
  const navigate = useNavigate();
  //sync current route with menu
  const location = useLocation();
  const currentRoute = location.pathname;

  const { width } = useWindowSize();

  const isTablet = useMemo(() => width && width < 992, [width]);

  useEffect(() => {
    if (isTablet) {
      setDesktopCollapsed(false);
    }
  }, [isTablet]);

  const userInfoData = localStorage.getItem("userInfo");

  const items: MenuItem[] = useMemo(() => {
    const userInfoData = localStorage.getItem("userInfo");
    const userInfo = userInfoData ? JSON.parse(userInfoData) : null;
    if (userInfo && userInfo.role === "admin") {
      return [
        getItem("Home", "1", <IoMdHome />),
        getItem("Coding", "2", <FaCode />, [
          // getItem("My Contests", "2.1", <GrPersonalComputer />),
          // getItem("All Contests", "2.2", <CiViewList />),
          getItem("My Courses", "2.3", <GrPersonalComputer />),
          getItem("All Courses", "2.4", <CiViewList />),
          // getItem("List Problem", "2.5", <FaLaptopCode />),
        ]),
        getItem("Admin", "3", <MdManageAccounts />, [
          getItem("Users", "3.1", <FaRegUser />),
          getItem("Question", "3.2", <FaLaptopCode />, [
            getItem("Create Question", "3.2.1", <FaLaptopCode />),
            getItem("List Questions", "3.2.2", <CiViewList />),
          ]),
          // getItem("Contest", "3.3", <MdOutlineEmojiEvents />, [
          //   getItem("Create Contest", "3.3.1", <MdOutlineEmojiEvents />),
          //   getItem("List Contest", "3.3.2", <CiViewList />),
          // ]),
          getItem("Join Course Request", "3.4", <BsChatSquareQuote />),
          getItem("Submissions", "3.5", <MdOutlineTask />),
          getItem("Course", "3.6", <MdOutlineEmojiEvents />, [
            getItem("Create Course", "3.6.1", <MdOutlineEmojiEvents />),
            getItem("List Course", "3.6.2", <CiViewList />),
          ]),
        ]),
      ];
    } else {
      return [
        getItem("Home", "1", <IoMdHome />),
        getItem("Coding", "2", <FaCode />, [
          getItem("My Contests", "2.1", <GrPersonalComputer />),
          getItem("All Contests", "2.2", <CiViewList />),
          getItem("My Courses", "2.3", <GrPersonalComputer />),
          getItem("All Courses", "2.4", <CiViewList />),
          getItem("List Problem", "2.5", <FaLaptopCode />),
        ]),
      ];
    }
  }, [userInfoData]);

  useEffect(() => {
    const currentKey = Object.keys(itemRoute).find(
      (key) => itemRoute[key as keyof typeof itemRoute] === currentRoute
    );
    if (currentKey) {
      if (currentKey.includes(".")) {
        const parentKey = currentKey.split(".")[0];
        setOpenKey([parentKey]);
      }
      setActiveKey([currentKey]);
    } else {
      setActiveKey(["0"]);
    }
  }, [currentRoute]);

  return (
    <Layout hasSider className="app-layout">
      <Sider
        breakpoint="lg"
        collapsible
        collapsedWidth={desktopCollapsed ? "80" : "0"}
        collapsed={isTablet ? collapsed : desktopCollapsed}
        onCollapse={() => setCollapsed(!collapsed)}
        trigger={null}
        style={{
          transition: "0.3s",
          display: collapsed ? "none" : "block",
          overflow: "hidden",
          height: "98vh",
          position: "fixed",
          left: 10,
          marginTop: "0.5rem",
          borderRadius: "1rem",
          zIndex: 2000,
        }}
      >
        <div
          className="logo-vertical"
          style={{
            justifyContent: desktopCollapsed ? "center" : "space-between",
          }}
        >
          {desktopCollapsed ? (
            <button
              className="toggle-menu-btn"
              onClick={() => {
                if (isTablet) {
                  setCollapsed(!collapsed);
                } else {
                  setDesktopCollapsed(!desktopCollapsed);
                }
              }}
            >
              {desktopCollapsed ? <MdSkipNext /> : <MdSkipPrevious />}
            </button>
          ) : (
            <>
              <Image
                onClick={() => {
                  navigate("/");
                }}
                src={"/logo.jpg"}
                alt="logo"
                preview={false}
                style={{
                  width: 35,
                  height: 35,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
              <button
                className="toggle-menu-btn"
                onClick={() => {
                  if (isTablet) {
                    setCollapsed(!collapsed);
                  } else {
                    setDesktopCollapsed(!desktopCollapsed);
                  }
                }}
              >
                {desktopCollapsed ? <MdSkipNext /> : <MdSkipPrevious />}
              </button>
            </>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={activeKey}
          selectedKeys={activeKey}
          openKeys={openKey}
          items={items}
          style={{
            height: "100%",
            borderRadius: "1rem",
            background: "#111 !important",
          }}
          onSelect={(item) => {
            setActiveKey([item.key as string]);
            navigate(itemRoute[item.key as string as keyof typeof itemRoute]);
          }}
          onOpenChange={(keys) => {
            setOpenKey(keys as any);
          }}
          className="menu"
        />
      </Sider>
      <Layout
        className="site-layout min-h-screen"
        style={{
          background: "#ebebeb",
          marginLeft: isTablet ? 0 : desktopCollapsed ? 80 : 200,
          transition: "margin-left 0.3s",
        }}
        onClick={() => {
          if (!collapsed && width && width < 992) {
            setCollapsed(true);
          }
        }}
      >
        <Header className="header">
          <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        </Header>
        <Content
          style={{
            marginLeft: 22,
          }}
        >
          <div
            style={{
              paddingTop: 16,
              paddingRight: 24,
              paddingLeft: 5,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
