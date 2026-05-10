<template>
  <div class="props-panel">
    <el-form label-width="80px" size="small">
      <BaseAndFormProps v-if="baseAndFormTypes.includes(component.type)" :component="component" :draft-props="draftProps" />
      <LayoutAndAdvancedProps v-else-if="layoutAndAdvancedTypes.includes(component.type)" :component="component" :draft-props="draftProps" />
      <ChartAndDataProps v-else-if="chartAndDataTypes.includes(component.type)" :component="component" :draft-props="draftProps" />

      <el-divider />

      <el-form-item>
        <el-button type="primary" @click="applyProps">确定</el-button>
        <el-button @click="resetProps">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, toRaw } from 'vue'
import { useEditorStore } from '../../stores/editor'
import BaseAndFormProps from './props-forms/BaseAndFormProps.vue'
import LayoutAndAdvancedProps from './props-forms/LayoutAndAdvancedProps.vue'
import ChartAndDataProps from './props-forms/ChartAndDataProps.vue'

const propsDef = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const store = useEditorStore()
const draftProps = ref({})

// 组件类型分组
const baseAndFormTypes = [
  'button', 'text', 'input', 'image', 'divider', 'icon', 'link',
  'select', 'radio', 'checkbox', 'switchComp', 'textarea',
  'datePicker', 'timePicker', 'rate', 'slider', 'upload'
]
const layoutAndAdvancedTypes = [
  'container', 'row', 'col', 'card', 'tabs', 'collapse',
  'table', 'carousel', 'progress', 'badge', 'tag', 'alert',
  'avatar', 'breadcrumb', 'pagination'
]
const chartAndDataTypes = [
  'lineChart', 'barChart', 'pieChart', 'radarChart', 'gaugeChart',
  'statistic', 'countdown', 'tree'
]

function deepClone(obj) {
  return JSON.parse(JSON.stringify(toRaw(obj)))
}

watch(() => propsDef.component, (newComp) => {
  if (newComp) {
    draftProps.value = deepClone(newComp.props)
  }
}, { immediate: true, deep: true })

function applyProps() {
  store.updateComponentProps(propsDef.component.id, deepClone(draftProps.value))
}

function resetProps() {
  draftProps.value = deepClone(propsDef.component.props)
}
</script>

<style scoped>
.props-panel {
  padding: 0;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

.el-divider {
  margin: 16px 0 12px;
}
</style>
