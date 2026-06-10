<script setup>
import { ref } from "vue"
import { RouterLink } from "vue-router"
import ToolCard from "../components/common/ToolCard.vue"
import EmptyState from "../components/common/EmptyState.vue"
import { useToolHub } from "../composables/useToolHub"

const { cartTools, cartTotal, removeFromCart, clearCart, purchaseTool } = useToolHub()
const checkoutDone = ref(false)

function handleCheckout() {
  if (!window.confirm(`确认购买购物车中全部 ${cartTools.value.length} 个工具，总计 ￥${cartTotal.value}？`)) return
  for (const tool of cartTools.value) {
    purchaseTool(tool.id)
  }
  clearCart()
  checkoutDone.value = true
}
</script>

<template>
  <main class="cart-page page-shell page-shell--full">
    <div class="cart-head">
      <div>
        <p class="eyebrow">Shopping Cart</p>
        <h1>购物车</h1>
      </div>
      <div v-if="cartTools.length" class="cart-head__right">
        <span class="cart-total">合计 <strong>￥{{ cartTotal }}</strong></span>
        <button class="primary-button" @click="handleCheckout">结算购买</button>
        <button class="ghost-button" @click="clearCart">清空购物车</button>
      </div>
    </div>

    <div v-if="checkoutDone" class="cart-checkout-msg">
      ✅ 购买完成！已结算的工具可在 <RouterLink to="/profile">个人中心</RouterLink> 查看。
    </div>

    <div v-if="cartTools.length" class="tool-grid">
      <article v-for="tool in cartTools" :key="tool.id" class="profile-tool-item">
        <ToolCard :tool="tool" />
        <div class="profile-tool-item__actions">
          <RouterLink class="ghost-button" :to="`/tool/${tool.id}`">查看详情</RouterLink>
          <button class="ghost-button profile-tool-delete" @click="removeFromCart(tool.id)">移出购物车</button>
        </div>
      </article>
    </div>

    <EmptyState
      v-else-if="!checkoutDone"
      icon="🛒"
      title="购物车是空的"
      description="去首页或全部工具页面逛逛，把感兴趣的AI工具加入购物车吧"
      action-label="去首页逛逛"
      action-to="/"
    />
  </main>
</template>
