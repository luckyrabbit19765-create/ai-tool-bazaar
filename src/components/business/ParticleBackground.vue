<script setup>
import { onMounted, onUnmounted, ref } from "vue"

const canvasRef = ref(null)
let animId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")

  let w, h
  const particles = []
  const maxDist = 180
  const count = 80
  const baseColor = [45, 140, 130]
  const accentColor = [122, 185, 219]

  function resize() {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener("resize", resize)

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.5 + 1.5,
      color: Math.random() < 0.7 ? baseColor : accentColor
    })
  }

  function draw() {
    ctx.clearRect(0, 0, w, h)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < -50) p.x = w + 50
      if (p.x > w + 50) p.x = -50
      if (p.y < -50) p.y = h + 50
      if (p.y > h + 50) p.y = -50

      // 外发光
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
      gradient.addColorStop(0, `rgba(${p.color.join(",")},0.35)`)
      gradient.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // 核心
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color.join(",")},0.7)`
      ctx.fill()
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.2
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(45,140,130,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }
    animId = requestAnimationFrame(draw)
  }
  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener("resize", resize)
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-bg" aria-hidden="true"></canvas>
</template>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}
</style>
