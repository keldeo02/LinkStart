import { AuthField } from '../components/AuthField'

export function LoginView() {
  return (
    <form className="auth-form" noValidate>
      <AuthField label="Email" type="email" placeholder="exemple@email.com" />
      <AuthField label="Mot de passe" type="password" placeholder="••••••••" />

      <button type="submit" className="btn-primary">
        Se connecter
      </button>
    </form>
  )
}
