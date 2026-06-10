<script setup>
import { RouterLink } from "vue-router"
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <RouterLink class="footer-logo" to="/">
          <span class="footer-logo__mark">AI</span>
          <span class="footer-logo__name">AI Tool Bazaar</span>
        </RouterLink>
        <p class="footer-desc">一个聚焦 AI 工具发现、展示与交易的课程项目平台。</p>
      </div>

      <div class="footer-links">
        <div class="footer-links__col">
          <strong>浏览</strong>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/catalog">全部工具</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#featured' }">精选推荐</RouterLink>
        </div>
        <div class="footer-links__col">
          <strong>功能</strong>
          <RouterLink to="/publish">发布工具</RouterLink>
          <RouterLink to="/profile">个人中心</RouterLink>
          <RouterLink to="/auth">登录注册</RouterLink>
        </div>
        <div class="footer-links__col">
          <strong>技术栈</strong>
          <span>Vue 3 + Vite</span>
          <span>Vue Router + Pinia</span>
          <span>Element Plus</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 AI Tool Bazaar · 前端框架技术期末作品</span>
      <span>仅供课程演示，不涉及真实交易</span>
    </div>
  </footer>
</template>
