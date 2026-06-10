<script setup>
import { ref } from "vue"

const emit = defineEmits(["update:image"])

const previewUrl = ref("")
const isDragging = ref(false)

function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result
    emit("update:image", e.target?.result)
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  previewUrl.value = ""
  emit("update:image", "")
}
</script>

<template>
  <div class="image-upload">
    <div
      v-if="!previewUrl"
      class="image-upload__zone"
      :class="{ 'image-upload__zone--dragging': isDragging }"
    >
      <span class="image-upload__icon">🖼️</span>
      <p class="image-upload__hint">点击或拖拽上传工具预览图</p>
      <p class="image-upload__sub">支持 JPG、PNG，建议 800×600 以上</p>
      <input
        type="file"
        accept="image/*"
        class="image-upload__input"
        @change="handleFile"
      />
    </div>

    <div v-else class="image-upload__preview">
      <img :src="previewUrl" alt="工具预览图" class="image-upload__thumb" />
      <div class="image-upload__preview-actions">
        <label class="ghost-button image-upload__replace-btn">
          更换图片
          <input
            type="file"
            accept="image/*"
            class="image-upload__input"
            @change="handleFile"
          />
        </label>
        <button class="ghost-button profile-tool-delete" @click="removeImage">
          移除
        </button>
      </div>
    </div>
  </div>
</template>
