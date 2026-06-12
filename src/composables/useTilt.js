import { onUnmounted, ref } from "vue"

export function useTilt() {
  const tiltRef = ref(null)
  const style = ref({})

  let el = null

  function onMove(e) {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const rx = ((y - midY) / midY) * -8
    const ry = ((x - midX) / midX) * 8
    const glowX = (x / rect.width) * 100
    const glowY = (y / rect.height) * 100
    style.value = {
      transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`,
      background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(45,140,130,0.12), transparent 60%)`,
      transition: "transform 0.1s ease-out"
    }
  }

  function onLeave() {
    style.value = {
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      background: "transparent",
      transition: "transform 0.5s ease-out"
    }
  }

  function bind(elRef) {
    el = elRef
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
  }

  onUnmounted(() => {
    if (el) {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  })

  return { tiltRef, style, bind }
}
