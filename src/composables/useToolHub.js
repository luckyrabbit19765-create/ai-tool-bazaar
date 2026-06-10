import { computed, reactive } from "vue"
import { toolCategories, tools } from "../data/tools"

const STORAGE_KEYS = {
  collected: "ai-tool-bazaar-collected",
  purchased: "ai-tool-bazaar-purchased",
  cart: "ai-tool-bazaar-cart",
  custom: "ai-tool-bazaar-custom"
}

const accentByCategory = {
  text: "sunrise",
  image: "mint",
  code: "ember",
  audio: "ocean"
}

const heroLabelByCategory = {
  text: "Writing Flow",
  image: "Visual Concept",
  code: "Code Workflow",
  audio: "Audio Motion"
}

const state = reactive({
  initialized: false,
  customTools: [],
  collectedIds: [],
  purchasedIds: [],
  cartIds: [],
  currentUserId: null
})

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function persistState() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.custom, JSON.stringify(state.customTools))
  window.localStorage.setItem(STORAGE_KEYS.collected, JSON.stringify(state.collectedIds))
  window.localStorage.setItem(STORAGE_KEYS.purchased, JSON.stringify(state.purchasedIds))
  window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cartIds))
}

function ensureInitialized() {
  if (state.initialized || typeof window === "undefined") {
    state.initialized = true
    return
  }

  const storedTools = safeParse(window.localStorage.getItem(STORAGE_KEYS.custom), null)
  const storedCollected = safeParse(window.localStorage.getItem(STORAGE_KEYS.collected), null)
  const storedPurchased = safeParse(window.localStorage.getItem(STORAGE_KEYS.purchased), null)
  const storedCart = safeParse(window.localStorage.getItem(STORAGE_KEYS.cart), null)

  // 首次使用时，将内置 demo 工具注入可变列表，并标注 demo 作者的 authorId
  if (storedTools === null) {
    state.customTools = tools.map((t) => ({ ...t, authorId: t.authorId ?? 1 }))
  } else {
    const merged = [...storedTools]
    for (const demo of tools) {
      const idx = merged.findIndex((t) => t.id === demo.id)
      if (idx === -1) {
        merged.push({ ...demo })
      } else {
        // 已存在的 demo 工具：补齐新增展示字段，同时保留用户侧可变数据
        merged[idx] = { ...demo, ...merged[idx], authorId: demo.authorId, image: demo.image }
      }
    }
    // 确保存量用户发布的工具也有 authorId（兜底用 demo 用户 ID）
    state.customTools = merged.map((t) => ({ ...t, authorId: t.authorId ?? 1 }))
  }

  // 立即持久化合并后的数据，避免用户手动清 localStorage
  window.localStorage.setItem(STORAGE_KEYS.custom, JSON.stringify(state.customTools))

  state.collectedIds = Array.isArray(storedCollected) ? storedCollected : []
  state.purchasedIds = Array.isArray(storedPurchased) ? storedPurchased : []
  state.cartIds = Array.isArray(storedCart) ? storedCart : []

  // 从 localStorage 读取当前登录用户，用于过滤"已发布"列表
  try {
    const raw = window.localStorage.getItem("ai-tool-bazaar-current-user")
    const user = raw ? JSON.parse(raw) : null
    if (user && user.role === "admin") {
      state.currentUserId = null // 管理员看到全部
    } else if (user) {
      state.currentUserId = user.id
    }
  } catch {
    state.currentUserId = null
  }

  state.initialized = true
}

