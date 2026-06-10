<script setup>
import { computed, ref, watch, nextTick, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getUserMessages, sendMessage } from "../api/messages"
import { useUserSession } from "../composables/useUserSession"
import { useUnread } from "../composables/useUnread"

const route = useRoute()
const router = useRouter()
const { currentUser } = useUserSession()
const { markAllRead } = useUnread()

/* ---- 状态 ---- */
const allMessages = ref([])
const inputText = ref("")
const chatRef = ref(null)
const loading = ref(false)

/* ---- 当前选中的对话 ---- */
const activePartnerId = ref(Number(route.query.with) || null)
const activeToolId = ref(Number(route.query.tool) || null)
const activeToolName = ref(route.query.name || "")

/* ---- 加载全部消息 ---- */
onMounted(async () => {
  if (!currentUser.value) return
  // 共享状态立即清红点
  markAllRead()
  loading.value = true
  try {
    allMessages.value = await getUserMessages(currentUser.value.id)
  } finally {
    loading.value = false
  }
})

/* ---- 按对方用户+工具分组 ---- */
const conversations = computed(() => {
  const map = {}
  for (const msg of allMessages.value) {
    const isMine = msg.from_user_id === currentUser.value?.id
    const partnerId = isMine ? msg.to_user_id : msg.from_user_id
    const partnerName = (isMine ? msg.to_username : msg.from_username) || "未知用户"
    const key = `${partnerId}-${msg.tool_id}`

    if (!map[key] || new Date(msg.created_at) > new Date(map[key].lastTime)) {
      map[key] = {
        partnerId,
        partnerName,
        toolId: msg.tool_id,
        toolName: msg.tool_name,
        lastMsg: msg.content,
        lastTime: msg.created_at,
        lastType: msg.msg_type,
        unread: !isMine && (activePartnerId.value !== partnerId || activeToolId.value !== msg.tool_id)
      }
    }
  }
  return Object.values(map).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
})

/* ---- 当前对话消息 ---- */
const currentMessages = computed(() =>
  allMessages.value.filter(
    (m) =>
      m.tool_id === activeToolId.value &&
      (m.from_user_id === activePartnerId.value || m.to_user_id === activePartnerId.value)
  ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
)

const activePartnerName = computed(() => {
  const conv = conversations.value.find(
    (c) => c.partnerId === activePartnerId.value && c.toolId === activeToolId.value
  )
  return conv?.partnerName || ""
})

/* ---- 操作 ---- */
function selectConversation(conv) {
  activePartnerId.value = conv.partnerId
  activeToolId.value = conv.toolId
  activeToolName.value = conv.toolName
  router.replace({ query: { with: conv.partnerId, tool: conv.toolId, name: conv.toolName } })
  nextTick(() => scrollBottom())
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  if (!activePartnerId.value || !activeToolId.value) {
    console.warn("未选择对话对象")
    return
  }

  if (!currentUser.value?.id) {
    console.warn("未登录")
    return
  }

  const msg = {
    toolId: activeToolId.value,
    toolName: activeToolName.value || "",
    fromUserId: currentUser.value.id,
    fromUsername: currentUser.value.displayName || currentUser.value.username,
    toUserId: activePartnerId.value,
    toUsername: activePartnerName.value || "",
    content: text,
    msgType: "chat"
  }

  try {
    await sendMessage(msg)
  } catch (e) {
    console.error("发送失败", e)
  }

  inputText.value = ""

  // 本地追加消息，字段名必须和 MySQL 列名一致（下划线风格）
  allMessages.value = [...allMessages.value, {
    id: Date.now() + Math.random(),
    tool_id: msg.toolId,
    tool_name: msg.toolName,
    from_user_id: msg.fromUserId,
    from_username: msg.fromUsername,
    to_user_id: msg.toUserId,
    to_username: msg.toUsername,
    content: msg.content,
    msg_type: msg.msgType,
    created_at: new Date().toISOString()
  }]
  nextTick(() => scrollBottom())
}

function scrollBottom() {
  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}

watch(currentMessages, () => nextTick(() => scrollBottom()))
</script>

<template>
  <div v-if="currentUser" class="profile-layout">

    <!-- 左侧：会话列表 -->
    <aside class="profile-sidebar messages-sidebar">
      <div class="profile-sidebar__user">
        <span class="profile-sidebar__avatar">💬</span>
        <strong>我的消息</strong>
        <span class="profile-sidebar__role">{{ conversations.length }} 个对话</span>
      </div>

      <nav v-if="conversations.length" class="messages-conv-list">
        <button
          v-for="conv in conversations"
          :key="`${conv.partnerId}-${conv.toolId}`"
          class="messages-conv-item"
          :class="{ 'messages-conv-item--active': activePartnerId === conv.partnerId && activeToolId === conv.toolId }"
          @click="selectConversation(conv)"
        >
          <span class="messages-conv-item__avatar">{{ String(conv.partnerName || 'U').charAt(0) }}</span>
          <div class="messages-conv-item__body">
            <div class="messages-conv-item__head">
              <strong>{{ conv.partnerName || '未知' }}</strong>
              <span class="messages-conv-item__time">{{ (conv.lastTime || '').slice(5, 10) }}</span>
            </div>
            <p class="messages-conv-item__tool">关于 {{ conv.toolName || '' }}</p>
            <p class="messages-conv-item__preview">{{ (conv.lastMsg || '').slice(0, 30) }}</p>
          </div>
        </button>
      </nav>

      <div v-else class="profile-sidebar__empty">
        <p>暂无消息记录</p>
        <p class="profile-sidebar__empty-hint">浏览工具并点击"联系商户"开始对话</p>
      </div>
    </aside>

    <!-- 右侧：聊天区 -->
    <main class="profile-main messages-main">
      <template v-if="activePartnerId && activeToolId">
        <div class="messages-chat-head">
          <div>
            <p class="eyebrow">{{ activeToolName }}</p>
            <h2>{{ activePartnerName }}</h2>
          </div>
        </div>

        <div ref="chatRef" class="messages-chat-body">
          <div v-if="!currentMessages.length" class="messages-chat-empty">
            <span>💬</span>
            <p>开始和 {{ activePartnerName }} 对话吧</p>
          </div>
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            class="chat-msg"
            :class="{ 'chat-msg--mine': msg.from_user_id === currentUser?.id }"
          >
            <div class="chat-msg__bubble">
              <span v-if="msg.msg_type !== 'chat'" class="chat-msg__type">
                {{ { price: '💰议价', refund: '↩️退款', delivery: '📦发货' }[msg.msg_type] || '' }}
              </span>
              <p>{{ msg.content }}</p>
              <span class="chat-msg__time">{{ msg.created_at?.slice(0, 16) || "" }}</span>
            </div>
          </div>
        </div>

        <div class="messages-chat-input">
          <input
            v-model="inputText"
            placeholder="输入消息..."
            @keydown.enter="handleSend"
          />
          <button class="primary-button" @click="handleSend">发送</button>
        </div>
      </template>

      <div v-else class="messages-chat-empty messages-chat-empty--center">
        <span>📬</span>
        <h3>选择一个对话</h3>
        <p>从左侧列表选择一位用户开始聊天</p>
      </div>
    </main>

  </div>
</template>
