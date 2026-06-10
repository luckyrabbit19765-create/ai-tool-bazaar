<script setup>
import { RouterLink } from "vue-router"

defineProps({
  featuredTools: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section id="featured" class="featured-panel">
    <div class="section-copy">
      <p class="eyebrow">Featured Picks</p>
      <h2>本周值得先看的 AI 工具</h2>
      <p>
        按热度、视觉完成度和实用价值挑出三款主推工具，用来展示平台首页的推荐位、卡片复用和模块层次。
      </p>
    </div>

    <div class="featured-grid">
      <RouterLink
        v-for="tool in featuredTools"
        :key="tool.id"
        class="featured-card"
        :to="`/tool/${tool.id}`"
      >
        <span class="featured-card__badge">{{ tool.badge }}</span>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
        <div class="featured-card__meta">
          <span>{{ tool.author }}</span>
          <strong>￥{{ tool.price }}</strong>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
