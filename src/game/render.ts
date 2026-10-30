import type { GameEngine } from './engine'
import type { Obstacle, PlayerState } from './types'

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  time: number,
): void {
  const { width, height } = engine
  const snap = engine.snapshot()
  const groundY = engine.getGroundY()

  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height, time, snap.speed)
  drawGround(ctx, width, height, groundY, time, snap.speed)
  drawPlayer(ctx, snap.player, time, snap.phase === 'running')
  for (const bug of snap.obstacles) {
    drawBug(ctx, bug, time)
  }
  drawHud(ctx, width, snap.score, snap.highScore)
  if (snap.phase === 'ready') {
    drawOverlay(ctx, width, height, 'CODE RUNNER', 'Escape de los Bugs', [
      'ESPACIO / ↑ / toque para saltar',
      '¡Esquiva los bugs y bate el récord!',
    ])
  } else if (snap.phase === 'gameover') {
    drawOverlay(ctx, width, height, 'GAME OVER', `Puntos: ${snap.score}`, [
      `Récord: ${snap.highScore}`,
      'Toca o pulsa ESPACIO para reiniciar',
    ])
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  speed: number,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#050816')
  g.addColorStop(0.55, '#0b1430')
  g.addColorStop(1, '#06101f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const scroll = (time * speed * 0.15) % 80
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)'
  ctx.lineWidth = 1
  for (let x = -scroll; x < w; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 40, h)
    ctx.stroke()
  }

  for (let i = 0; i < 18; i++) {
    const sx = ((i * 97 + time * 12) % (w + 40)) - 20
    const sy = (i * 53) % (h * 0.55)
    ctx.fillStyle = `hsla(${180 + i * 12}, 100%, 70%, ${0.15 + (i % 3) * 0.08})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1.2 + (i % 3), 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  time: number,
  speed: number,
): void {
  const glow = ctx.createLinearGradient(0, groundY - 20, 0, h)
  glow.addColorStop(0, 'rgba(0, 255, 170, 0)')
  glow.addColorStop(0.15, 'rgba(0, 255, 170, 0.35)')
  glow.addColorStop(1, 'rgba(0, 80, 120, 0.25)')
  ctx.fillStyle = glow
  ctx.fillRect(0, groundY - 2, w, h - groundY + 2)

  ctx.strokeStyle = '#00ffc8'
  ctx.shadowColor = '#00ffc8'
  ctx.shadowBlur = 12
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(w, groundY)
  ctx.stroke()
  ctx.shadowBlur = 0

  const dash = (time * speed * 0.45) % 48
  ctx.strokeStyle = 'rgba(255, 0, 200, 0.45)'
  ctx.setLineDash([18, 30])
  ctx.lineDashOffset = -dash
  ctx.beginPath()
  ctx.moveTo(0, groundY + 10)
  ctx.lineTo(w, groundY + 10)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  time: number,
  running: boolean,
): void {
  const bob = p.grounded && running ? Math.sin(p.animFrame) * 2 : 0
  const x = p.x
  const y = p.y + bob
  const leg = p.grounded && running ? Math.sin(p.animFrame * 1.6) * 6 : 0

  ctx.save()
  ctx.shadowColor = '#39f3ff'
  ctx.shadowBlur = 16

  // cuerpo
  ctx.fillStyle = '#1cf0ff'
  roundRect(ctx, x + 8, y + 10, 28, 28, 6)
  ctx.fill()

  // cabeza
  ctx.fillStyle = '#e8fbff'
  roundRect(ctx, x + 10, y, 24, 18, 5)
  ctx.fill()

  // ojos
  ctx.fillStyle = '#081018'
  ctx.fillRect(x + 15, y + 6, 5, 5)
  ctx.fillRect(x + 25, y + 6, 5, 5)
  ctx.fillStyle = '#39ff88'
  ctx.fillRect(x + 16, y + 7, 2, 2)
  ctx.fillRect(x + 26, y + 7, 2, 2)

  // antena
  ctx.strokeStyle = '#ff4fd8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + 22, y)
  ctx.lineTo(x + 22, y - 8)
  ctx.stroke()
  ctx.fillStyle = '#ff4fd8'
  ctx.beginPath()
  ctx.arc(x + 22, y - 10, 3 + Math.sin(time * 8) * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // piernas
  ctx.strokeStyle = '#1cf0ff'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + 16, y + 38)
  ctx.lineTo(x + 14 - leg, y + 50)
  ctx.moveTo(x + 30, y + 38)
  ctx.lineTo(x + 32 + leg, y + 50)
  ctx.stroke()

  ctx.restore()
}

function drawBug(ctx: CanvasRenderingContext2D, bug: Obstacle, time: number): void {
  const pulse = 0.85 + Math.sin(time * 6 + bug.x * 0.02) * 0.15
  ctx.save()
  ctx.translate(bug.x + bug.width / 2, bug.y + bug.height / 2)
  ctx.scale(pulse, pulse)
  ctx.shadowColor = `hsl(${bug.hue}, 100%, 55%)`
  ctx.shadowBlur = 14

  ctx.fillStyle = `hsl(${bug.hue}, 90%, 55%)`
  ctx.strokeStyle = `hsl(${bug.hue}, 100%, 75%)`
  ctx.lineWidth = 2

  if (bug.kind === 'virus') {
    ctx.beginPath()
    ctx.arc(0, 0, bug.width * 0.32, 0, Math.PI * 2)
    ctx.fill()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + time
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * bug.width * 0.28, Math.sin(a) * bug.height * 0.28)
      ctx.lineTo(Math.cos(a) * bug.width * 0.48, Math.sin(a) * bug.height * 0.48)
      ctx.stroke()
    }
  } else if (bug.kind === 'worm') {
    ctx.beginPath()
    ctx.ellipse(0, 0, bug.width * 0.42, bug.height * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0a1020'
    ctx.beginPath()
    ctx.arc(bug.width * 0.18, -4, 3, 0, Math.PI * 2)
    ctx.fill()
  } else if (bug.kind === 'glitch') {
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(-bug.width * 0.35 + i * 4, -bug.height * 0.35, bug.width * 0.55, 8)
      ctx.fillRect(-bug.width * 0.2 - i * 3, 2, bug.width * 0.5, 8)
      ctx.fillRect(-bug.width * 0.3, bug.height * 0.18, bug.width * 0.45, 7)
    }
  } else {
    roundRect(ctx, -bug.width * 0.4, -bug.height * 0.35, bug.width * 0.8, bug.height * 0.7, 4)
    ctx.fill()
    ctx.fillStyle = '#0a1020'
    ctx.font = `bold ${Math.floor(bug.height * 0.35)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('404', 0, 0)
  }

  ctx.restore()
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  score: number,
  high: number,
): void {
  ctx.save()
  ctx.font = '600 18px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#9bfff0'
  ctx.shadowColor = '#00ffc8'
  ctx.shadowBlur = 8
  ctx.textAlign = 'left'
  ctx.fillText(`SCORE ${score}`, 18, 32)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#ff9be8'
  ctx.shadowColor = '#ff4fd8'
  ctx.fillText(`BEST ${high}`, w - 18, 32)
  ctx.restore()
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle: string,
  lines: string[],
): void {
  ctx.fillStyle = 'rgba(3, 6, 16, 0.62)'
  ctx.fillRect(0, 0, w, h)

  ctx.textAlign = 'center'
  ctx.shadowColor = '#00ffc8'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#7dffe8'
  ctx.font = `800 ${Math.min(42, w * 0.08)}px "Segoe UI", system-ui, sans-serif`
  ctx.fillText(title, w / 2, h * 0.34)

  ctx.shadowColor = '#ff4fd8'
  ctx.fillStyle = '#ffb3ef'
  ctx.font = `700 ${Math.min(24, w * 0.05)}px "Segoe UI", system-ui, sans-serif`
  ctx.fillText(subtitle, w / 2, h * 0.42)

  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(220, 245, 255, 0.9)'
  ctx.font = `500 ${Math.min(16, w * 0.035)}px "Segoe UI", system-ui, sans-serif`
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h * 0.52 + i * 28)
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
