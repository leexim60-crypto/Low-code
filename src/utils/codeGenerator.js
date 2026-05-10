/**
 * 源码生成器 - 生成可运行的 .vue 单文件组件
 */

/**
 * 生成完整的 Vue SFC 代码
 */
export function generateVueSFC(pageConfig) {
  const components = pageConfig.components || []
  const usedImports = new Set()

  const template = generateTemplate(components, usedImports)
  const script = generateScript(components, pageConfig, usedImports)
  const style = generateStyle(components)

  return `<!-- 请确保已安装并引入 element-plus 和 echarts -->
<!-- npm install element-plus echarts -->
<!-- 在 main.js 中: import 'element-plus/dist/index.css' -->

<template>
  <div class="page-container">
${template}
  </div>
</template>

${script}

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}
.chart-container {
  width: 100%;
  height: 400px;
}
${style}
</style>`
}

// ========== 模板生成 ==========

function generateTemplate(components, usedImports, indent = 4) {
  const pad = ' '.repeat(indent)
  let html = ''

  for (const comp of components) {
    const tag = getComponentTag(comp, usedImports, indent)
    if (tag) html += pad + tag + '\n'
  }
  return html
}

function getComponentTag(comp, usedImports, indent) {
  const pad = ' '.repeat(indent)
  const id = comp.id
  const props = comp.props || {}
  const style = comp.style || {}
  const styleStr = buildStyleStr(style)
  const classStr = ` class="comp-${id}"`
  const visAttr = ` v-if="runtimeState.${id}.visible"`
  const evtAttr = hasClickEvent(comp) ? ` @click="on_${id}Click()"` : ''
  const changeAttr = hasValueChangeEvent(comp) ? ` @change="on_${id}Change()"` : ''

  switch (comp.type) {
    case 'button':
      usedImports.add('ElButton')
      return `<el-button${classStr} type="${props.type || 'default'}"${sizeAttr(props.size)}${props.round ? ' round' : ''}${props.disabled ? ' disabled' : ''}${evtAttr}${styleStr}>${props.text || '按钮'}</el-button>`

    case 'text':
      return `<p${classStr}${styleStr}>${props.content || ''}</p>`

    case 'input':
      usedImports.add('ElInput')
      return `<el-input${classStr} v-model="formData.${id}" placeholder="${props.placeholder || ''}"${props.clearable ? ' clearable' : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleStr} />`

    case 'image':
      return `<img${classStr} :src="'${props.src || ''}'" alt="${props.alt || ''}"${styleStr} />`

    case 'divider':
      usedImports.add('ElDivider')
      return `<el-divider${classStr} />`

    case 'icon':
      usedImports.add('ElIcon')
      return `<el-icon${classStr}${props.size ? ` :size="${props.size}"` : ''}${props.color ? ` color="${props.color}"` : ''}><${props.name || 'Star'} /></el-icon>`

    case 'link':
      usedImports.add('ElLink')
      return `<el-link${classStr} href="${props.href || '#'}" target="${props.target || '_blank'}"${props.disabled ? ' disabled' : ''}>${props.text || '链接'}</el-link>`

    case 'select':
      usedImports.add('ElSelect')
      usedImports.add('ElOption')
      return `<el-select${classStr} v-model="formData.${id}" placeholder="${props.placeholder || ''}"${props.clearable ? ' clearable' : ''}${changeAttr}${styleStr}>\n${(props.options || []).map(o => `${pad}  <el-option label="${o.label}" value="${o.value}" />`).join('\n')}\n${pad}</el-select>`

    case 'radio':
      usedImports.add('ElRadioGroup')
      usedImports.add('ElRadio')
      return `<el-radio-group${classStr} v-model="formData.${id}"${changeAttr}${visAttr}>\n${(props.options || []).map(o => `${pad}  <el-radio value="${o.value}">${o.label}</el-radio>`).join('\n')}\n${pad}</el-radio-group>`

    case 'checkbox':
      usedImports.add('ElCheckboxGroup')
      usedImports.add('ElCheckbox')
      return `<el-checkbox-group${classStr} v-model="formData.${id}"${changeAttr}${visAttr}>\n${(props.options || []).map(o => `${pad}  <el-checkbox value="${o.value}">${o.label}</el-checkbox>`).join('\n')}\n${pad}</el-checkbox-group>`

    case 'switchComp':
      usedImports.add('ElSwitch')
      return `<el-switch${classStr} v-model="formData.${id}"${props.activeText ? ` active-text="${props.activeText}"` : ''}${props.inactiveText ? ` inactive-text="${props.inactiveText}"` : ''}${props.disabled ? ' disabled' : ''}${changeAttr} />`

    case 'textarea':
      usedImports.add('ElInput')
      return `<el-input${classStr} v-model="formData.${id}" type="textarea" placeholder="${props.placeholder || ''}" :rows="${props.rows || 4}"${props.maxlength ? ` maxlength="${props.maxlength}"` : ''}${props.showWordLimit ? ' show-word-limit' : ''}${changeAttr} />`

    case 'datePicker':
      usedImports.add('ElDatePicker')
      return `<el-date-picker${classStr} v-model="formData.${id}" placeholder="${props.placeholder || '选择日期'}"${changeAttr} />`

    case 'timePicker':
      usedImports.add('ElTimePicker')
      return `<el-time-picker${classStr} v-model="formData.${id}" placeholder="${props.placeholder || '选择时间'}"${changeAttr} />`

    case 'rate':
      usedImports.add('ElRate')
      return `<el-rate${classStr} v-model="formData.${id}" :max="${props.max || 5}"${props.showText ? ' show-text' : ''}${changeAttr} />`

    case 'slider':
      usedImports.add('ElSlider')
      return `<el-slider${classStr} v-model="formData.${id}" :min="${props.min || 0}" :max="${props.max || 100}" :step="${props.step || 1}"${changeAttr} />`

    case 'upload':
      usedImports.add('ElUpload')
      return `<el-upload${classStr} action="" :auto-upload="false"${props.drag ? ' drag' : ''}><span>点击上传</span>${props.tip ? `<template #tip><div class="el-upload__tip">${props.tip}</div></template>` : ''}</el-upload>`

    case 'container':
      return `<div${classStr}${styleStr}>\n${comp.children ? generateTemplate(comp.children, usedImports, indent + 2) : pad}\n${pad}</div>`

    case 'row':
      usedImports.add('ElRow')
      return `<el-row${classStr} :gutter="${props.gutter || 10}">\n${comp.children ? generateTemplate(comp.children, usedImports, indent + 2) : pad}\n${pad}</el-row>`

    case 'col':
      usedImports.add('ElCol')
      return `<el-col${classStr} :span="${props.span || 12}">\n${comp.children ? generateTemplate(comp.children, usedImports, indent + 2) : pad}\n${pad}</el-col>`

    case 'card':
      usedImports.add('ElCard')
      return `<el-card${classStr}${styleStr}>\n${props.showHeader !== false ? `${pad}  <template #header>${props.title || '卡片'}</template>\n` : ''}${comp.children ? generateTemplate(comp.children, usedImports, indent + 2) : pad}\n${pad}</el-card>`

    case 'tabs':
      usedImports.add('ElTabs')
      usedImports.add('ElTabPane')
      return `<el-tabs${classStr} v-model="activeTab_${id}">\n${(props.tabs || []).map(t => `${pad}  <el-tab-pane label="${t.label}" name="${t.name}">${t.label}内容</el-tab-pane>`).join('\n')}\n${pad}</el-tabs>`

    case 'collapse':
      usedImports.add('ElCollapse')
      usedImports.add('ElCollapseItem')
      return `<el-collapse${classStr}>\n${(props.items || []).map((item, i) => `${pad}  <el-collapse-item title="${item.title}" name="${i}">${item.content}</el-collapse-item>`).join('\n')}\n${pad}</el-collapse>`

    case 'table':
      usedImports.add('ElTable')
      usedImports.add('ElTableColumn')
      return `<el-table${classStr} :data="tableData_${id}"${props.border ? ' border' : ''}${props.stripe ? ' stripe' : ''}>\n${(props.columns || []).map(col => `${pad}  <el-table-column prop="${col.prop}" label="${col.label}"${col.width ? ` width="${col.width}"` : ''} />`).join('\n')}\n${pad}</el-table>`

    case 'carousel':
      usedImports.add('ElCarousel')
      usedImports.add('ElCarouselItem')
      return `<el-carousel${classStr}>\n${(props.images || []).map(img => `${pad}  <el-carousel-item><img src="${img.src}" alt="${img.alt}" style="width:100%;height:300px;object-fit:cover" /></el-carousel-item>`).join('\n')}\n${pad}</el-carousel>`

    case 'progress':
      usedImports.add('ElProgress')
      return `<el-progress${classStr} :percentage="${props.percentage || 0}"${props.textInside ? ' text-inside' : ''}${props.color ? ` color="${props.color}"` : ''} />`

    case 'badge':
      usedImports.add('ElBadge')
      return `<el-badge${classStr} :value="${props.value || 0}"${props.max ? ` :max="${props.max}"` : ''}${props.isDot ? ' is-dot' : ''}><span>${props.text || '内容'}</span></el-badge>`

    case 'tag':
      usedImports.add('ElTag')
      return `<el-tag${classStr} type="${props.type || 'info'}" effect="${props.effect || 'light'}"${props.closable ? ' closable' : ''}>${props.text || '标签'}</el-tag>`

    case 'alert':
      usedImports.add('ElAlert')
      return `<el-alert${classStr} title="${props.title || ''}"${props.description ? ` description="${props.description}"` : ''} type="${props.type || 'info'}"${props.showIcon ? ' show-icon' : ''}${props.closable ? ' closable' : ''} />`

    case 'avatar':
      usedImports.add('ElAvatar')
      return `<el-avatar${classStr}${props.src ? ` src="${props.src}"` : ''}${props.shape === 'square' ? ' shape="square"' : ''}${props.size ? ` :size="${props.size}"` : ''} />`

    case 'breadcrumb':
      usedImports.add('ElBreadcrumb')
      usedImports.add('ElBreadcrumbItem')
      return `<el-breadcrumb${classStr} separator="${props.separator || '/'}">\n${(props.items || []).map(item => `${pad}  <el-breadcrumb-item${item.path ? ` to="${item.path}"` : ''}>${item.label}</el-breadcrumb-item>`).join('\n')}\n${pad}</el-breadcrumb>`

    case 'pagination':
      usedImports.add('ElPagination')
      return `<el-pagination${classStr} layout="total, prev, pager, next" :total="${props.total || 100}" :page-size="${props.pageSize || 10}" />`

    case 'lineChart':
    case 'barChart':
    case 'pieChart':
    case 'radarChart':
    case 'gaugeChart':
      return `<div class="chart-container comp-${id}" ref="chart_${id}"></div>`

    case 'statistic':
      usedImports.add('ElStatistic')
      return `<el-statistic${classStr} title="${props.title || ''}" :value="${props.value || 0}"${props.suffix ? ` suffix="${props.suffix}"` : ''}${props.prefix ? ` prefix="${props.prefix}"` : ''}${props.precision ? ` :precision="${props.precision}"` : ''} />`

    case 'countdown':
      usedImports.add('ElCountdown')
      return `<div${classStr}><span>${props.title || '倒计时'}</span><el-countdown :value="${props.value || Date.now() + 86400000}" format="${props.format || 'DD天HH时mm分ss秒'}" /></div>`

    case 'tree':
      usedImports.add('ElTree')
      return `<el-tree${classStr} :data="treeData_${id}" default-expand-all${props.showCheckbox ? ' show-checkbox' : ''} />`

    default:
      return `<!-- 未知组件: ${comp.type} -->`
  }
}

