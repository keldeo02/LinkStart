import { Link, NavLink } from 'react-router-dom'
import { isAuthenticated } from '../services/authSession'

export function MainNavbar() {
  const loggedIn = isAuthenticated()

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand-link">
          LinkStart
        </Link>

        <nav className="main-nav" aria-label="Navigation principale">
          <NavLink
            to="/posts"
            className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
          >
            Annonces
          </NavLink>

          {loggedIn ? (
            <>
              <NavLink
                to="/match"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Match
              </NavLink>
              <NavLink
                to="/post/create"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Publier
              </NavLink>
              <NavLink
                to="/me/post"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Mes annonces
              </NavLink>
              <NavLink
                to="/me"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Mon profil
              </NavLink>
              <Link to="/logout" className="main-nav-link main-nav-link--logout">
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Connexion
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `main-nav-link ${isActive ? 'is-active' : ''}`}
              >
                Inscription
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
