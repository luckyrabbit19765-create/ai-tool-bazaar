<script setup>
import { onMounted, onUnmounted, ref } from "vue"

const elRef = ref(null)
const visible = ref(false)
let observer = null

onMounted(() => {
  if (!elRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.unobserve(entry.target)
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  )
  observer.observe(elRef.value)

  onUnmounted(() => observer?.disconnect())
})
</script>

<template>
  <div ref="elRef" class="scroll-reveal" :class="{ 'scroll-reveal--visible': visible }">
    <slot />
  </div>
</template>

<style scoped>
.scroll-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
