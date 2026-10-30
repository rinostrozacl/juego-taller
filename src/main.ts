import { GameEngine } from './game/engine'
import { drawFrame } from './game/render'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('No se encontró #app')
}

app.innerHTML = `
  <div class="shell">
    <header class="top">
      <p class="brand">Code Runner</p>
      <p class="tag">Escape de los Bugs</p>
    </header>
    <canvas id="game" aria-label="Code Runner: Escape de los Bugs"></canvas>
    <p class="hint">ESPACIO · ↑ · toque para saltar</p>
  </div>
`

const canvasEl = document.querySelector<HTMLCanvasElement>('#game')
if (!canvasEl) {
  throw new Error('No se encontró el canvas')
}
const canvas: HTMLCanvasElement = canvasEl

const context = canvas.getContext('2d')
if (!context) {
  throw new Error('Canvas 2D no disponible')
}
const ctx: CanvasRenderingContext2D = context

const engine = new GameEngine({ width: 800, height: 450 })
let last = performance.now()
let animTime = 0

function resize(): void {
  const maxW = Math.min(window.innerWidth - 24, 960)
  const maxH = Math.min(window.innerHeight - 140, 540)
  const ratio = 16 / 9
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${Math.floor(w)}px`
  canvas.style.height = `${Math.floor(h)}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  engine.resize(w, h)
}

function onJump(e?: Event): void {
  e?.preventDefault()
  engine.jump()
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    onJump()
  }
})

canvas.addEventListener('pointerdown', onJump)
window.addEventListener('resize', resize)
resize()

function loop(now: number): void {
  const dt = (now - last) / 1000
  last = now
  animTime += dt
  engine.update(dt)
  drawFrame(ctx, engine, animTime)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
