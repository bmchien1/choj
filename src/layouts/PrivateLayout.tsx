import { useEffect, useMemo, useState } from "react";
import { Layout } from "antd";
import "./index.css";
import { useLocation } from "react-router-dom";
import AppHeader from "@/components/Header/index";
import useWindowSize from "@/hooks/useWindowSize.ts";
import Sidebar from "@/components/SideBar";
import { ToastContainer } from "react-toastify";

const { Header, Content } = Layout;

const PrivateLayout = (params: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState(["1"]);
  const [openKey, setOpenKey] = useState<any[] | undefined>(undefined);
  const location = useLocation();
  const currentRoute = location.pathname;

  const { width } = useWindowSize();
  const isTablet = useMemo(() => (width ?? 0) < 992, [width]); // Default to 0 if width is undefined

  useEffect(() => {
    if (isTablet) {
      setDesktopCollapsed(false);
    }
  }, [isTablet]);

  const itemRoute = {
    "1": "/",
    "2.3": "/my-courses",
    "2.4": "/courses",
    "2.5": "/list-problem",
    "3.1": "/admin/users",
    "3.2.1": "/admin/question/create",
    "3.2.2": "/admin/questions",
    "3.4": "/admin/join-course-request",
    "3.5": "/admin/submission",
    "3.6.1": "/admin/course/create",
    "3.6.2": "/admin/courses",
    "4.1.1": "/admin/course/create",
    "4.1.2": "/teacher/my-courses",
    "4.2.1": "/admin/question/create",
    "4.2.2": "/teacher/my-questions",
  };

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
      <Sidebar
        collapsed={collapsed}
        desktopCollapsed={desktopCollapsed}
        activeKey={activeKey}
        openKey={openKey}
        isTablet={isTablet}
        setCollapsed={setCollapsed}
        setDesktopCollapsed={setDesktopCollapsed}
        setActiveKey={setActiveKey}
        setOpenKey={setOpenKey}
      />
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
        <Content style={{ marginLeft: 22 }}>
          <div style={{ paddingTop: 16, paddingRight: 24, paddingLeft: 5 }}>
            {params.children}
          </div>
        </Content>
        <ToastContainer />
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
