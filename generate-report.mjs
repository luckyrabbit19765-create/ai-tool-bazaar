import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, Header, Footer, PageNumber,
  TableOfContents
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SS = path.join(__dirname, "screenshots")
const OUT = path.join(__dirname, "..", "前端框架技术期末作品报告_v4.docx")

// 中文排版字号: 三号=16pt=32halfpt, 四号=14pt=28halfpt, 小四=12pt=24halfpt
// DXA: 1pt=20dxa, 1行=240dxa, 段前1行=480dxa, 首行缩进2字符=480dxa(对12pt)
const fontHei = "黑体"
const fontSong = "宋体"

// 一级标题：黑体三号 居中 1.5倍行距 段前1行 段后1行
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 480, line: 360, lineRule: "auto" },
    children: [new TextRun({ text, font: fontHei, size: 32, bold: true })]
  })
}

// 二级标题：黑体四号 左对齐 段前1行 段后1行
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 480, after: 480 },
    children: [new TextRun({ text, font: fontHei, size: 28, bold: true })]
  })
}

// 正文：宋体小四 首行缩进2字符 行距固定值22pt 段前0段后0
function body(text) {
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 440, lineRule: "exact" },
    indent: { firstLine: 480 },
    children: [new TextRun({ text, font: fontSong, size: 24 })]
  })
}

function bodyNoIndent(text) {
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 440, lineRule: "exact" },
    children: [new TextRun({ text, font: fontSong, size: 24 })]
  })
}

function empty() { return new Paragraph({ spacing: { after: 0 }, children: [] }) }

// 图片：居中 + 单倍行距 + 图号标注。全页截图拉宽到560px≈6.2inch填满版心
function img(filename, caption) {
  const data = fs.readFileSync(path.join(SS, filename))
  const ext = path.extname(filename).slice(1)
  const imgRun = new ImageRun({
    type: ext === "jpg" ? "jpg" : "png",
    data,
    transformation: { width: 560, height: 350 }
  })
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 0, line: 240 }, children: [imgRun] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, line: 240 },
      children: [new TextRun({ text: caption, font: fontSong, size: 20, italics: true, color: "666666" })]
    })
  ]
}

// ====== BUILD DOCUMENT ======
let sections = []

// ====== COVER PAGE ======
sections.push({
  properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    empty(), empty(), empty(), empty(), empty(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "《前端框架技术》期末作品", font: fontHei, size: 44, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "AI Tool Bazaar — AI 工具集市", font: fontHei, size: 36 })] }),
    empty(), empty(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "题    目：AI Tool Bazaar 在线AI工具交易平台", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "学生姓名：_______________", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "学    号：_______________", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "学院名称：_______________", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "专业班级：_______________", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "指导教师：_______________", font: fontSong, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 500 }, children: [new TextRun({ text: "填写日期：2026年___月___日", font: fontSong, size: 28 })] }),
  ]
})

// ====== 静态目录（含点线和页码） ======
import { PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader } from "docx"

function tocEntry(text, page, level) {
  const isH1 = level === 1
  return new Paragraph({
    spacing: { after: 80, line: 360 },
    indent: isH1 ? {} : { left: 480 },
    children: [
      new TextRun({
        text,
        font: isH1 ? fontHei : fontSong,
        size: isH1 ? 28 : 24,
        bold: isH1
      }),
      new TextRun({ children: [
        new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.DOT }),
        page
      ], font: fontSong, size: 24 })
    ]
  })
}

