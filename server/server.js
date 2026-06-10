import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcryptjs"
import db from "./db.js"
import { tools as demoTools } from "./tools-data.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 种子管理员账号（首次启动自动创建）
function seed() {
  const admin = db.prepare("SELECT id FROM users WHERE username = ?").get("admin")
  if (!admin) {
    const demoPass = bcrypt.hashSync("123456", 10)
    const adminPass = bcrypt.hashSync("admin123", 10)
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("demo", demoPass, "演示用户", "user")
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("admin", adminPass, "平台管理员", "admin")
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("alice", demoPass, "爱丽丝", "user")
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("bob", demoPass, "鲍勃", "user")
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("cathy", demoPass, "凯茜", "user")
    db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run("david", demoPass, "大卫", "user")
    console.log("✅ 种子用户已创建")
  }
}
seed()

const app = express()
app.use(cors())
app.use(express.json())

// 生产环境：提供前端静态文件
const distPath = path.resolve(__dirname, "..", "dist")
app.use(express.static(distPath))

/* ===== 注册 ===== */
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, displayName } = req.body
    if (!username || !password || !displayName) return res.status(400).json({ ok: false, message: "请完整填写注册信息" })
    if (password.length < 6) return res.status(400).json({ ok: false, message: "密码至少需要 6 位" })

    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim())
    if (exists) return res.status(409).json({ ok: false, message: "这个账号名已经存在了" })

    const hashed = bcrypt.hashSync(password, 10)
    const result = db.prepare("INSERT INTO users (username, password, display_name, role) VALUES (?,?,?,?)").run(username.trim(), hashed, displayName.trim(), "user")

    res.json({ ok: true, user: { id: result.lastInsertRowid, username: username.trim(), displayName: displayName.trim(), role: "user" } })
  } catch (err) { console.error("register:", err); res.status(500).json({ ok: false, message: "服务器错误" }) }
})

/* ===== 登录 ===== */
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ ok: false, message: "请输入账号和密码" })

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim())
    if (!user) return res.status(401).json({ ok: false, message: "账号或密码不正确" })
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ ok: false, message: "账号或密码不正确" })

    res.json({ ok: true, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } })
  } catch (err) { console.error("login:", err); res.status(500).json({ ok: false, message: "服务器错误" }) }
})

/* ===== 账号列表 ===== */
app.get("/api/auth/accounts", (_req, res) => {
  try {
    const rows = db.prepare("SELECT id, username, display_name, role FROM users ORDER BY id").all()
    res.json(rows.map(u => ({ id: u.id, username: u.username, displayName: u.display_name, role: u.role })))
  } catch { res.status(500).json([]) }
})

/* ===== 删除账号 ===== */
app.delete("/api/auth/accounts/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(id)
    if (!user) return res.status(404).json({ ok: false, message: "账号不存在" })
    if (user.role === "admin") return res.status(403).json({ ok: false, message: "不能删除管理员" })
    db.prepare("DELETE FROM users WHERE id = ?").run(id)
    res.json({ ok: true })
  } catch { res.status(500).json({ ok: false, message: "服务器错误" }) }
})

/* ===== 消息 ===== */
app.get("/api/messages/unread/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId)
    let since = req.query.since || "1970-01-01"
    since = since.replace("T", " ").slice(0, 19)
    const row = db.prepare("SELECT COUNT(*) AS count FROM messages WHERE to_user_id = ? AND created_at > ?").get(userId, since)
    res.json({ count: row.count })
  } catch { res.json({ count: 0 }) }
})

app.post("/api/messages", (req, res) => {
  try {
    const { toolId, toolName, fromUserId, fromUsername, toUserId, toUsername, content, msgType } = req.body
    db.prepare("INSERT INTO messages (tool_id, tool_name, from_user_id, from_username, to_user_id, to_username, content, msg_type) VALUES (?,?,?,?,?,?,?,?)")
      .run(toolId, toolName || "", fromUserId, fromUsername || "", toUserId, toUsername || "", content, msgType || "chat")
    res.json({ ok: true })
  } catch { res.status(500).json({ ok: false, message: "发送失败" }) }
})

app.get("/api/messages/user/:userId", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM messages WHERE from_user_id = ? OR to_user_id = ? ORDER BY created_at DESC").all(Number(req.params.userId), Number(req.params.userId))
    res.json(rows)
  } catch { res.status(500).json([]) }
})

app.get("/api/messages/user/:userId/tool/:toolId", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM messages WHERE tool_id = ? AND (from_user_id = ? OR to_user_id = ?) ORDER BY created_at ASC")
      .all(Number(req.params.toolId), Number(req.params.userId), Number(req.params.userId))
    res.json(rows)
  } catch { res.status(500).json([]) }
})

/* ===== 举报 ===== */
app.post("/api/reports", (req, res) => {
  try {
    const { toolId, toolName, reporterId, reporterName, reason } = req.body
    db.prepare("INSERT INTO reports (tool_id, tool_name, reporter_id, reporter_name, reason) VALUES (?,?,?,?,?)")
      .run(toolId, toolName || "", reporterId, reporterName || "", reason)
    res.json({ ok: true, message: "举报已提交，管理员将尽快审核" })
  } catch { res.status(500).json({ ok: false, message: "提交失败" }) }
})

