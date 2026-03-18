import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlatformPicker } from '../components/PlatformPicker'
import { getCurrentUserId, getSessionPayload } from '../services/authSession'
import { createPost } from '../services/postsApi'

export function PostCreateView() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ game: '', rank: '', message: '', platform: [] as string[] })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const session = getSessionPayload()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const authorId = getCurrentUserId()
    if (!authorId) {
      setErrorMessage('Tu dois être connecté.')
      return
    }

    if (!formData.game || !formData.rank || !formData.message) {
      setErrorMessage('Merci de remplir jeu, rank et message.')
      return
    }

    try {
      setIsSubmitting(true)
      await createPost({
        game: formData.game,
        rank: formData.rank,
        message: formData.message,
        platform: formData.platform.length ? formData.platform : (session?.preferences ?? ['PC']),
        authorId,
      })
      navigate('/posts')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/post/create</p>
        <h1 className="auth-title">Créer une annonce</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Jeu</span>
            <input name="game" value={formData.game} onChange={handleChange} placeholder="Valorant" />
          </label>
          <label className="form-field">
            <span>Rank</span>
            <input name="rank" value={formData.rank} onChange={handleChange} placeholder="Diamond" />
          </label>
          <label className="form-field">
            <span>Message</span>
            <input
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Cherche team sérieuse"
            />
          </label>
          <label className="form-field">
            <span>Plateforme(s)</span>
            <PlatformPicker
              selected={formData.platform}
              onChange={(platforms) => {
                setFormData((prev) => ({ ...prev, platform: platforms }))
                setErrorMessage('')
              }}
            />
          </label>

          {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer'}
          </button>
        </form>
      </section>
    </main>
  )
}
