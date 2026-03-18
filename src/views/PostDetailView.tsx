import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createMatch, getMatchByAnnouncementAndUser, updateMatchState } from '../services/matchesApi'
import { getCurrentUserId } from '../services/authSession'
import { getPostById } from '../services/postsApi'
import type { Post } from '../types/models'

export function PostDetailView() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()

  useEffect(() => {
    if (!id) {
      return
    }

    const load = async () => {
      try {
        const data = await getPostById(id)
        setPost(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [id])

  const handleAskMatch = async () => {
    if (!post) {
      return
    }

    if (!currentUserId) {
      setMessage('Connecte-toi pour demander un match.')
      return
    }

    try {
      const existing = await getMatchByAnnouncementAndUser(post.id, currentUserId)

      if (!existing) {
        await createMatch(post.id, currentUserId, 'en attente')
        setMessage('Demande envoyée.')
        return
      }

      await updateMatchState(existing.id, 'en attente')
      setMessage('Demande mise à jour.')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  if (!post) {
    return (
      <main className="content-shell">
        <section className="panel">
          <p className="form-message">Annonce introuvable.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">Détail annonce</p>
        <h1 className="auth-title">{post.game}</h1>
        <p className="auth-subtitle">Rank {post.rank} • {post.platform.join(', ')}</p>
        <p>{post.message}</p>
        <div className="inline-actions">
          <button type="button" className="btn-primary" onClick={() => void handleAskMatch()}>
            Demander un match
          </button>
          <Link to="/posts" className="btn-primary btn-link btn-secondary">
            Retour
          </Link>
        </div>

        {message ? <p className="form-message is-success">{message}</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}
