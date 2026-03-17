const AUTH_TOKEN_KEY = 'linkstart_auth_token'

type SessionPayload = {
  userId: string
  email: string
  preferences: string[]
  exp: number
}

type UserForSession = {
  id: string
  email: string
  preferences?: string[]
}

function toBase64Url(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return decodeURIComponent(escape(atob(padded)))
}

function createJwtMock(payload: SessionPayload): string {
  const header = { alg: 'none', typ: 'JWT' }
  return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}.`
}

function decodeJwtPayload(token: string): SessionPayload | null {
  const parts = token.split('.')

  if (parts.length < 2) {
    return null
  }

  try {
    return JSON.parse(fromBase64Url(parts[1])) as SessionPayload
  } catch {
    return null
  }
}

export function saveSessionFromUser(user: UserForSession): void {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    preferences: user.preferences ?? [],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  }

  localStorage.setItem(AUTH_TOKEN_KEY, createJwtMock(payload))
}

export function refreshSessionPreferences(preferences: string[]): void {
  const payload = getSessionPayload()
  if (!payload) {
    return
  }

  localStorage.setItem(
    AUTH_TOKEN_KEY,
    createJwtMock({
      ...payload,
      preferences,
    }),
  )
}

export function getSessionPayload(): SessionPayload | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)

  if (!payload) {
    clearSession()
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) {
    clearSession()
    return null
  }

  return payload
}

export function isAuthenticated(): boolean {
  return getSessionPayload() !== null
}

export function getCurrentUserId(): string | null {
  return getSessionPayload()?.userId ?? null
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getRawToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}
