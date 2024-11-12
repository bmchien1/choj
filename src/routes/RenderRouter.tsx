import {FC} from 'react';
import {Navigate, useRoutes} from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout.tsx';
import {NotFoundPage} from "@/pages";
import publicRoutes from "@/routes/publicRoutes.ts";
import PrivateLayout from "@/layouts/PrivateLayout.tsx";
import privateRoutes from "@/routes/privateRoutes.ts";
import {JWT_LOCAL_STORAGE_KEY} from "@/constants/data.ts";

const ProtectedRoute: FC<{element: JSX.Element, requiredLogin: boolean}> = ({element, requiredLogin }) => {
	const isAuthenticated = localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
	
	if(!isAuthenticated && requiredLogin) {
		return <Navigate to="/login" />;
	}
	
	if(isAuthenticated && !requiredLogin) {
		return <Navigate to="/" />;
	}
	
	return element;
};

const routes = [
	{
		element: <PrivateLayout />,
		children: [
			...Object.values(privateRoutes).map(({path, component: Component}) => (
				{
					path,
					element: <ProtectedRoute element={<Component />} requiredLogin={true} />,
				}
			)),
		]
	},
	{
		element: <PublicLayout />,
		children: [
			...Object.values(publicRoutes).map(({path, component: Component}) => (
				{
					path,
					element:<ProtectedRoute element={<Component />} requiredLogin={false} />,
				}
			)),
		]
	},
	{
		path: '*',
		element: <NotFoundPage/>
	}
];

const RenderRouter: FC = () => {
	return useRoutes(routes);
};

export default RenderRouter;