import { FC } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout.tsx";
import { NotFoundPage } from "@/pages";
import publicRoutes from "@/routes/publicRoutes.ts";
import PrivateLayout from "@/layouts/PrivateLayout.tsx";
import studentRoutes from "@/routes/studentRoutes.ts";
import teacherRoutes from "@/routes/teacherRoutes.ts";
import adminRoutes from "@/routes/adminRoutes.ts";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";

const ProtectedRoute: FC<{
  element: JSX.Element;
  requiredLogin: boolean;
  requiredAdmin?: boolean;
  requiredTeacher?: boolean;
  path?: string;
}> = ({
  element,
  requiredLogin,
  requiredAdmin = false,
  requiredTeacher = false,
  path,
}) => {
  const isAuthenticated = !!localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
  let userRole: string | null = null;

  try {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      userRole = parsed.role || null;
    }
  } catch (error) {
    console.error(`Failed to parse userInfo for route ${path}:`, error);
  }

  if (requiredAdmin && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requiredTeacher && !["teacher", "admin"].includes(userRole || "")) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated && requiredLogin) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !requiredLogin && path !== "/login") {
    return <Navigate to="/" replace />;
  }

  return element;
};
const routes = [
  {
    element: <PrivateLayout />,
    // path: "/*",
    children: [
      ...Object.values(studentRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute
            element={<Component />}
            requiredLogin={true}
            path={path}
          />
        ),
      })),
    ],
  },
  {
    element: <PrivateLayout />,
    // path: "/*",
    children: [
      ...Object.values(teacherRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute
            element={<Component />}
            requiredLogin={true}
            requiredTeacher={true}
            path={path}
          />
        ),
      })),
    ],
  },
  {
    element: <PrivateLayout />,
    // path: "/*",
    children: [
      ...Object.values(adminRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute
            element={<Component />}
            requiredLogin={true}
            requiredAdmin={true}
            path={path}
          />
        ),
      })),
    ],
  },
  {
    element: <PublicLayout />,
    // path: "*/",
    children: [
      ...Object.values(publicRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute
            element={<Component />}
            requiredLogin={false}
            path={path}
          />
        ),
      })),
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

const RenderRouter: FC = () => {
  return useRoutes(routes);
};

export default RenderRouter;