const tocItems = [
  ["一、引言", "1", 1],
  ["    1.1 项目背景", "1", 2],
  ["    1.2 项目概述", "1", 2],
  ["二、功能实现", "2", 1],
  ["    2.1 功能完整性", "2", 2],
  ["    2.2 Vue核心特性运用", "4", 2],
  ["    2.3 功能正确性", "5", 2],
  ["    2.4 代码规范", "5", 2],
  ["    2.5 代码可读性", "5", 2],
  ["三、用户体验", "6", 1],
  ["    3.1 界面设计", "6", 2],
  ["    3.2 交互设计", "6", 2],
  ["四、拓展性", "7", 1],
  ["    4.1 后端接口与状态管理", "7", 2],
  ["    4.2 消息通讯系统", "7", 2],
  ["    4.3 管理员后台", "8", 2],
  ["    4.4 扩展接口预留", "8", 2],
  ["五、创新性", "9", 1],
  ["    5.1 AI智能导购助手", "9", 2],
  ["    5.2 举报审核系统", "9", 2],
  ["    5.3 AI工具垂直领域定位", "10", 2],
  ["    5.4 数字化运营", "10", 2],
  ["六、总结", "11", 1],
  ["    6.1 项目成果总结", "11", 2],
  ["    6.2 个人收获与不足", "11", 2],
  ["    6.3 未来展望", "11", 2]
]

sections.push({
  properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("目  录"),
    empty(),
    ...tocItems.map(([text, page, level]) => tocEntry(text, page, level)),
    empty(),
    new Paragraph({ children: [new PageBreak()] })
  ]
})

// ====== MAIN CONTENT ======
const mainChildren = []

// 一、引言
mainChildren.push(h1("一、引言"))
mainChildren.push(h2("1.1 项目背景"))
mainChildren.push(body("随着人工智能技术的爆发式增长，越来越多的开发者和创作者开始使用AI生成各类实用工具。然而，市场上缺少一个专门展示和交易这些AI生成工具的平台。AI Tool Bazaar应运而生——它是一个面向AI工具创作者和用户的双边交易平台，创作者可以上传自己使用AI完成的工具，用户可以浏览、搜索、筛选并决定是否购买。"))
mainChildren.push(body("本平台聚焦「AI生成的工具」这一新兴垂直市场，覆盖文字处理、图片生成、代码工具、音频创作等多个领域，切合当下AI热潮，具有鲜明的时代特征和创新意义。"))

mainChildren.push(h2("1.2 项目概述"))
mainChildren.push(body("AI Tool Bazaar（AI工具集市）是一个基于Vue 3前端框架构建的单页应用（SPA），配合Node.js + Express后端和MySQL/SQLite数据库，实现了一个完整的AI工具展示、搜索、交易、沟通平台。"))
mainChildren.push(body("核心功能包括：首页浏览与精选推荐、工具搜索与分类筛选、工具详情与购买流程、购物车与结算、用户注册登录、个人中心管理、管理员后台、用户间即时通讯、AI智能导购助手等。项目采用组件化开发思想，共实现19个Vue组件，组件复用率高，代码结构清晰。"))

// 二、功能实现
mainChildren.push(h1("二、功能实现"))
mainChildren.push(h2("2.1 功能完整性"))
mainChildren.push(body("本项目严格按照Vue的组件化开发思想，共实现了19个组件，涵盖通用组件、业务组件和页面视图三个层次。其中通用组件如ToolCard、Pagination、EmptyState等在多页面间复用，复用率达到40%以上。"))
mainChildren.push(body("以下是平台主要功能页面的截图展示："))
mainChildren.push(...img("01-首页.png", "图2-1 首页（未登录状态）"))
mainChildren.push(...img("02-全部工具.png", "图2-2 全部工具浏览页"))
mainChildren.push(...img("03-工具详情.png", "图2-3 工具详情页"))
mainChildren.push(...img("07-首页-已登录.png", "图2-4 首页（已登录状态，含导航栏用户头像）"))

mainChildren.push(body("平台实现了完整的用户系统，支持注册和登录功能："))
mainChildren.push(...img("04-登录页.png", "图2-5 用户登录页"))
mainChildren.push(...img("05-注册页.png", "图2-6 用户注册页"))

mainChildren.push(body("个人中心是用户管理自己发布、购买和收藏内容的核心页面，采用侧边栏布局："))
mainChildren.push(...img("08-个人中心-已发布.png", "图2-7 个人中心 — 已发布工具"))
mainChildren.push(...img("09-个人中心-已购买.png", "图2-8 个人中心 — 已购买工具"))
mainChildren.push(...img("10-个人中心-已收藏.png", "图2-9 个人中心 — 已收藏工具"))

