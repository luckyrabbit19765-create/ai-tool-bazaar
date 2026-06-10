<script setup>
import { computed, reactive, ref } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import { useUserSession } from "../composables/useUserSession"

const route = useRoute()
const router = useRouter()
const { login, register } = useUserSession()

const activeTab = ref(route.query.mode === "register" ? "register" : "login")
const errorMessage = ref("")
const successMessage = ref("")
const submitting = ref(false)

const loginForm = reactive({
  username: "",
  password: ""
})

const registerForm = reactive({
  displayName: "",
  username: "",
  password: "",
  confirmPassword: ""
})

const redirectTarget = computed(() => route.query.redirect || "/profile")

function clearFeedback() {
  errorMessage.value = ""
  successMessage.value = ""
}

function switchTab(tab) {
  activeTab.value = tab
  clearFeedback()
}

async function submitLogin() {
  clearFeedback()

  if (!loginForm.username.trim() || !loginForm.password) {
    errorMessage.value = "请先输入账号和密码"
    return
  }

  submitting.value = true
  const result = await login(loginForm)
  submitting.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  successMessage.value = "登录成功，正在进入页面..."
  setTimeout(() => {
    if (result.user?.role === "admin" && !route.query.redirect) {
      router.push("/admin")
      return
    }
    router.push(String(redirectTarget.value))
  }, 600)
}

async function submitRegister() {
  clearFeedback()

  if (!registerForm.displayName.trim() || !registerForm.username.trim() || !registerForm.password) {
    errorMessage.value = "请完整填写注册信息"
    return
  }

  if (registerForm.password.length < 6) {
    errorMessage.value = "密码至少需要 6 位"
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = "两次输入的密码不一致"
    return
  }

  submitting.value = true
  const result = await register(registerForm)
  submitting.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  successMessage.value = "注册成功，已自动登录"
  setTimeout(() => {
    router.push(String(redirectTarget.value))
  }, 600)
}
</script>

<template>
  <div class="auth-wrapper">
    <!-- 背景装饰 -->
    <div class="auth-bg-decor"></div>

    <!-- 居中卡片 -->
    <main class="auth-card">
      <!-- 顶部品牌 -->
      <RouterLink class="auth-brand" to="/">
        <div class="auth-brand-mark">AI</div>
        <span class="auth-brand-name">AI Tool Bazaar</span>
      </RouterLink>

      <!-- Tab 切换 -->
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': activeTab === 'login' }"
          @click="switchTab('login')"
        >
          登录
        </button>
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': activeTab === 'register' }"
          @click="switchTab('register')"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="submitLogin">
        <label class="auth-field">
          <span class="auth-field__label">账号</span>
          <input
            v-model="loginForm.username"
            type="text"
            class="auth-field__input"
            placeholder="输入账号，例如 demo"
            autocomplete="username"
          />
        </label>

        <label class="auth-field">
          <span class="auth-field__label">密码</span>
          <input
            v-model="loginForm.password"
            type="password"
            class="auth-field__input"
            placeholder="输入密码，例如 123456"
            autocomplete="current-password"
          />
        </label>

        <button
          type="submit"
          class="auth-submit"
          :disabled="submitting"
        >
          {{ submitting ? "登录中..." : "立即登录" }}
        </button>

        <p class="auth-hint">演示账号：demo · alice · bob · cathy · david / 123456</p>
        <p class="auth-hint">管理员账号：admin / admin123</p>
      </form>

      <!-- 注册表单 -->
      <form v-else class="auth-form" @submit.prevent="submitRegister">
        <label class="auth-field">
          <span class="auth-field__label">昵称</span>
          <input
            v-model="registerForm.displayName"
            type="text"
            class="auth-field__input"
            placeholder="例如：23软工1班 张三"
            autocomplete="name"
          />
        </label>

        <label class="auth-field">
          <span class="auth-field__label">账号</span>
          <input
            v-model="registerForm.username"
            type="text"
            class="auth-field__input"
            placeholder="用于后续登录"
            autocomplete="username"
          />
        </label>

        <label class="auth-field">
          <span class="auth-field__label">密码</span>
          <input
            v-model="registerForm.password"
            type="password"
            class="auth-field__input"
            placeholder="不少于 6 位"
            autocomplete="new-password"
          />
        </label>

        <label class="auth-field">
          <span class="auth-field__label">确认密码</span>
          <input
            v-model="registerForm.confirmPassword"
            type="password"
            class="auth-field__input"
            placeholder="再次输入密码"
            autocomplete="new-password"
          />
        </label>

        <button
          type="submit"
          class="auth-submit"
          :disabled="submitting"
        >
          {{ submitting ? "注册中..." : "注册并登录" }}
        </button>
      </form>

      <!-- 反馈消息 -->
      <p v-if="errorMessage" class="auth-msg auth-msg--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="auth-msg auth-msg--success">{{ successMessage }}</p>

      <!-- 底部链接 -->
      <RouterLink class="auth-back" to="/">
        ← 返回首页
      </RouterLink>
    </main>
  </div>
</template>
