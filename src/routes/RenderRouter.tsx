import { FC } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout.tsx";
import { NotFoundPage } from "@/pages";
import publicRoutes from "@/routes/publicRoutes.ts";
import PrivateLayout from "@/layouts/PrivateLayout.tsx";
import privateRoutes from "@/routes/privateRoutes.ts";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";
import adminRoutes from "@/routes/adminRoutes.ts";

const ProtectedRoute: FC<{
  element: JSX.Element;
  requiredLogin: boolean;
  requiredAdmin?: boolean;
  requiredTeacher?: boolean;
}> = ({
  element,
  requiredLogin,
  requiredAdmin = false,
  requiredTeacher = false,
}) => {
  const isAuthenticated = localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
  const userInfo = localStorage.getItem("userInfo");

  if (requiredAdmin && userInfo && JSON.parse(userInfo).role !== "admin") {
    return <Navigate to="/" />;
  }

  if (requiredTeacher && userInfo && JSON.parse(userInfo).role !== "teacher") {
    return <Navigate to="/" />;
  }

  if (!isAuthenticated && requiredLogin) {
    return <Navigate to="/login" />;
  }

  if (isAuthenticated && !requiredLogin) {
    return <Navigate to="/" />;
  }

  return element;
};

const routes = [
  {
    element: <PrivateLayout />,
    children: [
      ...Object.values(privateRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute element={<Component />} requiredLogin={true} />
        ),
      })),
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      ...Object.values(publicRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute element={<Component />} requiredLogin={false} />
        ),
      })),
    ],
  },
  {
    element: <PrivateLayout />,
    children: [
      ...Object.values(adminRoutes).map(({ path, component: Component }) => ({
        path,
        element: (
          <ProtectedRoute
            element={<Component />}
            requiredLogin={true}
            requiredAdmin={true}
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