mainChildren.push(body("工具交易的核心流程包括发布、购物车和购买确认："))
mainChildren.push(...img("13-发布工具.png", "图2-10 工具发布页面"))
mainChildren.push(...img("11-购物车.png", "图2-11 购物车页面"))
mainChildren.push(...img("14-购买确认弹窗.png", "图2-12 购买确认弹窗"))

mainChildren.push(h2("2.2 Vue 核心特性运用"))
mainChildren.push(body("1. 组件化开发：项目按通用/业务/页面三层组织19个组件。通用组件如ToolCard在首页列表、个人中心、详情页推荐区复用；Pagination在首页、个人中心、管理员页面复用；EmptyState在搜索无结果、空列表等多种场景复用。"))
mainChildren.push(body("2. 指令系统：项目中大量使用v-if、v-for、v-show、v-model等Vue指令。例如首页工具列表使用v-for渲染卡片、购物车使用v-if判断空状态、表单使用v-model实现双向绑定。"))
mainChildren.push(body("3. 计算属性computed：在SearchFilter中使用computed对工具列表按分类和关键词进行筛选排序，在购物车中使用computed计算总价，避免了在模板中写复杂逻辑。"))
mainChildren.push(body("4. 侦听器watch：在DetailView中使用watch监听路由参数变化（/tool/:id），当用户切换到不同工具时自动重新请求数据。"))
mainChildren.push(body("5. 动态组件：在个人中心页面使用component :is实现「已发布」「已购买」「已收藏」三个Tab之间的动态切换。"))
mainChildren.push(body("6. Vue Router：实现了动态路由（/tool/:id）、嵌套路由、路由守卫（beforeEach检查登录状态），管理员路由还有角色权限校验。"))
mainChildren.push(body("7. 组件通信：父传子使用Props（如ToolCard接收tool对象），子传父使用Emit（如SearchFilter发出update事件），跨层级共享使用Pinia状态管理（用户状态、购物车状态）。"))

mainChildren.push(h2("2.3 功能正确性"))
mainChildren.push(body("所有功能均经过实际操作验证：上传工具后首页刷新可见、搜索筛选能正确匹配、购买流程从详情页到弹窗确认到购物车到个人中心完整闭环。边界情况如搜索无结果、空列表、404页面等均已正确处理。"))
mainChildren.push(...img("06-404页面.png", "图2-13 404页面"))

mainChildren.push(h2("2.4 代码规范"))
mainChildren.push(body("项目配置了ESLint和Prettier进行代码规范管理，遵循Vue官方推荐的编码风格。组件文件使用PascalCase命名（如ToolCard.vue），普通JS文件使用kebab-case命名（如use-marketplace.js），变量和函数使用camelCase命名。每个组件顶部有JSDoc注释说明其用途，computed和watch旁边有功能注释，关键逻辑有行内注释。"))

mainChildren.push(h2("2.5 代码可读性"))
mainChildren.push(body("项目采用Composition API + <script setup>语法，代码更简洁、逻辑组织更清晰。通过Composables（useToolHub、useMarketplace、useUserSession等）将数据获取、状态管理和业务逻辑从.vue文件中剥离，视图组件只保留模板和数据绑定，实现了关注点分离。组件职责单一：展示组件只通过props接收数据渲染，容器组件负责数据获取和组合。目录结构按api/、components/common/、components/business/、composables/、store/、views/分层，职责清晰。"))

// 三、用户体验
mainChildren.push(h1("三、用户体验"))
mainChildren.push(h2("3.1 界面设计"))
mainChildren.push(body("平台采用现代简洁的设计风格，以清新的蓝绿色调为主，使用Element Plus组件库统一色彩、圆角和间距体系。首页采用卡片网格布局，支持响应式适配：大屏4列、中屏3列、小屏2列。工具卡片包含分类标签、缩略图、名称、价格、作者等关键信息，信息密度适中。"))
mainChildren.push(body("整体布局采用侧边栏设计（个人中心、管理员后台、消息页面），左侧导航右侧内容，层次分明。导航栏品牌置于最左侧，中间为功能导航链接，右侧为用户头像和购物车图标，布局符合用户习惯。"))

