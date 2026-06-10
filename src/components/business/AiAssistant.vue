<script setup>
import { nextTick, onMounted, ref } from "vue"
import { useUserSession } from "../../composables/useUserSession"

const { currentUser } = useUserSession()

const isOpen = ref(false)
const messages = ref([])
const input = ref("")
const loading = ref(false)
const chatRef = ref(null)

function toggle() { isOpen.value = !isOpen.value }

onMounted(() => {
  messages.value = [{
    role: "assistant",
    content: "你好！我是AI工具集市的智能助手 🤖\n\n我可以帮你：\n🔍 根据需求推荐合适的AI工具\n📤 指导发布工具\n🛒 介绍购物和消息功能\n\n直接输入你想问的吧~"
  }]
})

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: "user", content: text })
  input.value = ""
  loading.value = true
  scrollDown()

  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.value?.id || 0, message: text })
    })
    const data = await res.json()
    messages.value.push({ role: "assistant", content: data.reply || "抱歉，请稍后再试" })
  } catch {
    messages.value.push({ role: "assistant", content: "网络错误，请稍后再试" })
  } finally {
    loading.value = false
    scrollDown()
  }
}

function scrollDown() {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}
</script>

<template>
  <div class="ai-assistant" :class="{ 'ai-assistant--open': isOpen }">
    <!-- 悬浮气泡 -->
    <button class="ai-bubble" @click="toggle">
      <span v-if="!isOpen">🤖</span>
      <span v-else>✕</span>
    </button>

    <!-- 聊天面板 -->
    <div v-if="isOpen" class="ai-panel">
      <div class="ai-panel__head">
        <span>🤖</span>
        <div>
          <strong>AI 小助手</strong>
          <p>智能导购 · 随时在线</p>
        </div>
      </div>

      <div ref="chatRef" class="ai-panel__body">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="ai-msg"
          :class="{ 'ai-msg--user': msg.role === 'user' }"
        >
          <span class="ai-msg__avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
          <div class="ai-msg__bubble">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="ai-msg">
          <span class="ai-msg__avatar">🤖</span>
          <div class="ai-msg__bubble ai-msg__bubble--loading">思考中...</div>
        </div>
      </div>

      <div class="ai-panel__foot">
        <input
          v-model="input"
          placeholder="输入你的问题..."
          @keydown.enter="send"
          :disabled="loading"
        />
        <button @click="send" :disabled="loading || !input.trim()">发送</button>
      </div>
    </div>
  </div>
</template>
