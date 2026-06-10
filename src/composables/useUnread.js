import { ref } from "vue"

const unreadCount = ref(0)

export function useUnread() {
  async function fetchUnread(userId) {
    if (!userId) {
      unreadCount.value = 0
      return
    }
    try {
      const lastRead = localStorage.getItem("msg_last_read") || "1970-01-01"
      const res = await fetch(`/api/messages/unread/${userId}?since=${encodeURIComponent(lastRead)}`)
      const data = await res.json()
      unreadCount.value = data.count || 0
    } catch {
      unreadCount.value = 0
    }
  }

  function markAllRead() {
    localStorage.setItem("msg_last_read", new Date().toISOString())
    unreadCount.value = 0
  }

  return { unreadCount, fetchUnread, markAllRead }
}
