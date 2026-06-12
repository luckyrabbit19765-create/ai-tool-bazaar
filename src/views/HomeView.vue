<script setup>
import { computed, ref } from "vue"
import { RouterLink } from "vue-router"
import BannerSwiper from "../components/business/BannerSwiper.vue"
import SearchFilter from "../components/business/SearchFilter.vue"
import ToolCard from "../components/common/ToolCard.vue"
import Pagination from "../components/common/Pagination.vue"
import EmptyState from "../components/common/EmptyState.vue"
import ParticleBackground from "../components/business/ParticleBackground.vue"
import ScrollReveal from "../components/common/ScrollReveal.vue"
import { useMarketplace } from "../composables/useMarketplace"
import { useToolHub } from "../composables/useToolHub"
import { useCountUp } from "../composables/useCountUp"

const {
  keyword,
  category,
  sortBy,
  categories,
  featuredTools,
  filteredTools
} = useMarketplace()

const { catalog } = useToolHub()

const currentPage = ref(1)
const pageSize = 6

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTools.value.slice(start, start + pageSize)
})

const rawStats = computed(() => {
  const authors = new Set(catalog.value.map((t) => t.author))
  const totalSales = catalog.value.reduce((sum, t) => sum + (t.sales || 0), 0)
  return { tools: catalog.value.length, authors: authors.size, sales: totalSales }
})

const toolsCount = useCountUp(computed(() => rawStats.value.tools), 1500)
const authorsCount = useCountUp(computed(() => rawStats.value.authors), 1800)
const salesCount = useCountUp(computed(() => rawStats.value.sales), 2000)

const features = [
  { icon: "🔍", title: "智能发现", desc: "关键词搜索 + 分类筛选 + 多维度排序，快速定位你需要的 AI 工具" },
  { icon: "🛒", title: "安全交易", desc: "购物车 + 购买确认 + 订单管理，完整的交易闭环保障每一次消费" },
  { icon: "💬", title: "商户直连", desc: "内置即时通讯，支持议价、退款、发货确认，沟通无障碍" },
  { icon: "📊", title: "数据驱动", desc: "实时销量排行、分类分布、平台概览，数据透明助力决策" }
]

const trustBadges = [
  "本地化部署",
  "数据加密存储",
  "14款精选工具",
  "7×24 智能导购",
  "售后无忧保障"
]

const spotlightTool = computed(() => featuredTools.value[2] ?? featuredTools.value[0])

function jumpToCatalog() {
  currentPage.value = 1
  document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" })
}

function applyCategory(value) {
  category.value = value
  jumpToCatalog()
}
</script>

<template>
  <main class="home-page">
    <section class="hero">
      <ParticleBackground />
      <div class="page-shell page-shell--hero hero-market" style="position:relative;z-index:1">
        <div class="hero-market__intro">
          <p class="eyebrow">Marketplace Home</p>
          <h1>发现、购买、发布 AI 工具</h1>
          <p class="hero-description">
            一个面向课程答辩的 AI 工具集市：首页直接提供搜索入口、分类筛选、精选工具和平台数据，完整串起发现、详情、购物车、购买和个人中心管理。
          </p>
        </div>

        <div class="hero-search-card">
          <div class="hero-search-card__bar">
            <span>⌕</span>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索 Prompt、海报、代码、音频工具..."
              @keydown.enter="jumpToCatalog"
            />
            <button class="primary-button" @click="jumpToCatalog">搜索工具</button>
          </div>

          <div class="hero-category-row">
            <button
              v-for="item in categories.slice(1)"
              :key="item.value"
              class="hero-category-pill"
              :class="{ 'hero-category-pill--active': category === item.value }"
              @click="applyCategory(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="hero-featured-strip" id="featured">
          <RouterLink
            v-for="tool in featuredTools"
            :key="tool.id"
            class="hero-featured-card"
            :to="`/tool/${tool.id}`"
          >
            <div
              class="hero-featured-card__image"
              :style="{ backgroundImage: `url(${tool.image})` }"
            >
              <span>{{ tool.badge }}</span>
            </div>
            <div class="hero-featured-card__body">
              <div>
                <p>{{ tool.heroLabel }}</p>
                <h2>{{ tool.name }}</h2>
              </div>
              <div class="hero-featured-card__meta">
                <span>★ {{ tool.rating }}</span>
                <strong>￥{{ tool.price }}</strong>
              </div>
            </div>
          </RouterLink>
        </div>

        <div class="hero-market__footer">
          <div class="hero-stats">
            <article class="stat-card">
              <strong>{{ toolsCount }}</strong>
              <span>已上架工具</span>
            </article>
            <article class="stat-card">
              <strong>{{ authorsCount }}</strong>
              <span>活跃创作者</span>
            </article>
            <article class="stat-card">
              <strong>{{ salesCount }}</strong>
              <span>累计销量</span>
            </article>
          </div>

          <div class="hero-flow">
            <span>发现工具</span>
            <span>查看详情</span>
            <span>加入购物车</span>
            <span>模拟购买</span>
            <span>个人中心管理</span>
          </div>
        </div>
      </div>
    </section>

    <ScrollReveal>
      <section class="page-shell page-shell--wide">
        <BannerSwiper :featured-tools="featuredTools" />
      </section>
    </ScrollReveal>

    <ScrollReveal>
    <section class="page-shell page-shell--wide" id="catalog">
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
          <p class="eyebrow">Tool Catalog</p>
          <h2>工具集市</h2>
        </div>
        <div class="catalog-header__right">
          <p class="catalog-count">当前展示 {{ filteredTools.length }} 个工具</p>
          <RouterLink class="primary-button" to="/catalog">查看全部 →</RouterLink>
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
        v-if="!filteredTools.length"
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
    </section>
    </ScrollReveal>

    <!-- 平台优势 -->
    <ScrollReveal>
    <section class="home-enterprise">
      <div class="page-shell page-shell--wide">
        <div class="home-enterprise__head">
          <p class="eyebrow">Why Choose Us</p>
          <h2>为什么选择 AI Tool Bazaar</h2>
          <p class="home-enterprise__sub">构建可靠、高效、安全的 AI 工具交易平台，为创作者与用户搭建桥梁</p>
        </div>

        <div class="home-enterprise__grid">
          <article v-for="item in features" :key="item.title" class="home-enterprise__card">
            <span class="home-enterprise__card-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>

        <div class="home-enterprise__trust">
          <p class="home-enterprise__trust-label">平台保障</p>
          <div class="home-enterprise__trust-badges">
            <span v-for="badge in trustBadges" :key="badge" class="home-enterprise__badge">✓ {{ badge }}</span>
          </div>
        </div>
      </div>
    </section>
    </ScrollReveal>
  </main>
</template>
