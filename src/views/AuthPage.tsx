import { useNavigate } from 'react-router-dom'
import { AuthHeader } from '../components/AuthHeader'
import { AuthTabs } from '../components/AuthTabs'
import { LoginView } from './LoginView'
import { RegisterView } from './RegisterView'

type AuthView = 'login' | 'register'

type AuthPageProps = {
  mode: AuthView
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()

  const title = mode === 'login' ? 'Connexion' : 'Inscription'
  const subtitle =
    mode === 'login'
      ? 'Connecte-toi pour accéder à ton espace.'
      : 'Crée ton compte en quelques secondes.'

  return (
    <main className="app-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <AuthHeader title={title} subtitle={subtitle} />

        <AuthTabs
          activeView={mode}
          onChangeView={(view) => navigate(view === 'login' ? '/login' : '/register')}
        />

        {mode === 'login' ? <LoginView /> : <RegisterView />}
      </section>
    </main>
  )
}
