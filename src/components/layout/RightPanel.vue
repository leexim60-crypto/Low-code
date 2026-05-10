<template>
  <div class="right-panel">
    <div class="panel-header">
      <h3>{{ selectedComponent ? '组件配置' : '页面配置' }}</h3>
    </div>
    <div class="panel-content">
      <template v-if="selectedComponent">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="属性" name="props">
            <PropsPanel :component="selectedComponent" />
          </el-tab-pane>
          <el-tab-pane label="样式" name="style">
            <StylePanel :component="selectedComponent" />
          </el-tab-pane>
          <el-tab-pane label="事件" name="events">
            <EventConfigPanel :component="selectedComponent" @update="handleEventsUpdate" />
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else>
        <div class="empty-config">
          <p>请选择一个组件进行配置</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '../../stores/editor'
import PropsPanel from './PropsPanel.vue'
import StylePanel from './StylePanel.vue'
import EventConfigPanel from './props-forms/EventConfigPanel.vue'

const store = useEditorStore()
const { selectedComponent } = storeToRefs(store)

const activeTab = ref('props')

function handleEventsUpdate(events) {
  if (selectedComponent.value) {
    selectedComponent.value.events = events
  }
}
</script>

<style scoped>
.right-panel {
  width: 320px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
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
  padding: 16px;
}

.panel-content :deep(.el-tabs__content) {
  padding: 0;
}

.panel-content :deep(.el-tab-pane) {
  overflow: visible;
}

.empty-config {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}
</style>
