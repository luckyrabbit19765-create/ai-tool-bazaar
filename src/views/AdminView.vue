<script setup>
import { computed, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import ToolCard from "../components/common/ToolCard.vue"
import Pagination from "../components/common/Pagination.vue"
import EmptyState from "../components/common/EmptyState.vue"
import { useToolHub } from "../composables/useToolHub"
import { useUserSession } from "../composables/useUserSession"
import { getReports, handleReport } from "../api/reports"

onMounted(() => {
  loadAccounts()
  loadReports()
})

const {
  catalog,
  purchasedTools,
  collectedTools,
  deletePublishedTool
} = useToolHub()
const { accounts, deleteAccount, loadAccounts } = useUserSession()

/* ---- 举报审核 ---- */
const reports = ref([])
const reportsLoading = ref(false)

async function loadReports() {
  reportsLoading.value = true
  try { reports.value = await getReports() } catch { reports.value = [] }
  reportsLoading.value = false
}

async function approveReport(id) {
  await handleReport(id, "approved")
  loadReports()
}

async function rejectReport(id) {
  await handleReport(id, "rejected")
  loadReports()
}

const pendingReports = computed(() => reports.value.filter((r) => r.status === "pending"))
const handledReports = computed(() => reports.value.filter((r) => r.status !== "pending"))

/* ---- 导航 ---- */
const currentTab = ref("tools")
const sidebarNav = [
  { key: "tools", label: "工具管理", icon: "⚙️" },
  { key: "reports", label: "举报审核", icon: "🚩" },
  { key: "accounts", label: "账号管理", icon: "👥" },
  { key: "activity", label: "平台概览", icon: "📊" }
]

/* ---- 搜索 ---- */
const toolSearch = ref("")
const accountSearch = ref("")

const filteredTools = computed(() => {
  if (!toolSearch.value.trim()) return catalog.value
  const q = toolSearch.value.trim().toLowerCase()
  return catalog.value.filter(
    (t) => t.name.toLowerCase().includes(q) || t.author.toLowerCase().includes(q)
  )
})

const filteredAccounts = computed(() => {
  if (!accountSearch.value.trim()) return accounts.value
  const q = accountSearch.value.trim().toLowerCase()
  return accounts.value.filter(
    (a) => a.username.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q)
  )
})

/* ---- 分页 ---- */
const toolPage = ref(1)
const accountPage = ref(1)
const pageSize = 8

const paginatedTools = computed(() => {
  const s = (toolPage.value - 1) * pageSize
  return filteredTools.value.slice(s, s + pageSize)
})
const paginatedAccounts = computed(() => {
  const s = (accountPage.value - 1) * pageSize
  return filteredAccounts.value.slice(s, s + pageSize)
})

/* ---- 统计 ---- */
const adminStats = computed(() => [
  { label: "平台工具总数", value: catalog.value.length, icon: "🛠️" },
  { label: "购买记录", value: purchasedTools.value.length, icon: "🛒" },
  { label: "收藏记录", value: collectedTools.value.length, icon: "⭐" },
  { label: "注册账号", value: accounts.value.length, icon: "👤" }
])

/* 热门工具（按销量排序取前5） */
const topTools = computed(() =>
  [...catalog.value].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5)
)

/* 最近新增（按 updatedAt 排序取前5） */
const recentTools = computed(() =>
  [...catalog.value].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 5)
)

/* 分类统计 */
const categoryStats = computed(() => {
  const map = {}
  for (const t of catalog.value) {
    map[t.category] = (map[t.category] || 0) + 1
  }
  return [
    { label: "文字处理", key: "text", count: map.text || 0, color: "#f4ba57" },
    { label: "图片生成", key: "image", count: map.image || 0, color: "#79c7b0" },
    { label: "代码工具", key: "code", count: map.code || 0, color: "#e79b89" },
    { label: "音频创作", key: "audio", count: map.audio || 0, color: "#7ab9db" }
  ]
})

const maxCategoryCount = computed(() =>
  Math.max(...categoryStats.value.map((c) => c.count), 1)
)

/* ---- 操作 ---- */
function switchTab(key) {
  currentTab.value = key
}

function removeTool(id) {
  if (!window.confirm("确认删除此工具？不可恢复。")) return
  deletePublishedTool(id)
}

function removeAccount(id) {
  if (!window.confirm("确认删除此账号？")) return
  deleteAccount(id)
}
</script>

