import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import {
  deleteFriendship,
  getFriendships,
  updateFriendshipState,
  type Friendship,
} from '../services/friendsApi'
import { getUserById } from '../services/usersApi'
import {
  getConversationByParticipants,
  createConversation,
} from '../services/messagesApi'
import type { User } from '../types/models'

type FriendshipWithUser = Friendship & { user: User | null }

export function FriendsView() {
  const [friendships, setFriendships] = useState<FriendshipWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const currentUserId = getCurrentUserId()

  const load = async () => {
    if (!currentUserId) return

    try {
      setIsLoading(true)
      const data = await getFriendships(currentUserId)

      const withUsers = await Promise.all(
        data.map(async (friendship) => {
          const otherUserId =
            friendship.requesterId === currentUserId
              ? friendship.receiverId
              : friendship.requesterId
          return { ...friendship, user: await getUserById(otherUserId) }
        }),
      )

      setFriendships(withUsers)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [currentUserId])

  const handleAccept = async (friendshipId: string) => {
    try {
      await updateFriendshipState(friendshipId, 'accepté')
      setMessage('Demande acceptée.')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  const handleRefuse = async (friendshipId: string) => {
    try {
      await updateFriendshipState(friendshipId, 'refusé')
      setMessage('Demande refusée.')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  const handleRemove = async (friendshipId: string) => {
    try {
      await deleteFriendship(friendshipId)
      setMessage('Ami retiré.')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue.')
    }
  }

  const handleMessage = async (friendUserId: string) => {
    try {
      if (!currentUserId) return

      // Cherche ou crée une conversation
      let conversation = await getConversationByParticipants(currentUserId, friendUserId)

      if (!conversation) {
        conversation = await createConversation([currentUserId, friendUserId])
      }

      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la création de la conversation.')
    }
  }

  const accepted = friendships.filter((f) => f.state === 'accepté')
  const pendingReceived = friendships.filter(
    (f) => f.state === 'en attente' && f.receiverId === currentUserId,
  )
  const pendingSent = friendships.filter(
    (f) => f.state === 'en attente' && f.requesterId === currentUserId,
  )

  return (
    <main className="content-shell">
      <section className="panel">
        <h1 className="auth-title">Mes amis</h1>

        {message ? <p className="form-message is-success">{message}</p> : null}
        {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}
        {isLoading ? <p className="form-message">Chargement...</p> : null}

        {!isLoading && (
          <>
            {pendingReceived.length > 0 && (
              <div className="fav-box">
                <p className="auth-kicker">Demandes reçues ({pendingReceived.length})</p>
                <ul className="dashboard-list">
                  {pendingReceived.map((f) => (
                    <li key={f.id} className="dashboard-item">
                      <Link to={`/profile/${f.user?.id}`} className="btn-primary btn-link btn-secondary">
                        {f.user?.username ?? f.requesterId}
                      </Link>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => void handleAccept(f.id)}
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          className="btn-primary btn-danger"
                          onClick={() => void handleRefuse(f.id)}
                        >
                          Refuser
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {accepted.length > 0 ? (
              <ul className="dashboard-list">
                {accepted.map((f) => (
                  <li key={f.id} className="dashboard-item">
                    <Link to={`/profile/${f.user?.id}`} className="btn-primary btn-link btn-secondary">
                      {f.user?.username ?? 'Joueur inconnu'}
                    </Link>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => void handleMessage(f.user?.id || '')}
                      >
                        Message
                      </button>
                      <button
                        type="button"
                        className="btn-primary btn-danger"
                        onClick={() => void handleRemove(f.id)}
                      >
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="form-message">Aucun ami pour l'instant.</p>
            )}

            {pendingSent.length > 0 && (
              <div className="fav-box">
                <p className="auth-kicker">Demandes envoyées ({pendingSent.length})</p>
                <ul className="dashboard-list">
                  {pendingSent.map((f) => (
                    <li key={f.id} className="dashboard-item">
                      <span>{f.user?.username ?? f.receiverId}</span>
                      <span className="form-message">En attente...</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
