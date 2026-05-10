<template>
  <!-- 下拉选择 -->
  <div v-if="component.type === 'select'" :style="wrapperStyle">
    <select class="custom-select" :disabled="component.props.disabled"
      @change="updateProp('modelValue', $event.target.value)">
      <option value="" disabled selected>{{ component.props.placeholder }}</option>
      <option v-for="option in component.props.options" :key="option.value" :value="option.value"
        :selected="component.props.modelValue === option.value">
        {{ option.label }}
      </option>
    </select>
  </div>

  <!-- 单选框 -->
  <div v-else-if="component.type === 'radio'" :style="marginStyle">
    <label v-for="option in component.props.options" :key="option.value" class="custom-radio">
      <input type="radio" :name="component.id" :value="option.value"
        :checked="component.props.modelValue === option.value" :disabled="component.props.disabled"
        @change="updateProp('modelValue', option.value)" />
      <span>{{ option.label }}</span>
    </label>
  </div>

  <!-- 多选框 -->
  <div v-else-if="component.type === 'checkbox'" :style="marginStyle">
    <label v-for="option in component.props.options" :key="option.value" class="custom-checkbox">
      <input type="checkbox" :value="option.value" :disabled="component.props.disabled"
        :checked="(component.props.modelValue || []).includes(option.value)"
        @change="toggleCheckbox(option.value)" />
      <span>{{ option.label }}</span>
    </label>
  </div>

  <!-- 开关 -->
  <div v-else-if="component.type === 'switchComp'" :style="marginStyle">
    <span v-if="component.props.inactiveText" class="switch-label">{{ component.props.inactiveText }}</span>
    <label class="custom-switch">
      <input type="checkbox" :checked="component.props.modelValue" :disabled="component.props.disabled"
        @change="updateProp('modelValue', $event.target.checked)" />
      <span class="switch-slider"></span>
    </label>
    <span v-if="component.props.activeText" class="switch-label">{{ component.props.activeText }}</span>
  </div>

  <!-- 文本域 -->
  <div v-else-if="component.type === 'textarea'" :style="wrapperStyle">
    <textarea
      class="custom-textarea"
      :class="{ 'is-disabled': component.props.disabled }"
      :placeholder="component.props.placeholder"
      :rows="component.props.rows"
      :disabled="component.props.disabled"
      :maxlength="component.props.maxlength"
      :value="component.props.modelValue"
      readonly
    />
    <span v-if="component.props.showWordLimit && component.props.maxlength" class="word-limit">
      {{ (component.props.modelValue || '').length }}/{{ component.props.maxlength }}
    </span>
  </div>

  <!-- 日期选择 -->
  <div v-else-if="component.type === 'datePicker'" :style="wrapperStyle">
    <input class="custom-input" type="date" :placeholder="component.props.placeholder"
      :disabled="component.props.disabled"
      @change="updateProp('modelValue', $event.target.value)" />
  </div>

  <!-- 时间选择 -->
  <div v-else-if="component.type === 'timePicker'" :style="wrapperStyle">
    <input class="custom-input" type="time" :placeholder="component.props.placeholder"
      :disabled="component.props.disabled"
      @change="updateProp('modelValue', $event.target.value)" />
  </div>

  <!-- 评分 -->
  <div v-else-if="component.type === 'rate'" class="rate-wrapper">
    <span v-for="i in component.props.max" :key="i" class="rate-star"
      :class="{ 'is-active': i <= component.props.modelValue }">★</span>
    <span v-if="component.props.showText" class="rate-text">
      {{ component.props.texts[component.props.modelValue - 1] || '' }}
    </span>
  </div>

  <!-- 滑块 -->
  <div v-else-if="component.type === 'slider'" :style="wrapperStyle">
    <input type="range" class="custom-slider" :min="component.props.min" :max="component.props.max"
      :step="component.props.step" :value="component.props.modelValue" :disabled="component.props.disabled"
      @input="updateProp('modelValue', Number($event.target.value))" />
    <span class="slider-value">{{ component.props.modelValue }}</span>
  </div>

  <!-- 上传 -->
  <div v-else-if="component.type === 'upload'" class="upload-wrapper">
    <div class="upload-area" :class="{ 'is-drag': component.props.drag }">
      <el-icon :size="40"><UploadFilled /></el-icon>
      <div class="upload-text">将文件拖到此处或<em>点击上传</em></div>
      <div v-if="component.props.tip" class="upload-tip">{{ component.props.tip }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { useDataStore } from '../../../stores/dataStore'

const props = defineProps({
  component: { type: Object, required: true }
})

const dataStore = useDataStore()

const wrapperStyle = computed(() => ({
  width: props.component.style.width,
  margin: props.component.style.margin
}))

const marginStyle = computed(() => ({
  margin: props.component.style.margin
}))

function updateProp(key, value) {
  // 同步更新到 dataStore（用于表达式引擎和联动）
  if (key === 'modelValue') {
    dataStore.updateFormValue(props.component.id, value)
    // 触发 valueChange 事件
    triggerValueChange(value)
  }
  // 也更新组件自身的 props（保持编辑器内即时预览）
  props.component.props[key] = value
}

function toggleCheckbox(value) {
  const arr = [...(props.component.props.modelValue || [])]
  const idx = arr.indexOf(value)
  if (idx > -1) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  updateProp('modelValue', arr)
}

function triggerValueChange(value) {
  const events = props.component.events
  if (!events) return
  const valueChangeEvents = events.filter(e => e.trigger?.type === 'valueChange')
  valueChangeEvents.forEach(evt => dataStore.executeActions(evt.actions))
}
</script>

<style scoped>
.custom-select {
  display: inline-block; height: 32px; line-height: 32px;
  padding: 0 15px; font-size: 14px; border: 1px solid var(--lc-border-base);
  border-radius: 4px; color: var(--lc-text-regular); background-color: #fff;
  outline: none; transition: border-color 0.2s; box-sizing: border-box;
  width: 100%; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c0c4cc' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
}
.custom-select:focus { border-color: var(--lc-primary); }

.custom-radio, .custom-checkbox {
  display: inline-flex; align-items: center; margin-right: 20px;
  cursor: pointer; font-size: 14px; color: var(--lc-text-regular);
}
.custom-radio input[type="radio"], .custom-checkbox input[type="checkbox"] {
  margin-right: 6px; cursor: pointer;
}

.custom-switch { position: relative; display: inline-block; width: 40px; height: 20px; }
.custom-switch input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--lc-border-base); transition: 0.3s; border-radius: 20px;
}
.switch-slider:before {
  position: absolute; content: ""; height: 16px; width: 16px;
  left: 2px; bottom: 2px; background-color: white; transition: 0.3s; border-radius: 50%;
}
.custom-switch input:checked + .switch-slider { background-color: var(--lc-primary); }
.custom-switch input:checked + .switch-slider:before { transform: translateX(20px); }
.switch-label { font-size: 14px; color: var(--lc-text-regular); margin: 0 8px; }

