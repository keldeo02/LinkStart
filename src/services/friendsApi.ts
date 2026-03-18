import { API_URL } from './apiConfig'

export type FriendState = 'en attente' | 'accepté' | 'refusé'

export type Friendship = {
  id: string
  requesterId: string
  receiverId: string
  state: FriendState
}

export async function getFriendships(userId: string): Promise<Friendship[]> {
  const [sent, received] = await Promise.all([
    fetch(`${API_URL}/friends?requesterId=${encodeURIComponent(userId)}`),
    fetch(`${API_URL}/friends?receiverId=${encodeURIComponent(userId)}`),
  ])

  if (!sent.ok || !received.ok) {
    throw new Error('Impossible de récupérer les amis.')
  }

  const sentData = (await sent.json()) as Friendship[]
  const receivedData = (await received.json()) as Friendship[]
  return [...sentData, ...receivedData]
}

export async function getFriendship(
  requesterId: string,
  receiverId: string,
): Promise<Friendship | null> {
  const [res1, res2] = await Promise.all([
    fetch(`${API_URL}/friends?requesterId=${encodeURIComponent(requesterId)}&receiverId=${encodeURIComponent(receiverId)}`),
    fetch(`${API_URL}/friends?requesterId=${encodeURIComponent(receiverId)}&receiverId=${encodeURIComponent(requesterId)}`),
  ])

  if (!res1.ok || !res2.ok) return null

  const data1 = (await res1.json()) as Friendship[]
  const data2 = (await res2.json()) as Friendship[]
  return data1[0] ?? data2[0] ?? null
}

export async function sendFriendRequest(requesterId: string, receiverId: string): Promise<Friendship> {
  const response = await fetch(`${API_URL}/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId, receiverId, state: 'en attente' }),
  })

  if (!response.ok) {
    throw new Error('Impossible d\'envoyer la demande.')
  }

  return (await response.json()) as Friendship
}

export async function updateFriendshipState(
  friendshipId: string,
  state: FriendState,
): Promise<Friendship> {
  const response = await fetch(`${API_URL}/friends/${friendshipId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  })

  if (!response.ok) {
    throw new Error('Impossible de mettre à jour la demande.')
  }

  return (await response.json()) as Friendship
}

export async function deleteFriendship(friendshipId: string): Promise<void> {
  const response = await fetch(`${API_URL}/friends/${friendshipId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Impossible de supprimer l\'ami.')
  }
}
