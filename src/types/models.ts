export type MatchState = 'valide' | 'refuse' | 'en attente'

export type User = {
  id: string
  username: string
  email: string
  platform: string[]
  password: string
  preferences?: string[]
}

export type Post = {
  id: string
  game: string
  rank: string
  message: string
  platform: string[]
  authorId: string
}

export type Match = {
  id: string
  announceId: string
  userId: string
  state: MatchState
}

export type RegisterPayload = {
  username: string
  email: string
  platform: string[]
  password: string
}

export type SessionUser = {
  id: string
  email: string
  preferences: string[]
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export type Conversation = {
  id: string
  participantIds: string[]
  lastMessage?: string
  lastMessageAt?: string
}
