import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthField } from '../components/AuthField'
import { loginUser } from '../services/authApi'

export function LoginView() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.email || !formData.password) {
      setErrorMessage('Renseigne ton email et ton mot de passe.')
      return
    }

    try {
      setIsSubmitting(true)
      const user = await loginUser(formData.email, formData.password)

      if (!user) {
        setErrorMessage('Email ou mot de passe incorrect.')
        return
      }

      navigate('/dashboard')
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
        autoComplete="current-password"
      />

      {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
