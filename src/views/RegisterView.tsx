import { AuthField } from '../components/AuthField'

export function RegisterView() {
  return (
    <form className="auth-form" noValidate>
      <AuthField label="Nom complet" type="text" placeholder="Ton nom" />
      <AuthField label="Email" type="email" placeholder="exemple@email.com" />
      <AuthField label="Mot de passe" type="password" placeholder="••••••••" />

      <button type="submit" className="btn-primary">
        Créer un compte
      </button>
    </form>
  )
}
