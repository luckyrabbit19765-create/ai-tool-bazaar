<script setup>
defineProps({
  message: {
    type: String,
    default: "加载中..."
  },
  variant: {
    type: String,
    default: "spinner", // spinner | skeleton | inline
    validator: (v) => ["spinner", "skeleton", "inline"].includes(v)
  }
})
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${variant}`">
    <div v-if="variant === 'spinner'" class="loading-spinner__ring">
      <span class="loading-spinner__dot"></span>
      <span class="loading-spinner__dot"></span>
      <span class="loading-spinner__dot"></span>
    </div>

    <div v-if="variant === 'skeleton'" class="loading-spinner__skeleton">
      <span class="loading-spinner__bar loading-spinner__bar--short"></span>
      <span class="loading-spinner__bar loading-spinner__bar--medium"></span>
      <span class="loading-spinner__bar loading-spinner__bar--long"></span>
      <span class="loading-spinner__bar loading-spinner__bar--medium"></span>
    </div>

    <div v-if="variant === 'inline'" class="loading-spinner__inline">
      <span class="loading-spinner__pulse"></span>
    </div>

    <p v-if="message && variant !== 'skeleton'" class="loading-spinner__text">{{ message }}</p>
  </div>
</template>
