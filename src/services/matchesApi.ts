import { API_URL } from './apiConfig'
import type { Match, MatchState } from '../types/models'

export async function getMatchesByAnnouncement(announceId: string): Promise<Match[]> {
  const response = await fetch(`${API_URL}/matches?announceId=${encodeURIComponent(announceId)}`)

  if (!response.ok) {
    throw new Error('Impossible de récupérer les demandes de match.')
  }

  return (await response.json()) as Match[]
}

export async function getMatchByAnnouncementAndUser(
  announceId: string,
  userId: string,
): Promise<Match | null> {
  const response = await fetch(
    `${API_URL}/matches?announceId=${encodeURIComponent(announceId)}&userId=${encodeURIComponent(userId)}`,
  )

  if (!response.ok) {
    throw new Error('Impossible de récupérer ce match.')
  }

  const matches = (await response.json()) as Match[]
  return matches[0] ?? null
}

export async function createMatch(
  announceId: string,
  userId: string,
  state: MatchState = 'en attente',
): Promise<Match> {
  const response = await fetch(`${API_URL}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ announceId, userId, state }),
  })

  if (!response.ok) {
    throw new Error('Impossible de créer la demande de match.')
  }

  return (await response.json()) as Match
}

export async function updateMatchState(matchId: string, state: MatchState): Promise<Match> {
  const response = await fetch(`${API_URL}/matches/${matchId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  })

  if (!response.ok) {
    throw new Error('Impossible de mettre à jour ce match.')
  }

  return (await response.json()) as Match
}
