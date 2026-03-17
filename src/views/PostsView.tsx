import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts } from '../services/postsApi'
import type { Post } from '../types/models'

export function PostsView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await getPosts()
        setPosts(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <main className="content-shell">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h1 className="auth-title">Annonces</h1>
            <p className="auth-subtitle">Retrouve tous les joueurs qui cherchent une team.</p>
          </div>
          <Link to="/post/create" className="btn-primary btn-link">
            Publier une annonce
          </Link>
        </div>

        {isLoading ? <p className="form-message">Chargement...</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <ul className="dashboard-list">
            {posts.map((post) => (
              <li key={post.id} className="dashboard-item stacked">
                <strong>{post.game}</strong>
                <span>{post.rank} • {post.platform.join(', ')}</span>
                <p>{post.message}</p>
                <div className="inline-actions">
                  <Link to={`/posts/${post.id}`} className="btn-primary btn-link">
                    Voir détail
                  </Link>
                  <Link to={`/profile/${post.authorId}`} className="btn-primary btn-link btn-secondary">
                    Profil auteur
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
