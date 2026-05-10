<template>
  <div class="chart-wrapper" :style="chartStyle">
    <div class="chart-title">{{ component.props.title }}</div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  component: { type: Object, required: true }
})

const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

const chartStyle = computed(() => ({
  width: props.component.style.width,
  height: props.component.style.height
}))

function buildOption() {
  const p = props.component.props
  switch (props.component.type) {
    case 'lineChart':
      return {
        tooltip: { trigger: 'axis' },
        legend: { show: p.showLegend, data: p.series.map(s => s.name) },
        xAxis: { type: 'category', data: p.xData },
        yAxis: { type: 'value' },
        series: p.series.map(s => ({ name: s.name, type: 'line', data: s.data, smooth: p.smooth }))
      }
    case 'barChart':
      return {
        tooltip: { trigger: 'axis' },
        legend: { show: p.showLegend, data: p.series.map(s => s.name) },
        xAxis: { type: 'category', data: p.xData },
        yAxis: { type: 'value' },
        series: p.series.map(s => ({ name: s.name, type: 'bar', data: s.data }))
      }
    case 'pieChart':
      return {
        tooltip: { trigger: 'item' },
        legend: { show: p.showLegend, orient: 'vertical', left: 'left' },
        series: [{
          type: 'pie', radius: p.radius,
          roseType: p.roseType ? 'area' : undefined,
          data: p.data,
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
        }]
      }
    case 'radarChart':
      return {
        tooltip: {},
        legend: { show: true, data: p.series.map(s => s.name) },
        radar: { indicator: p.indicators },
        series: [{ type: 'radar', data: p.series.map(s => ({ name: s.name, value: s.data })) }]
      }
    case 'gaugeChart':
      return {
        series: [{
          type: 'gauge', min: p.min, max: p.max,
          detail: { formatter: '{value}%' },
          data: [{ value: p.value, name: p.name }]
        }]
      }
  }
  return null
}

function initChart() {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(buildOption(), true)
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  nextTick(initChart)
  // 使用 ResizeObserver 替代 window.resize，更准确响应容器尺寸变化
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeChart()
    })
    resizeObserver.observe(chartRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  chartInstance?.dispose()
  chartInstance = null
})

watch(() => props.component.props, () => {
  if (chartInstance) {
    chartInstance.setOption(buildOption(), true)
  }
}, { deep: true })

watch(chartRef, (el) => {
  if (el) {
    chartInstance?.dispose()
    chartInstance = null
    nextTick(initChart)
  }
})
</script>

<style scoped>
.chart-wrapper { border: 1px solid #ebeef5; border-radius: 4px; padding: 16px; background: #fff; }
.chart-title { font-size: 16px; font-weight: 500; color: #303133; margin-bottom: 12px; }
.chart-container { width: 100%; height: 300px; }
</style>
