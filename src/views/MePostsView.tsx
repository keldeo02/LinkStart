import { useEffect, useState } from 'react'
import { getCurrentUserId } from '../services/authSession'
import { getMatchesByAnnouncement, updateMatchState } from '../services/matchesApi'
import { getPostsByAuthor } from '../services/postsApi'
import { getUserById } from '../services/usersApi'
import type { Match, Post, User } from '../types/models'

type PostMatches = {
  post: Post
  requests: Array<Match & { user?: User | null }>
}

export function MePostsView() {
  const [items, setItems] = useState<PostMatches[]>([])
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const userId = getCurrentUserId()

  const load = async () => {
    if (!userId) {
      return
    }

    const myPosts = await getPostsByAuthor(userId)

    const withMatches = await Promise.all(
      myPosts.map(async (post) => {
        const requests = await getMatchesByAnnouncement(post.id)
        const withUsers = await Promise.all(
          requests.map(async (match) => ({
            ...match,
            user: await getUserById(match.userId),
          })),
        )

        return {
          post,
          requests: withUsers,
        }
      }),
    )

    setItems(withMatches)
  }

  useEffect(() => {
    const init = async () => {
      try {
        await load()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void init()
  }, [userId])

  const handleModeration = async (matchId: string, state: 'valide' | 'refuse') => {
    try {
      await updateMatchState(matchId, state)
      setMessage(`Demande ${state}.`)
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/me/post</p>
        <h1 className="auth-title">Mes annonces et matchs</h1>

        {items.length === 0 ? <p className="form-message">Aucune annonce publiée.</p> : null}

        {items.map((item) => (
          <article key={item.post.id} className="swipe-card">
            <p className="swipe-title">{item.post.game} ({item.post.rank})</p>
            <p>{item.post.message}</p>

            {item.requests.length === 0 ? <p className="form-message">Aucune demande.</p> : null}

            {item.requests.map((request) => (
              <div key={request.id} className="dashboard-item">
                <span>
                  {request.user?.username ?? request.userId} — état : {request.state}
                </span>
                <div className="inline-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => void handleModeration(request.id, 'valide')}
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    className="btn-primary btn-danger"
                    onClick={() => void handleModeration(request.id, 'refuse')}
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </article>
        ))}

        {message ? <p className="form-message is-success">{message}</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}
