<script setup>
import { computed, ref } from "vue"
import { RouterView } from "vue-router"
import LaunchCover from "./components/business/LaunchCover.vue"
import LayoutHeader from "./components/common/LayoutHeader.vue"
import LayoutFooter from "./components/common/LayoutFooter.vue"
import AiAssistant from "./components/business/AiAssistant.vue"

const isCoverVisible = ref(true)

const appShellClass = computed(() => ({
  "app-shell--locked": isCoverVisible.value
}))
</script>

<template>
  <div class="app-shell" :class="appShellClass">
    <div class="app-content" :class="{ 'app-content--locked': isCoverVisible }">
      <LayoutHeader />
      <RouterView />
      <LayoutFooter />
      <AiAssistant />
    </div>

    <LaunchCover
      v-if="isCoverVisible"
      @enter="isCoverVisible = false"
    />
  </div>
</template>
