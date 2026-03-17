import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './views/AuthPage'
import { DashboardView } from './views/DashboardView'
import { NotFoundView } from './views/NotFoundView'

function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<AuthPage mode="login" />} />
			<Route path="/register" element={<AuthPage mode="register" />} />
			<Route path="/dashboard" element={<DashboardView />} />
			<Route path="*" element={<NotFoundView />} />
		</Routes>
	)
}

export default App

