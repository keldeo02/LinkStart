import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { MainNavbar } from './components/MainNavbar'
import { isAuthenticated } from './services/authSession'
import { AuthPage } from './views/AuthPage'
import { HomeView } from './views/HomeView'
import { MeEditView } from './views/MeEditView'
import { MePostsView } from './views/MePostsView'
import { MeView } from './views/MeView'
import { NotFoundView } from './views/NotFoundView'
import { LogoutView } from './views/LogoutView'
import { PostCreateView } from './views/PostCreateView'
import { PostDeleteView } from './views/PostDeleteView'
import { PostDetailView } from './views/PostDetailView'
import { PostEditView } from './views/PostEditView'
import { PostsView } from './views/PostsView'
import { ProfileView } from './views/ProfileView'
import { SwipeView } from './views/SwipeView'

function AppLayout() {
	return (
		<>
			<MainNavbar />
			<div className="page-wrap">
				<Outlet />
			</div>
		</>
	)
}

function ProtectedRoute() {
	if (!isAuthenticated()) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<HomeView />} />
				<Route path="/posts" element={<PostsView />} />
				<Route path="/posts/:id" element={<PostDetailView />} />
				<Route path="/login" element={<AuthPage mode="login" />} />
				<Route path="/register" element={<AuthPage mode="register" />} />
				<Route path="/profile/:id" element={<ProfileView />} />

				<Route element={<ProtectedRoute />}>
					<Route path="/match" element={<SwipeView />} />
					<Route path="/post/create" element={<PostCreateView />} />
					<Route path="/post/delete" element={<PostDeleteView />} />
					<Route path="/post/edit" element={<PostEditView />} />
					<Route path="/me" element={<MeView />} />
					<Route path="/me/post" element={<MePostsView />} />
					<Route path="/me/edit" element={<MeEditView />} />
					<Route path="/logout" element={<LogoutView />} />
				</Route>

				<Route path="*" element={<NotFoundView />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}

export default App