// ========== 脚本生成 ==========

function generateScript(components, pageConfig, usedImports) {
  const formData = {}
  const tableData = {}
  const treeData = {}
  const chartInits = []
  const eventHandlers = []
  const tabVars = {}

  collectData(components, formData, tableData, treeData, chartInits, eventHandlers, tabVars)

  const imports = []
  if (usedImports.size > 0) {
    imports.push(`import { ${[...usedImports].join(', ')} } from 'element-plus'`)
  }
  imports.push(`import { reactive, ref, onMounted, watch } from 'vue'`)

  const chartImports = chartInits.length > 0 ? `import * as echarts from 'echarts'` : ''

  const formDataEntries = Object.entries(formData).map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`).join(',\n')
  const tableDataEntries = Object.entries(tableData).map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`).join(',\n')
  const treeDataEntries = Object.entries(treeData).map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`).join(',\n')
  const tabEntries = Object.entries(tabVars).map(([k, v]) => `const ${k} = ref('${v}')`).join('\n')

  const chartInitCode = chartInits.map(({ id, config }) => `
  const chart_${id} = ref(null)
  onMounted(() => {
    if (chart_${id}.value) {
      const instance = echarts.init(chart_${id}.value)
      instance.setOption(${JSON.stringify(config, null, 2)})
      window.addEventListener('resize', () => instance.resize())
    }
  })`).join('\n')

  // 分类事件处理器
  const clickHandlers = eventHandlers.filter(e => e.trigger === 'click')
  const mountHandlers = eventHandlers.filter(e => e.trigger === 'mount')
  const valueChangeHandlers = eventHandlers.filter(e => e.trigger === 'valueChange')

  function generateActionLines(actions, indent = '  ') {
    return actions.map(action => {
      switch (action.type) {
        case 'showComponent': return `${indent}runtimeState.${action.targetId}.visible = true`
        case 'hideComponent': return `${indent}runtimeState.${action.targetId}.visible = false`
        case 'setVariable': return `${indent}formData.${action.key} = ${JSON.stringify(action.value)}`
        case 'resetForm': return `${indent}Object.keys(formData).forEach(k => formData[k] = typeof formData[k] === 'boolean' ? false : '')`
        case 'setProps': {
          const entries = Object.entries(action.props || {})
          return entries.map(([key, val]) => {
            if (key === 'modelValue') {
              return `${indent}formData.${action.targetId} = ${JSON.stringify(val)}`
            }
            return `${indent}runtimeState.${action.targetId}.extraProps.${key} = ${JSON.stringify(val)}`
          }).join('\n')
        }
        default: return `${indent}// ${action.type}`
      }
    }).join('\n')
  }

  const eventCode = [
    ...clickHandlers.map(({ id, actions }) => `
function on_${id}Click() {
${generateActionLines(actions)}
}`),
    ...valueChangeHandlers.map(({ id, actions }) => `
function on_${id}Change() {
${generateActionLines(actions)}
}`)
  ].join('\n')

  const mountCode = mountHandlers.length > 0 ? `
onMounted(() => {
${mountHandlers.map(({ id, actions }) => `  // mount: ${id}\n${generateActionLines(actions, '  ')}`).join('\n')}
})` : ''

  const watchCode = ''

  // runtimeState
  const allIds = []
  collectIds(components, allIds)
  const hasSetProps = eventHandlers.some(e => e.actions.some(a => a.type === 'setProps'))
  const runtimeEntries = allIds.map(id => `    ${id}: { visible: true${hasSetProps ? ', extraProps: {}' : ''} }`).join(',\n')

  return `<script setup>
