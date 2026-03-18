import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getCurrentUserId, refreshSessionPreferences } from '../services/authSession'
import { PlatformPicker } from '../components/PlatformPicker'
import { getUserById, updateUser } from '../services/usersApi'

export function MeEditView() {
  const [formData, setFormData] = useState({ username: '', platform: [] as string[] })
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const userId = getCurrentUserId()

  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) {
          return
        }

        const user = await getUserById(userId)
        if (!user) {
          return
        }

        setFormData({
          username: user.username,
          platform: Array.isArray(user.platform) ? user.platform : [user.platform],
        })
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [userId])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userId) {
      setErrorMessage('Utilisateur non connecté.')
      return
    }

    try {
      await updateUser(userId, {
        username: formData.username,
        platform: formData.platform,
        preferences: formData.platform,
      })
      refreshSessionPreferences(formData.platform)
      setMessage('Profil mis à jour.')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/me/edit</p>
        <h1 className="auth-title">Modifier mon profil</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Username</span>
            <input name="username" value={formData.username} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>Plateforme(s)</span>
            <PlatformPicker
              selected={formData.platform}
              onChange={(platforms) => setFormData((prev) => ({ ...prev, platform: platforms }))}
            />
          </label>

          {message ? <p className="form-message is-success">{message}</p> : null}
          {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </form>
      </section>
    </main>
  )
}
