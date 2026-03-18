import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import { getPostsByAuthor } from '../services/postsApi'
import { getUserById } from '../services/usersApi'
import type { User } from '../types/models'

export function MeView() {
  const [user, setUser] = useState<User | null>(null)
  const [postCount, setPostCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const userId = getCurrentUserId()

  useEffect(() => {
    if (!userId) {
      return
    }

    const load = async () => {
      try {
        const [profile, posts] = await Promise.all([getUserById(userId), getPostsByAuthor(userId)])
        setUser(profile)
        setPostCount(posts.length)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [userId])

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/me</p>
        <h1 className="auth-title">Mon profil gamer</h1>

        {user ? (
          <div className="dashboard-list">
            <p><strong>Username :</strong> {user.username}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Plateforme :</strong> {user.platform.join(', ')}</p>
            <p><strong>Annonces publiées :</strong> {postCount}</p>
          </div>
        ) : (
          <p className="form-message">Chargement...</p>
        )}

        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

        <div className="inline-actions">
          <Link className="btn-primary btn-link" to="/me/edit">
            Modifier mon profil
          </Link>
          <Link className="btn-primary btn-link btn-secondary" to="/logout">
            Déconnexion
          </Link>
        </div>
      </section>
    </main>
  )
}
