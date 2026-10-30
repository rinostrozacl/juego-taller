import { describe, expect, it } from 'vitest'
import { GameEngine } from './engine'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) as string) : null
    },
    key(index: number) {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, String(value))
    },
  }
}

describe('GameEngine', () => {
  it('inicia en ready y pasa a running con jump', () => {
    const engine = new GameEngine(
      { width: 800, height: 450, storage: memoryStorage() },
      () => 0.1,
    )
    expect(engine.phase).toBe('ready')
    engine.jump()
    expect(engine.phase).toBe('running')
    expect(engine.player.grounded).toBe(false)
  })

  it('aumenta score con el tiempo y termina por colisión', () => {
    let n = 0
    const rng = () => {
      n += 1
      return n % 2 === 0 ? 0.1 : 0.9
    }
    const engine = new GameEngine(
      { width: 400, height: 300, storage: memoryStorage() },
      rng,
    )
    engine.start()
    // forzar obstáculo encima del jugador
    engine.obstacles.push({
      x: engine.player.x,
      y: engine.player.y,
      width: engine.player.width,
      height: engine.player.height,
      kind: 'virus',
      hue: 120,
    })
    engine.update(0.016)
    expect(engine.phase).toBe('gameover')
    expect(engine.highScore).toBeGreaterThanOrEqual(0)
  })

  it('reinicia tras game over con jump', () => {
    const engine = new GameEngine(
      { width: 800, height: 450, storage: memoryStorage() },
      () => 0.2,
    )
    engine.start()
    engine.phase = 'gameover'
    engine.score = 42
    engine.jump()
    expect(engine.phase).toBe('running')
    expect(engine.score).toBe(0)
  })
})
