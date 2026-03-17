import { API_URL } from './apiConfig'
import type { Post } from '../types/models'

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts`)
  if (!response.ok) {
    throw new Error('Impossible de récupérer les annonces.')
  }
  return (await response.json()) as Post[]
}

export async function getPostById(postId: string): Promise<Post | null> {
  const response = await fetch(`${API_URL}/posts/${postId}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error('Impossible de récupérer cette annonce.')
  }
  return (await response.json()) as Post
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const normalizedAuthorId = String(authorId).trim()
  const response = await fetch(`${API_URL}/posts?authorId=${encodeURIComponent(normalizedAuthorId)}`)
  if (!response.ok) {
    throw new Error('Impossible de récupérer tes annonces.')
  }

  const scopedPosts = (await response.json()) as Post[]
  if (scopedPosts.length > 0) {
    return scopedPosts
  }

  const allResponse = await fetch(`${API_URL}/posts`)
  if (!allResponse.ok) {
    throw new Error('Impossible de récupérer tes annonces.')
  }

  const allPosts = (await allResponse.json()) as Array<Post & { userId?: string; authorID?: string }>
  return allPosts.filter((post) => {
    const candidateAuthorId = String(post.authorId ?? post.userId ?? post.authorID ?? '').trim()
    return candidateAuthorId === normalizedAuthorId
  })
}

export async function createPost(payload: Omit<Post, 'id'>): Promise<Post> {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Impossible de créer l\'annonce.')
  }

  return (await response.json()) as Post
}

export async function updatePost(postId: string, payload: Omit<Post, 'id' | 'authorId'>): Promise<Post> {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Impossible de modifier l\'annonce.')
  }

  return (await response.json()) as Post
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Impossible de supprimer l\'annonce.')
  }
}
