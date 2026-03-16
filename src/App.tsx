import { useState } from 'react'
import { AuthHeader } from './components/AuthHeader'
import { AuthTabs } from './components/AuthTabs'
import { LoginView } from './views/LoginView'
import { RegisterView } from './views/RegisterView'

type AuthView = 'login' | 'register'

function App() {
	const [activeView, setActiveView] = useState<AuthView>('login')

	return (
		<main className="app-shell">
			<section className="auth-card" aria-labelledby="auth-title">
				<AuthHeader
					title={activeView === 'login' ? 'Connexion' : 'Inscription'}
					subtitle={
						activeView === 'login'
							? 'Connecte-toi pour accéder à ton espace.'
							: 'Crée ton compte en quelques secondes.'
					}
				/>

				<AuthTabs activeView={activeView} onChangeView={setActiveView} />

				{activeView === 'login' ? <LoginView /> : <RegisterView />}
			</section>
		</main>
	)
}

export default App