mainChildren.push(h2("3.2 交互设计"))
mainChildren.push(body("平台提供了完善的交互反馈机制：页面数据加载时显示骨架屏（LoadingSpinner组件）；列表为空时显示空状态占位和引导文案（EmptyState组件）；操作成功/失败时显示顶部消息提示（ElMessage）；购买操作需要二次确认弹窗（PurchaseModal组件）；表单输入有实时校验反馈。"))
mainChildren.push(body("此外，用户登录后导航栏显示头像，鼠标悬停可展开下拉菜单；消息页面收到新消息时导航栏显示红点角标；购物车图标实时显示商品数量角标。这些细节交互提升了用户体验。"))

// 四、拓展性
mainChildren.push(h1("四、拓展性"))
mainChildren.push(h2("4.1 后端接口与状态管理"))
mainChildren.push(body("项目配备了完整的Node.js + Express后端，实现了用户认证、消息通讯、举报管理等RESTful API接口。使用bcrypt加密用户密码，支持注册、登录、账号管理等功能。前端通过Axios封装统一的请求拦截器，实现loading状态管理、错误统一处理和baseURL配置。"))
mainChildren.push(body("状态管理方面，使用Pinia管理跨页面共享的全局状态（用户登录信息、购物车数据），使用Composables封装可复用的数据获取和处理逻辑（useTools、useSearch、useCart），组件局部状态使用ref/reactive管理。三种方式各司其职，互不干扰。"))

mainChildren.push(h2("4.2 消息通讯系统"))
mainChildren.push(body("平台内置了完整的用户间即时通讯系统，支持买家与创作者之间的消息沟通。消息页面采用侧边栏布局，左侧显示所有对话列表，右侧显示选中对话的完整聊天记录，支持实时发送和接收消息。"))
mainChildren.push(...img("12-消息页.png", "图4-1 消息通讯页面"))
mainChildren.push(...img("15-联系商户.png", "图4-2 从工具详情页联系商户"))

mainChildren.push(h2("4.3 管理员后台"))
mainChildren.push(body("管理员后台提供完整的平台管理功能，包括工具管理（查看、编辑、删除所有工具）、举报审核（审批或驳回用户举报）、账号管理（查看和删除用户账号）、平台概览（统计数据和可视化图表）。"))
mainChildren.push(...img("18-管理员-工具管理.png", "图4-3 管理员 — 工具管理"))
mainChildren.push(...img("19-管理员-举报审核.png", "图4-4 管理员 — 举报审核"))
mainChildren.push(...img("20-管理员-账号管理.png", "图4-5 管理员 — 账号管理"))
mainChildren.push(...img("21-管理员-平台概览.png", "图4-6 管理员 — 平台概览"))

mainChildren.push(h2("4.4 扩展接口预留"))
mainChildren.push(body("数据模型预留了扩展字段（tags、version、downloadUrl、rating），后续可扩展标签系统、版本管理、在线下载、评分评论等功能。API层与组件解耦，切换后端只需修改api层代码，组件代码零改动。通过Vite环境变量可一键切换Mock数据和真实后端。"))

// 五、创新性
mainChildren.push(h1("五、创新性"))
mainChildren.push(h2("5.1 AI 智能导购助手"))
mainChildren.push(body("平台集成AI智能导购助手，用户点击右下角悬浮气泡即可与AI对话。AI可以根据用户需求推荐匹配的AI工具，回答平台使用问题，引导用户发布工具。AI具备对话记忆功能，能根据历史记录提供个性化回复。该功能采用Ollama本地部署方案，数据完全留在本机，保护用户隐私。"))
mainChildren.push(...img("16-AI助手.png", "图5-1 AI智能导购助手"))

