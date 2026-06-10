<script setup>
defineProps({
  keyword: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  "update:keyword",
  "update:category",
  "update:sortBy"
])
</script>

<template>
  <section class="search-panel">
    <div class="search-panel__top">
      <div>
        <p class="eyebrow">Search & Filter</p>
        <h2>像逛集市一样挑选适合你的 AI 工具</h2>
      </div>
      <div class="search-input">
        <span>⌕</span>
        <input
          :value="keyword"
          type="text"
          placeholder="搜索工具名、作者或用途"
          @input="emit('update:keyword', $event.target.value)"
        />
      </div>
    </div>

    <div class="search-panel__bottom">
      <div class="category-group">
        <button
          v-for="item in categories"
          :key="item.value"
          class="chip"
          :class="{ 'chip--active': item.value === category }"
          @click="emit('update:category', item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <label class="sort-select">
        <span>排序</span>
        <select
          :value="sortBy"
          @change="emit('update:sortBy', $event.target.value)"
        >
          <option value="popular">最热</option>
          <option value="rating">评分优先</option>
          <option value="priceAsc">价格从低到高</option>
          <option value="priceDesc">价格从高到低</option>
        </select>
      </label>
    </div>
  </section>
</template>
