import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlatformPicker } from '../components/PlatformPicker'
import { loginUser, registerUser } from '../services/authApi'
import { saveSessionFromUser } from '../services/authSession'

type AuthView = 'login' | 'register'

type AuthPageProps = {
  mode: AuthView
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    platform: [] as string[],
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = mode === 'login' ? 'Connexion' : 'Inscription'
  const subtitle =
    mode === 'login'
      ? 'Connecte-toi pour accéder à ton espace.'
      : 'Crée ton compte en quelques secondes.'

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setLoginData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
  }

  const handleRegisterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setRegisterData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!loginData.email || !loginData.password) {
      setErrorMessage('Renseigne ton email et ton mot de passe.')
      return
    }

    try {
      setIsSubmitting(true)
      const user = await loginUser(loginData.email, loginData.password)

      if (!user) {
        setErrorMessage('Email ou mot de passe incorrect.')
        return
      }

      saveSessionFromUser(user)
      navigate('/posts')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !registerData.username ||
      !registerData.email ||
      !registerData.password ||
      registerData.platform.length === 0
    ) {
      setErrorMessage('Merci de remplir tous les champs.')
      return
    }

    try {
      setIsSubmitting(true)
      await registerUser(registerData)
      setSuccessMessage('Compte créé avec succès. Redirection vers la connexion...')
      setRegisterData({ username: '', email: '', password: '', platform: [] })

      setTimeout(() => {
        navigate('/login')
      }, 900)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="auth-kicker">LinkStart</p>
          <h1 id="auth-title" className="auth-title">
            {title}
          </h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>

        <nav className="auth-tabs" aria-label="Choix du formulaire">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => navigate('/login')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
            onClick={() => navigate('/register')}
          >
            Inscription
          </button>
        </nav>

        {mode === 'login' ? (
          <form className="auth-form" noValidate onSubmit={handleLoginSubmit}>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="exemple@email.com"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                autoComplete="email"
              />
            </label>
            <label className="form-field">
              <span>Mot de passe</span>
              <input
                type="password"
                placeholder="••••••••"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
              />
            </label>

            {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form className="auth-form" noValidate onSubmit={handleRegisterSubmit}>
            <label className="form-field">
              <span>Username</span>
              <input
                type="text"
                placeholder="Ton pseudo gamer"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                autoComplete="name"
              />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="exemple@email.com"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                autoComplete="email"
              />
            </label>
            <label className="form-field">
              <span>Mot de passe</span>
              <input
                type="password"
                placeholder="••••••••"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                autoComplete="new-password"
              />
            </label>

            <div className="form-field">
              <span>Plateforme(s)</span>
              <PlatformPicker
                selected={registerData.platform}
                onChange={(platforms) => {
                  setRegisterData((previous) => ({ ...previous, platform: platforms }))
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
              />
            </div>

            {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
            {successMessage ? <p className="form-message is-success">{successMessage}</p> : null}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer un compte'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
