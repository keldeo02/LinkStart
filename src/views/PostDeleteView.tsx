import { useEffect, useState, type ChangeEvent } from 'react'
import { getCurrentUserId } from '../services/authSession'
import { deletePost, getPostsByAuthor } from '../services/postsApi'
import type { Post } from '../types/models'

export function PostDeleteView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()

  const reload = async () => {
    if (!currentUserId) {
      return
    }

    const data = await getPostsByAuthor(currentUserId)
    setPosts(data)
    setSelectedPostId(data[0]?.id ?? '')
  }

  useEffect(() => {
    const init = async () => {
      try {
        await reload()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void init()
  }, [currentUserId])

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPostId(event.target.value)
  }

  const handleDelete = async () => {
    if (!selectedPostId) {
      setErrorMessage('Aucune annonce sélectionnée.')
      return
    }

    try {
      await deletePost(selectedPostId)
      setMessage('Annonce supprimée.')
      setErrorMessage('')
      await reload()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/post/delete</p>
        <h1 className="auth-title">Supprimer une annonce</h1>

        <label className="form-field">
          <span>Annonce à supprimer</span>
          <select className="input-select" value={selectedPostId} onChange={handleChange}>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.game} - {post.rank}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="btn-primary btn-danger" onClick={() => void handleDelete()}>
          Supprimer
        </button>

        {message ? <p className="form-message is-success">{message}</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}
