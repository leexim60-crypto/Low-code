<template>
  <div v-for="(series, sIndex) in dp.series" :key="'s-'+sIndex" class="series-section">
    <div class="series-header">
      <el-input v-model="series.name" placeholder="系列名称" size="small" style="width: 150px;" />
      <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeSeries(sIndex)" />
    </div>
    <div class="series-data">
      <div v-for="(val, vIndex) in series.data" :key="'v-'+vIndex" class="series-data-item">
        <span class="data-index">{{ dp.xData[vIndex] || '数据' + (vIndex+1) }}:</span>
        <el-input-number v-model="series.data[vIndex]" size="small" controls-position="right" />
      </div>
    </div>
    <el-button type="primary" size="small" @click="ops.addSeriesData(sIndex)" style="margin-top: 4px;">添加数据点</el-button>
  </div>
  <el-button type="success" size="small" @click="ops.addSeries">添加系列</el-button>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'

defineProps({
  dp: { type: Object, required: true },
  ops: { type: Object, required: true }
})
</script>

<style scoped>
.series-section { background: #f5f7fa; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
.series-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.series-data { display: flex; flex-wrap: wrap; gap: 6px; }
.series-data-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.data-index { color: #909399; min-width: 40px; }
.series-data-item .el-input-number { width: 100px; }
</style>
