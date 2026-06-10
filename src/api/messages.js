const BASE = import.meta.env.PROD
  ? "https://ai-tool-bazaar.onrender.com/api/messages"
  : "/api/messages"

export async function sendMessage(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function getUserMessages(userId) {
  const res = await fetch(`${BASE}/user/${userId}`)
  return res.json()
}

export async function getConversation(userId, toolId) {
  const res = await fetch(`${BASE}/user/${userId}/tool/${toolId}`)
  return res.json()
}
