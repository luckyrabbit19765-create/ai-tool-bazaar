<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import { useUserSession } from "../../composables/useUserSession"
import { useToolHub } from "../../composables/useToolHub"
import { useUnread } from "../../composables/useUnread"

const { currentUser, isLoggedIn, isAdmin, logout } = useUserSession()
const { cartTools } = useToolHub()
const { unreadCount, fetchUnread } = useUnread()

const showDropdown = ref(false)
let hideTimer = null
let pollTimer = null

onMounted(() => {
  if (currentUser.value?.id) fetchUnread(currentUser.value.id)
  pollTimer = setInterval(() => {
    if (currentUser.value?.id) fetchUnread(currentUser.value.id)
  }, 5000)
})

onUnmounted(() => clearInterval(pollTimer))

watch(currentUser, (u) => {
  if (u?.id) fetchUnread(u.id)
  else unreadCount.value = 0
})

const userInitial = computed(() => (currentUser.value?.displayName ?? "U")[0])
const userLabel = computed(() => currentUser.value?.displayName ?? "")
const userRole = computed(() =>
  currentUser.value?.role === "admin" ? "管理员" : "普通用户"
)

function openDropdown() {
  clearTimeout(hideTimer)
  showDropdown.value = true
}

function closeDropdown() {
  hideTimer = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

function handleLogout() {
  showDropdown.value = false
  logout()
  window.location.href = "/"
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/">
        <div class="brand-mark">AI</div>
        <div>
          <p class="brand-name">AI Tool Bazaar</p>
          <p class="brand-subtitle">创作者与实用工具的交易主页</p>
        </div>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink :to="{ path: '/', hash: '#featured' }">精选工具</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#catalog' }">工具集市</RouterLink>
        <RouterLink to="/catalog">全部工具</RouterLink>
        <RouterLink v-if="isLoggedIn" class="nav-msg-link" to="/messages">
          消息
          <span v-if="unreadCount" class="nav-msg-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </RouterLink>
        <RouterLink v-if="isLoggedIn" to="/profile">个人中心</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">后台管理</RouterLink>
      </nav>

      <div class="header-actions">
        <RouterLink class="header-cart-btn" to="/cart">
          🛒
          <span v-if="cartTools.length" class="header-cart-badge">{{ cartTools.length }}</span>
        </RouterLink>

        <!-- 未登录 -->
        <template v-if="!isLoggedIn">
          <RouterLink class="ghost-button" to="/auth?mode=login">登录</RouterLink>
          <RouterLink class="primary-button" to="/auth?mode=register">注册</RouterLink>
        </template>

        <!-- 已登录 → 用户头像 + 下拉菜单 -->
        <div
          v-else
          class="header-user"
          @mouseenter="openDropdown"
          @mouseleave="closeDropdown"
        >
          <button class="header-user__avatar" :class="{ 'header-user__avatar--open': showDropdown }">
            {{ userInitial }}
          </button>

          <div v-if="showDropdown" class="header-user__dropdown" @mouseenter="openDropdown">
            <div class="header-user__dropdown-head">
              <span class="header-user__dropdown-avatar">{{ userInitial }}</span>
              <div>
                <strong>{{ userLabel }}</strong>
                <span>{{ userRole }}</span>
              </div>
            </div>

            <div class="header-user__dropdown-divider"></div>

            <RouterLink class="header-user__dropdown-link" to="/profile" @click="showDropdown = false">
              <span>👤</span> 个人中心
            </RouterLink>

            <RouterLink v-if="isAdmin" class="header-user__dropdown-link" to="/admin" @click="showDropdown = false">
              <span>⚙️</span> 后台管理
            </RouterLink>

            <RouterLink class="header-user__dropdown-link" to="/publish" @click="showDropdown = false">
              <span>📤</span> 发布工具
            </RouterLink>

            <div class="header-user__dropdown-divider"></div>

            <button class="header-user__dropdown-link header-user__dropdown-link--logout" @click="handleLogout">
              <span>🚪</span> 退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
