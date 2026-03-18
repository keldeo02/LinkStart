import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getConversations } from '../services/messagesApi'
import { getUsers } from '../services/usersApi'
import { getCurrentUserId } from '../services/authSession'
import type { Conversation, User } from '../types/models'

export function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadConversations = async (userId: string) => {
    try {
      const allConversations = await getConversations()
      const userConversations = allConversations.filter((conv) =>
        conv.participantIds.includes(userId)
      )
      setConversations(userConversations)

      const allUsers = await getUsers()
      const userMap = new Map(allUsers.map((user) => [user.id, user]))
      setUsers(userMap)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getCurrentUserId()
        if (!userId) {
          navigate('/login')
          return
        }

        setLoading(true)
        await loadConversations(userId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  // Auto-refresh des conversations toutes les 2 secondes
  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const interval = setInterval(() => {
      loadConversations(userId).catch(console.error)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getOtherUserId = (conv: Conversation): string => {
    const userId = getCurrentUserId()
    return conv.participantIds.find((id) => id !== userId) || ''
  }

  const getOtherUserName = (conv: Conversation): string => {
    const otherUserId = getOtherUserId(conv)
    return users.get(otherUserId)?.username || 'Utilisateur inconnu'
  }

  if (loading) {
    return (
      <div className="view-container">
        <h1>Messagerie</h1>
        <p>Chargement des conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-container">
        <h1>Messagerie</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="view-container">
      <h1>Messagerie</h1>

      {conversations.length === 0 ? (
        <div className="no-content">
          <p>Vous n'avez pas encore de conversations.</p>
        </div>
      ) : (
        <div className="messages-list">
          {conversations
            .sort((a, b) => {
              const timeA = new Date(a.lastMessageAt || 0).getTime()
              const timeB = new Date(b.lastMessageAt || 0).getTime()
              return timeB - timeA
            })
            .map((conversation) => (
              <Link
                key={conversation.id}
                to={`/messages/${conversation.id}`}
                className="message-item"
              >
                <div className="message-item-header">
                  <h3>{getOtherUserName(conversation)}</h3>
                  <span className="message-date">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleDateString('fr-FR')
                      : ''}
                  </span>
                </div>
                <p className="message-preview">{conversation.lastMessage || 'Aucun message'}</p>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
