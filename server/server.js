import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcryptjs"
import pool from "./db.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

// 生产环境：提供前端静态文件
const distPath = path.resolve(__dirname, "..", "dist")
app.use(express.static(distPath))

/* ===== 工具函数 ===== */

function safeUser(user) {
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

/* ===== 注册 ===== */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, displayName } = req.body

    if (!username || !password || !displayName) {
      return res.status(400).json({ ok: false, message: "请完整填写注册信息" })
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: "密码至少需要 6 位" })
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    )

    if (existing.length > 0) {
      return res.status(409).json({ ok: false, message: "这个账号名已经存在了" })
    }

    const hashed = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      "INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)",
      [username.trim(), hashed, displayName.trim(), "user"]
    )

    const user = {
      id: result.insertId,
      username: username.trim(),
      displayName: displayName.trim(),
      role: "user"
    }

    res.json({ ok: true, user })
  } catch (err) {
    console.error("register error:", err)
    res.status(500).json({ ok: false, message: "服务器错误，请稍后重试" })
  }
})

/* ===== 登录 ===== */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ ok: false, message: "请输入账号和密码" })
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username.trim()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: "账号或密码不正确" })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({ ok: false, message: "账号或密码不正确" })
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role
      }
    })
  } catch (err) {
    console.error("login error:", err)
    res.status(500).json({ ok: false, message: "服务器错误，请稍后重试" })
  }
})

/* ===== 获取账号列表（管理员用） ===== */
app.get("/api/auth/accounts", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, display_name, role FROM users ORDER BY id"
    )
    res.json(rows.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      role: u.role
    })))
  } catch (err) {
    console.error("accounts error:", err)
    res.status(500).json({ ok: false, message: "服务器错误" })
  }
})

/* ===== 删除账号（管理员用） ===== */
app.delete("/api/auth/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [id])
    if (rows.length === 0) return res.status(404).json({ ok: false, message: "账号不存在" })
    if (rows[0].role === "admin") return res.status(403).json({ ok: false, message: "不能删除管理员账号" })

    await pool.query("DELETE FROM users WHERE id = ?", [id])
    res.json({ ok: true })
  } catch (err) {
    console.error("delete account error:", err)
    res.status(500).json({ ok: false, message: "服务器错误" })
  }
})

/* ===== 消息 / 聊天 ===== */

// 未读消息数（只统计 last_read 之后的消息）
app.get("/api/messages/unread/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId)
    let lastRead = req.query.since || "1970-01-01"
    // 转换 ISO 格式为 MySQL 格式
    lastRead = lastRead.replace("T", " ").slice(0, 19)
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM messages WHERE to_user_id = ? AND created_at > ?",
      [userId, lastRead]
    )
    res.json({ count: rows[0].count })
  } catch (err) {
    res.json({ count: 0 })
  }
})

