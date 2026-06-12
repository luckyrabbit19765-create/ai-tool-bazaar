import { chromium } from "playwright"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "screenshots")
const BASE = "http://localhost:3001"

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`)
  const defaults = { fullPage: true }
  await page.screenshot({ ...defaults, ...opts, path: file })
  console.log(`  ✅ ${name}`)
}

async function dismissCover(page) {
  const cover = page.locator(".launch-cover__lid")
  if (await cover.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cover.click()
    await page.waitForTimeout(1200)
  }
}

async function login(page, user, pass) {
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.fill('input[placeholder*="账号"]', user)
  await page.fill('input[placeholder*="密码"]', pass)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1500)
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  console.log("📸 开始截图...\n")

  // ====== 未登录状态 ======
  console.log("--- 未登录 ---")
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1000)
  // 关闭封面
  const coverBtn = page.locator(".launch-cover__lid")
  if (await coverBtn.isVisible().catch(() => false)) { await coverBtn.click(); await page.waitForTimeout(1500) }
  await shot(page, "01-首页")

  await page.goto(`${BASE}/catalog`, { waitUntil: "networkidle" })
  await shot(page, "02-全部工具")

  await page.goto(`${BASE}/tool/1`, { waitUntil: "networkidle" })
  await shot(page, "03-工具详情")

  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" })
  await shot(page, "04-登录页")

  await page.goto(`${BASE}/auth?mode=register`, { waitUntil: "networkidle" })
  await shot(page, "05-注册页")

  await page.goto(`${BASE}/notfound`, { waitUntil: "networkidle" })
  await shot(page, "06-404页面")

  // ====== 普通用户登录 (demo) ======
  console.log("--- 普通用户 demo ---")
  await login(page, "demo", "123456")

  await page.goto(BASE, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  await shot(page, "07-首页-已登录")

  await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  await shot(page, "08-个人中心-已发布")

  await page.getByText("已购买").first().click()
  await page.waitForTimeout(500)
  await shot(page, "09-个人中心-已购买")

  await page.getByText("已收藏").first().click()
  await page.waitForTimeout(500)
  await shot(page, "10-个人中心-已收藏")

  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, "11-购物车")

  await page.goto(`${BASE}/messages`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, "12-消息页")

  await page.goto(`${BASE}/publish`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, "13-发布工具")

  // 购买弹窗
  await page.goto(`${BASE}/tool/1`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await page.locator('text=立即购买').first().click({ force: true })
  await page.waitForTimeout(800)
  await shot(page, "14-购买确认弹窗")

  // 联系商户 -> 消息页
  await page.goto(`${BASE}/tool/1`, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  const chatBtn = page.locator('text=联系商户')
  if (await chatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await chatBtn.click()
    await page.waitForTimeout(1000)
    await dismissCover(page)
    await shot(page, "15-联系商户")
  }

  // AI助手
  await page.goto(BASE, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  const aiBubble = page.locator(".ai-bubble")
  if (await aiBubble.isVisible({ timeout: 2000 }).catch(() => false)) {
    await aiBubble.click()
    await page.waitForTimeout(800)
    await shot(page, "16-AI助手", { fullPage: false })
  }

  // 举报
  await page.goto(`${BASE}/tool/1`, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  const reportBtn = page.locator('text=举报此工具')
  if (await reportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await reportBtn.click()
    await page.waitForTimeout(500)
    await page.fill(".detail-report__form textarea", "该工具描述与实际功能不符")
    await shot(page, "17-举报功能")
  }

  // 退出登录
  const userAvatar = page.locator(".header-user__avatar")
  if (await userAvatar.isVisible().catch(() => false)) {
    await userAvatar.hover()
    await page.waitForTimeout(300)
    const logoutBtn = page.locator('text=退出登录')
    if (await logoutBtn.isVisible().catch(() => false)) await logoutBtn.click()
    await page.waitForTimeout(1000)
  }

  // ====== 管理员登录 ======
  console.log("--- 管理员 admin ---")
  await login(page, "admin", "admin123")

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  await dismissCover(page)
  await page.waitForTimeout(500)
  await shot(page, "18-管理员-工具管理")

  await page.getByText("举报审核").first().click()
  await page.waitForTimeout(500)
  await shot(page, "19-管理员-举报审核")

  await page.getByText("账号管理").last().click()
  await page.waitForTimeout(500)
  await shot(page, "20-管理员-账号管理")

  await page.getByText("平台概览").last().click()
  await page.waitForTimeout(500)
  await shot(page, "21-管理员-平台概览")

  await browser.close()
  console.log(`\n🎉 完成！共 21 张截图 → ${OUT}`)
})()
