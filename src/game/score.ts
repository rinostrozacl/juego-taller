export const HIGH_SCORE_KEY = 'juego-taller-high-score'

export function loadHighScore(storage: Storage = localStorage): number {
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY)
    const value = raw == null ? 0 : Number(raw)
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

export function saveHighScore(
  score: number,
  storage: Storage = localStorage,
): number {
  const next = Math.max(0, Math.floor(score))
  const current = loadHighScore(storage)
  const best = Math.max(current, next)
  try {
    storage.setItem(HIGH_SCORE_KEY, String(best))
  } catch {
    // storage lleno o bloqueado
  }
  return best
}

export function scoreFromDistance(distance: number): number {
  return Math.floor(Math.max(0, distance) / 10)
}

export function speedForScore(score: number, base = 280, max = 720): number {
  return Math.min(max, base + score * 2.2)
}
