import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getCurrentUserId } from '../services/authSession'
import { getPostsByAuthor, updatePost } from '../services/postsApi'
import { PlatformPicker } from '../components/PlatformPicker'
import type { Post } from '../types/models'

export function PostEditView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState('')
  const [formData, setFormData] = useState({ game: '', rank: '', message: '', platform: [] as string[] })
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    const load = async () => {
      try {
        const data = await getPostsByAuthor(currentUserId)
        setPosts(data)
        if (data[0]) {
          setSelectedPostId(data[0].id)
          setFormData({
            game: data[0].game,
            rank: data[0].rank,
            message: data[0].message,
            platform: Array.isArray(data[0].platform) ? data[0].platform : [data[0].platform],
          })
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [currentUserId])

  const handleSelectPost = (event: ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value
    setSelectedPostId(id)
    const selected = posts.find((post) => post.id === id)
    if (selected) {
      setFormData({
        game: selected.game,
        rank: selected.rank,
        message: selected.message,
        platform: Array.isArray(selected.platform) ? selected.platform : [selected.platform],
      })
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedPostId) {
      setErrorMessage('Aucune annonce sélectionnée.')
      return
    }

    try {
      await updatePost(selectedPostId, formData)
      setMessage('Annonce modifiée.')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/post/edit</p>
        <h1 className="auth-title">Modifier une annonce</h1>

        <label className="form-field">
          <span>Annonce</span>
          <select className="input-select" value={selectedPostId} onChange={handleSelectPost}>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.game} - {post.rank}
              </option>
            ))}
          </select>
        </label>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Jeu</span>
            <input name="game" value={formData.game} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>Rank</span>
            <input name="rank" value={formData.rank} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>Message</span>
            <input name="message" value={formData.message} onChange={handleChange} />
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