<template>
  <div class="profile-layout">

    <!-- 侧边栏 -->
    <aside class="profile-sidebar">
      <div class="profile-sidebar__user">
        <span class="profile-sidebar__avatar">A</span>
        <strong>管理员后台</strong>
        <span class="profile-sidebar__role">平台管理</span>
      </div>

      <nav class="profile-sidebar__nav">
        <button
          v-for="item in sidebarNav"
          :key="item.key"
          class="profile-sidebar__link"
          :class="{ 'profile-sidebar__link--active': currentTab === item.key }"
          @click="switchTab(item.key)"
        >
          <span class="profile-sidebar__link-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span class="profile-sidebar__link-count">
            {{ item.key === 'tools' ? catalog.length : item.key === 'accounts' ? accounts.length : purchasedTools.length + collectedTools.length }}
          </span>
        </button>
      </nav>

      <div class="profile-sidebar__footer">
        <RouterLink class="ghost-button profile-sidebar__btn" to="/">返回首页</RouterLink>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="profile-main">

      <!-- ====== 工具管理 ====== -->
      <template v-if="currentTab === 'tools'">
        <div class="profile-main__head">
          <div>
            <p class="eyebrow">Admin / Tools</p>
            <h1>工具管理</h1>
          </div>
          <div class="profile-main__head-row">
            <div class="profile-search">
              <span>⌕</span>
              <input v-model="toolSearch" type="text" placeholder="搜索工具名或作者..." @input="toolPage = 1" />
              <span class="profile-search__count">{{ filteredTools.length }}</span>
            </div>
            <RouterLink class="primary-button" to="/publish">新增工具</RouterLink>
          </div>
        </div>

        <div v-if="filteredTools.length" class="tool-grid">
          <article v-for="tool in paginatedTools" :key="tool.id" class="profile-tool-item">
            <ToolCard :tool="tool" />
            <div class="profile-tool-item__actions">
              <RouterLink class="ghost-button" :to="`/tool/${tool.id}`">查看</RouterLink>
              <RouterLink class="ghost-button" :to="`/publish?edit=${tool.id}`">编辑</RouterLink>
              <button class="ghost-button profile-tool-delete" @click="removeTool(tool.id)">删除</button>
            </div>
          </article>
        </div>

        <EmptyState v-else icon="📦" title="没有匹配的工具" />

        <Pagination
          v-if="filteredTools.length > pageSize"
          :current="toolPage" :total="filteredTools.length" :page-size="pageSize"
          @update:current="toolPage = $event"
        />
      </template>

      <!-- ====== 举报审核 ====== -->
      <template v-if="currentTab === 'reports'">
        <div class="profile-main__head">
          <div>
            <p class="eyebrow">Admin / Reports</p>
            <h1>举报审核</h1>
          </div>
          <span class="profile-search__count">待处理 {{ pendingReports.length }} / 共 {{ reports.length }}</span>
        </div>

        <!-- 待处理 -->
        <div v-if="pendingReports.length" class="admin-list">
          <h3 style="margin-bottom:12px">⏳ 待处理</h3>
          <article v-for="r in pendingReports" :key="r.id" class="admin-item">
            <div class="admin-item__info">
              <strong>🚩 {{ r.tool_name }}</strong>
              <p>举报人：{{ r.reporter_name }} · {{ r.created_at?.slice(0, 16) }}</p>
              <p style="margin-top:4px;color:var(--text-main)">{{ r.reason }}</p>
            </div>
            <div class="admin-item__actions">
              <button class="primary-button" @click="approveReport(r.id)">通过</button>
              <button class="ghost-button profile-tool-delete" @click="rejectReport(r.id)">驳回</button>
            </div>
          </article>
        </div>

        <!-- 已处理 -->
        <div v-if="handledReports.length" class="admin-list" style="margin-top:28px">
          <h3 style="margin-bottom:12px">✅ 已处理</h3>
          <article v-for="r in handledReports" :key="r.id" class="admin-item">
            <div class="admin-item__info">
              <strong>{{ r.tool_name }}</strong>
              <p>{{ r.reporter_name }} · {{ r.created_at?.slice(0, 16) }} · {{ r.status === 'approved' ? '✅ 已通过' : '❌ 已驳回' }}</p>
            </div>
          </article>
        </div>

        <EmptyState v-if="!reports.length" icon="🚩" title="暂无举报记录" description="用户提交的举报将在这里审核" />
      </template>

      <!-- ====== 账号管理 ====== -->
      <template v-if="currentTab === 'accounts'">
        <div class="profile-main__head">
          <div>
            <p class="eyebrow">Admin / Accounts</p>
            <h1>账号管理</h1>
          </div>
          <div class="profile-search">
            <span>⌕</span>
            <input v-model="accountSearch" type="text" placeholder="搜索用户名或昵称..." @input="accountPage = 1" />
            <span class="profile-search__count">{{ filteredAccounts.length }}</span>
          </div>
        </div>

        <div v-if="filteredAccounts.length" class="admin-list">
          <article v-for="acct in paginatedAccounts" :key="acct.id" class="admin-item">
            <div class="admin-item__info">
              <strong>{{ acct.displayName }}</strong>
              <p>@{{ acct.username }} · {{ acct.role === "admin" ? "管理员" : "普通用户" }}</p>
            </div>
            <div class="admin-item__actions">
              <span v-if="acct.role === 'admin'" class="user-chip">管理员</span>
              <button
                v-else
                class="ghost-button profile-tool-delete"
                @click="removeAccount(acct.id)"
              >
                删除账号
              </button>
            </div>
          </article>
        </div>

        <EmptyState v-else icon="👥" title="没有匹配的账号" />

        <Pagination
          v-if="filteredAccounts.length > pageSize"
          :current="accountPage" :total="filteredAccounts.length" :page-size="pageSize"
          @update:current="accountPage = $event"
        />
      </template>

      <!-- ====== 平台概览 ====== -->
      <template v-if="currentTab === 'activity'">
        <div class="profile-main__head">
          <div>
            <p class="eyebrow">Admin / Activity</p>
            <h1>平台概览</h1>
          </div>
        </div>

        <!-- 四格统计 -->
        <div class="admin-stats-grid">
          <article v-for="item in adminStats" :key="item.label" class="admin-stat-card">
            <span class="admin-stat-card__icon">{{ item.icon }}</span>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </article>
        </div>

        <!-- 分类分布 + 交互记录 -->
        <div class="admin-dash-row">
          <!-- 分类分布 -->
          <section class="detail-panel admin-category-panel">
            <p class="eyebrow">Category Distribution</p>
            <h3>分类分布</h3>
            <div class="admin-category-list">
              <div v-for="cat in categoryStats" :key="cat.key" class="admin-category-item">
                <div class="admin-category-item__head">
                  <span>{{ cat.label }}</span>
                  <strong>{{ cat.count }}</strong>
                </div>
                <div class="admin-category-bar">
                  <span
                    class="admin-category-bar__fill"
                    :style="{
                      width: maxCategoryCount ? (cat.count / maxCategoryCount * 100) + '%' : '0%',
                      background: cat.color
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </section>

          <!-- 交互概览 -->
          <section class="detail-panel">
            <p class="eyebrow">Interaction Overview</p>
            <h3>交互概览</h3>
            <div class="admin-interaction-list">
              <div class="admin-interaction-item">
                <span class="admin-interaction-item__icon">🛒</span>
                <div>
                  <strong>购买记录</strong>
                  <p>{{ purchasedTools.length }} 个工具被购买</p>
                </div>
              </div>
              <div class="admin-interaction-item">
                <span class="admin-interaction-item__icon">⭐</span>
                <div>
                  <strong>收藏记录</strong>
                  <p>{{ collectedTools.length }} 个工具被收藏</p>
                </div>
              </div>
              <div class="admin-interaction-item">
                <span class="admin-interaction-item__icon">📝</span>
                <div>
                  <strong>活跃创作者</strong>
                  <p>{{ [...new Set(catalog.map(t => t.author))].length }} 位创作者</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 热门工具 & 最近新增 -->
        <div class="admin-dash-row">
          <!-- 热门工具 Top 5 -->
          <section class="detail-panel">
            <p class="eyebrow">Top Selling</p>
            <h3>热门工具 Top 5</h3>
            <div v-if="topTools.length" class="admin-rank-list">
              <article v-for="(t, i) in topTools" :key="t.id" class="admin-rank-item">
                <span class="admin-rank-item__index" :class="{ 'admin-rank-item__index--top': i < 3 }">{{ i + 1 }}</span>
                <div>
                  <strong>{{ t.name }}</strong>
                  <p>{{ t.author }} · 销量 {{ t.sales || 0 }} · ★ {{ t.rating }}</p>
                </div>
                <span class="admin-rank-item__price">￥{{ t.price }}</span>
              </article>
            </div>
            <EmptyState v-else icon="📭" title="暂无工具数据" />
          </section>

          <!-- 最近新增 -->
          <section class="detail-panel">
            <p class="eyebrow">Recently Added</p>
            <h3>最近新增</h3>
            <div v-if="recentTools.length" class="admin-rank-list">
              <article v-for="t in recentTools" :key="t.id" class="admin-rank-item">
                <span class="admin-rank-item__dot" :class="`accent-${t.accent}`"></span>
                <div>
                  <strong>{{ t.name }}</strong>
                  <p>{{ t.author }} · {{ t.updatedAt }}</p>
                </div>
                <span class="admin-rank-item__badge">{{ t.badge }}</span>
              </article>
            </div>
            <EmptyState v-else icon="📭" title="暂无工具数据" />
          </section>
        </div>
      </template>

    </main>
  </div>
</template>
