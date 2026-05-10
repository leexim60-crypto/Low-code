<template>
  <!-- 统计数值 -->
  <div v-if="component.type === 'statistic'" class="statistic-wrapper">
    <div class="statistic-title">{{ component.props.title }}</div>
    <div class="statistic-value" :style="component.props.valueStyle">
      <span v-if="component.props.prefix" class="statistic-prefix">{{ component.props.prefix }}</span>
      {{ formatStatisticValue(component.props.value, component.props.precision) }}
      <span v-if="component.props.suffix" class="statistic-suffix">{{ component.props.suffix }}</span>
    </div>
  </div>

  <!-- 倒计时 -->
  <div v-else-if="component.type === 'countdown'" class="countdown-wrapper">
    <div class="countdown-title">{{ component.props.title }}</div>
    <div class="countdown-value">{{ formatCountdown(component.props.value) }}</div>
  </div>

  <!-- 树形控件 -->
  <div v-else-if="component.type === 'tree'" class="tree-wrapper">
    <div v-for="(item, index) in component.props.data" :key="index" class="tree-node">
      <div class="tree-node-content">
        <span class="tree-expand-icon" v-if="item.children">▼</span>
        <span v-if="component.props.showCheckbox" class="tree-checkbox"></span>
        <span class="tree-label">{{ item.label }}</span>
      </div>
      <div v-if="item.children" class="tree-children">
        <div v-for="(child, childIndex) in item.children" :key="childIndex" class="tree-node">
          <div class="tree-node-content tree-level-2">
            <span class="tree-expand-icon" v-if="child.children">▼</span>
            <span v-if="component.props.showCheckbox" class="tree-checkbox"></span>
            <span class="tree-label">{{ child.label }}</span>
          </div>
          <div v-if="child.children" class="tree-children">
            <div v-for="(grandchild, gIndex) in child.children" :key="gIndex" class="tree-node">
              <div class="tree-node-content tree-level-3">
                <span v-if="component.props.showCheckbox" class="tree-checkbox"></span>
                <span class="tree-label">{{ grandchild.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true }
})

function formatStatisticValue(value, precision) {
  if (typeof value !== 'number') return value
  return value.toFixed(precision)
}

function formatCountdown(endTime) {
  const now = Date.now()
  const diff = endTime - now
  if (diff <= 0) return '已结束'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return `${days}天${hours}时${minutes}分${seconds}秒`
}
</script>

<style scoped>
.statistic-wrapper { padding: 16px; }
.statistic-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.statistic-value { font-size: 28px; font-weight: 500; }
.statistic-prefix, .statistic-suffix { font-size: 14px; }

.countdown-wrapper { padding: 16px; }
.countdown-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.countdown-value { font-size: 20px; font-weight: 500; color: #303133; }

.tree-wrapper { font-size: 14px; }
.tree-node { margin-left: 16px; }
.tree-node-content {
  display: flex; align-items: center; padding: 6px 0; cursor: pointer;
}
.tree-node-content:hover { background: #f5f7fa; }
.tree-expand-icon { margin-right: 6px; font-size: 10px; color: #c0c4cc; }
.tree-checkbox { margin-right: 6px; }
.tree-label { color: #606266; }
.tree-children { margin-left: 20px; }
.tree-level-2 { padding-left: 0; }
.tree-level-3 { padding-left: 0; }
</style>
