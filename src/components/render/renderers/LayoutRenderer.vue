<template>
  <!-- 容器 -->
  <div v-if="component.type === 'container'" class="container-component" :style="containerStyle"
    @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.stop="handleNativeDrop">
    <VueDraggable v-model="localChildren" :animation="150" ghost-class="ghost-component"
      handle=".drag-handle" group="components" @start="onDragStart" @end="onDragEnd">
      <slot v-for="child in localChildren" :key="child.id" name="child" :component="child" />
    </VueDraggable>
    <div v-if="!localChildren || localChildren.length === 0" class="container-empty">
      拖拽组件到容器内
    </div>
  </div>

  <!-- 行布局 -->
  <div v-else-if="component.type === 'row'" class="row-component" :style="rowStyle"
    @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.stop="handleNativeDrop">
    <VueDraggable v-model="localChildren" :animation="150" ghost-class="ghost-component"
      handle=".drag-handle" group="components" @start="onDragStart" @end="onDragEnd">
      <slot v-for="child in localChildren" :key="child.id" name="child" :component="child" />
    </VueDraggable>
  </div>

  <!-- 列布局 -->
  <div v-else-if="component.type === 'col'" class="col-component" :style="colStyle"
    @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.stop="handleNativeDrop">
    <VueDraggable v-model="localChildren" :animation="150" ghost-class="ghost-component"
      handle=".drag-handle" group="components" @start="onDragStart" @end="onDragEnd">
      <slot v-for="child in localChildren" :key="child.id" name="child" :component="child" />
    </VueDraggable>
  </div>

  <!-- 卡片 -->
  <div v-else-if="component.type === 'card'" class="card-component" :style="cardStyle"
    @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.stop="handleNativeDrop">
    <div v-if="component.props.showHeader" class="card-header">
      <span>{{ component.props.title }}</span>
    </div>
    <div class="card-body">
      <VueDraggable v-model="localChildren" :animation="150" ghost-class="ghost-component"
        handle=".drag-handle" group="components" @start="onDragStart" @end="onDragEnd">
        <slot v-for="child in localChildren" :key="child.id" name="child" :component="child" />
      </VueDraggable>
      <div v-if="!localChildren || localChildren.length === 0" class="container-empty">
        拖拽组件到卡片内
      </div>
    </div>
  </div>

  <!-- 标签页 -->
  <div v-else-if="component.type === 'tabs'" class="tabs-component">
    <div class="tabs-header">
      <div v-for="tab in component.props.tabs" :key="tab.name" class="tab-item"
        :class="{ 'is-active': component.props.activeTab === tab.name }">
        {{ tab.label }}
      </div>
    </div>
    <div class="tabs-body">
      <div class="tab-content">标签内容区域</div>
    </div>
  </div>

  <!-- 折叠面板 -->
  <div v-else-if="component.type === 'collapse'" class="collapse-component">
    <div v-for="(item, index) in component.props.items" :key="index" class="collapse-item">
      <div class="collapse-header">
        <span>{{ item.title }}</span>
        <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="collapse-body">{{ item.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useEditorStore } from '../../../stores/editor'

const store = useEditorStore()

const props = defineProps({
  component: { type: Object, required: true }
})

// 拖拽开始前的索引
const dragStartIndex = ref(-1)

// 本地 children 引用，用于 VueDraggable v-model
const localChildren = computed({
  get: () => props.component.children || [],
  set: (val) => {
    props.component.children = val
  }
})

// 拖拽开始时记录索引
function onDragStart(evt) {
  dragStartIndex.value = evt.oldIndex
}

// 拖拽结束时保存到 store
function onDragEnd(evt) {
  // VueDraggable 已经直接修改了 children 数组
  // 由于使用了 v-model，修改已经生效
  // 这里不需要额外操作，拖拽排序已完成
}

// 拦截从左侧面板拖入的原生 drop 事件，将组件添加到当前布局的 children 中
function handleNativeDrop(event) {
  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  if (componentType) {
    store.addComponent(componentType, -1, props.component.id)
  }
}

const containerStyle = computed(() => ({
  width: props.component.style.width,
  minHeight: props.component.style.minHeight,
  padding: props.component.style.padding,
  backgroundColor: props.component.style.backgroundColor,
  border: props.component.style.border,
  borderRadius: props.component.style.borderRadius,
  boxShadow: props.component.style.boxShadow,
  opacity: props.component.style.opacity
}))

const rowStyle = computed(() => ({
  margin: props.component.style.margin,
  display: 'flex',
  flexWrap: 'wrap'
}))

const colStyle = computed(() => ({
  padding: props.component.style.padding,
  margin: props.component.style.margin
}))

const cardStyle = computed(() => ({
  width: props.component.style.width
}))
</script>

<style scoped>
.container-component {
  background: #f5f7fa; border: 1px dashed #c0c4cc;
  border-radius: 4px; min-height: 100px;
}
.container-empty {
  display: flex; align-items: center; justify-content: center;
  height: 100%; min-height: 80px; color: #909399; font-size: 12px;
}
.row-component { display: flex; flex-wrap: wrap; }
.col-component { flex: 1; }
.card-component { border: 1px solid #ebeef5; border-radius: 4px; overflow: hidden; }
.card-header {
  padding: 12px 20px; border-bottom: 1px solid #ebeef5;
  background: #fff; font-size: 16px; font-weight: 500;
}
.card-body { padding: 20px; background: #fff; }

.tabs-component { border: 1px solid #e4e7ed; border-radius: 4px; }
.tabs-header { display: flex; border-bottom: 1px solid #e4e7ed; background: #fff; }
.tab-item {
  padding: 12px 20px; font-size: 14px; color: #606266;
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.tab-item:hover { color: var(--lc-primary); }
.tab-item.is-active { color: var(--lc-primary); border-bottom-color: var(--lc-primary); }
.tabs-body { padding: 20px; background: #fff; }
.tab-content { min-height: 100px; }

.collapse-component { border: 1px solid #ebeef5; border-radius: 4px; }
.collapse-item { border-bottom: 1px solid #ebeef5; }
.collapse-item:last-child { border-bottom: none; }
.collapse-header {
  padding: 12px 20px; display: flex; justify-content: space-between;
  align-items: center; cursor: pointer; background: #fff; font-size: 14px; color: #303133;
}
.collapse-header:hover { background: #f5f7fa; }
.collapse-body { padding: 0 20px 12px; font-size: 14px; color: #606266; }

.ghost-component {
  opacity: 0.5; border: 2px dashed var(--lc-primary); background: var(--lc-primary-light);
}
</style>
