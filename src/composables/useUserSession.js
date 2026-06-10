import { computed, reactive } from "vue"
import { loginAPI, registerAPI, fetchAccounts, deleteAccountAPI } from "../api/auth.js"
import { useToolHub } from "./useToolHub"

const STORAGE_KEY = "ai-tool-bazaar-current-user"

const sessionState = reactive({
  initialized: false,
  accounts: [],
  currentUser: null
})

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function persistCurrentUser() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState.currentUser))
}

function ensureSession() {
  if (sessionState.initialized || typeof window === "undefined") {
    sessionState.initialized = true
    return
  }

  sessionState.currentUser = safeParse(
    window.localStorage.getItem(STORAGE_KEY),
    null
  )
  sessionState.initialized = true
}

/* ---- 同步 useToolHub 的当前用户 ID ---- */
let toolHub = null
function getToolHub() {
  if (!toolHub) toolHub = useToolHub()
  return toolHub
}

function syncToolHubUser(user) {
  const hub = getToolHub()
  if (!user) {
    hub.setCurrentUserId(null)
  } else if (user.role === "admin") {
    hub.setCurrentUserId(null)
  } else {
    hub.setCurrentUserId(user.id)
  }
}

/* ---- 加载账号列表（管理员用） ---- */
async function loadAccounts() {
  try {
    const data = await fetchAccounts()
    if (Array.isArray(data)) sessionState.accounts = data
  } catch {
    // 网络错误时保持现有列表
  }
}

export function readCurrentUser() {
  if (typeof window === "undefined") return null
  return safeParse(window.localStorage.getItem(STORAGE_KEY), null)
}

export function useUserSession() {
  ensureSession()
  syncToolHubUser(sessionState.currentUser)

  const currentUser = computed(() => sessionState.currentUser)
  const isLoggedIn = computed(() => Boolean(sessionState.currentUser))
  const isAdmin = computed(() => sessionState.currentUser?.role === "admin")
  const accounts = computed(() => sessionState.accounts)

  async function login(payload) {
    const result = await loginAPI(payload)
    if (!result.ok) return result

    sessionState.currentUser = result.user
    persistCurrentUser()
    syncToolHubUser(result.user)
    return result
  }

  async function register(payload) {
    const result = await registerAPI(payload)
    if (!result.ok) return result

    sessionState.currentUser = result.user
    persistCurrentUser()
    syncToolHubUser(result.user)
    return result
  }

  async function deleteAccount(id) {
    const result = await deleteAccountAPI(id)
    if (result.ok) {
      sessionState.accounts = sessionState.accounts.filter((a) => a.id !== Number(id))
    }
    return result.ok
  }

  function logout() {
    sessionState.currentUser = null
    persistCurrentUser()
    syncToolHubUser(null)
  }

  return {
    currentUser,
    isLoggedIn,
    isAdmin,
    accounts,
    login,
    register,
    deleteAccount,
    logout,
    loadAccounts
  }
}
