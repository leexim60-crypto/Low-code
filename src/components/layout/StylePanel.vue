<template>
  <div class="style-panel">
    <el-form label-width="80px" size="small">

      <!-- 尺寸配置 -->
      <template v-if="hasSizeConfig">
        <el-divider content-position="left">尺寸</el-divider>

        <el-form-item label="宽度" v-if="config.width">
          <el-input v-model="draftStyle.width" placeholder="如: 200px / 100%" />
        </el-form-item>

        <el-form-item label="高度" v-if="config.height">
          <el-input v-model="draftStyle.height" placeholder="如: 100px" />
        </el-form-item>

        <el-form-item label="最小高度" v-if="config.minHeight">
          <el-input v-model="draftStyle.minHeight" placeholder="如: 200px" />
        </el-form-item>
      </template>

      <!-- 间距配置 -->
      <template v-if="hasSpacingConfig">
        <el-divider content-position="left">间距</el-divider>

        <el-form-item label="外边距" v-if="config.margin">
          <el-input v-model="draftStyle.margin" placeholder="如: 10px 20px" />
        </el-form-item>

        <el-form-item label="内边距" v-if="config.padding">
          <el-input v-model="draftStyle.padding" placeholder="如: 10px 20px" />
        </el-form-item>
      </template>

      <!-- 背景配置 -->
      <template v-if="hasBackgroundConfig">
        <el-divider content-position="left">背景</el-divider>

        <el-form-item label="背景色" v-if="config.backgroundColor">
          <el-color-picker v-model="draftStyle.backgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="透明度" v-if="config.opacity">
          <el-slider v-model="opacity" :min="0" :max="1" :step="0.1" />
        </el-form-item>
      </template>

      <!-- 边框配置 -->
      <template v-if="hasBorderConfig">
        <el-divider content-position="left">边框</el-divider>

        <el-form-item label="边框" v-if="config.border">
          <el-select v-model="draftStyle.border">
            <el-option label="无边框" value="none" />
            <el-option label="虚线边框" value="1px dashed #c0c4cc" />
            <el-option label="实线边框" value="1px solid #c0c4cc" />
            <el-option label="实线边框(橙)" value="1px solid #f08a5d" />
          </el-select>
        </el-form-item>

        <el-form-item label="边框颜色" v-if="config.borderColor">
          <el-color-picker v-model="draftStyle.borderColor" />
        </el-form-item>

        <el-form-item label="边框宽度" v-if="config.borderWidth">
          <el-input v-model="draftStyle.borderWidth" placeholder="如: 1px" />
        </el-form-item>

        <el-form-item label="边框样式" v-if="config.borderStyle">
          <el-select v-model="draftStyle.borderStyle">
            <el-option label="无" value="none" />
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
            <el-option label="点线" value="dotted" />
          </el-select>
        </el-form-item>

        <el-form-item label="圆角" v-if="config.borderRadius">
          <el-input v-model="draftStyle.borderRadius" placeholder="如: 4px" />
        </el-form-item>

        <el-form-item label="阴影" v-if="config.boxShadow">
          <el-input v-model="draftStyle.boxShadow" placeholder="如: 0 2px 8px rgba(0,0,0,0.1)" />
        </el-form-item>
      </template>

      <!-- 文字配置 -->
      <template v-if="hasTextConfig">
        <el-divider content-position="left">文字</el-divider>

        <el-form-item label="字号" v-if="config.fontSize">
          <el-input v-model="draftStyle.fontSize" placeholder="如: 14px" />
        </el-form-item>

        <el-form-item label="颜色" v-if="config.color">
          <el-color-picker v-model="draftStyle.color" />
        </el-form-item>

        <el-form-item label="行高" v-if="config.lineHeight">
          <el-input v-model="draftStyle.lineHeight" placeholder="如: 1.5" />
        </el-form-item>

        <el-form-item label="对齐方式" v-if="config.textAlign">
          <el-radio-group v-model="draftStyle.textAlign">
            <el-radio-button label="left">左</el-radio-button>
            <el-radio-button label="center">中</el-radio-button>
            <el-radio-button label="right">右</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="字体粗细" v-if="config.fontWeight">
          <el-select v-model="draftStyle.fontWeight">
            <el-option label="正常" value="normal" />
            <el-option label="粗体" value="bold" />
            <el-option label="100" value="100" />
            <el-option label="200" value="200" />
            <el-option label="300" value="300" />
            <el-option label="400" value="400" />
            <el-option label="500" value="500" />
            <el-option label="600" value="600" />
            <el-option label="700" value="700" />
          </el-select>
        </el-form-item>
      </template>

      <el-divider />

      <el-form-item>
        <el-button type="primary" @click="applyStyle">确定</el-button>
        <el-button @click="resetStyle">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '../../stores/editor'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const store = useEditorStore()

