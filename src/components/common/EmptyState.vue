<script setup>
import { RouterLink } from "vue-router"

defineProps({
  icon: {
    type: String,
    default: "📭"
  },
  title: {
    type: String,
    default: "暂无内容"
  },
  description: {
    type: String,
    default: ""
  },
  actionLabel: {
    type: String,
    default: ""
  },
  actionTo: {
    type: String,
    default: ""
  }
})
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon">{{ icon }}</span>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="primary-button empty-state__action"
    >
      {{ actionLabel }}
    </RouterLink>
    <slot />
  </div>
</template>
