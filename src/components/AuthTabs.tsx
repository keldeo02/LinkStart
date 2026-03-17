type AuthView = 'login' | 'register'

type AuthTabsProps = {
  activeView: AuthView
  onChangeView: (view: AuthView) => void
}

export function AuthTabs({ activeView, onChangeView }: AuthTabsProps) {
  return (
    <nav className="auth-tabs" aria-label="Choix du formulaire">
      <button
        type="button"
        className={`auth-tab ${activeView === 'login' ? 'is-active' : ''}`}
        onClick={() => onChangeView('login')}
      >
        Connexion
      </button>
      <button
        type="button"
        className={`auth-tab ${activeView === 'register' ? 'is-active' : ''}`}
        onClick={() => onChangeView('register')}
      >
        Inscription
      </button>
    </nav>
  )
}
