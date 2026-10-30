import type { Rect } from './types'

/** Colisión AABB con margen opcional para hitbox más justa. */
export function intersects(a: Rect, b: Rect, padding = 0): boolean {
  const ax = a.x + padding
  const ay = a.y + padding
  const aw = a.width - padding * 2
  const ah = a.height - padding * 2
  const bx = b.x + padding
  const by = b.y + padding
  const bw = b.width - padding * 2
  const bh = b.height - padding * 2

  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function anyCollision(
  player: Rect,
  obstacles: Rect[],
  padding = 4,
): boolean {
  return obstacles.some((o) => intersects(player, o, padding))
}
