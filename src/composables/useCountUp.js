import { ref, watch } from "vue"

export function useCountUp(target, duration = 1500) {
  const display = ref(0)
  let timer = null

  function animate(from, to, ms) {
    clearInterval(timer)
    const start = performance.now()
    timer = setInterval(() => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / ms, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      display.value = Math.round(from + (to - from) * eased)
      if (progress >= 1) clearInterval(timer)
    }, 16)
  }

  watch(target, (val) => {
    if (val != null) animate(0, Number(val), duration)
  }, { immediate: true })

  return display
}
