import { Link } from 'react-router-dom'

export function HomeView() {
  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">Objectif</p>
        <h1 className="auth-title">Trouver des joueurs et former des équipes</h1>
        <p className="auth-subtitle">
          Crée ton compte, publie une annonce, swipe pour rejoindre une team et gère tes matchs.
        </p>
        <div className="inline-actions">
          <Link to="/posts" className="btn-primary btn-link">
            Voir les annonces
          </Link>
        </div>
      </section>
    </main>
  )
}
