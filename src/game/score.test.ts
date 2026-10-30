import { describe, expect, it } from 'vitest'
import {
  HIGH_SCORE_KEY,
  loadHighScore,
  saveHighScore,
  scoreFromDistance,
  speedForScore,
} from './score'

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

describe('scoreFromDistance', () => {
  it('convierte distancia a puntos', () => {
    expect(scoreFromDistance(0)).toBe(0)
    expect(scoreFromDistance(99)).toBe(9)
    expect(scoreFromDistance(100)).toBe(10)
  })
})

describe('speedForScore', () => {
  it('aumenta con el score y respeta el tope', () => {
    expect(speedForScore(0)).toBe(280)
    expect(speedForScore(10)).toBeGreaterThan(280)
    expect(speedForScore(10_000)).toBe(720)
  })
})

describe('high score localStorage', () => {
  it('carga 0 si no hay valor', () => {
    const s = memoryStorage()
    expect(loadHighScore(s)).toBe(0)
  })

  it('guarda y actualiza solo si mejora', () => {
    const s = memoryStorage()
    expect(saveHighScore(50, s)).toBe(50)
    expect(s.getItem(HIGH_SCORE_KEY)).toBe('50')
    expect(saveHighScore(30, s)).toBe(50)
    expect(saveHighScore(80, s)).toBe(80)
    expect(loadHighScore(s)).toBe(80)
  })
})
