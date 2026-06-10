import bcrypt from "bcryptjs"
import pool from "./db.js"

async function seed() {
  const pass = await bcrypt.hash("123456", 10)
  const adminPass = await bcrypt.hash("admin123", 10)

  await pool.query("DELETE FROM users")

  const users = [
    ["demo", pass, "演示用户", "user"],
    ["admin", adminPass, "平台管理员", "admin"],
    ["alice", pass, "爱丽丝", "user"],
    ["bob", pass, "鲍勃", "user"],
    ["cathy", pass, "凯茜", "user"],
    ["david", pass, "大卫", "user"]
  ]

  for (const [username, password, displayName, role] of users) {
    await pool.query(
      "INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)",
      [username, password, displayName, role]
    )
    console.log(`✅ ${username} / ${role === 'admin' ? 'admin123' : '123456'} (${displayName})`)
  }

  await pool.end()
  console.log(`\n共 ${users.length} 个用户写入完成`)
}

seed().catch(console.error)
