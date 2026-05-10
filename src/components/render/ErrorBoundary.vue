<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <el-icon :size="24" color="#f56c6c"><WarningFilled /></el-icon>
      <div class="error-info">
        <p class="error-title">组件渲染出错</p>
        <p class="error-detail">{{ errorMessage }}</p>
      </div>
      <el-button size="small" type="primary" @click="retry">重试</el-button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'ErrorBoundary' })

const props = defineProps({
  componentId: { type: String, default: '' }
})

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message || '未知错误'
  console.error(`[ErrorBoundary] 组件 ${props.componentId} 渲染出错:`, err, info)
  return false // 阻止错误向上传播
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  border: 1px solid #fde2e2;
  background: #fef0f0;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 40px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-info {
  flex: 1;
  min-width: 0;
}

.error-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #f56c6c;
}

.error-detail {
  margin: 2px 0 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
