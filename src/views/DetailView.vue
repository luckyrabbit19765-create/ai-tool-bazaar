<script setup>
import { computed, ref } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import ToolCard from "../components/common/ToolCard.vue"
import PurchaseModal from "../components/business/PurchaseModal.vue"
import { useToolHub } from "../composables/useToolHub"
import { useUserSession } from "../composables/useUserSession"
import { submitReport } from "../api/reports"

const route = useRoute()
const router = useRouter()
const purchaseState = ref("idle")
const showPurchaseModal = ref(false)
const reportReason = ref("")
const showReportForm = ref(false)
const reportSent = ref(false)

const { currentUser, isLoggedIn } = useUserSession()

async function handleReport() {
  if (!reportReason.value.trim()) return
  await submitReport({
    toolId: tool.value.id,
    toolName: tool.value.name,
    reporterId: currentUser.value.id,
    reporterName: currentUser.value.displayName,
    reason: reportReason.value.trim()
  })
  reportSent.value = true
  reportReason.value = ""
}

const {
  getRelatedTools,
  getToolById,
  isToolCollected,
  isToolPurchased,
  toggleCollected,
  purchaseTool,
  addToCart,
  isInCart
} = useToolHub()

const tool = computed(() => getToolById(route.params.id))
const isCollected = computed(() => (tool.value ? isToolCollected(tool.value.id) : false))
const isPurchased = computed(() => (tool.value ? isToolPurchased(tool.value.id) : false))

const relatedTools = computed(() => {
  if (!tool.value) {
    return []
  }

  return getRelatedTools(tool.value.id, tool.value.category, 3)
})

function openPurchaseModal() {
  if (!tool.value) return
  showPurchaseModal.value = true
}

function confirmPurchase() {
  if (!tool.value) return
  purchaseTool(tool.value.id)
  purchaseState.value = "success"
  showPurchaseModal.value = false
}
</script>

<template>
  <main class="detail-page">
    <section v-if="tool" class="page-shell page-shell--wide detail-hero">
      <RouterLink class="detail-back" to="/">
        ← 返回首页
      </RouterLink>

      <div class="detail-grid">
        <div class="detail-visual" :class="`accent-${tool.accent}`">
          <span class="detail-visual__badge">{{ tool.badge }}</span>
          <div class="detail-visual__content">
            <p>{{ tool.heroLabel }}</p>
            <h1>{{ tool.name }}</h1>
            <span>{{ tool.delivery }}</span>
          </div>
        </div>

        <div class="detail-summary">
          <p class="eyebrow">Tool Detail</p>
          <h2>{{ tool.name }}</h2>
          <p class="detail-summary__description">
            {{ tool.longDescription }}
          </p>

          <div class="detail-meta">
            <article class="detail-meta__item">
              <span>作者</span>
              <strong>{{ tool.author }}</strong>
            </article>
            <article class="detail-meta__item">
              <span>评分</span>
              <strong>★ {{ tool.rating }}</strong>
            </article>
            <article class="detail-meta__item">
              <span>销量</span>
              <strong>{{ tool.sales }}</strong>
            </article>
            <article class="detail-meta__item">
              <span>更新日期</span>
              <strong>{{ tool.updatedAt }}</strong>
            </article>
          </div>

          <div class="detail-tags">
            <span
              v-for="tag in tool.tags"
              :key="tag"
              class="detail-tag"
            >
              {{ tag }}
            </span>
          </div>

          <div class="detail-actions">
            <button
              class="primary-button"
              :disabled="isPurchased || purchaseState === 'success'"
              @click="openPurchaseModal"
            >
              {{ isPurchased || purchaseState === "success" ? "已加入演示订单" : `立即购买 ￥${tool.price}` }}
            </button>
            <button
              class="ghost-button"
              :disabled="isInCart(tool.id)"
              @click="addToCart(tool.id)"
            >
              {{ isInCart(tool.id) ? "已在购物车" : "加入购物车" }}
            </button>
            <button class="ghost-button" @click="toggleCollected(tool.id)">
              {{ isCollected ? "已收藏" : "加入收藏" }}
            </button>
            <RouterLink
              v-if="isLoggedIn"
              class="ghost-button"
              :to="`/messages?with=${tool.authorId}&tool=${tool.id}&name=${encodeURIComponent(tool.name)}`"
            >
              💬 联系商户
            </RouterLink>
          </div>

          <p v-if="isPurchased || purchaseState === 'success'" class="detail-feedback">
            已模拟完成购买流程，你可以继续在答辩中演示"购买成功 -> 返回列表"的链路。
          </p>

          <!-- 举报 -->
          <div class="detail-report">
            <button
              v-if="isLoggedIn && !reportSent"
              class="detail-report__btn"
              @click="showReportForm = !showReportForm"
            >
              🚩 {{ showReportForm ? '收起' : '举报此工具' }}
            </button>
            <div v-if="showReportForm" class="detail-report__form">
              <textarea v-model="reportReason" placeholder="请描述举报原因..." rows="3"></textarea>
              <button class="primary-button detail-report__submit" @click="handleReport">提交举报</button>
            </div>
            <p v-if="reportSent" class="detail-feedback">✅ 举报已提交，管理员将尽快审核处理。</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="tool" class="page-shell page-shell--wide detail-sections">
      <div class="detail-panel">
        <p class="eyebrow">Core Highlights</p>
        <h3>功能亮点</h3>
        <ul class="detail-list">
          <li v-for="item in tool.highlights" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="detail-panel">
        <p class="eyebrow">Use Cases</p>
        <h3>适用场景</h3>
        <ul class="detail-list">
          <li v-for="item in tool.useCases" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section v-if="tool && relatedTools.length" class="page-shell page-shell--wide detail-related">
      <div class="section-copy">
        <p class="eyebrow">Related Tools</p>
        <h2>同类型推荐</h2>
      </div>

      <div class="tool-grid">
        <ToolCard
          v-for="item in relatedTools"
          :key="item.id"
          :tool="item"
        />
      </div>
    </section>

    <section v-else-if="!tool" class="page-shell page-shell--wide detail-empty">
      <p class="eyebrow">Tool Missing</p>
      <h1>没有找到这个工具</h1>
      <p>当前链接可能不存在，或者该工具还没有加入展示数据。</p>
      <RouterLink class="primary-button" to="/">
        返回首页继续浏览
      </RouterLink>
    </section>

    <PurchaseModal
      v-if="tool && showPurchaseModal"
      :tool="tool"
      @confirm="confirmPurchase"
      @close="showPurchaseModal = false"
    />
  </main>
</template>