// 发送消息
app.post("/api/messages", async (req, res) => {
  try {
    const { toolId, toolName, fromUserId, fromUsername, toUserId, toUsername, content, msgType } = req.body
    if (!toolId || !fromUserId || !toUserId || !content) {
      return res.status(400).json({ ok: false, message: "缺少必要参数" })
    }

    await pool.query(
      `INSERT INTO messages (tool_id, tool_name, from_user_id, from_username, to_user_id, to_username, content, msg_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [toolId, toolName || "", fromUserId, fromUsername || "", toUserId, toUsername || "", content, msgType || "chat"]
    )

    res.json({ ok: true })
  } catch (err) {
    console.error("send message error:", err)
    res.status(500).json({ ok: false, message: "发送失败" })
  }
})

// 获取某用户的所有消息（按工具分组）
app.get("/api/messages/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId)
    const [rows] = await pool.query(
      `SELECT * FROM messages
       WHERE from_user_id = ? OR to_user_id = ?
       ORDER BY created_at DESC`,
      [userId, userId]
    )
    res.json(rows)
  } catch (err) {
    console.error("get messages error:", err)
    res.status(500).json([])
  }
})

// 获取某用户关于某个工具的对话
app.get("/api/messages/user/:userId/tool/:toolId", async (req, res) => {
  try {
    const userId = Number(req.params.userId)
    const toolId = Number(req.params.toolId)
    const [rows] = await pool.query(
      `SELECT * FROM messages
       WHERE tool_id = ? AND (from_user_id = ? OR to_user_id = ?)
       ORDER BY created_at ASC`,
      [toolId, userId, userId]
    )
    res.json(rows)
  } catch (err) {
    console.error("get conversation error:", err)
    res.status(500).json([])
  }
})

/* ===== AI 助手 ===== */

import { tools as demoTools } from "./tools-data.js"

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { userId, message } = req.body
    if (!userId || !message) return res.status(400).json({ ok: false })

    const msg = message.trim()
    const lower = msg.toLowerCase()

    // 1. 获取最近聊天记录作上下文
    const [history] = await pool.query(
      "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      [userId]
    )
    const context = history.reverse().map(h => `${h.role}: ${h.content}`).join("\n")

    // 2. 保存用户消息
    await pool.query("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'user', ?)", [userId, msg])

    // 3. 构建工具列表摘要
    const toolSummary = demoTools.map(t =>
      `[${t.name}] 分类:${t.category} 价格:￥${t.price} 作者:${t.author} 评分:${t.rating} 描述:${t.description}`
    ).join("\n")

    // 4. 尝试 Ollama，失败则用关键词匹配
    let reply
    try {
      reply = await callOllama(msg, context, toolSummary)
    } catch {
      reply = keywordMatch(msg, toolSummary)
    }

    // 5. 保存助手回复
    await pool.query("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'assistant', ?)", [userId, reply])

    res.json({ ok: true, reply })
  } catch (err) {
    console.error("ai chat error:", err)
    res.status(500).json({ ok: false, reply: "抱歉，AI助手暂时无法响应，请稍后重试。" })
  }
})

/* Ollama 调用 */
async function callOllama(message, context, toolSummary) {
  const prompt = `你是"AI工具集市"的智能导购助手。你热情、专业，帮助用户发现合适的AI工具。

## 平台工具列表
${toolSummary}

## 最近对话
${context || "（新对话）"}

## 你的能力
1. 根据用户需求推荐匹配的工具（说出工具名、价格和理由）
2. 如果用户想发布工具，引导他们去"发布工具"页面（/publish）
3. 介绍平台功能：首页浏览、购物车、消息、个人中心
4. 友好聊天，解答问题

## 用户问题
${message}

请用中文回复，简洁有帮助。如推荐工具，列出工具名和价格。`

  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "qwen2.5:1.5b", prompt, stream: false }),
    signal: AbortSignal.timeout(8000)
  })
  const data = await resp.json()
  return data.response || "抱歉，我暂时无法回答这个问题。"
}

/* 关键词匹配兜底 */
function keywordMatch(message, toolSummary) {
  const lower = message.toLowerCase()

  // 推荐工具
  if (lower.includes("推荐") || lower.includes("找") || lower.includes("想要") || lower.includes("有没有") || lower.includes("海报") || lower.includes("代码") || lower.includes("文字") || lower.includes("音频") || lower.includes("图片") || lower.includes("设计") || lower.includes("配色") || lower.includes("图标") || lower.includes("问卷") || lower.includes("文档") || lower.includes("部署") || lower.includes("接口") || lower.includes("bug")) {

    const keywords = [
      { word: "海报", ids: [2, 6] },
      { word: "代码", ids: [3, 7, 13, 14] },
      { word: "文字", ids: [1, 5, 8] },
      { word: "音频", ids: [4] },
      { word: "配色", ids: [9] },
      { word: "图标", ids: [10] },
      { word: "问卷", ids: [11] },
      { word: "文档", ids: [8, 12] },
      { word: "部署", ids: [14] },
      { word: "接口", ids: [13] },
      { word: "bug", ids: [7] },
      { word: "图片", ids: [2, 6, 9] },
      { word: "设计", ids: [2, 6, 9, 10] }
    ]

    let matchedIds = []
    for (const kw of keywords) {
      if (lower.includes(kw.word)) matchedIds.push(...kw.ids)
    }
    // 去重，最多推荐3个
    matchedIds = [...new Set(matchedIds)].slice(0, 3)

    if (matchedIds.length) {
      const matched = demoTools.filter(t => matchedIds.includes(t.id))
      const list = matched.map(t => `- **${t.name}** ￥${t.price} ★${t.rating}\n  ${t.description}`).join("\n")
      return `根据你的需求，推荐以下工具：\n\n${list}\n\n可以点击工具卡片查看详情或加入购物车~`
    }
  }

  // 发布工具
  if (lower.includes("发布") || lower.includes("上传") || lower.includes("创建")) {
    return `你可以点击导航栏的「发布工具」按钮（或访问 /publish 页面），填写工具名称、分类、价格和描述就能发布了。发布后工具会立即出现在首页列表和个人中心中。需要我详细说明某个步骤吗？`
  }

  // 购物车
  if (lower.includes("购物车") || lower.includes("结算")) {
    return `点击导航栏的购物车图标可以进入购物车页面。在工具详情页点击「加入购物车」，然后在购物车中可以一键结算。购买后的工具会出现在个人中心的「已购买」列表里。`
  }

  // 平台介绍
  if (lower.includes("介绍") || lower.includes("功能") || lower.includes("怎么用") || lower.includes("帮助")) {
    return `欢迎来到 AI Tool Bazaar！这里是AI工具的展示和交易平台。你可以：\n- 浏览工具：首页和全部工具页面搜索、筛选\n- 购买工具：加入购物车后一键结算\n- 发布工具：点击发布工具分享你的AI工具\n- 联系商户：在工具详情页与创作者沟通\n- 个人中心：管理你的发布、购买和收藏\n\n有什么需要帮忙的吗？`
  }

  return `你好！我是AI工具集市的智能助手。你可以问我：\n- 帮我推荐做海报的AI工具\n- 怎么发布工具？\n- 购物车怎么用？\n\n有什么可以帮你的吗？`
}

/* ===== 举报 ===== */

// 提交举报
app.post("/api/reports", async (req, res) => {
  try {
    const { toolId, toolName, reporterId, reporterName, reason } = req.body
    if (!toolId || !reporterId || !reason) {
      return res.status(400).json({ ok: false, message: "缺少必要参数" })
    }
    await pool.query(
      "INSERT INTO reports (tool_id, tool_name, reporter_id, reporter_name, reason) VALUES (?, ?, ?, ?, ?)",
      [toolId, toolName || "", reporterId, reporterName || "", reason]
    )
    res.json({ ok: true, message: "举报已提交，管理员将尽快审核" })
  } catch (err) {
    console.error("report error:", err)
    res.status(500).json({ ok: false, message: "提交失败" })
  }
})

// 获取举报列表（管理员）
app.get("/api/reports", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reports ORDER BY created_at DESC"
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json([])
  }
})

// 处理举报（管理员审批/驳回）
app.put("/api/reports/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, message: "无效状态" })
    }
    await pool.query(
      "UPDATE reports SET status = ?, handled_at = NOW() WHERE id = ?",
      [status, id]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, message: "处理失败" })
  }
})

// SPA 回退：非 API 路由返回 index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"))
})

/* ===== 启动 ===== */
const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ AI Tool Bazaar 已上线: http://localhost:${PORT}`)
})
