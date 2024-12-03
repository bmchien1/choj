import QueryProvider from "@/providers/QueryProvider.tsx";
import UpdateProvider from "@/providers/UpdateProvider.tsx";
import AppRoutes from "@/routes/index.tsx";
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
