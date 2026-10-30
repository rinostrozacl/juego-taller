export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface PlayerState {
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  grounded: boolean
  animFrame: number
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  kind: BugKind
  hue: number
}

export type BugKind = 'virus' | 'worm' | 'glitch' | '404'

export type GamePhase = 'ready' | 'running' | 'gameover'

export interface GameSnapshot {
  phase: GamePhase
  score: number
  highScore: number
  speed: number
  player: PlayerState
  obstacles: Obstacle[]
}
