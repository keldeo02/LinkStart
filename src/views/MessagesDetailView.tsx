import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getConversationById,
  getMessagesByConversation,
  createMessage,
  updateConversation,
} from '../services/messagesApi'
import { getUserById } from '../services/usersApi'
import { getCurrentUserId } from '../services/authSession'
import type { Conversation, Message, User } from '../types/models'

export function MessagesDetailView() {
  const { id: conversationId } = useParams<{ id: string }>()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await getMessagesByConversation(convId)
      setMessages(msgs)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  const mergeMessages = async (convId: string) => {
    try {
      const msgs = await getMessagesByConversation(convId)
      
      // Garder les anciens messages et ajouter les nouveaux
      setMessages(prevMessages => {
        const merged = [...prevMessages]
        
        // Ajouter ou mettre à jour les messages de la DB
        for (const msg of msgs) {
          const index = merged.findIndex(m => m.id === msg.id)
          if (index === -1) {
            // Nouveau message de la DB
            merged.push(msg)
          } else {
            // Mettre à jour un message existant
            merged[index] = msg
          }
        }
        
        // Trier par date de création
        merged.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        return merged
      })
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!conversationId) {
          navigate('/messages')
          return
        }

        const userId = getCurrentUserId()
        if (!userId) {
          navigate('/login')
          return
        }

        const conv = await getConversationById(conversationId)
        if (!conv) {
          setError('Conversation non trouvée.')
          return
        }

        if (!conv.participantIds.includes(userId)) {
          setError('Vous n\'avez pas accès à cette conversation.')
          return
        }

        setConversation(conv)

        await loadMessages(conversationId)

        const otherUserId = conv.participantIds.find((id) => id !== userId)
        if (otherUserId) {
          const user = await getUserById(otherUserId)
          if (user) {
            setOtherUser(user)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la conversation')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [conversationId, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-refresh des messages toutes les 5 secondes
  useEffect(() => {
    if (!conversationId) return

    const interval = setInterval(() => {
      mergeMessages(conversationId).catch(console.error)
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageContent.trim()) {
      return
    }

    if (!conversation || !conversationId) {
      return
    }

    const userId = getCurrentUserId()
    if (!userId) {
      return
    }

    try {
      setSending(true)

      const newMessage = await createMessage({
        conversationId,
        senderId: userId,
        content: messageContent.trim(),
        createdAt: new Date().toISOString(),
      })

      setMessages([...messages, newMessage])

      await updateConversation(conversationId, {
        lastMessage: messageContent.trim(),
        lastMessageAt: newMessage.createdAt,
      })

      setMessageContent('')
      
      // Recharger les messages du serveur pour assurer la synchronisation
      setTimeout(() => {
        mergeMessages(conversationId).catch(console.error)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  const handleRefreshMessages = async () => {
    if (!conversationId) return
    try {
      setRefreshing(true)
      await mergeMessages(conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rechargement')
    } finally {
      setRefreshing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Entrée = envoyer, Shift+Entrée = nouvelle ligne
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = (e.target as HTMLTextAreaElement).form
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }))
      }
    }
  }

  const userId = getCurrentUserId()

  if (loading) {
    return (
      <div className="view-container">
        <h1>Conversation</h1>
        <p>Chargement de la conversation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-container">
        <h1>Conversation</h1>
        <div className="error-message">{error}</div>
        <Link to="/messages" className="button">
          Retour aux messages
        </Link>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="view-container">
        <h1>Conversation</h1>
        <div className="error-message">Conversation non trouvée.</div>
        <Link to="/messages" className="button">
          Retour aux messages
        </Link>
      </div>
    )
  }

  return (
    <div className="view-container messages-detail">
      <div className="messages-header">
        <Link to="/messages" className="back-link">
          ← Retour
        </Link>
        <h1>{otherUser?.username || 'Utilisateur inconnu'}</h1>
        <button
          type="button"
          onClick={handleRefreshMessages}
          disabled={refreshing}
          className="btn-icon-refresh"
          title="Recharger les messages"
        >
          {refreshing ? '⟳' : '↻'}
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Aucun message pour le moment.</p>
          </div>
        ) : (
          <div className="messages-list-detail">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${
                  message.senderId === userId ? 'message-own' : 'message-other'
                }`}
              >
                <p className="message-text">{message.content}</p>
                <span className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <div className="message-input-wrapper">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            disabled={sending}
            rows={3}
          />
          <button type="submit" disabled={sending || !messageContent.trim()}>
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  )
}
