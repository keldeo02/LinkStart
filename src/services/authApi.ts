const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type User = {
  id: number
  fullName: string
  email: string
  password: string
}

type RegisterPayload = {
  fullName: string
  email: string
  password: string
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const response = await fetch(
    `${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  )

  if (!response.ok) {
    throw new Error('Impossible de contacter le serveur.')
  }

  const users = (await response.json()) as User[]
  return users[0] ?? null
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

  return (await createResponse.json()) as User
}
