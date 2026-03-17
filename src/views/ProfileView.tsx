import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPostsByAuthor } from '../services/postsApi'
import { getUserById } from '../services/usersApi'
import type { Post, User } from '../types/models'

export function ProfileView() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!id) {
      return
    }

    const load = async () => {
      try {
        const [profile, userPosts] = await Promise.all([getUserById(id), getPostsByAuthor(id)])
        setUser(profile)
        setPosts(userPosts)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [id])

  return (
    <main className="content-shell">
      <section className="panel">
        <p className="auth-kicker">/profile/:id</p>
        <h1 className="auth-title">Profil gamer</h1>

        {user ? (
          <>
            <p><strong>Username :</strong> {user.username}</p>
            <p><strong>Plateforme :</strong> {user.platform.join(', ')}</p>
            <p><strong>Annonces :</strong> {posts.length}</p>
          </>
        ) : (
          <p className="form-message">Profil introuvable.</p>
        )}

        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}
