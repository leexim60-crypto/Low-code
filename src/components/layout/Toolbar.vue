<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <el-button-group>
        <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
          <el-button :icon="RefreshLeft" :disabled="!canUndo" @click="store.undo()" />
        </el-tooltip>
        <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
          <el-button :icon="RefreshRight" :disabled="!canRedo" @click="store.redo()" />
        </el-tooltip>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button-group>
        <el-tooltip content="删除" placement="bottom">
          <el-button :icon="Delete" :disabled="!selectedComponentId" @click="handleDelete" />
        </el-tooltip>
        <el-tooltip content="复制" placement="bottom">
          <el-button :icon="CopyDocument" :disabled="!selectedComponentId" @click="handleDuplicate" />
        </el-tooltip>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button-group v-if="selectedComponentId">
        <el-tooltip content="上移" placement="bottom">
          <el-button :icon="Top" @click="store.moveUp(selectedComponentId)" />
        </el-tooltip>
        <el-tooltip content="下移" placement="bottom">
          <el-button :icon="Bottom" @click="store.moveDown(selectedComponentId)" />
        </el-tooltip>
        <el-tooltip content="置顶" placement="bottom">
          <el-button :icon="Upload" @click="store.moveTop(selectedComponentId)" />
        </el-tooltip>
        <el-tooltip content="置底" placement="bottom">
          <el-button :icon="Download" @click="store.moveBottom(selectedComponentId)" />
        </el-tooltip>
      </el-button-group>
    </div>

    <div class="toolbar-center">
      <el-button-group>
        <el-tooltip content="PC端" placement="bottom">
          <el-button :type="canvasConfig.deviceType === 'pc' ? 'primary' : ''" @click="store.setDeviceType('pc')">
            <el-icon><Monitor /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="平板" placement="bottom">
          <el-button :type="canvasConfig.deviceType === 'tablet' ? 'primary' : ''" @click="store.setDeviceType('tablet')">
            <el-icon><Monitor /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="手机" placement="bottom">
          <el-button :type="canvasConfig.deviceType === 'mobile' ? 'primary' : ''" @click="store.setDeviceType('mobile')">
            <el-icon><Iphone /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-tooltip content="显示网格" placement="bottom">
        <el-button :type="canvasConfig.showGrid ? 'primary' : ''" @click="store.toggleGrid()">
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-tooltip>

      <el-slider
        v-model="zoom"
        :min="50"
        :max="200"
        :step="10"
        :format-tooltip="formatZoom"
        class="zoom-slider"
        @change="handleZoomChange"
      />
    </div>

    <div class="toolbar-right">
      <el-dropdown @command="handleCommand">
        <el-button>
          <el-icon><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="clear">清空画布</el-dropdown-item>
            <el-dropdown-item command="export">导出JSON</el-dropdown-item>
            <el-dropdown-item command="import">导入JSON</el-dropdown-item>
            <el-dropdown-item command="preview">预览页面</el-dropdown-item>
            <el-dropdown-item command="exportCode">导出源码</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  RefreshLeft, RefreshRight, Delete, CopyDocument,
  Top, Bottom, Upload, Download, Monitor,
  Iphone, Grid, More
} from '@element-plus/icons-vue'
import { useEditorStore } from '../../stores/editor'
import { downloadJSON, readLocalJSON } from '../../utils/helper'
import { generatePreviewHtml } from '../../utils/previewGenerator'
import { generateVueSFC } from '../../utils/codeGenerator'

const store = useEditorStore()
const { selectedComponentId, canvasConfig, canUndo, canRedo } = storeToRefs(store)

const zoom = ref(100)

watch(() => canvasConfig.value.zoom, (val) => {
  zoom.value = val * 100
})

function formatZoom(val) {
  return `${val}%`
}

function handleZoomChange(val) {
  store.setZoom(val / 100)
}

function handleDelete() {
  if (selectedComponentId.value) {
    store.deleteComponent(selectedComponentId.value)
  }
}

function handleDuplicate() {
  if (selectedComponentId.value) {
    store.duplicateComponent(selectedComponentId.value)
  }
}

async function handleCommand(command) {
  switch (command) {
    case 'clear':
      try {
        await ElMessageBox.confirm('确定要清空画布吗？', '提示', {
          type: 'warning'
        })
        store.clearCanvas()
        ElMessage.success('画布已清空')
      } catch {
        // 取消操作
      }
      break
    case 'export':
      const json = store.exportJSON()
      downloadJSON(json, `${json.name || 'page'}.json`)
      ElMessage.success('导出成功')
      break
    case 'import':
      try {
        const json = await readLocalJSON()
        store.importJSON(json)
        ElMessage.success('导入成功')
      } catch (err) {
        ElMessage.error('导入失败: ' + err.message)
      }
      break
    case 'preview':
      previewPage()
      break
    case 'exportCode':
      exportCode()
      break
  }
}

function previewPage() {
  const json = store.exportJSON()
  const html = generatePreviewHtml(json)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

function exportCode() {
  try {
    const json = store.exportJSON()
    const code = generateVueSFC(json)
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${json.name || 'page'}.vue`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
    ElMessage.success('源码导出成功')
  } catch (err) {
    console.error('导出源码失败:', err)
    ElMessage.error('导出源码失败: ' + err.message)
  }
}

// 快捷键支持
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault()
      store.undo()
    } else if (e.key === 'y') {
      e.preventDefault()
      store.redo()
    }
  }
  if (e.key === 'Delete' && selectedComponentId.value) {
    handleDelete()
  }
})
</script>

<style scoped>
.toolbar {
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-slider {
  width: 120px;
  margin-left: 8px;
}
</style>
