<script setup>
import { ref } from "vue"

defineProps({
  tool: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["confirm", "close"])

const isProcessing = ref(false)

function handleConfirm() {
  isProcessing.value = true
  setTimeout(() => {
    emit("confirm")
    isProcessing.value = false
  }, 500)
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-card__header">
        <p class="eyebrow">确认购买</p>
        <button class="modal-card__close" @click="emit('close')" aria-label="关闭">✕</button>
      </div>

      <div class="modal-card__body">
        <div class="modal-tool-info">
          <div class="modal-tool-icon" :class="`accent-${tool.accent || 'mint'}`">
            <span>{{ tool.category === 'text' ? 'T' : tool.category === 'image' ? 'I' : tool.category === 'code' ? 'C' : tool.category === 'audio' ? 'A' : 'AI' }}</span>
          </div>
          <div>
            <strong>{{ tool.name }}</strong>
            <p>{{ tool.author }}</p>
          </div>
        </div>

        <div class="modal-price-row">
          <span>应付金额</span>
          <strong class="modal-price">￥{{ tool.price }}</strong>
        </div>

        <p class="modal-note">
          这是演示购买流程，不会产生真实交易。购买后将出现在个人中心的"已购买"列表。
        </p>
      </div>

      <div class="modal-card__footer">
        <button class="ghost-button" @click="emit('close')">取消</button>
        <button
          class="primary-button modal-confirm-btn"
          :disabled="isProcessing"
          @click="handleConfirm"
        >
          {{ isProcessing ? "处理中..." : "确认购买" }}
        </button>
      </div>
    </div>
  </div>
</template>
