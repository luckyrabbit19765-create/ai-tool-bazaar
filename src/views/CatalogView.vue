<script setup>
import { computed, ref } from "vue"
import ToolCard from "../components/common/ToolCard.vue"
import SearchFilter from "../components/business/SearchFilter.vue"
import Pagination from "../components/common/Pagination.vue"
import EmptyState from "../components/common/EmptyState.vue"
import { useMarketplace } from "../composables/useMarketplace"

const {
  keyword,
  category,
  sortBy,
  categories,
  filteredTools
} = useMarketplace()

const currentPage = ref(1)
const pageSize = 9

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTools.value.slice(start, start + pageSize)
})
</script>

<template>
  <main class="catalog-page page-shell page-shell--full">
    <div class="catalog-page__head">
      <div>
        <p class="eyebrow">Tool Catalog</p>
        <h1>全部工具</h1>
        <p class="publish-copy">浏览、搜索和筛选平台上所有的 AI 工具</p>
      </div>
    </div>

    <SearchFilter
      :keyword="keyword"
      :category="category"
      :sort-by="sortBy"
      :categories="categories"
      @update:keyword="keyword = $event"
      @update:category="category = $event"
      @update:sort-by="sortBy = $event"
    />

    <div class="catalog-header">
      <div>
        <p class="eyebrow">Results</p>
        <h2>共 {{ filteredTools.length }} 个工具</h2>
      </div>
    </div>

    <div v-if="filteredTools.length" class="tool-grid">
      <ToolCard
        v-for="tool in paginatedTools"
        :key="tool.id"
        :tool="tool"
      />
    </div>

    <EmptyState
      v-else
      icon="🔍"
      title="没有找到匹配的工具"
      description="换个关键词或分类试试？"
    />

    <Pagination
      v-if="filteredTools.length > pageSize"
      :current="currentPage"
      :total="filteredTools.length"
      :page-size="pageSize"
      @update:current="currentPage = $event"
    />
  </main>
</template>
