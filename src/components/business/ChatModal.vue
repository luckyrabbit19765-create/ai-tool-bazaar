<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue"
import { sendMessage, getConversation } from "../../api/messages"

const props = defineProps({
  tool: { type: Object, required: true },
  currentUser: { type: Object, required: true }
})

const emit = defineEmits(["close"])

const messages = ref([])
const inputText = ref("")
const loading = ref(false)
const activeType = ref("chat")
const chatRef = ref(null)

const merchantName = computed(() => props.tool.author)
const merchantId = computed(() => props.tool.authorId)

const quickReplies = {
  chat: [
    "你好，我对这个工具有兴趣",
    "这个工具支持哪些格式？",
    "可以详细介绍一下功能吗？"
  ],
  price: [
    "价格可以优惠一些吗？",
    "有没有学生折扣？",
    "如果批量购买有没有优惠？"
  ],
  refund: [
    "我想申请退款",
    "这个工具不符合我的预期",
    "可以帮我处理一下退款吗？"
  ],
  delivery: [
    "购买后多久能收到？",
    "请确认一下发货信息",
    "已收到，谢谢！"
  ]
}

const typeLabels = {
  chat: "💬 聊天",
  price: "💰 议价",
  refund: "↩️ 退款",
  delivery: "📦 发货"
}

async function loadMessages() {
  loading.value = true
  try {
    const data = await getConversation(props.currentUser.id, props.tool.id)
    messages.value = data
  } catch {
    messages.value = []
  } finally {
    loading.value = false
    nextTick(() => scrollBottom())
  }
}

onMounted(loadMessages)

function scrollBottom() {
  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  const msg = {
    toolId: props.tool.id,
    toolName: props.tool.name,
    fromUserId: props.currentUser.id,
    fromUsername: props.currentUser.displayName,
    toUserId: merchantId.value,
    toUsername: merchantName.value,
    content: text,
    msgType: activeType.value
  }

  await sendMessage(msg)
  inputText.value = ""

  messages.value.push({
    ...msg,
    id: Date.now(),
    created_at: new Date().toISOString()
  })
  nextTick(() => scrollBottom())
}

function useQuick(text) {
  inputText.value = text
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="chat-modal">
      <!-- 头部 -->
      <div class="chat-modal__head">
        <div>
          <p class="eyebrow">联系商户</p>
          <h3>{{ merchantName }} · {{ tool.name }}</h3>
        </div>
        <button class="modal-card__close" @click="emit('close')">✕</button>
      </div>

      <!-- 消息类型切换 -->
      <div class="chat-type-tabs">
        <button
          v-for="(label, key) in typeLabels"
          :key="key"
          class="chat-type-tab"
          :class="{ 'chat-type-tab--active': activeType === key }"
          @click="activeType = key"
        >
          {{ label }}
        </button>
      </div>

      <!-- 消息列表 -->
      <div ref="chatRef" class="chat-messages">
        <div v-if="loading" class="chat-messages__loading">加载中...</div>
        <div v-else-if="!messages.length" class="chat-messages__empty">
          <span>💬</span>
          <p>还没有消息记录，发送第一条消息开始沟通吧</p>
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-msg"
          :class="{ 'chat-msg--mine': msg.fromUserId === currentUser.id }"
        >
          <div class="chat-msg__bubble">
            <span class="chat-msg__type">{{ typeLabels[msg.msgType]?.split(" ")[0] }}</span>
            <p>{{ msg.content }}</p>
            <span class="chat-msg__time">{{ msg.created_at?.slice(0, 16) || "" }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷回复 -->
      <div class="chat-quick-replies">
        <button
          v-for="(text, i) in quickReplies[activeType]"
          :key="i"
          class="chat-quick-btn"
          @click="useQuick(text)"
        >
          {{ text }}
        </button>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-row">
        <input
          v-model="inputText"
          class="chat-input"
          :placeholder="activeType === 'refund' ? '描述退款原因...' : activeType === 'price' ? '输入你的报价...' : '输入消息...'"
          @keydown.enter="handleSend"
        />
        <button class="primary-button" @click="handleSend">发送</button>
      </div>
    </div>
  </div>
</template>