const draftStyle = ref({})
const opacity = ref(1)

// 默认样式配置
const defaultConfig = {
  width: false,
  height: false,
  minHeight: false,
  margin: true,
  padding: false,
  backgroundColor: false,
  opacity: false,
  border: false,
  borderColor: false,
  borderWidth: false,
  borderStyle: false,
  borderRadius: false,
  boxShadow: false,
  fontSize: false,
  color: false,
  lineHeight: false,
  textAlign: false,
  fontWeight: false
}

// 组件样式配置映射
const styleConfigMap = {
  button: { ...defaultConfig, width: true, borderRadius: true },
  text: { ...defaultConfig, fontSize: true, color: true, lineHeight: true, textAlign: true, fontWeight: true },
  input: { ...defaultConfig, width: true },
  image: { ...defaultConfig, width: true, height: true, border: true, borderColor: true, borderRadius: true },
  divider: { ...defaultConfig },
  icon: { ...defaultConfig },
  link: { ...defaultConfig, fontSize: true },
  select: { ...defaultConfig, width: true },
  radio: { ...defaultConfig },
  checkbox: { ...defaultConfig },
  switchComp: { ...defaultConfig },
  textarea: { ...defaultConfig, width: true },
  datePicker: { ...defaultConfig, width: true },
  timePicker: { ...defaultConfig, width: true },
  rate: { ...defaultConfig },
  slider: { ...defaultConfig, width: true },
  upload: { ...defaultConfig },
  container: { ...defaultConfig, width: true, minHeight: true, padding: true, backgroundColor: true, opacity: true, border: true, borderRadius: true, boxShadow: true },
  row: { ...defaultConfig },
  col: { ...defaultConfig, padding: true },
  card: { ...defaultConfig, width: true },
  tabs: { ...defaultConfig },
  collapse: { ...defaultConfig },
  table: { ...defaultConfig, width: true },
  carousel: { ...defaultConfig, width: true },
  progress: { ...defaultConfig, width: true },
  badge: { ...defaultConfig },
  tag: { ...defaultConfig },
  alert: { ...defaultConfig },
  avatar: { ...defaultConfig },
  breadcrumb: { ...defaultConfig },
  pagination: { ...defaultConfig },
  lineChart: { ...defaultConfig, width: true, height: true },
  barChart: { ...defaultConfig, width: true, height: true },
  pieChart: { ...defaultConfig, width: true, height: true },
  radarChart: { ...defaultConfig, width: true, height: true },
  gaugeChart: { ...defaultConfig, width: true, height: true },
  statistic: { ...defaultConfig },
  countdown: { ...defaultConfig },
  tree: { ...defaultConfig }
}

const config = computed(() => {
  return styleConfigMap[props.component.type] || defaultConfig
})

const hasSizeConfig = computed(() => {
  return config.value.width || config.value.height || config.value.minHeight
})

const hasSpacingConfig = computed(() => {
  return config.value.margin || config.value.padding
})

const hasBackgroundConfig = computed(() => {
  return config.value.backgroundColor || config.value.opacity
})

const hasBorderConfig = computed(() => {
  return config.value.border || config.value.borderColor || config.value.borderWidth ||
         config.value.borderStyle || config.value.borderRadius || config.value.boxShadow
})

const hasTextConfig = computed(() => {
  return config.value.fontSize || config.value.color || config.value.lineHeight ||
         config.value.textAlign || config.value.fontWeight
})

watch(() => props.component, (newComp) => {
  if (newComp) {
    draftStyle.value = { ...newComp.style }
    opacity.value = newComp.style.opacity ? parseFloat(newComp.style.opacity) : 1
  }
}, { immediate: true, deep: true })

function applyStyle() {
  draftStyle.value.opacity = opacity.value
  store.updateComponentStyle(props.component.id, { ...draftStyle.value })
}

function resetStyle() {
  draftStyle.value = { ...props.component.style }
  opacity.value = props.component.style.opacity ? parseFloat(props.component.style.opacity) : 1
}
</script>

<style scoped>
.style-panel {
  padding: 8px 0 10px;
}

.el-divider {
  margin: 20px 0 12px;
}

.el-divider:first-child {
  margin-top: 0;
}

.el-form-item:last-child {
  margin-bottom: 0;
}
</style>
