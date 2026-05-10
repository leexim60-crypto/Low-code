<template>
  <div class="canvas-container" ref="canvasContainerRef">
    <div
      class="canvas"
      :class="[
        `device-${canvasConfig.deviceType}`,
        { 'show-grid': canvasConfig.showGrid }
      ]"
      :style="{ transform: `scale(${canvasConfig.zoom})` }"
      @click="handleCanvasClick"
      @dragover.prevent="handleDragOver"
      @drop="handleDrop"
    >
      <div class="canvas-content" ref="canvasContentRef">
        <!-- 辅助线 -->
        <div
          v-for="line in alignLines"
          :key="line.id"
          class="align-line"
          :class="line.type"
          :style="line.style"
        />

        <!-- 拖拽排序容器 -->
        <VueDraggable
          v-model="pageConfig.components"
          :animation="150"
          ghost-class="ghost-component"
          handle=".drag-handle"
          group="components"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <RenderComponent
            v-for="component in pageConfig.components"
            :key="component.id"
            :component="component"
          />
        </VueDraggable>

        <div v-if="pageConfig.components.length === 0" class="empty-tip">
          <el-icon :size="48"><Plus /></el-icon>
          <p>从左侧拖拽组件到此处</p>
        </div>
      </div>

      <!-- 框选区域 -->
      <div
        v-if="isSelecting"
        class="selection-rect"
        :style="selectionStyle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { VueDraggable } from 'vue-draggable-plus'
import { useEditorStore } from '../../stores/editor'
import RenderComponent from '../render/RenderComponent.vue'

const store = useEditorStore()
const { pageConfig, canvasConfig, selectedComponentId } = storeToRefs(store)

const canvasContainerRef = ref(null)
const canvasContentRef = ref(null)

// 拖拽状态
const isDragging = ref(false)

// 框选状态
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })

// 辅助线
const alignLines = ref([])

// 框选样式
const selectionStyle = computed(() => {
  if (!isSelecting.value) return {}
  const x = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const y = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const width = Math.abs(selectionEnd.value.x - selectionStart.value.x)
  const height = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  return {
    left: x + 'px',
    top: y + 'px',
    width: width + 'px',
    height: height + 'px'
  }
})

// 拖拽开始
function onDragStart() {
  isDragging.value = true
}

// 拖拽结束
function onDragEnd() {
  isDragging.value = false
  clearAlignLines()
}

// 处理拖拽经过
function handleDragOver(e) {
  e.preventDefault()
  // 计算辅助线
  if (isDragging.value) {
    calculateAlignLines(e)
  }
}

// 处理拖放
function handleDrop(event) {
  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  if (componentType) {
    store.addComponent(componentType)
  }
  clearAlignLines()
}

// 点击画布空白区域取消选中
function handleCanvasClick(e) {
  if (e.target === e.currentTarget || e.target.classList.contains('canvas-content')) {
    store.deselectComponent()
  }
}

// 计算辅助线
function calculateAlignLines(e) {
  // 简化实现：显示中心线
  const canvas = canvasContentRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  alignLines.value = [
    {
      id: 'center-x',
      type: 'vertical',
      style: { left: centerX + 'px', height: '100%' }
    },
    {
      id: 'center-y',
      type: 'horizontal',
      style: { top: centerY + 'px', width: '100%' }
    }
  ]
}

// 清除辅助线
function clearAlignLines() {
  alignLines.value = []
}

// 快捷键处理
function handleKeydown(e) {
  // 如果正在输入，不处理快捷键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

  const isCtrl = e.ctrlKey || e.metaKey

  // Ctrl+Z: 撤销
  if (isCtrl && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    store.undo()
    return
  }

  // Ctrl+Shift+Z 或 Ctrl+Y: 重做
  if ((isCtrl && e.shiftKey && e.key === 'z') || (isCtrl && e.key === 'y')) {
    e.preventDefault()
    store.redo()
    return
  }

  // Ctrl+C: 复制
  if (isCtrl && e.key === 'c') {
    e.preventDefault()
    store.copyComponent()
    return
  }

  // Ctrl+V: 粘贴
  if (isCtrl && e.key === 'v') {
    e.preventDefault()
    store.pasteComponent()
    return
  }

  // Ctrl+X: 剪切
  if (isCtrl && e.key === 'x') {
    e.preventDefault()
    store.cutComponent()
    return
  }

  // Ctrl+D: 复制选中组件
  if (isCtrl && e.key === 'd') {
    e.preventDefault()
    if (selectedComponentId.value) {
      store.duplicateComponent(selectedComponentId.value)
    }
    return
  }

  // Delete/Backspace: 删除选中组件
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    if (selectedComponentId.value) {
      store.deleteComponent(selectedComponentId.value)
    }
    return
  }

  // 方向键: 微调位置
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    // 这里可以实现组件位置微调
    return
  }
}

// 鼠标按下开始框选
function handleMouseDown(e) {
  // 只在画布空白区域开始框选
  if (e.target !== canvasContentRef.value) return

  isSelecting.value = true
  selectionStart.value = { x: e.offsetX, y: e.offsetY }
  selectionEnd.value = { x: e.offsetX, y: e.offsetY }
}

// 鼠标移动更新框选区域
function handleMouseMove(e) {
  if (!isSelecting.value) return
  selectionEnd.value = { x: e.offsetX, y: e.offsetY }
}

// 鼠标松开结束框选
function handleMouseUp() {
  isSelecting.value = false
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.canvas-container {
  flex: 1;
  height: 100%;
  overflow: auto;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.canvas {
  width: 100%;
  min-height: 600px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform-origin: top center;
  transition: width 0.3s;
  position: relative;
}

.canvas.device-pc {
  max-width: 100%;
}

.canvas.device-tablet {
  max-width: 1024px;
}

.canvas.device-mobile {
  max-width: 375px;
}

.canvas.show-grid {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-content {
  min-height: 100%;
  padding: 16px;
  position: relative;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.empty-tip p {
  margin-top: 12px;
  font-size: 14px;
}

/* 拖拽时的幽灵组件 */
.ghost-component {
  opacity: 0.5;
  border: 2px dashed var(--lc-primary);
  background: var(--lc-primary-light);
}

/* 辅助线 */
.align-line {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
}

.align-line.vertical {
  width: 1px;
  top: 0;
  background: var(--lc-primary);
}

.align-line.horizontal {
  height: 1px;
  left: 0;
  background: var(--lc-primary);
}

/* 框选区域 */
.selection-rect {
  position: absolute;
  border: 1px solid var(--lc-primary);
  background: rgba(64, 158, 255, 0.1);
  z-index: 999;
  pointer-events: none;
}
</style>
