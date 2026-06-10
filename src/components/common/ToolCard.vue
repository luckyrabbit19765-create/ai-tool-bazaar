<script setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"

const props = defineProps({
  tool: {
    type: Object,
    required: true
  }
})

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
  <article class="tool-card">
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
        <RouterLink class="card-button" :to="`/tool/${props.tool.id}`">
          查看详情
        </RouterLink>
      </div>
    </div>
  </article>
</template>
