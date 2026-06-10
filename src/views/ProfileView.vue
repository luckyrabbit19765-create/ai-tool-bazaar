<script setup>
import { computed, ref } from "vue"
import { RouterLink } from "vue-router"
import ToolCard from "../components/common/ToolCard.vue"
import Pagination from "../components/common/Pagination.vue"
import EmptyState from "../components/common/EmptyState.vue"
import { useToolHub } from "../composables/useToolHub"
import { useUserSession } from "../composables/useUserSession"

const {
  stats,
  publishedTools,
  purchasedTools,
  collectedTools,
  deletePublishedTool
} = useToolHub()
const { currentUser, logout } = useUserSession()

const currentTab = ref("published")
const currentPage = ref(1)
const searchQuery = ref("")
const pageSize = 6

const sidebarNav = [
  { key: "published", label: "已发布", icon: "📦" },
  { key: "purchased", label: "已购买", icon: "🛒" },
  { key: "collected", label: "已收藏", icon: "⭐" }
]

const currentTools = computed(() => {
  let list
  if (currentTab.value === "purchased") list = purchasedTools.value
  else if (currentTab.value === "collected") list = collectedTools.value
  else list = publishedTools.value

  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.trim().toLowerCase()
  return list.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  )
})

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return currentTools.value.slice(start, start + pageSize)
})

const activeLabel = computed(() =>
  sidebarNav.find((n) => n.key === currentTab.value)?.label ?? ""
)

const activePanelComponent = computed(() => {
  const panels = {
    published: "section",
    purchased: "section",
    collected: "section"
  }

  return panels[currentTab.value] ?? "section"
})

function switchTab(key) {
  currentTab.value = key
  currentPage.value = 1
  searchQuery.value = ""
}

function removeTool(id) {
  if (!window.confirm("确认删除？")) return
  deletePublishedTool(id)
}

function handleLogout() {
  logout()
  window.location.href = "/"
}
</script>

<template>
  <div class="profile-layout">

    <!-- 左侧边栏 -->
    <aside class="profile-sidebar">
      <div class="profile-sidebar__user">
        <span class="profile-sidebar__avatar">{{ (currentUser?.displayName ?? "U")[0] }}</span>
        <strong>{{ currentUser?.displayName }}</strong>
        <span class="profile-sidebar__role">{{ currentUser?.role === "admin" ? "管理员" : "普通用户" }}</span>
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
          <span class="profile-sidebar__link-count">{{ item.key === 'published' ? stats.published : item.key === 'purchased' ? stats.purchased : stats.collected }}</span>
        </button>
      </nav>

      <div class="profile-sidebar__footer">
        <RouterLink class="ghost-button profile-sidebar__btn" to="/publish">发布工具</RouterLink>
        <button class="ghost-button profile-sidebar__btn" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="profile-main">
      <div class="profile-main__head">
        <div>
          <p class="eyebrow">个人中心</p>
          <h1>{{ activeLabel }}</h1>
        </div>
        <div class="profile-search">
          <span>⌕</span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="`搜索${activeLabel}中的工具...`"
            @input="currentPage = 1"
          />
          <span class="profile-search__count">{{ currentTools.length }}</span>
        </div>
      </div>

      <component :is="activePanelComponent" v-if="currentTools.length" class="tool-grid">
        <article
          v-for="tool in paginatedTools"
          :key="tool.id"
          class="profile-tool-item"
        >
          <ToolCard :tool="tool" />
          <div v-if="currentTab === 'published'" class="profile-tool-item__actions">
            <RouterLink class="ghost-button" :to="`/publish?edit=${tool.id}`">编辑</RouterLink>
            <button class="ghost-button profile-tool-delete" @click="removeTool(tool.id)">删除</button>
          </div>
        </article>
      </component>

      <EmptyState
        v-else-if="!searchQuery.trim()"
        :icon="currentTab === 'published' ? '📦' : currentTab === 'purchased' ? '🛒' : '⭐'"
        :title="`还没有${activeLabel}工具`"
        :description="currentTab === 'published' ? '去发布页创建你的第一个AI工具吧' : '去首页浏览更多AI工具'"
        :action-label="currentTab === 'published' ? '去发布' : '去首页'"
        :action-to="currentTab === 'published' ? '/publish' : '/'"
      />

      <EmptyState
        v-else
        icon="🔍"
        title="没有匹配结果"
        :description="'在「' + activeLabel + '」中没有找到「' + searchQuery + '」'"
      />

      <Pagination
        v-if="currentTools.length > pageSize"
        :current="currentPage"
        :total="currentTools.length"
        :page-size="pageSize"
        @update:current="currentPage = $event"
      />
    </main>
  </div>
</template>