${imports.join('\n')}
${chartImports ? `\n${chartImports}` : ''}

// 表单数据
const formData = reactive({
${formDataEntries}
})
${tableDataEntries ? `\nconst tableData = reactive({\n${tableDataEntries}\n})` : ''}
${treeDataEntries ? `\nconst treeData = reactive({\n${treeDataEntries}\n})` : ''}

// 运行时状态（可见性控制）
const runtimeState = reactive({
${runtimeEntries}
})
${tabEntries ? `\n${tabEntries}` : ''}
${chartInitCode ? `\n// 图表初始化\n${chartInitCode}` : ''}
${eventCode ? `\n// 事件处理\n${eventCode}` : ''}${mountCode}
</script>`
}

function collectData(components, formData, tableData, treeData, chartInits, eventHandlers, tabVars) {
  const formTypes = ['input', 'select', 'radio', 'checkbox', 'switchComp', 'textarea', 'datePicker', 'timePicker', 'rate', 'slider']

  for (const comp of components) {
    const props = comp.props || {}

    if (formTypes.includes(comp.type)) {
      formData[comp.id] = props.modelValue ?? (comp.type === 'checkbox' ? [] : comp.type === 'switchComp' ? false : '')
    }

    if (comp.type === 'table') {
      tableData[`tableData_${comp.id}`] = props.data || []
    }

    if (comp.type === 'tree') {
      treeData[`treeData_${comp.id}`] = props.data || []
    }

    if (comp.type === 'tabs') {
      tabVars[`activeTab_${comp.id}`] = props.activeTab || ''
    }

    if (['lineChart', 'barChart', 'pieChart', 'radarChart', 'gaugeChart'].includes(comp.type)) {
      chartInits.push({ id: comp.id, config: getChartOption(comp) })
    }

    if (comp.events && comp.events.length > 0) {
      const clickEvents = comp.events.filter(e => e.trigger?.type === 'click')
      const mountEvents = comp.events.filter(e => e.trigger?.type === 'mount')
      const valueChangeEvents = comp.events.filter(e => e.trigger?.type === 'valueChange')

      if (clickEvents.length > 0) {
        eventHandlers.push({ id: comp.id, trigger: 'click', actions: clickEvents.flatMap(e => e.actions || []) })
      }
      if (mountEvents.length > 0) {
        eventHandlers.push({ id: comp.id, trigger: 'mount', actions: mountEvents.flatMap(e => e.actions || []) })
      }
      if (valueChangeEvents.length > 0) {
        eventHandlers.push({ id: comp.id, trigger: 'valueChange', actions: valueChangeEvents.flatMap(e => e.actions || []) })
      }
    }

    if (comp.children) {
      collectData(comp.children, formData, tableData, treeData, chartInits, eventHandlers, tabVars)
    }
  }
}

function collectIds(components, ids) {
  for (const comp of components) {
    ids.push(comp.id)
    if (comp.children) collectIds(comp.children, ids)
  }
}

function getChartOption(comp) {
  const props = comp.props || {}
  switch (comp.type) {
    case 'lineChart':
    case 'barChart':
      return {
        xAxis: { type: 'category', data: props.xData || [] },
        yAxis: { type: 'value' },
        series: (props.series || []).map(s => ({ name: s.name, type: comp.type === 'lineChart' ? 'line' : 'bar', data: s.data || [] }))
      }
    case 'pieChart':
      return { series: [{ type: 'pie', data: props.data || [] }] }
    case 'radarChart':
      return {
        radar: { indicator: (props.indicators || []).map(i => ({ name: i.name, max: i.max })) },
        series: [{ type: 'radar', data: (props.series || []).map(s => ({ name: s.name, value: s.data || [] })) }]
      }
    case 'gaugeChart':
      return { series: [{ type: 'gauge', data: [{ value: props.value || 0 }] }] }
    default:
      return {}
  }
}

// ========== 样式生成 ==========

function generateStyle(components) {
  const rules = []
  collectStyles(components, rules)
  return rules.join('\n')
}

function collectStyles(components, rules) {
  for (const comp of components) {
    const style = comp.style || {}
    const props = []
    if (style.width && style.width !== 'auto') props.push(`width: ${style.width}`)
    if (style.height && style.height !== 'auto') props.push(`height: ${style.height}`)
    if (style.margin) props.push(`margin: ${style.margin}`)
    if (style.padding) props.push(`padding: ${style.padding}`)
    if (style.fontSize) props.push(`font-size: ${style.fontSize}`)
    if (style.color) props.push(`color: ${style.color}`)
    if (style.textAlign) props.push(`text-align: ${style.textAlign}`)
    if (style.fontWeight) props.push(`font-weight: ${style.fontWeight}`)
    if (style.lineHeight) props.push(`line-height: ${style.lineHeight}`)
    if (style.backgroundColor) props.push(`background-color: ${style.backgroundColor}`)
    if (style.borderRadius) props.push(`border-radius: ${style.borderRadius}`)
    if (style.border && style.border !== 'none') props.push(`border: ${style.border}`)
    if (style.opacity !== undefined && style.opacity !== 1) props.push(`opacity: ${style.opacity}`)
    if (style.boxShadow) props.push(`box-shadow: ${style.boxShadow}`)
    if (style.minHeight) props.push(`min-height: ${style.minHeight}`)
    if (style.minWidth) props.push(`min-width: ${style.minWidth}`)
    if (props.length > 0) {
      rules.push(`.comp-${comp.id} {\n  ${props.join(';\n  ')};\n}`)
    }
    if (comp.children) collectStyles(comp.children, rules)
  }
}

// ========== 辅助函数 ==========

function hasClickEvent(comp) {
  return comp.events && comp.events.some(e => e.trigger?.type === 'click')
}

function hasValueChangeEvent(comp) {
  return comp.events && comp.events.some(e => e.trigger?.type === 'valueChange')
}

function buildStyleStr(style) {
  const parts = []
  if (style.width && style.width !== 'auto') parts.push(`width:${style.width}`)
  if (style.height && style.height !== 'auto') parts.push(`height:${style.height}`)
  if (style.margin) parts.push(`margin:${style.margin}`)
  if (style.padding) parts.push(`padding:${style.padding}`)
  if (style.fontSize) parts.push(`font-size:${style.fontSize}`)
  if (style.color) parts.push(`color:${style.color}`)
  if (style.textAlign) parts.push(`text-align:${style.textAlign}`)
  if (style.fontWeight) parts.push(`font-weight:${style.fontWeight}`)
  if (style.lineHeight) parts.push(`line-height:${style.lineHeight}`)
  if (style.backgroundColor) parts.push(`background-color:${style.backgroundColor}`)
  if (style.borderRadius) parts.push(`border-radius:${style.borderRadius}`)
  if (style.border && style.border !== 'none') parts.push(`border:${style.border}`)
  if (style.opacity !== undefined && style.opacity !== 1) parts.push(`opacity:${style.opacity}`)
  if (style.boxShadow) parts.push(`box-shadow:${style.boxShadow}`)
  if (style.minHeight) parts.push(`min-height:${style.minHeight}`)
  if (style.minWidth) parts.push(`min-width:${style.minWidth}`)
  return parts.length ? ` style="${parts.join(';')}"` : ''
}

function sizeAttr(size) {
  const map = { large: ' size="large"', small: ' size="small"', default: '' }
  return map[size] || ''
}
