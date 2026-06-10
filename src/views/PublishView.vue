<script setup>
import { computed, reactive, ref, watchEffect } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import ToolCard from "../components/common/ToolCard.vue"
import ImageUpload from "../components/business/ImageUpload.vue"
import { useToolHub } from "../composables/useToolHub"
import { useUserSession } from "../composables/useUserSession"

const route = useRoute()
const router = useRouter()
const { categories, publishTool, getPublishedToolById, updatePublishedTool } = useToolHub()
const { currentUser } = useUserSession()

const form = reactive({
  name: "",
  category: "text",
  author: "课程作者",
  price: "29",
  description: "",
  longDescription: "",
  delivery: "",
  highlights: "",
  useCases: "",
  tags: "",
  accent: "mint",
  image: ""
})

const errors = reactive({
  name: "",
  author: "",
  price: "",
  description: ""
})

const createdTool = ref(null)
const submitMessage = ref("")

const editingId = computed(() => {
  const raw = route.query.edit
  return raw ? Number(raw) : null
})

const editingTool = computed(() =>
  editingId.value ? getPublishedToolById(editingId.value) : null
)

watchEffect(() => {
  if (!editingTool.value) {
    form.author = currentUser.value?.displayName ?? "课程作者"
  }
})

watchEffect(() => {
  if (!editingTool.value) {
    return
  }

  form.name = editingTool.value.name
  form.category = editingTool.value.category
  form.author = editingTool.value.author
  form.price = String(editingTool.value.price)
  form.description = editingTool.value.description
  form.longDescription = editingTool.value.longDescription
  form.delivery = editingTool.value.delivery
  form.highlights = editingTool.value.highlights.join(",")
  form.useCases = editingTool.value.useCases.join(",")
  form.tags = editingTool.value.tags.join(",")
  form.accent = editingTool.value.accent
  createdTool.value = editingTool.value
})

function resetErrors() {
  errors.name = ""
  errors.author = ""
  errors.price = ""
  errors.description = ""
}

function validate() {
  resetErrors()

  if (!form.name.trim()) {
    errors.name = "请输入工具名称"
  }
  if (!form.author.trim()) {
    errors.author = "请输入创作者名称"
  }
  if (!form.description.trim()) {
    errors.description = "请输入一句核心描述"
  }
  if (!form.price || Number(form.price) <= 0) {
    errors.price = "请输入有效价格"
  }

  return !errors.name && !errors.author && !errors.price && !errors.description
}

function submitForm() {
  if (!validate()) {
    return
  }

  if (editingTool.value) {
    createdTool.value = updatePublishedTool(editingTool.value.id, form)
    submitMessage.value = "工具信息已更新"
    router.replace("/publish")
    return
  }

  createdTool.value = publishTool(form)
  submitMessage.value = "新工具已发布，并同步加入首页和个人中心"

  form.name = ""
  form.description = ""
  form.longDescription = ""
  form.delivery = ""
  form.highlights = ""
  form.useCases = ""
  form.tags = ""
  form.price = "29"
}
</script>

<template>
  <main class="publish-page page-shell page-shell--wide">
    <section class="publish-layout">
      <div class="publish-panel">
        <p class="eyebrow">Publish Tool</p>
        <h1>{{ editingTool ? "编辑已发布工具" : "发布一个新的 AI 工具条目" }}</h1>
        <p class="publish-copy">
          {{ editingTool
            ? "你可以直接修改已发布工具的信息，保存后首页和详情页会同步更新。"
            : "这里是作品里的“创作者入口”。你发布完成后，工具会立即加入首页列表，也会出现在个人中心的“已发布工具”里。"
          }}
        </p>

        <div v-if="editingTool" class="publish-edit-banner">
          <span>✏️ 正在编辑：<strong>{{ editingTool.name }}</strong></span>
          <RouterLink class="ghost-button" to="/profile">取消编辑</RouterLink>
        </div>

        <div class="publish-form">
          <label class="form-field">
            <span>工具名称</span>
            <input v-model="form.name" type="text" placeholder="例如：Campus Poster AI" />
            <small v-if="errors.name">{{ errors.name }}</small>
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>工具分类</span>
              <select v-model="form.category">
                <option v-for="item in categories.slice(1)" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </label>

            <label class="form-field">
              <span>视觉主题</span>
              <select v-model="form.accent">
                <option value="sunrise">暖青渐变</option>
                <option value="mint">薄荷清透</option>
                <option value="ember">浅珊瑚</option>
                <option value="ocean">海雾蓝</option>
              </select>
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">
              <span>创作者</span>
              <input v-model="form.author" type="text" placeholder="例如：23软工1班 张三" />
              <small v-if="errors.author">{{ errors.author }}</small>
            </label>

            <label class="form-field">
              <span>价格</span>
              <input v-model="form.price" type="number" min="1" step="1" />
              <small v-if="errors.price">{{ errors.price }}</small>
            </label>
          </div>

          <label class="form-field">
            <span>一句介绍</span>
            <textarea v-model="form.description" rows="3" placeholder="用一句话说明这个工具最核心的价值"></textarea>
            <small v-if="errors.description">{{ errors.description }}</small>
          </label>

          <label class="form-field">
            <span>详细介绍</span>
            <textarea v-model="form.longDescription" rows="4" placeholder="可写工具适用对象、核心流程、交付内容"></textarea>
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>功能亮点</span>
              <input v-model="form.highlights" type="text" placeholder="逗号分隔，例如：海报生成,多尺寸导出,模板管理" />
            </label>

            <label class="form-field">
              <span>适用场景</span>
              <input v-model="form.useCases" type="text" placeholder="逗号分隔，例如：首页海报,活动页封面,社媒图" />
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">
              <span>标签</span>
              <input v-model="form.tags" type="text" placeholder="逗号分隔，例如：设计,KV,品牌" />
            </label>

            <label class="form-field">
              <span>交付内容</span>
              <input v-model="form.delivery" type="text" placeholder="例如：主视觉模板 + 使用说明" />
            </label>
          </div>

          <label class="form-field">
            <span>工具预览图</span>
            <ImageUpload @update:image="form.image = $event" />
          </label>

          <div class="publish-actions">
            <button class="primary-button" @click="submitForm">{{ editingTool ? "保存修改" : "立即发布" }}</button>
            <RouterLink v-if="editingTool" class="ghost-button" to="/profile">返回个人中心</RouterLink>
            <RouterLink class="ghost-button" to="/profile">查看个人中心</RouterLink>
          </div>
        </div>
      </div>

      <aside class="publish-side">
        <div class="publish-panel publish-panel--compact">
          <p class="eyebrow">Preview</p>
          <h2>发布后效果预览</h2>
          <p class="publish-copy">
            {{ editingTool
              ? "修改保存后，下方预览会更新，首页与详情页也会同步变化。"
              : "成功发布后，工具会显示在下方，并能从首页卡片跳转到详情页。"
            }}
          </p>
        </div>

        <div v-if="submitMessage" class="detail-feedback">
          {{ submitMessage }}
        </div>

        <div v-if="createdTool" class="tool-grid">
          <ToolCard :tool="createdTool" />
        </div>

        <div v-else class="publish-empty">
          <p>还没有发布内容，先填写左侧表单试试。</p>
        </div>
      </aside>
    </section>
  </main>
</template>
