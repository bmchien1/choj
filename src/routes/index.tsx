import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RenderRouter from './RenderRouter.tsx';

const AppRoutes = () => {
	return (
		<Suspense fallback="loading...">
			<BrowserRouter>
				<RenderRouter />
			</BrowserRouter>
		</Suspense>
	);
};

export default AppRoutes;