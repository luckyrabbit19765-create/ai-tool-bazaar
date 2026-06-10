<script setup>
import { computed } from "vue"

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(["update:current"])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const result = []
  const max = totalPages.value
  const cur = props.current

  if (max <= 7) {
    for (let i = 1; i <= max; i++) result.push(i)
    return result
  }

  result.push(1)
  if (cur > 3) result.push("...")

  const start = Math.max(2, cur - 1)
  const end = Math.min(max - 1, cur + 1)
  for (let i = start; i <= end; i++) result.push(i)

  if (cur < max - 2) result.push("...")
  result.push(max)

  return result
})

function goTo(page) {
  if (page === "...") return
  const target = Number(page)
  if (target < 1 || target > totalPages.value || target === props.current) return
  emit("update:current", target)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="分页导航">
    <button
      class="pagination__btn"
      :disabled="current <= 1"
      @click="goTo(current - 1)"
    >
      ← 上一页
    </button>

    <div class="pagination__pages">
      <button
        v-for="page in pages"
        :key="page"
        class="pagination__page"
        :class="{
          'pagination__page--active': page === current,
          'pagination__page--ellipsis': page === '...'
        }"
        :disabled="page === '...'"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="pagination__btn"
      :disabled="current >= totalPages"
      @click="goTo(current + 1)"
    >
      下一页 →
    </button>
  </nav>
</template>
