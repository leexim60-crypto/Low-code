<template>
  <!-- 折线图 -->
  <template v-if="component.type === 'lineChart'">
    <el-divider content-position="left">基本设置</el-divider>
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="平滑曲线"><el-switch v-model="dp.smooth" /></el-form-item>
    <el-form-item label="显示图例"><el-switch v-model="dp.showLegend" /></el-form-item>
    <el-divider content-position="left">X轴数据</el-divider>
    <div class="chart-data-section">
      <div v-for="(item, index) in dp.xData" :key="'x-'+index" class="chart-data-item">
        <el-input v-model="dp.xData[index]" size="small" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeXData(index)" />
      </div>
      <el-button type="primary" size="small" @click="ops.addXData">添加X轴数据</el-button>
    </div>
    <el-divider content-position="left">系列数据</el-divider>
    <SeriesEditor :dp="dp" :ops="ops" />
  </template>

  <!-- 柱状图 -->
  <template v-else-if="component.type === 'barChart'">
    <el-divider content-position="left">基本设置</el-divider>
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="水平柱状"><el-switch v-model="dp.horizontal" /></el-form-item>
    <el-form-item label="显示图例"><el-switch v-model="dp.showLegend" /></el-form-item>
    <el-divider content-position="left">X轴数据</el-divider>
    <div class="chart-data-section">
      <div v-for="(item, index) in dp.xData" :key="'x-'+index" class="chart-data-item">
        <el-input v-model="dp.xData[index]" size="small" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeXData(index)" />
      </div>
      <el-button type="primary" size="small" @click="ops.addXData">添加X轴数据</el-button>
    </div>
    <el-divider content-position="left">系列数据</el-divider>
    <SeriesEditor :dp="dp" :ops="ops" />
  </template>

  <!-- 饼图 -->
  <template v-else-if="component.type === 'pieChart'">
    <el-divider content-position="left">基本设置</el-divider>
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="半径"><el-input v-model="dp.radius" placeholder="如: 50%" /></el-form-item>
    <el-form-item label="玫瑰图"><el-switch v-model="dp.roseType" /></el-form-item>
    <el-form-item label="显示图例"><el-switch v-model="dp.showLegend" /></el-form-item>
    <el-divider content-position="left">数据配置</el-divider>
    <div class="pie-data-section">
      <div v-for="(item, index) in dp.data" :key="'pie-'+index" class="pie-data-item">
        <el-input v-model="item.name" placeholder="名称" size="small" />
        <el-input-number v-model="item.value" placeholder="值" size="small" controls-position="right" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removePieData(index)" />
      </div>
      <el-button type="primary" size="small" @click="ops.addPieData">添加数据项</el-button>
    </div>
  </template>

  <!-- 雷达图 -->
  <template v-else-if="component.type === 'radarChart'">
    <el-divider content-position="left">基本设置</el-divider>
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-divider content-position="left">指标配置</el-divider>
    <div class="radar-indicator-section">
      <div v-for="(item, index) in dp.indicators" :key="'ind-'+index" class="radar-indicator-item">
        <el-input v-model="item.name" placeholder="指标名" size="small" />
        <el-input-number v-model="item.max" placeholder="最大值" size="small" controls-position="right" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeIndicator(index)" />
      </div>
      <el-button type="primary" size="small" @click="ops.addIndicator">添加指标</el-button>
    </div>
    <el-divider content-position="left">系列数据</el-divider>
    <div v-for="(series, sIndex) in dp.series" :key="'rs-'+sIndex" class="series-section">
      <div class="series-header">
        <el-input v-model="series.name" placeholder="系列名称" size="small" style="width: 150px;" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeSeries(sIndex)" />
      </div>
      <div class="series-data">
        <div v-for="(val, vIndex) in series.data" :key="'rv-'+vIndex" class="series-data-item">
          <span class="data-index">{{ dp.indicators[vIndex]?.name || '指标' + (vIndex+1) }}:</span>
          <el-input-number v-model="series.data[vIndex]" size="small" controls-position="right" />
        </div>
      </div>
    </div>
    <el-button type="success" size="small" @click="ops.addSeries">添加系列</el-button>
  </template>

  <!-- 仪表盘 -->
  <template v-else-if="component.type === 'gaugeChart'">
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="名称"><el-input v-model="dp.name" /></el-form-item>
    <el-form-item label="当前值"><el-input-number v-model="dp.value" :min="dp.min" :max="dp.max" /></el-form-item>
    <el-form-item label="最小值"><el-input-number v-model="dp.min" /></el-form-item>
    <el-form-item label="最大值"><el-input-number v-model="dp.max" /></el-form-item>
  </template>

  <!-- 统计数值 -->
  <template v-else-if="component.type === 'statistic'">
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="数值"><el-input-number v-model="dp.value" /></el-form-item>
    <el-form-item label="精度"><el-input-number v-model="dp.precision" :min="0" :max="10" /></el-form-item>
    <el-form-item label="前缀"><el-input v-model="dp.prefix" /></el-form-item>
    <el-form-item label="后缀"><el-input v-model="dp.suffix" /></el-form-item>
  </template>

  <!-- 倒计时 -->
  <template v-else-if="component.type === 'countdown'">
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
  </template>

  <!-- 树形控件 -->
  <template v-else-if="component.type === 'tree'">
    <el-divider content-position="left">树节点配置</el-divider>
    <div class="tree-config-section">
      <div v-for="(node, nIndex) in dp.data" :key="'n-'+nIndex" class="tree-node-config">
        <div class="tree-node-row">
          <el-input v-model="node.label" placeholder="节点名称" size="small" />
          <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeTreeNode(nIndex)" />
          <el-button type="primary" size="small" @click="ops.addChildNode(node)">添加子节点</el-button>
        </div>
        <div v-if="node.children" class="tree-children-config">
          <div v-for="(child, cIndex) in node.children" :key="'c-'+cIndex" class="tree-child-row">
            <el-input v-model="child.label" placeholder="子节点名称" size="small" />
            <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeChildNode(node, cIndex)" />
            <el-button type="primary" size="small" @click="ops.addGrandchildNode(child)">添加子节点</el-button>
          </div>
          <div v-if="child.children" class="tree-grandchildren-config">
            <div v-for="(gc, gcIndex) in child.children" :key="'gc-'+gcIndex" class="tree-grandchild-row">
              <el-input v-model="gc.label" placeholder="节点名称" size="small" />
              <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeGrandchildNode(child, gcIndex)" />
            </div>
          </div>
        </div>
      </div>
      <el-button type="primary" size="small" @click="ops.addTreeNode">添加根节点</el-button>
    </div>
    <el-divider content-position="left">树设置</el-divider>
    <el-form-item label="显示复选框"><el-switch v-model="dp.showCheckbox" /></el-form-item>
    <el-form-item label="默认展开"><el-switch v-model="dp.defaultExpandAll" /></el-form-item>
    <el-form-item label="可拖拽"><el-switch v-model="dp.draggable" /></el-form-item>
  </template>
