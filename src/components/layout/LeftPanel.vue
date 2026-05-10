<template>
  <div class="left-panel">
    <div class="panel-header">
      <h3>组件物料库</h3>
    </div>
    <div class="panel-content">
      <el-collapse v-model="activeCategories">
        <el-collapse-item
          v-for="category in categories"
          :key="category.name"
          :title="category.label"
          :name="category.name"
        >
          <div class="component-list">
            <div
              v-for="(config, type) in getComponentsByCategory(category.name)"
              :key="type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, type)"
            >
              <el-icon><component :is="config.icon" /></el-icon>
              <span>{{ config.name }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { componentConfigs, componentCategories } from '../../config/components'

const activeCategories = ref(['base', 'form', 'layout'])
const categories = componentCategories

function getComponentsByCategory(category) {
  const result = {}
  Object.entries(componentConfigs).forEach(([type, config]) => {
    if (config.category === category) {
      result[type] = config
    }
  })
  return result
}

function handleDragStart(event, type) {
  event.dataTransfer.setData('componentType', type)
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.left-panel {
  width: 260px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.component-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: grab;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
}

.component-item:hover {
  background: var(--lc-primary-light);
  border-color: var(--lc-primary);
  color: var(--lc-primary);
}

.component-item:active {
  cursor: grabbing;
}
</style>
