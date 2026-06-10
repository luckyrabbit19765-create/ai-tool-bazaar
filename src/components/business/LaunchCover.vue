<script setup>
import { ref } from "vue"

const emit = defineEmits(["enter"])

const isOpening = ref(false)

const edgeNotes = [
  "Live Curation",
  "Creative Market",
  "Signal Motion",
  "Tool Discovery"
]

const quickStats = [
  { value: "120+", label: "Curated Tools" },
  { value: "48", label: "Active Makers" },
  { value: "24/7", label: "Signal Flow" }
]

const leaves = Array.from({ length: 8 }, (_, index) => index + 1)

function openCover() {
  if (isOpening.value) {
    return
  }

  isOpening.value = true

  window.setTimeout(() => {
    emit("enter")
  }, 1050)
}
</script>

<template>
  <div class="launch-cover" :class="{ 'launch-cover--opening': isOpening }">
    <div class="launch-cover__grid"></div>
    <div class="launch-cover__scanline"></div>
    <div class="launch-cover__ambient launch-cover__ambient--left"></div>
    <div class="launch-cover__ambient launch-cover__ambient--right"></div>
    <div class="launch-cover__ambient launch-cover__ambient--top"></div>
    <div class="launch-cover__ambient launch-cover__ambient--bottom"></div>
    <div class="launch-cover__orbit launch-cover__orbit--one"></div>
    <div class="launch-cover__orbit launch-cover__orbit--two"></div>

    <div class="launch-cover__particles" aria-hidden="true">
      <span class="launch-cover__particle launch-cover__particle--1"></span>
      <span class="launch-cover__particle launch-cover__particle--2"></span>
      <span class="launch-cover__particle launch-cover__particle--3"></span>
      <span class="launch-cover__particle launch-cover__particle--4"></span>
      <span class="launch-cover__particle launch-cover__particle--5"></span>
      <span class="launch-cover__particle launch-cover__particle--6"></span>
    </div>

    <div class="launch-cover__leaves" aria-hidden="true">
      <span
        v-for="leaf in leaves"
        :key="leaf"
        :class="['launch-cover__leaf', `launch-cover__leaf--${leaf}`]"
      ></span>
    </div>

    <div class="launch-cover__stage">
      <div class="launch-cover__corners" aria-hidden="true">
        <span
          v-for="note in edgeNotes"
          :key="note"
          class="launch-cover__corner-note"
        >
          {{ note }}
        </span>
      </div>

      <div class="launch-cover__base">
        <p class="launch-cover__eyebrow">AI Tool Bazaar</p>
        <h2>准备进入一个更轻盈的 AI 工具集市</h2>
        <p class="launch-cover__hint">封面翻开后，将进入首页浏览、筛选与推荐视图。</p>
      </div>

      <button
        type="button"
        class="launch-cover__lid"
        @click="openCover"
      >
        <span class="launch-cover__lid-mark">Tap To Open</span>
        <div class="launch-cover__lid-content">
          <p class="launch-cover__eyebrow">Opening Cover</p>
          <h1>AI 工具集市</h1>
          <p class="launch-cover__description">
            一个带筛选、推荐、卡片浏览和交易感知的 AI 工具主页。点击翻开封面，进入首页。
          </p>

          <div class="launch-cover__stats">
            <article
              v-for="item in quickStats"
              :key="item.label"
              class="launch-cover__stat-card"
            >
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>

          <span class="launch-cover__button">
            {{ isOpening ? "正在开启..." : "开启集市" }}
          </span>
        </div>

        <div class="launch-cover__nature-scene" aria-hidden="true">
          <div class="launch-cover__ground-wave"></div>
        </div>
      </button>
    </div>
  </div>
</template>
