import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import { getPosts } from '../services/postsApi'
import { getUsers } from '../services/usersApi'
import type { Post, User } from '../types/models'

export function FavoritesView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [usersById, setUsersById] = useState<Record<string, User>>({})
  const [favoritePostIds, setFavoritePostIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()
  const favoritesStorageKey = `linkstart_fav_posts_${currentUserId ?? 'guest'}`

  useEffect(() => {
    const rawValue = localStorage.getItem(favoritesStorageKey)
    if (!rawValue) {
      setFavoritePostIds([])
      return
    }

    try {
      const parsed = JSON.parse(rawValue) as string[]
      setFavoritePostIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setFavoritePostIds([])
    }
  }, [favoritesStorageKey])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [postsData, usersData] = await Promise.all([getPosts(), getUsers()])
        setPosts(postsData)
        setUsersById(Object.fromEntries(usersData.map((user) => [user.id, user])))
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const removeFavorite = (postId: string) => {
    setFavoritePostIds((previous) => {
      const next = previous.filter((id) => id !== postId)
      localStorage.setItem(favoritesStorageKey, JSON.stringify(next))
      return next
    })
  }

  const favoritePosts = useMemo(
    () => posts.filter((post) => favoritePostIds.includes(post.id)),
    [posts, favoritePostIds],
  )

  return (
    <main className="content-shell">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h1 className="auth-title">Mes favoris</h1>
            <p className="auth-subtitle">Les annonces que tu as mises de côté.</p>
          </div>
          <Link to="/posts" className="btn-primary btn-link btn-secondary">
            Toutes les annonces
          </Link>
        </div>

        {isLoading ? <p className="form-message">Chargement...</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

        {!isLoading && favoritePosts.length === 0 ? (
          <p className="form-message">Aucune annonce en favori pour l'instant.</p>
        ) : null}

        {!isLoading ? (
          <ul className="dashboard-list">
            {favoritePosts.map((post) => (
              <li key={post.id} className="dashboard-item stacked">
                <strong>{post.game}</strong>
                <span>{post.rank} • {post.platform.join(', ')}</span>
                <p>{post.message}</p>
                <span className="form-message">Auteur : {usersById[post.authorId]?.username ?? 'Inconnu'}</span>
                <div className="inline-actions">
                  <Link to={`/posts/${post.id}`} className="btn-primary btn-link">
                    Voir détail
                  </Link>
                  <Link to={`/profile/${post.authorId}`} className="btn-primary btn-link btn-secondary">
                    Profil auteur
                  </Link>
                  <button
                    type="button"
                    className="btn-primary btn-danger"
                    onClick={() => removeFavorite(post.id)}
                  >
                    ★ Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
