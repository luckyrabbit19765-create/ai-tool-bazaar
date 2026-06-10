# AI Tool Bazaar

AI Tool Bazaar 是一个基于 Vue 3 和 Vite 的 AI 工具集市课程项目。用户可以浏览工具、搜索筛选、查看详情、收藏、加入购物车、模拟购买，并在登录后发布和管理自己的工具；管理员可以进入后台管理工具和账号。

## 功能清单

- 首页封面动画、精选推荐、工具列表、平台数据统计
- 全部工具页搜索、分类筛选、排序和分页
- 工具详情页展示价格、作者、标签、亮点、适用场景和同类推荐
- 收藏、购物车、单个购买、购物车批量结算
- 登录、注册、路由守卫和管理员权限判断
- 发布工具、编辑工具、删除工具，数据同步到首页和个人中心
- 个人中心展示已发布、已购买、已收藏，并支持搜索和分页
- 管理员后台包含工具管理、账号管理和平台概览
- 404 兜底页和空状态组件

## 技术栈

- Vue 3 Composition API + `<script setup>`
- Vue Router 4
- Vite
- Express
- MySQL
- bcryptjs
- localStorage 本地持久化部分工具交互状态

## 项目结构

```text
ai-tool-bazaar/
├── src/
│   ├── api/                 # 前端接口请求
│   ├── components/          # 通用组件和业务组件
│   ├── composables/         # 工具集市、用户会话等复用逻辑
│   ├── data/                # 内置工具演示数据
│   ├── router/              # 路由和权限守卫
│   ├── views/               # 页面视图
│   ├── App.vue
│   └── main.js
├── server/
│   ├── init-db.sql          # 数据库建表脚本
│   ├── seed.js              # 演示账号种子脚本
│   ├── server.js            # Express API 服务
│   └── db.js                # MySQL 连接池配置
└── README.md
```

## 启动步骤

### 1. 安装依赖

```bash
npm install
cd server
npm install
cd ..
```

### 2. 初始化数据库

确保本机已启动 MySQL，并创建项目数据库。可以在 MySQL 客户端中执行：

```sql
source server/init-db.sql;
```

默认数据库连接配置在 `server/db.js`：

```js
host: "localhost"
user: "root"
password: "12345"
database: "ai_tool_bazaar"
```

如果本机 MySQL 密码不同，需要先修改 `server/db.js`。

### 3. 写入演示账号

```bash
npm run server:seed
```

演示账号：

- 普通用户：`demo / 123456`
- 管理员：`admin / admin123`

### 4. 启动后端

```bash
npm run server
```

后端默认运行在 `http://localhost:3001`。

### 5. 启动前端

另开一个终端执行：

```bash
npm run dev
```

前端默认运行在 `http://localhost:5173`，Vite 会把 `/api` 请求代理到后端。

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`。

## 演示建议

1. 打开首页，点击封面进入项目。
2. 演示搜索、分类筛选、排序和分页。
3. 进入详情页，演示收藏、加入购物车和购买确认。
4. 登录普通用户，发布一个新工具，再到个人中心查看和编辑。
5. 登录管理员账号，进入后台查看工具管理、账号管理和平台概览。

## 说明

工具商品数据主要由前端内置数据和 localStorage 管理，账号登录注册使用 Express + MySQL。提交报告时建议按当前真实实现说明技术栈，避免写成已经使用 Pinia、Axios、Element Plus 或 JSON Server。