.custom-textarea {
  width: 100%; padding: 8px 15px; font-size: 14px; border: 1px solid var(--lc-border-base);
  border-radius: 4px; color: var(--lc-text-regular); background-color: #fff;
  outline: none; resize: vertical; font-family: inherit;
}
.custom-textarea:focus { border-color: var(--lc-primary); }
.custom-textarea.is-disabled { background-color: #f5f7fa; border-color: #e4e7ed; color: #c0c4cc; cursor: not-allowed; }
.word-limit { font-size: 12px; color: #909399; text-align: right; margin-top: 4px; }

.custom-input {
  display: inline-block; height: 32px; line-height: 32px;
  padding: 0 15px; font-size: 14px; border: 1px solid var(--lc-border-base);
  border-radius: 4px; color: var(--lc-text-regular); background-color: #fff;
  outline: none; transition: border-color 0.2s; box-sizing: border-box; width: 100%;
}
.custom-input:focus { border-color: var(--lc-primary); }
.custom-input::placeholder { color: #c0c4cc; }

.rate-wrapper { display: inline-flex; align-items: center; }
.rate-star { font-size: 20px; color: #c0c4cc; cursor: pointer; margin-right: 4px; }
.rate-star.is-active { color: #f7ba2a; }
.rate-text { font-size: 14px; color: var(--lc-text-regular); margin-left: 8px; }

.custom-slider {
  width: calc(100% - 50px); height: 6px;
  -webkit-appearance: none; appearance: none;
  background: #e4e7ed; outline: none; border-radius: 3px;
}
.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 16px; height: 16px; border-radius: 50%; background: var(--lc-primary); cursor: pointer;
}
.slider-value { margin-left: 10px; font-size: 14px; color: var(--lc-text-regular); }

.upload-wrapper { display: inline-block; }
.upload-area {
  width: 300px; height: 180px; border: 1px dashed var(--lc-border-base); border-radius: 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s;
}
.upload-area:hover { border-color: var(--lc-primary); }
.upload-area.is-drag { border-style: solid; }
.upload-text { font-size: 14px; color: var(--lc-text-regular); margin-top: 8px; }
.upload-text em { color: var(--lc-primary); font-style: normal; }
.upload-tip { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
