import QueryProvider from "./providers/QueryProvider";
import UpdateProvider from "./providers/UpdateProvider";
import AppRoutes from "./routes/index.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	return (
		<QueryProvider>
			<UpdateProvider>
				<AppRoutes />
			</UpdateProvider>
		</QueryProvider>
	)
}

export default App
