const BASE = "/api/reports"

export async function submitReport(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function getReports() {
  const res = await fetch(BASE)
  return res.json()
}

export async function handleReport(id, status) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  return res.json()
}
