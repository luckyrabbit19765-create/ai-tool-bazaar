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
      const apiBase = typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "https://ai-tool-bazaar.onrender.com" : ""
      const res = await fetch(`${apiBase}/api/messages/unread/${userId}?since=${encodeURIComponent(lastRead)}`)
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
