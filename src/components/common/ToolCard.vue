<script setup>
import { computed, reactive, ref } from "vue"
import { RouterLink } from "vue-router"

const props = defineProps({
  tool: {
    type: Object,
    required: true
  }
})

const cardRef = ref(null)
const tilt = reactive({ rx: 0, ry: 0, glowX: 50, glowY: 50, active: false })

function onMove(e) {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  tilt.rx = ((y - rect.height / 2) / (rect.height / 2)) * -6
  tilt.ry = ((x - rect.width / 2) / (rect.width / 2)) * 6
  tilt.glowX = (x / rect.width) * 100
  tilt.glowY = (y / rect.height) * 100
  tilt.active = true
}

function onLeave() {
  tilt.rx = 0; tilt.ry = 0; tilt.active = false
}

const accentClassMap = {
  sunrise: "accent-sunrise",
  mint: "accent-mint",
  ember: "accent-ember",
  ocean: "accent-ocean"
}

const categoryEmoji = computed(() => {
  const map = { text: "📝", image: "🖼️", code: "💻", audio: "🎵" }
  return map[props.tool.category] || "🛠️"
})
</script>

<template>
  <article
    ref="cardRef"
    class="tool-card"
    :class="{ 'tool-card--tilted': tilt.active }"
    :style="tilt.active
      ? { transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: 'transform 0.1s ease-out, box-shadow 0.2s ease' }
      : { transform: 'perspective(700px) rotateX(0) rotateY(0)', transition: 'transform 0.5s ease-out' }"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <RouterLink
      class="tool-card__link"
      :to="`/tool/${props.tool.id}`"
    >
      <div
        class="tool-card__visual"
        :class="[accentClassMap[props.tool.accent], { 'tool-card__visual--has-image': props.tool.image }]"
        :style="props.tool.image ? { backgroundImage: `url(${props.tool.image})` } : {}"
      >
        <span class="tool-card__badge">{{ props.tool.badge }}</span>
        <div v-if="!props.tool.image" class="tool-card__placeholder">
          <span class="tool-card__placeholder-emoji">{{ categoryEmoji }}</span>
        </div>
        <div class="tool-card__preview">
          <span class="tool-card__preview-tag">{{ props.tool.category }}</span>
          <h3>{{ props.tool.name }}</h3>
        </div>
        <div class="tool-card__overlay">
          <span class="tool-card__overlay-btn">查看详情</span>
        </div>
      </div>
    </RouterLink>

    <div class="tool-card__content">
      <div class="tool-card__meta">
        <span>{{ props.tool.author }}</span>
        <span>{{ props.tool.sales }} sold</span>
      </div>

      <p class="tool-card__description">{{ props.tool.description }}</p>

      <div class="tool-card__footer">
        <div>
          <strong>￥{{ props.tool.price }}</strong>
          <span class="tool-card__rating">★ {{ props.tool.rating }}</span>
        </div>
        <span class="card-button">查看详情</span>
      </div>
    </div>
  </article>
</template>
