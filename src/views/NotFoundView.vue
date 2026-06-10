<script setup>
import { RouterLink } from "vue-router"
</script>

<template>
  <div class="notfound-wrapper">
    <div class="notfound-card">
      <span class="notfound-code">404</span>
      <h1>页面走丢了</h1>
      <p>你访问的路径没有匹配到任何页面，可能链接已失效或输错了地址。</p>
      <div class="notfound-actions">
        <RouterLink class="primary-button" to="/">返回首页</RouterLink>
        <RouterLink class="ghost-button" to="/catalog">浏览工具</RouterLink>
      </div>
    </div>
  </div>
</template>
