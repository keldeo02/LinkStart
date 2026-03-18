import { API_URL } from './apiConfig'
import type { Message, Conversation } from '../types/models'

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/conversations`)
  if (!response.ok) {
    throw new Error('Impossible de récupérer les conversations.')
  }
  return (await response.json()) as Conversation[]
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error('Impossible de récupérer cette conversation.')
  }
  return (await response.json()) as Conversation
}

export async function getConversationByParticipants(
  userId: string,
  otherUserId: string
): Promise<Conversation | null> {
  const conversations = await getConversations()
  const conversation = conversations.find(
    (conv) =>
      conv.participantIds.includes(userId) && conv.participantIds.includes(otherUserId)
  )
  return conversation || null
}

export async function createConversation(participantIds: string[]): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participantIds: participantIds.sort(),
      lastMessage: undefined,
      lastMessageAt: undefined,
    }),
  })

  if (!response.ok) {
    throw new Error('Impossible de créer la conversation.')
  }

  return (await response.json()) as Conversation
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  // Au lieu de faire confiance au filtrage de json-server, on charge tout et on filtre
  const response = await fetch(`${API_URL}/messages`)
  if (!response.ok) {
    throw new Error('Impossible de récupérer les messages.')
  }
  
  const allMessages = (await response.json()) as Message[]
  
  const filtered = allMessages
    .filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
  return filtered
}

export async function getMessageById(messageId: string): Promise<Message | null> {
  const response = await fetch(`${API_URL}/messages/${messageId}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error('Impossible de récupérer ce message.')
  }
  return (await response.json()) as Message
}

export async function createMessage(payload: Omit<Message, 'id'>): Promise<Message> {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Impossible d\'envoyer le message.')
  }

  return (await response.json()) as Message
}

export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Impossible de mettre à jour la conversation.')
  }

  return (await response.json()) as Conversation
}

export async function deleteMessage(messageId: string): Promise<void> {
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Impossible de supprimer le message.')
  }
}
