import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import { getPosts } from '../services/postsApi'
import { getUsers } from '../services/usersApi'
import type { Post, User } from '../types/models'

export function PostsView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [usersById, setUsersById] = useState<Record<string, User>>({})
  const [gameFilter, setGameFilter] = useState('all')
  const [playerSearch, setPlayerSearch] = useState('')
  const [favoritePostIds, setFavoritePostIds] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const currentUserId = getCurrentUserId()
  const favoritesStorageKey = `linkstart_fav_posts_${currentUserId ?? 'guest'}`

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

  const availableGames = useMemo(
    () => [...new Set(posts.map((post) => post.game))].sort((left, right) => left.localeCompare(right)),
    [posts],
  )

  const normalizedSearch = playerSearch.trim().toLowerCase()

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchesGame = gameFilter === 'all' || post.game === gameFilter
        const authorName = usersById[post.authorId]?.username?.toLowerCase() ?? ''
        const matchesPlayer = normalizedSearch.length === 0 || authorName.includes(normalizedSearch)
        return matchesGame && matchesPlayer
      }),
    [posts, gameFilter, usersById, normalizedSearch],
  )

  const matchingPlayers = useMemo(() => {
    if (normalizedSearch.length === 0) {
      return [] as User[]
    }
    return Object.values(usersById)
      .filter((user) => user.username.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => left.username.localeCompare(right.username))
  }, [usersById, normalizedSearch])

  const toggleFavoritePost = (postId: string) => {
    setFavoritePostIds((previous) => {
      const next = previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
      localStorage.setItem(favoritesStorageKey, JSON.stringify(next))
      return next
    })
  }

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

        <div className="filters-row">
          <label className="form-field filters-field">
            <span>Filtrer par jeu</span>
            <select
              className="input-select"
              value={gameFilter}
              onChange={(event) => setGameFilter(event.target.value)}
            >
              <option value="all">Tous les jeux</option>
              {availableGames.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field filters-field">
            <span>Rechercher un joueur</span>
            <input
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
              placeholder="Ex: Gabin"
            />
          </label>
        </div>

        {normalizedSearch ? (
          <div className="fav-box">
            <p className="auth-kicker">Résultats joueurs</p>
            {matchingPlayers.length === 0 ? (
              <p className="form-message">Aucun joueur trouvé.</p>
            ) : (
              <div className="inline-actions">
                {matchingPlayers.map((player) => (
                  <Link key={player.id} to={`/profile/${player.id}`} className="btn-primary btn-link btn-secondary">
                    {player.username}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {isLoading ? <p className="form-message">Chargement...</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <ul className="dashboard-list">
            {filteredPosts.map((post) => (
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
                    className="btn-primary btn-secondary"
                    onClick={() => toggleFavoritePost(post.id)}
                  >
                    {favoritePostIds.includes(post.id) ? '★ Retirer fav' : '☆ Ajouter fav'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {!isLoading && !errorMessage && filteredPosts.length === 0 ? (
          <p className="form-message">Aucune annonce pour ce filtre.</p>
        ) : null}
      </section>
    </main>
  )
}
