import { describe, expect, it } from 'vitest'
import { anyCollision, intersects } from './collision'

describe('intersects', () => {
  it('detecta solapamiento', () => {
    expect(
      intersects(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ),
    ).toBe(true)
  })

  it('no colisiona si están separados', () => {
    expect(
      intersects(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 0, width: 10, height: 10 },
      ),
    ).toBe(false)
  })

  it('respeta padding (hitbox más justa)', () => {
    expect(
      intersects(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 9, y: 0, width: 10, height: 10 },
        2,
      ),
    ).toBe(false)
  })
})

describe('anyCollision', () => {
  it('encuentra al menos un obstáculo', () => {
    const player = { x: 10, y: 10, width: 20, height: 20 }
    const obstacles = [
      { x: 100, y: 10, width: 10, height: 10 },
      { x: 15, y: 15, width: 10, height: 10 },
    ]
    expect(anyCollision(player, obstacles, 0)).toBe(true)
  })

  it('retorna false sin obstáculos cercanos', () => {
    const player = { x: 0, y: 0, width: 10, height: 10 }
    expect(
      anyCollision(player, [{ x: 50, y: 50, width: 10, height: 10 }], 0),
    ).toBe(false)
  })
})
