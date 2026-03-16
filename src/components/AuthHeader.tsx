type AuthHeaderProps = {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <p className="auth-kicker">LinkStart</p>
      <h1 id="auth-title" className="auth-title">
        {title}
      </h1>
      <p className="auth-subtitle">{subtitle}</p>
    </header>
  )
}
