const BASE = "/api/auth"

export async function loginAPI({ username, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

export async function registerAPI({ username, password, displayName }) {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, displayName })
  })
  return res.json()
}

export async function fetchAccounts() {
  const res = await fetch(`${BASE}/accounts`)
  return res.json()
}

export async function deleteAccountAPI(id) {
  const res = await fetch(`${BASE}/accounts/${id}`, { method: "DELETE" })
  return res.json()
}