app.get("/api/reports", (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all()) }
  catch { res.status(500).json([]) }
})

app.put("/api/reports/:id", (req, res) => {
  try {
    const { status } = req.body
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ ok: false, message: "无效状态" })
    db.prepare("UPDATE reports SET status = ?, handled_at = datetime('now') WHERE id = ?").run(status, Number(req.params.id))
    res.json({ ok: true })
  } catch { res.status(500).json({ ok: false, message: "处理失败" }) }
})

/* ===== AI 助手 ===== */
app.post("/api/ai/chat", (req, res) => {
  try {
    const { userId, message } = req.body
    if (!userId || !message) return res.status(400).json({ ok: false })

    const msg = message.trim()
    const lower = msg.toLowerCase()

    const history = db.prepare("SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all(userId)
    const context = history.reverse().map(h => `${h.role}: ${h.content}`).join("\n")

    db.prepare("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'user', ?)").run(userId, msg)

    const toolSummary = demoTools.map(t => `[${t.name}] 分类:${t.category} 价格:￥${t.price} 作者:${t.author} 评分:${t.rating} 描述:${t.description}`).join("\n")

    let reply
    try { reply = callOllama(msg, context, toolSummary) } catch { reply = keywordMatch(msg) }

    db.prepare("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'assistant', ?)").run(userId, reply)
    res.json({ ok: true, reply })
  } catch (err) { console.error("ai:", err); res.status(500).json({ ok: false, reply: "AI助手暂时无法响应" }) }
})

/* 关键词匹配 */
function keywordMatch(message) {
  const lower = message.toLowerCase()
  if (lower.includes("推荐") || lower.includes("找") || lower.includes("想要") || lower.includes("海报") || lower.includes("代码") || lower.includes("文字") || lower.includes("音频") || lower.includes("图片") || lower.includes("设计") || lower.includes("配色") || lower.includes("图标") || lower.includes("问卷") || lower.includes("文档") || lower.includes("部署") || lower.includes("接口") || lower.includes("bug")) {
    const kw = [{ w: "海报", ids: [2, 6] }, { w: "代码", ids: [3, 7, 13, 14] }, { w: "文字", ids: [1, 5, 8] }, { w: "音频", ids: [4] }, { w: "配色", ids: [9] }, { w: "图标", ids: [10] }, { w: "问卷", ids: [11] }, { w: "文档", ids: [8, 12] }, { w: "部署", ids: [14] }, { w: "接口", ids: [13] }, { w: "bug", ids: [7] }, { w: "图片", ids: [2, 6, 9] }, { w: "设计", ids: [2, 6, 9, 10] }]
    let ids = []; for (const k of kw) { if (lower.includes(k.w)) ids.push(...k.ids) }
    ids = [...new Set(ids)].slice(0, 3)
    if (ids.length) {
      const m = demoTools.filter(t => ids.includes(t.id))
      return `根据你的需求，推荐以下工具：\n\n${m.map(t => `- **${t.name}** ￥${t.price} ★${t.rating}\n  ${t.description}`).join("\n")}\n\n可以点击工具卡片查看详情或加入购物车~`
    }
  }
  if (lower.includes("发布") || lower.includes("上传") || lower.includes("创建")) return `你可以点击导航栏的「发布工具」按钮（或访问 /publish 页面），填写工具名称、分类、价格和描述就能发布了。`
  if (lower.includes("购物车") || lower.includes("结算")) return `点击导航栏的购物车图标可以进入购物车页面。加入购物车后在购物车中一键结算，已购工具在个人中心查看。`
  if (lower.includes("介绍") || lower.includes("功能") || lower.includes("帮助")) return `欢迎来到 AI Tool Bazaar！你可以浏览工具、加入购物车、发布工具、联系商户、管理个人中心。有什么需要帮忙的吗？`
  return `你好！我是AI工具集市的智能助手。你可以问我：推荐做海报的AI工具、怎么发布工具、购物车怎么用？`
}

/* Ollama 调用 */
async function callOllama(message, context, toolSummary) {
  const prompt = `你是"AI工具集市"的智能导购助手。帮助用户发现合适的AI工具。\n\n## 工具列表\n${toolSummary}\n\n## 最近对话\n${context || "（新对话）"}\n\n## 用户问题\n${message}\n\n请用中文简洁回复。推荐工具时列出工具名和价格。`
  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "qwen2.5:1.5b", prompt, stream: false }),
    signal: AbortSignal.timeout(8000)
  })
  const data = await resp.json()
  return data.response || "抱歉，我暂时无法回答。"
}

// SPA 回退
app.get("*", (_req, res) => { res.sendFile(path.join(distPath, "index.html")) })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => { console.log(`✅ AI Tool Bazaar 已上线: http://localhost:${PORT}`) })
