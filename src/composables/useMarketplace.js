import { computed, ref } from "vue"
import { useToolHub } from "./useToolHub"

const sortStrategies = {
  popular: (left, right) => right.sales - left.sales,
  priceAsc: (left, right) => left.price - right.price,
  priceDesc: (left, right) => right.price - left.price,
  rating: (left, right) => right.rating - left.rating
}

export function useMarketplace() {
  const { catalog, categories } = useToolHub()
  const keyword = ref("")
  const category = ref("all")
  const sortBy = ref("popular")

  const featuredTools = computed(() =>
    [...catalog.value]
      .sort((left, right) => right.rating * right.sales - left.rating * left.sales)
      .slice(0, 3)
  )

  const filteredTools = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()
    const strategy = sortStrategies[sortBy.value] ?? sortStrategies.popular

    return [...catalog.value]
      .filter((tool) => {
        const matchesKeyword =
          !normalizedKeyword ||
          tool.name.toLowerCase().includes(normalizedKeyword) ||
          tool.description.toLowerCase().includes(normalizedKeyword) ||
          tool.author.toLowerCase().includes(normalizedKeyword)

        const matchesCategory =
          category.value === "all" || tool.category === category.value

        return matchesKeyword && matchesCategory
      })
      .sort(strategy)
  })

  return {
    keyword,
    category,
    sortBy,
    categories,
    featuredTools,
    filteredTools
  }
}
