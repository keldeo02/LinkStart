import { API_URL } from './apiConfig'
import type { User } from '../types/models'

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`)

  if (!response.ok) {
    throw new Error('Impossible de récupérer les joueurs.')
  }

  return (await response.json()) as User[]
}

export async function getUserById(userId: string): Promise<User | null> {
  const response = await fetch(`${API_URL}/users/${userId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Impossible de récupérer ce profil.')
  }

  return (await response.json()) as User
}

export async function updateUser(
  userId: string,
  payload: Partial<Pick<User, 'username' | 'platform' | 'preferences'>>,
): Promise<User> {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Impossible de modifier le profil.')
  }

  return (await response.json()) as User
}