function normalizeList(input) {
  return input
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function useToolHub() {
  ensureInitialized()

  // catalog 包含全部工具（首页浏览用，所有人都能看到）
  const catalog = computed(() => state.customTools)

  // currentUserId = null 时表示管理员视角，显示全部；否则只显示当前用户的
  const stats = computed(() => ({
    published: state.currentUserId === null
      ? state.customTools.length
      : state.customTools.filter((t) => t.authorId === state.currentUserId).length,
    purchased: state.purchasedIds.length,
    collected: state.collectedIds.length
  }))

  function setCurrentUserId(id) {
    state.currentUserId = id
  }

  function getToolById(id) {
    return catalog.value.find((tool) => tool.id === Number(id)) ?? null
  }

  function getRelatedTools(currentToolId, category, limit = 3) {
    return catalog.value
      .filter((tool) => tool.id !== Number(currentToolId) && tool.category === category)
      .slice(0, limit)
  }

  function isToolCollected(id) {
    return state.collectedIds.includes(Number(id))
  }

  function isToolPurchased(id) {
    return state.purchasedIds.includes(Number(id))
  }

  function toggleCollected(id) {
    const targetId = Number(id)
    if (state.collectedIds.includes(targetId)) {
      state.collectedIds = state.collectedIds.filter((item) => item !== targetId)
    } else {
      state.collectedIds = [targetId, ...state.collectedIds]
    }
    persistState()
  }

  function purchaseTool(id) {
    const targetId = Number(id)
    if (!state.purchasedIds.includes(targetId)) {
      state.purchasedIds = [targetId, ...state.purchasedIds]
      persistState()
    }
  }

  function publishTool(payload) {
    const nextId =
      Math.max(...catalog.value.map((tool) => Number(tool.id)), 0) + 1

    const tool = {
      id: nextId,
      name: payload.name.trim(),
      category: payload.category,
      badge: "Just Added",
      price: Number(payload.price),
      rating: 4.8,
      sales: 0,
      author: payload.author.trim(),
      authorId: state.currentUserId,
      description: payload.description.trim(),
      accent: payload.accent || accentByCategory[payload.category] || "mint",
      heroLabel: heroLabelByCategory[payload.category] || "Creative Tool",
      longDescription: payload.longDescription.trim() || payload.description.trim(),
      highlights: normalizeList(payload.highlights || "快速部署,课程答辩展示,创作者工作流"),
      useCases: normalizeList(payload.useCases || "课程项目,作品展示,创意提案"),
      tags: normalizeList(payload.tags || payload.name),
      updatedAt: new Date().toISOString().slice(0, 10),
      delivery: payload.delivery.trim() || "作品文件 + 使用说明"
    }

    state.customTools = [tool, ...state.customTools]
    persistState()

    return tool
  }

  function getPublishedToolById(id) {
    return state.customTools.find((tool) => tool.id === Number(id)) ?? null
  }

  function updatePublishedTool(id, payload) {
    const targetId = Number(id)
    const currentTool = getPublishedToolById(targetId)

    if (!currentTool) {
      return null
    }

    const updatedTool = {
      ...currentTool,
      name: payload.name.trim(),
      category: payload.category,
      price: Number(payload.price),
      author: payload.author.trim(),
      description: payload.description.trim(),
      accent: payload.accent || accentByCategory[payload.category] || currentTool.accent,
      heroLabel: heroLabelByCategory[payload.category] || currentTool.heroLabel,
      longDescription: payload.longDescription.trim() || payload.description.trim(),
      highlights: normalizeList(payload.highlights || currentTool.highlights.join(",")),
      useCases: normalizeList(payload.useCases || currentTool.useCases.join(",")),
      tags: normalizeList(payload.tags || currentTool.tags.join(",")),
      updatedAt: new Date().toISOString().slice(0, 10),
      delivery: payload.delivery.trim() || currentTool.delivery
    }

    state.customTools = state.customTools.map((tool) =>
      tool.id === targetId ? updatedTool : tool
    )
    persistState()

    return updatedTool
  }

  function deletePublishedTool(id) {
    const targetId = Number(id)
    state.customTools = state.customTools.filter((tool) => tool.id !== targetId)
    state.collectedIds = state.collectedIds.filter((item) => item !== targetId)
    state.purchasedIds = state.purchasedIds.filter((item) => item !== targetId)
    persistState()
  }

  // 当前用户发布的工具（null = 管理员，显示全部；否则只显示自己的）
  const publishedTools = computed(() =>
    state.currentUserId === null
      ? state.customTools
      : state.customTools.filter((t) => t.authorId === state.currentUserId)
  )

  /* ---- 购物车 ---- */
  function addToCart(id) {
    const targetId = Number(id)
    if (!state.cartIds.includes(targetId)) {
      state.cartIds = [targetId, ...state.cartIds]
      persistState()
    }
  }

  function removeFromCart(id) {
    state.cartIds = state.cartIds.filter((item) => item !== Number(id))
    persistState()
  }

  function isInCart(id) {
    return state.cartIds.includes(Number(id))
  }

  function clearCart() {
    state.cartIds = []
    persistState()
  }

  const cartTools = computed(() =>
    catalog.value.filter((tool) => state.cartIds.includes(Number(tool.id)))
  )

  const cartTotal = computed(() =>
    cartTools.value.reduce((sum, t) => sum + (Number(t.price) || 0), 0)
  )

  const purchasedTools = computed(() =>
    catalog.value.filter((tool) => state.purchasedIds.includes(Number(tool.id)))
  )
  const collectedTools = computed(() =>
    catalog.value.filter((tool) => state.collectedIds.includes(Number(tool.id)))
  )

  return {
    categories: toolCategories,
    catalog,
    stats,
    publishedTools,
    purchasedTools,
    collectedTools,
    cartTools,
    cartTotal,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart,
    setCurrentUserId,
    getToolById,
    getRelatedTools,
    isToolCollected,
    isToolPurchased,
    toggleCollected,
    purchaseTool,
    publishTool,
    getPublishedToolById,
    updatePublishedTool,
    deletePublishedTool
  }
}
