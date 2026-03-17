import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthField } from '../components/AuthField'
import { PlatformPicker } from '../components/PlatformPicker'
import { registerUser } from '../services/authApi'

export function RegisterView() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    platform: [] as string[],
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.username || !formData.email || !formData.password || formData.platform.length === 0) {
      setErrorMessage('Merci de remplir tous les champs.')
      return
    }

    try {
      setIsSubmitting(true)
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        platform: formData.platform,
      })
      setSuccessMessage('Compte créé avec succès. Redirection vers la connexion...')
      setFormData({ username: '', email: '', password: '', platform: [] })

      setTimeout(() => {
        navigate('/login')
      }, 900)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Une erreur est survenue.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <AuthField
        label="Username"
        type="text"
        placeholder="Ton pseudo gamer"
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        autoComplete="name"
      />
      <AuthField
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        autoComplete="email"
      />
      <AuthField
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        autoComplete="new-password"
      />

      <div className="form-field">
        <span>Plateforme(s)</span>
        <PlatformPicker
          selected={formData.platform}
          onChange={(platforms) => {
            setFormData((prev) => ({ ...prev, platform: platforms }))
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
  )
}
