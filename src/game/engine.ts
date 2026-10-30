import { anyCollision } from './collision'
import {
  loadHighScore,
  saveHighScore,
  scoreFromDistance,
  speedForScore,
} from './score'
import type {
  BugKind,
  GamePhase,
  GameSnapshot,
  Obstacle,
  PlayerState,
} from './types'

const GRAVITY = 2200
const JUMP_VELOCITY = -780
const GROUND_Y_RATIO = 0.78
const PLAYER_W = 44
const PLAYER_H = 52
const KINDS: BugKind[] = ['virus', 'worm', 'glitch', '404']

export interface EngineConfig {
  width: number
  height: number
  storage?: Storage
}

export class GameEngine {
  width: number
  height: number
  private storage: Storage
  phase: GamePhase = 'ready'
  score = 0
  highScore = 0
  speed = 280
  distance = 0
  player!: PlayerState
  obstacles: Obstacle[] = []
  private spawnTimer = 0
  private groundY = 0
  private rng: () => number

  constructor(config: EngineConfig, rng: () => number = Math.random) {
    this.width = config.width
    this.height = config.height
    this.storage = config.storage ?? localStorage
    this.rng = rng
    this.highScore = loadHighScore(this.storage)
    this.resetPlayer()
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.groundY = height * GROUND_Y_RATIO
    this.player.y = Math.min(this.player.y, this.groundY - this.player.height)
    if (this.player.grounded) {
      this.player.y = this.groundY - this.player.height
    }
  }

  private resetPlayer(): void {
    this.groundY = this.height * GROUND_Y_RATIO
    this.player = {
      x: this.width * 0.18,
      y: this.groundY - PLAYER_H,
      width: PLAYER_W,
      height: PLAYER_H,
      velocityY: 0,
      grounded: true,
      animFrame: 0,
    }
  }

  start(): void {
    this.phase = 'running'
    this.score = 0
    this.distance = 0
    this.speed = 280
    this.obstacles = []
    this.spawnTimer = 0.6
    this.resetPlayer()
  }

  restart(): void {
    this.highScore = loadHighScore(this.storage)
    this.start()
  }

  jump(): void {
    if (this.phase === 'ready') {
      this.start()
      this.doJump()
      return
    }
    if (this.phase === 'gameover') {
      this.restart()
      return
    }
    this.doJump()
  }

  private doJump(): void {
    if (this.phase !== 'running') return
    if (!this.player.grounded) return
    this.player.velocityY = JUMP_VELOCITY
    this.player.grounded = false
  }

  update(dt: number): void {
    if (this.phase !== 'running') return
    const clamped = Math.min(dt, 0.05)

    this.distance += this.speed * clamped
    this.score = scoreFromDistance(this.distance)
    this.speed = speedForScore(this.score)
    this.player.animFrame += clamped * (10 + this.speed / 80)

    this.player.velocityY += GRAVITY * clamped
    this.player.y += this.player.velocityY * clamped
    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height
      this.player.velocityY = 0
      this.player.grounded = true
    }

    this.spawnTimer -= clamped
    if (this.spawnTimer <= 0) {
      this.spawnObstacle()
      const gap = Math.max(0.55, 1.55 - this.score * 0.012)
      this.spawnTimer = gap + this.rng() * 0.55
    }

    for (const o of this.obstacles) {
      o.x -= this.speed * clamped
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -20)

    if (
      anyCollision(
        this.player,
        this.obstacles.map((o) => ({
          x: o.x,
          y: o.y,
          width: o.width,
          height: o.height,
        })),
        6,
      )
    ) {
      this.phase = 'gameover'
      this.highScore = saveHighScore(this.score, this.storage)
    }
  }

  private spawnObstacle(): void {
    const kind = KINDS[Math.floor(this.rng() * KINDS.length)] ?? 'virus'
    const size = 34 + Math.floor(this.rng() * 22)
    const tall = this.rng() > 0.7
    const height = tall ? size * 1.35 : size
    const width = tall ? size * 0.85 : size
    this.obstacles.push({
      x: this.width + 20,
      y: this.groundY - height,
      width,
      height,
      kind,
      hue: 120 + this.rng() * 160,
    })
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      score: this.score,
      highScore: this.highScore,
      speed: this.speed,
      player: { ...this.player },
      obstacles: this.obstacles.map((o) => ({ ...o })),
    }
  }

  getGroundY(): number {
    return this.groundY
  }
}
