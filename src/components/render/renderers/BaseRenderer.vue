<template>
  <!-- 按钮 -->
  <button
    v-if="component.type === 'button'"
    class="custom-button"
    :class="[
      `el-button--${component.props.type || 'default'}`,
      `el-button--${component.props.size || 'default'}`,
      { 'is-round': component.props.round, 'is-disabled': component.props.disabled }
    ]"
    :style="buttonStyle"
    :disabled="component.props.disabled"
    @click="handleClick"
  >
    {{ component.props.text }}
  </button>

  <!-- 文本 -->
  <p
    v-else-if="component.type === 'text'"
    class="text-component"
    :style="textStyle"
  >
    {{ component.props.content }}
  </p>

  <!-- 输入框 -->
  <div v-else-if="component.type === 'input'" :style="inputWrapperStyle">
    <input
      class="custom-input"
      :class="{ 'is-disabled': component.props.disabled }"
      :type="component.props.type || 'text'"
      :placeholder="component.props.placeholder"
      :disabled="component.props.disabled"
      :value="component.props.modelValue"
      :style="inputStyle"
      readonly
    />
  </div>

  <!-- 图片 -->
  <img
    v-else-if="component.type === 'image'"
    class="custom-image"
    :src="component.props.src"
    :alt="component.props.alt"
    :style="imageStyle"
  />

  <!-- 分割线 -->
  <div
    v-else-if="component.type === 'divider'"
    class="custom-divider"
    :style="dividerStyle"
  />

  <!-- 图标 -->
  <div v-else-if="component.type === 'icon'" :style="iconStyle">
    <el-icon :size="component.props.size" :color="component.props.color">
      <component :is="component.props.name" />
    </el-icon>
  </div>

  <!-- 链接 -->
  <a
    v-else-if="component.type === 'link'"
    class="custom-link"
    :class="{ 'is-disabled': component.props.disabled }"
    :href="component.props.disabled ? 'javascript:void(0)' : component.props.href"
    :target="component.props.target"
    :style="linkStyle"
  >
    {{ component.props.text }}
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../../../stores/dataStore'

const props = defineProps({
  component: { type: Object, required: true }
})

const dataStore = useDataStore()

function handleClick() {
  const events = props.component.events
  if (!events) return
  const clickEvents = events.filter(e => e.trigger?.type === 'click')
  clickEvents.forEach(evt => dataStore.executeActions(evt.actions))
}

const buttonStyle = computed(() => ({
  borderRadius: props.component.style.borderRadius || '4px',
  margin: props.component.style.margin,
  width: props.component.style.width
}))

const textStyle = computed(() => ({
  fontSize: props.component.style.fontSize,
  color: props.component.style.color,
  lineHeight: props.component.style.lineHeight,
  textAlign: props.component.style.textAlign,
  fontWeight: props.component.style.fontWeight,
  margin: props.component.style.margin
}))

const inputWrapperStyle = computed(() => ({
  width: props.component.style.width,
  margin: props.component.style.margin
}))

const inputStyle = computed(() => ({ width: '100%' }))

const imageStyle = computed(() => {
  const s = props.component.style
  return {
    width: s.width,
    height: s.height,
    margin: s.margin,
    border: s.border || (s.borderColor ? `${s.borderWidth || '1px'} ${s.borderStyle || 'solid'} ${s.borderColor}` : undefined),
    borderRadius: s.borderRadius,
    objectFit: 'cover'
  }
})

const dividerStyle = computed(() => ({
  margin: props.component.style.margin || '10px 0',
  borderTop: `1px ${props.component.props.borderStyle || 'solid'} #dcdfe6`
}))

const iconStyle = computed(() => ({
  margin: props.component.style.margin,
  display: 'inline-flex'
}))

const linkStyle = computed(() => ({
  fontSize: props.component.style.fontSize,
  margin: props.component.style.margin
}))
</script>

<style scoped>
.text-component { margin: 0; word-break: break-word; }

.custom-button {
  display: inline-flex; justify-content: center; align-items: center;
  line-height: 1; height: 32px; white-space: nowrap; cursor: pointer;
  text-align: center; box-sizing: border-box; outline: none; transition: 0.1s;
  font-weight: 500; user-select: none; vertical-align: middle;
  padding: 8px 15px; font-size: 14px;
  border: 1px solid var(--lc-border-base); background: var(--lc-bg-white); color: var(--lc-text-regular);
}
.custom-button:hover { color: var(--lc-primary); border-color: var(--lc-primary-border); background-color: var(--lc-primary-light); }
.custom-button.el-button--primary { color: #fff; background-color: var(--lc-primary); border-color: var(--lc-primary); }
.custom-button.el-button--primary:hover { background-color: var(--lc-primary-dark); border-color: var(--lc-primary-dark); }
.custom-button.el-button--success { color: #fff; background-color: #67c23a; border-color: #67c23a; }
.custom-button.el-button--success:hover { background-color: #95d475; border-color: #95d475; }
.custom-button.el-button--warning { color: #fff; background-color: #e6a23c; border-color: #e6a23c; }
.custom-button.el-button--warning:hover { background-color: #eebe77; border-color: #eebe77; }
.custom-button.el-button--danger { color: #fff; background-color: #f56c6c; border-color: #f56c6c; }
.custom-button.el-button--danger:hover { background-color: #f89898; border-color: #f89898; }
.custom-button.el-button--info { color: #fff; background-color: #909399; border-color: #909399; }
.custom-button.el-button--info:hover { background-color: #a6a9ad; border-color: #a6a9ad; }
.custom-button.el-button--large { height: 40px; padding: 12px 19px; font-size: 14px; }
.custom-button.el-button--small { height: 24px; padding: 5px 11px; font-size: 12px; }
.custom-button.is-round { border-radius: 20px; }
.custom-button.is-disabled { opacity: 0.5; cursor: not-allowed; }

.custom-input {
  display: inline-block; height: 32px; line-height: 32px;
  padding: 0 15px; font-size: 14px; border: 1px solid #dcdfe6;
  border-radius: 4px; color: #606266; background-color: #fff;
  outline: none; transition: border-color 0.2s; box-sizing: border-box; width: 100%;
}
.custom-input:focus { border-color: var(--lc-primary); }
.custom-input::placeholder { color: #c0c4cc; }
.custom-input.is-disabled { background-color: #f5f7fa; border-color: #e4e7ed; color: #c0c4cc; cursor: not-allowed; }

.custom-image { display: block; max-width: 100%; }
.custom-divider { height: 1px; width: 100%; }
.custom-link { color: var(--lc-primary); text-decoration: none; }
.custom-link:hover { text-decoration: underline; }
.custom-link.is-disabled { color: #c0c4cc; cursor: not-allowed; }
</style>
