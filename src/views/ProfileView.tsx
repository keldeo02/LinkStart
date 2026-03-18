import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import {
  deleteFriendship,
  getFriendship,
  sendFriendRequest,
  type Friendship,
} from '../services/friendsApi'
import { getPostsByAuthor } from '../services/postsApi'
import { getUserById } from '../services/usersApi'
import type { Post, User } from '../types/models'

export function ProfileView() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [friendship, setFriendship] = useState<Friendship | null>(null)
  const [friendMessage, setFriendMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()

  useEffect(() => {
    if (!id) {
      return
    }

    const load = async () => {
      try {
        const [profile, userPosts] = await Promise.all([getUserById(id), getPostsByAuthor(id)])
        setUser(profile)
        setPosts(userPosts)
        if (currentUserId && currentUserId !== id) {
          const existing = await getFriendship(currentUserId, id)
          setFriendship(existing)
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
      }
    }

    void load()
  }, [id])

  const handleAddFriend = async () => {
    if (!currentUserId || !id) return
    try {
      const created = await sendFriendRequest(currentUserId, id)
      setFriendship(created)
      setFriendMessage('Demande envoyee !')
    } catch (error) {
      setFriendMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  const handleRemoveFriend = async () => {
    if (!friendship) return
    try {
      await deleteFriendship(friendship.id)
      setFriendship(null)
      setFriendMessage('Ami retire.')
    } catch (error) {
      setFriendMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

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

            {currentUserId && currentUserId !== id ? (
              <div className="inline-actions">
                {!friendship ? (
                  <button type="button" className="btn-primary" onClick={() => void handleAddFriend()}>
                    + Ajouter en ami
                  </button>
                ) : friendship.state === 'en attente' ? (
                  <span className="form-message">Demande en attente...</span>
                ) : friendship.state === 'accept\u00e9' ? (
                  <button type="button" className="btn-primary btn-danger" onClick={() => void handleRemoveFriend()}>
                    Retirer des amis
                  </button>
                ) : null}
                {friendMessage ? <p className="form-message is-success">{friendMessage}</p> : null}
              </div>
            ) : null}
          </>
        ) : (
          <p className="form-message">Profil introuvable.</p>
        )}

        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
      </section>
    </main>
  )
}
