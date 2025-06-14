import React, { useMemo } from "react";
import { MenuProps, Layout } from "antd";
import { Menu } from "antd";
import {
  HomeOutlined,
  CodeOutlined,
  ReadOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
  AppstoreOutlined,
  TagOutlined,
  TrophyOutlined,
  RightOutlined,
  DownOutlined,
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const itemRoute = {
  "1": "/",
  "2.3": "/my-courses",
  "2.4": "/courses",
  "2.5": "/contest",
  "3.1": "/admin/users",
  "3.2": "/admin/questions",
  "3.3": "/admin/tags",
  "3.4": "/admin/join-course-request",
  "3.5": "/admin/submission",
  "3.6": "/admin/courses",
  "3.7": "/admin/contest",
  "4.1": "/teacher/my-courses",
  "4.2": "/teacher/my-questions",
  "4.3": "/teacher/join-course-request",
  "4.4": "/teacher/my-matrices",
  "4.5": "/teacher/my-tags",
  "4.6": "/teacher/contest",
};

interface SidebarProps {
  collapsed: boolean;
  desktopCollapsed: boolean;
  activeKey: string[];
  openKey: any[] | undefined;
  isTablet: boolean;
  setCollapsed: (value: boolean) => void;
  setDesktopCollapsed: (value: boolean) => void;
  setActiveKey: (value: string[]) => void;
  setOpenKey: (value: any[] | undefined) => void;
}

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

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  desktopCollapsed,
  activeKey,
  openKey,
  isTablet,
  setCollapsed,
  setDesktopCollapsed,
  setActiveKey,
  setOpenKey,
}) => {
  const navigate = useNavigate();
  const userInfoData = localStorage.getItem("userInfo");

  const items: MenuItem[] = useMemo(() => {
    const userInfo = userInfoData ? JSON.parse(userInfoData) : null;
    if (userInfo && userInfo.role === "admin") {
      return [
        getItem("Home", "1", <HomeOutlined />),
        getItem("Content", "2", <CodeOutlined />, [
          getItem("My Courses", "2.3", <BookOutlined />),
          getItem("All Courses", "2.4", <BookOutlined />),
          getItem("Contest", "2.5", <TrophyOutlined />),
        ]),
        getItem("Admin", "3", <ReadOutlined />, [
          getItem("Users", "3.1", <UserOutlined />),
          getItem("Question", "3.2", <QuestionCircleOutlined />),
          getItem("Tag", "3.3", <TagOutlined />),
          getItem("Join Course Request", "3.4", <UserAddOutlined />),
          getItem("Submissions", "3.5", <FileTextOutlined />),
          getItem("Course", "3.6", <BookOutlined />), 
          getItem("Contest", "3.7", <TrophyOutlined />),
        ]),
      ];
    } else if (userInfo && userInfo.role === "teacher") {
      return [
        getItem("Home", "1", <HomeOutlined />),
        getItem("Content", "2", <CodeOutlined />, [
          getItem("My Courses", "2.3", <BookOutlined />),
          getItem("All Courses", "2.4", <BookOutlined />),
          getItem("Contest", "2.5", <TrophyOutlined />),
        ]),
        getItem("Teaching", "4", <ReadOutlined />, [
          getItem("Course", "4.1", <BookOutlined />),
          getItem("Question", "4.2", <QuestionCircleOutlined />),
          getItem("Join Course Request", "4.3", <UserAddOutlined />),
          getItem("Matrix", "4.4", <AppstoreOutlined />),
          getItem("Tag", "4.5", <TagOutlined />),
          getItem("Contest", "4.6", <TrophyOutlined />),
        ]),
      ];
    } else {
      return [
        getItem("Home", "1", <HomeOutlined />),
        getItem("Coding", "2", <CodeOutlined />, [
          getItem("My Courses", "2.3", <BookOutlined />),
          getItem("All Courses", "2.4", <BookOutlined />),
          getItem("Contest", "2.5", <TrophyOutlined />),
        ]),
  
      ];
    }
  }, [userInfoData]);

  return (
    <Sider
      breakpoint="lg"
      collapsible
      collapsedWidth="80"
      width="220"
      collapsed={isTablet ? collapsed : desktopCollapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      trigger={null}
      style={{
        transition: "0.3s",
        display: collapsed ? "none" : "block",
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        marginTop: 0,
        borderRadius: 0,
        zIndex: 2000,
        boxShadow: "none",
        background: "#000",
        backdropFilter: "none",
        border: "none",
      }}
    >
      <div
        className="logo-vertical"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          padding: desktopCollapsed ? "20px 10px" : "20px 24px",
          background: "#000",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#e0e0e0",
            }}
          />
          {!desktopCollapsed && (
            <span style={{ fontSize: "20px", fontWeight: 600 }}>StudyHub</span>
          )}
        </div>
        <button
          className="toggle-menu-btn"
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            cursor: "pointer",
            color: "#ff6a00",
          }}
          onClick={() => {
            if (isTablet) {
              setCollapsed(!collapsed);
            } else {
              setDesktopCollapsed(!desktopCollapsed);
            }
          }}
        >
          <MenuOutlined />
        </button>
      </div>
      <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 }} />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={activeKey}
        selectedKeys={activeKey}
        openKeys={openKey}
        items={items}
        inlineCollapsed={desktopCollapsed}
        style={{
          height: "calc(100% - 71px)",
          background: "#000",
          fontFamily: "Inter, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          padding: "8px 0",
        }}
        onSelect={(item) => {
          setActiveKey([item.key as string]);
          navigate(itemRoute[item.key as keyof typeof itemRoute]);
        }}
        onOpenChange={(keys) => setOpenKey(keys as any)}
        className="menu custom-sidebar-menu"
      />
      <style>{`
        .custom-sidebar-menu .ant-menu-item {
          border-radius: 0 !important;
          margin-bottom: 0px;
          transition: all 0.2s;
          color: #fff !important;
          padding: 12px 24px !important;
        }
        .custom-sidebar-menu .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
        }
        .custom-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #fff !important;
        }
        .custom-sidebar-menu .ant-menu-item-selected[data-menu-key="1"] {
            background: #ff6a00 !important;
            color: #fff !important;
        }
        .custom-sidebar-menu .ant-menu-item-selected[data-menu-key="1"] .anticon {
            color: #fff !important;
        }
        .custom-sidebar-menu .ant-menu-item[data-menu-key="1"]:hover {
            background: rgba(255, 106, 0, 0.8) !important;
            color: #fff !important;
        }
        .custom-sidebar-menu .ant-menu-item .anticon {
          font-size: 20px !important;
          margin-right: 12px;
          color: inherit;
        }
        .custom-sidebar-menu .ant-menu-submenu-title {
          color: #fff !important;
          padding: 12px 24px !important;
        }
        .custom-sidebar-menu .ant-menu-submenu-title:hover {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .custom-sidebar-menu .ant-menu-submenu .ant-menu-item {
          padding-left: 48px !important;
        }
        .custom-sidebar-menu .ant-menu-submenu .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.15) !important;
        }
        .custom-sidebar-menu .ant-menu-submenu-arrow {
            color: #fff !important;
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;
