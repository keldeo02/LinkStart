import { Link } from 'react-router-dom'

export function NotFoundView() {
  return (
    <main className="app-shell">
      <section className="auth-card">
        <header className="auth-header">
          <p className="auth-kicker">Erreur 404</p>
          <h1 className="auth-title">Page introuvable</h1>
          <p className="auth-subtitle">La page demandée n'existe pas.</p>
        </header>

        <Link to="/login" className="btn-primary btn-link">
          Retour à la connexion
        </Link>
      </section>
    </main>
  )
}
