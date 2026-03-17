import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUserId } from '../services/authSession'
import {
  createMatch,
  getMatchByAnnouncementAndUser,
  updateMatchState,
} from '../services/matchesApi'
import { getPosts } from '../services/postsApi'
import type { Post } from '../types/models'

type SwipeDirection = 'idle' | 'left' | 'right'

export function SwipeView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<SwipeDirection>('idle')
  const [feedback, setFeedback] = useState<{ text: string; type: 'ok' | 'ko' } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const currentUserId = getCurrentUserId()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPosts()
        setPosts(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Impossible de charger les annonces.')
      }
    }

    void load()
  }, [])

  const candidates = useMemo(
    () => posts.filter((post) => post.authorId !== currentUserId),
    [posts, currentUserId],
  )

  const currentCard: Post | null = candidates[index] ?? null
  const remaining = candidates.length - index

  const advance = () => {
    setTimeout(() => {
      setIndex((i) => i + 1)
      setDirection('idle')
      setFeedback(null)
    }, 350)
  }

  const handleSwipe = async (decision: 'valide' | 'refuse') => {
    if (!currentCard) {
      return
    }

    const dir = decision === 'valide' ? 'right' : 'left'
    setDirection(dir)

    try {
      const existing = await getMatchByAnnouncementAndUser(currentCard.id, currentUserId!)

      if (existing) {
        await updateMatchState(existing.id, decision === 'valide' ? 'en attente' : 'refuse')
      } else {
        await createMatch(currentCard.id, currentUserId!, decision === 'valide' ? 'en attente' : 'refuse')
      }

      setFeedback(
        decision === 'valide'
          ? { text: 'Match envoyé !', type: 'ok' }
          : { text: 'Passé', type: 'ko' },
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors du swipe.')
      setDirection('idle')
      return
    }

    advance()
  }

  return (
    <main className="swipe-shell">
      <div className="swipe-header">
        <h1 className="auth-title">Match</h1>
        {remaining > 0 ? (
          <p className="auth-subtitle">{remaining} annonce{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="form-message is-error">{errorMessage}</p> : null}

      {!currentCard ? (
        <div className="swipe-done">
          <p className="swipe-done-emoji">🎮</p>
          <p className="swipe-done-title">Tu as tout vu !</p>
          <p className="auth-subtitle">Reviens plus tard ou publie ta propre annonce.</p>
          <Link to="/post/create" className="btn-primary btn-link">
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="swipe-stage">
          <article
            className={`tinder-card tinder-card--${direction}`}
            key={currentCard.id}
          >
            {feedback && direction !== 'idle' ? (
              <div className={`tinder-badge tinder-badge--${feedback.type}`}>
                {feedback.type === 'ok' ? '✓ Match' : '✗ Pass'}
              </div>
            ) : null}

            <div className="tinder-card-platform">{currentCard.platform.join(' / ')}</div>
            <p className="tinder-card-game">{currentCard.game}</p>
            <p className="tinder-card-rank">Rank : {currentCard.rank}</p>
            <p className="tinder-card-message">"{currentCard.message}"</p>

            <Link
              to={`/profile/${currentCard.authorId}`}
              className="tinder-card-profile"
            >
              Voir le profil →
            </Link>
          </article>

          <div className="swipe-actions">
            <button
              type="button"
              className="swipe-btn swipe-btn--pass"
              onClick={() => void handleSwipe('refuse')}
              aria-label="Passer"
            >
              ✕
            </button>
            <button
              type="button"
              className="swipe-btn swipe-btn--match"
              onClick={() => void handleSwipe('valide')}
              aria-label="Matcher"
            >
              ♥
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