</template>

<script setup>
import { toRef } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useListOps } from './useListOps'
import SeriesEditor from './SeriesEditor.vue'

const props = defineProps({
  component: { type: Object, required: true },
  draftProps: { type: Object, required: true }
})

const dp = toRef(props, 'draftProps')
const ops = useListOps(dp)
</script>

<style scoped>
.chart-data-section { margin-bottom: 12px; }
.chart-data-item { display: flex; gap: 6px; margin-bottom: 6px; align-items: center; }
.chart-data-item .el-input { flex: 1; }
.series-section { background: #f5f7fa; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
.series-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.series-data { display: flex; flex-wrap: wrap; gap: 6px; }
.series-data-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.data-index { color: #909399; min-width: 40px; }
.series-data-item .el-input-number { width: 100px; }
.pie-data-section { margin-bottom: 12px; }
.pie-data-item { display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }
.pie-data-item .el-input { flex: 1; }
.pie-data-item .el-input-number { width: 120px; }
.radar-indicator-section { margin-bottom: 12px; }
.radar-indicator-item { display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }
.radar-indicator-item .el-input { flex: 1; }
.radar-indicator-item .el-input-number { width: 100px; }
.tree-config-section { margin-bottom: 12px; }
.tree-node-config { margin-bottom: 10px; padding: 8px; background: #f5f7fa; border-radius: 4px; }
.tree-node-row { display: flex; gap: 6px; align-items: center; }
.tree-node-row .el-input { flex: 1; }
.tree-children-config { margin-left: 20px; margin-top: 8px; padding-left: 10px; border-left: 2px solid #e4e7ed; }
.tree-child-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
.tree-child-row .el-input { flex: 1; }
.tree-grandchildren-config { margin-left: 20px; margin-top: 6px; padding-left: 10px; border-left: 2px solid #e4e7ed; }
.tree-grandchild-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.tree-grandchild-row .el-input { flex: 1; }
</style>
