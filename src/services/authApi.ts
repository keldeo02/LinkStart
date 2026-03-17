import { API_URL } from './apiConfig'
import type { RegisterPayload, User } from '../types/models'

type RawUser = Partial<Omit<User, 'platform'>> & {
  id: string
  email: string
  password: string
  platform?: string | string[]
}

function normalizeUser(user: RawUser): User {
  const platforms: string[] = Array.isArray(user.platform)
    ? user.platform
    : user.platform
      ? [user.platform]
      : ['PC']
  return {
    id: user.id,
    username: user.username ?? 'Utilisateur',
    email: user.email,
    platform: platforms,
    password: user.password,
    preferences: user.preferences ?? platforms,
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const response = await fetch(
    `${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  )

  if (!response.ok) {
    throw new Error('Impossible de contacter le serveur.')
  }

  const users = (await response.json()) as Array<Partial<User> & { id: string; email: string; password: string }>
  return users[0] ? normalizeUser(users[0]) : null
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const existingResponse = await fetch(`${API_URL}/users?email=${encodeURIComponent(payload.email)}`)

  if (!existingResponse.ok) {
    throw new Error('Impossible de vérifier cet email.')
  }

  const existingUsers = (await existingResponse.json()) as User[]

  if (existingUsers.length > 0) {
    throw new Error('Un compte existe déjà avec cet email.')
  }

  const createResponse = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!createResponse.ok) {
    throw new Error('Impossible de créer le compte.')
  }

  const created = (await createResponse.json()) as Partial<User> & {
    id: string
    email: string
    password: string
  }

  return normalizeUser(created)
}
