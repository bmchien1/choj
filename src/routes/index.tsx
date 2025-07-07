import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import RenderRouter from "./RenderRouter.tsx";

const AppRoutes = () => {
  return (
    <Suspense fallback="loading...">
      <RouterProvider router={RenderRouter}></RouterProvider>
    </Suspense>
  );
};

export default AppRoutes;