mainChildren.push(h2("5.2 举报审核系统"))
mainChildren.push(body("平台建立了完整的举报机制：用户可以在工具详情页提交举报，填写举报原因；管理员在后台可以查看所有举报并进行审批（通过/驳回）。举报状态实时更新，用户提交后即时收到反馈。"))
mainChildren.push(...img("17-举报功能.png", "图5-2 工具举报功能"))

mainChildren.push(h2("5.3 AI工具垂直领域定位"))
mainChildren.push(body("不同于传统电商平台，AI Tool Bazaar聚焦「AI生成的工具」这一新兴垂直市场。分类体系采用文字/图片/代码/音频等AI生成能力维度，形成了独特的分类方式。同一用户既是创作者（上传自己的AI工具获利）也是购买者（浏览购买他人的AI工具），角色闭环完整。"))

mainChildren.push(h2("5.4 数字化运营"))
mainChildren.push(body("平台首页展示实时统计数据（已上架工具数、活跃创作者数、累计销量），管理员后台提供分类分布柱状图、热门工具销量排行、交互数据概览等数据可视化功能，体现了数据驱动的运营理念。"))

// 六、总结
mainChildren.push(h1("六、总结"))
mainChildren.push(h2("6.1 项目成果总结"))
mainChildren.push(body("AI Tool Bazaar项目完整实现了一个AI工具交易平台的全部核心功能，包括14款内置AI工具的展示、搜索、购买、发布流程，6个用户账号的登录管理，完整的购物车和结算系统，用户间即时通讯，AI智能导购助手，举报审核后台等。项目共编写19个Vue组件、3个Composables、3个API模块、6个页面视图，代码总量超过4000行（含CSS），组件复用率超过40%。"))

mainChildren.push(h2("6.2 个人收获与不足"))
mainChildren.push(body("通过本次项目实践，我深入掌握了Vue 3 Composition API的核心用法，包括响应式系统（ref/reactive/computed/watch）、组件通信（Props/Emit/Pinia）、Vue Router（动态路由/嵌套路由/路由守卫）、组合式函数（Composables）等高级特性。同时实践了前后端分离架构、数据库设计、RESTful API开发、项目部署等全栈技能。"))
mainChildren.push(body("不足之处在于：部分功能的用户体验还可以进一步优化，例如AI助手目前使用关键词匹配兜底方案，真AI模式下需要解决GPU兼容问题；前端缺少完善的错误边界处理；移动端适配可以更加精细。"))

mainChildren.push(h2("6.3 未来展望"))
mainChildren.push(body("前端框架技术正在快速发展，Vue 3生态日益成熟，TypeScript、SSR（Nuxt）、微前端等方向都值得深入学习。通过本学期课程和本次项目实践，我对前端组件化开发、状态管理、工程化实践有了系统性认知。未来我将继续关注前端技术的发展趋势，将所学知识应用到更多实际项目中，不断提升自己的工程能力和技术视野。"))

mainChildren.push(new Paragraph({ children: [new PageBreak()] }))

sections.push({
  properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    page: { pageNumbers: { start: 1 } } },
  headers: {
    default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "《前端框架技术》期末作品报告", font: fontSong, size: 18, color: "888888" })] })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", font: fontSong, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: fontSong, size: 18 }), new TextRun({ text: " 页", font: fontSong, size: 18 })] })] })
  },
  children: mainChildren
})

const doc = new Document({
  styles: {
    default: { document: { run: { font: fontSong, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: fontHei },
        paragraph: { spacing: { before: 480, after: 480, line: 360, lineRule: "auto" }, alignment: AlignmentType.CENTER, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: fontHei },
        paragraph: { spacing: { before: 480, after: 480 }, outlineLevel: 1 } },
    ]
  },
  sections
})

console.log("📝 生成报告中...")
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT, buffer)
  console.log(`✅ 报告已生成: ${OUT}`)
  console.log(`   截图数量: 21张`)
  console.log(`   页数: 封面 + 目录 + 正文（约30页）`)
})
