<template>
  <div
    v-if="isVisible"
    class="render-component"
    :class="{ 'is-selected': isSelected, 'is-hover': isHover }"
    :style="componentStyle"
    @click.stop="handleClick"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <!-- 按类型分发到对应渲染器（传递解析后的 props），用 ErrorBoundary 包裹 -->
    <ErrorBoundary :component-id="component.id">
      <BaseRenderer v-if="baseTypes.includes(component.type)" :component="mergedComponent" />
      <FormRenderer v-else-if="formTypes.includes(component.type)" :component="mergedComponent" />
      <LayoutRenderer v-else-if="layoutTypes.includes(component.type)" :component="mergedComponent">
        <!-- 递归渲染子组件 -->
        <template #child="{ component: child }">
          <RenderComponent :component="child" />
        </template>
      </LayoutRenderer>
      <AdvancedRenderer v-else-if="advancedTypes.includes(component.type)" :component="mergedComponent" />
      <ChartRenderer v-else-if="chartTypes.includes(component.type)" :component="mergedComponent" />
      <DataRenderer v-else-if="dataTypes.includes(component.type)" :component="mergedComponent" />
    </ErrorBoundary>

    <!-- 选中时的操作按钮 -->
    <div v-if="isSelected" class="component-actions">
      <el-button-group>
        <el-tooltip content="复制" placement="top">
          <el-button size="small" :icon="CopyDocument" @click.stop="handleDuplicate" />
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <el-button size="small" :icon="Delete" @click.stop="handleDelete" />
        </el-tooltip>
      </el-button-group>
    </div>

    <!-- 组件类型标签（拖拽手柄） -->
    <div v-if="isHover || isSelected" class="component-label drag-handle">
      {{ component.name }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { CopyDocument, Delete } from '@element-plus/icons-vue'
import { useEditorStore } from '../../stores/editor'
import { useDataStore } from '../../stores/dataStore'
import { resolveProps } from '../../utils/expressionEngine'
import ErrorBoundary from './ErrorBoundary.vue'
import BaseRenderer from './renderers/BaseRenderer.vue'
import FormRenderer from './renderers/FormRenderer.vue'
import LayoutRenderer from './renderers/LayoutRenderer.vue'
import AdvancedRenderer from './renderers/AdvancedRenderer.vue'
import ChartRenderer from './renderers/ChartRenderer.vue'
import DataRenderer from './renderers/DataRenderer.vue'

defineOptions({ name: 'RenderComponent' })

const props = defineProps({
  component: { type: Object, required: true }
})

const store = useEditorStore()
const dataStore = useDataStore()
const { selectedComponentId } = storeToRefs(store)

const isHover = ref(false)
const isSelected = computed(() => selectedComponentId.value === props.component.id)

// 可见性（来自联动系统）
const isVisible = computed(() => dataStore.isComponentVisible(props.component.id))

// 解析表达式后的 props，合并联动 extraProps
const mergedComponent = computed(() => {
  const resolved = resolveProps(props.component.props, dataStore.context)
  const extraProps = dataStore.getComponentExtraProps(props.component.id)
  return {
    ...props.component,
    props: { ...resolved, ...extraProps }
  }
})

// mount 触发
onMounted(() => {
  const events = props.component.events
  if (events) {
    const mountEvents = events.filter(e => e.trigger?.type === 'mount')
    mountEvents.forEach(evt => dataStore.executeActions(evt.actions))
  }
})

// 组件类型分组
const baseTypes = ['button', 'text', 'input', 'image', 'divider', 'icon', 'link']
const formTypes = ['select', 'radio', 'checkbox', 'switchComp', 'textarea', 'datePicker', 'timePicker', 'rate', 'slider', 'upload']
const layoutTypes = ['container', 'row', 'col', 'card', 'tabs', 'collapse']
const advancedTypes = ['table', 'carousel', 'progress', 'badge', 'tag', 'alert', 'avatar', 'breadcrumb', 'pagination']
const chartTypes = ['lineChart', 'barChart', 'pieChart', 'radarChart', 'gaugeChart']
const dataTypes = ['statistic', 'countdown', 'tree']

const componentStyle = computed(() => {
  const baseStyle = {
    position: 'relative',
    padding: '2px',
    margin: '2px',
    transition: 'all 0.2s'
  }
  if (isSelected.value) {
    baseStyle.outline = 'var(--lc-selected-outline)'
    baseStyle.outlineOffset = '2px'
  } else if (isHover.value) {
    baseStyle.outline = 'var(--lc-hover-outline)'
    baseStyle.outlineOffset = '2px'
  }
  return baseStyle
})

function handleClick() {
  store.selectComponent(props.component.id)
}

function handleDuplicate() {
  store.duplicateComponent(props.component.id)
}

function handleDelete() {
  store.deleteComponent(props.component.id)
}
</script>

<style scoped>
.render-component {
  cursor: pointer;
  min-height: 20px;
}

.render-component.is-selected {
  z-index: 10;
}

.component-actions {
  position: absolute;
  top: -32px;
  right: 0;
  z-index: 100;
}

.component-label {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 11px;
  color: var(--lc-primary);
  background: var(--lc-primary-light);
  padding: 1px 6px;
  border-radius: 2px;
  z-index: 100;
  cursor: move;
}
</style>
