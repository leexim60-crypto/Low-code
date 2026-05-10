/**
 * 预览页面生成器 - 生成可交互的完整HTML页面
 * 使用 Vue 3 + Element Plus CDN 渲染真实组件
 */

/**
 * 生成完整预览HTML
 */
export function generatePreviewHtml(pageConfig) {
  const components = pageConfig.components || []
  const template = generateTemplate(components)
  const script = generateScript(components, pageConfig)
  const style = generateStyle(components)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageConfig.name || '预览页面'}</title>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
  <script src="https://unpkg.com/element-plus"><\/script>
  <script src="https://unpkg.com/echarts@5/dist/echarts.min.js"><\/script>
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; }
    .page-container { max-width: 1200px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .chart-container { width: 100%; height: 400px; }
    ${style}
  </style>
</head>
<body>
  <div id="app">
    <div class="page-container">
${template}
    </div>
  </div>
  <script>
${script}
  <\/script>
</body>
</html>`
}

/**
 * 递归生成 Vue 模板
 */
function generateTemplate(components, indent = 6) {
  const pad = ' '.repeat(indent)
  let html = ''

  for (const comp of components) {
    const tag = getTemplateTag(comp, indent)
    if (tag) {
      html += pad + tag + '\n'
    }
  }
  return html
}

/**
 * 获取单个组件的模板代码
 */
function getTemplateTag(comp, indent) {
  const id = comp.id
  const props = comp.props || {}
  const style = comp.style || {}
  const styleStr = buildStyleAttr(style)
  const classStr = ` class="comp-${id}"`
  const visAttr = ` v-if="runtimeState.${id} !== false"`
  const evtAttr = hasClickEvent(comp) ? ` @click="on_${id}_click()"` : ''
  const changeAttr = hasValueChangeEvent(comp) ? ` @change="on_${id}_change()"` : ''

  switch (comp.type) {
    // ========== 基础组件 ==========
    case 'button':
      return `<el-button${classStr} type="${props.type || 'primary'}"${sizeAttr(props.size)}${props.round ? ' round' : ''}${props.disabled ? ' disabled' : ''}${evtAttr}${styleStr}>${props.text || '按钮'}</el-button>`

    case 'text':
      return `<p${classStr}${styleAttr(style)}${visAttr}>${props.content || ''}</p>`

    case 'input':
      return `<el-input${classStr} v-model="formData.${id}" placeholder="${props.placeholder || ''}" type="${props.type || 'text'}"${props.clearable ? ' clearable' : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'image':
      return `<img${classStr} src="${props.src || ''}" alt="${props.alt || ''}"${styleAttr(style)}${visAttr} />`

    case 'divider':
      return `<el-divider${classStr}${props.borderStyle === 'dashed' ? ' border-style="dashed"' : ''}${styleAttr(style)}${visAttr} />`

    case 'icon':
      return `<el-icon${classStr}${props.size ? ` :size="${props.size}"` : ''}${props.color ? ` color="${props.color}"` : ''}${styleAttr(style)}${visAttr}><${props.name || 'Star'} /></el-icon>`

    case 'link':
      return `<el-link${classStr} href="${props.href || '#'}" target="${props.target || '_blank'}"${props.disabled ? ' disabled' : ''}${styleAttr(style)}${visAttr}>${props.text || '链接'}</el-link>`

    // ========== 表单组件 ==========
    case 'select':
      return genSelect(id, props, style, visAttr, changeAttr)

    case 'radio':
      return genRadio(id, props, style, visAttr, changeAttr)

    case 'checkbox':
      return genCheckbox(id, props, style, visAttr, changeAttr)

    case 'switchComp':
      return `<el-switch${classStr} v-model="formData.${id}"${props.activeText ? ` active-text="${props.activeText}"` : ''}${props.inactiveText ? ` inactive-text="${props.inactiveText}"` : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'textarea':
      return `<el-input${classStr} v-model="formData.${id}" type="textarea" placeholder="${props.placeholder || ''}" :rows="${props.rows || 4}"${props.maxlength ? ` maxlength="${props.maxlength}"` : ''}${props.showWordLimit ? ' show-word-limit' : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'datePicker':
      return `<el-date-picker${classStr} v-model="formData.${id}" placeholder="${props.placeholder || '选择日期'}"${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'timePicker':
      return `<el-time-picker${classStr} v-model="formData.${id}" placeholder="${props.placeholder || '选择时间'}"${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'rate':
      return `<el-rate${classStr} v-model="formData.${id}" :max="${props.max || 5}"${props.showText ? ' show-text' : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'slider':
      return `<el-slider${classStr} v-model="formData.${id}" :min="${props.min || 0}" :max="${props.max || 100}" :step="${props.step || 1}"${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr} />`

    case 'upload':
      return `<el-upload${classStr} action="" :auto-upload="false"${props.drag ? ' drag' : ''}${styleAttr(style)}${visAttr}><el-icon><UploadFilled /></el-icon>${props.tip ? `<div class="el-upload__tip">${props.tip}</div>` : ''}</el-upload>`

    // ========== 布局组件 ==========
    case 'container':
      return genContainer(comp, indent, visAttr, classStr)

    case 'row':
      return genRow(comp, indent, visAttr, classStr)

    case 'col':
      return genCol(comp, indent, visAttr, classStr)

    case 'card':
      return genCard(comp, indent, visAttr, classStr)

    case 'tabs':
      return genTabs(comp, indent, visAttr, classStr)

    case 'collapse':
      return genCollapse(comp, indent, visAttr, classStr)

    // ========== 高级组件 ==========
    case 'table':
      return genTable(comp, visAttr, classStr)

    case 'carousel':
      return genCarousel(comp, visAttr, classStr)

    case 'progress':
      return `<el-progress${classStr} :percentage="${props.percentage || 0}"${props.showText === false ? ':show-text="false"' : ''}${props.textInside ? ' text-inside' : ''}${props.color ? ` color="${props.color}"` : ''}${styleAttr(style)}${visAttr} />`

    case 'badge':
      return `<el-badge${classStr} :value="${props.value || 0}"${props.max ? ` :max="${props.max}"` : ''}${props.isDot ? ' is-dot' : ''}${props.hidden ? ' hidden' : ''}${visAttr}><span>${props.text || '内容'}</span></el-badge>`

    case 'tag':
      return `<el-tag${classStr} type="${props.type || 'info'}" effect="${props.effect || 'light'}"${props.closable ? ' closable' : ''}${styleAttr(style)}${visAttr}>${props.text || '标签'}</el-tag>`

    case 'alert':
      return `<el-alert${classStr} title="${props.title || ''}"${props.description ? ` description="${props.description}"` : ''} type="${props.type || 'info'}"${props.showIcon ? ' show-icon' : ''}${props.closable ? ' closable' : ''}${props.center ? ' center' : ''}${visAttr} />`

    case 'avatar':
      return `<el-avatar${classStr}${props.src ? ` src="${props.src}"` : ''}${props.shape === 'square' ? ' shape="square"' : ''}${props.size ? ` :size="${props.size}"` : ''}${visAttr}>${props.src ? '' : '<el-icon><User /></el-icon>'}</el-avatar>`

    case 'breadcrumb':
      return genBreadcrumb(comp, visAttr, classStr)

    case 'pagination':
      return `<el-pagination${classStr} layout="total, prev, pager, next" :total="${props.total || 100}" :page-size="${props.pageSize || 10}"${styleAttr(style)}${visAttr} />`

    // ========== 图表组件 ==========
    case 'lineChart':
    case 'barChart':
    case 'pieChart':
    case 'radarChart':
    case 'gaugeChart':
      return `<div class="chart-container comp-${id}" :ref="el => initChart_${id}(el)"${styleAttr(style)}${visAttr}></div>`

    // ========== 数据展示 ==========
    case 'statistic':
      return `<el-statistic${classStr} title="${props.title || ''}" :value="${props.value || 0}"${props.prefix ? ` prefix="${props.prefix}"` : ''}${props.suffix ? ` suffix="${props.suffix}"` : ''}${props.precision ? ` :precision="${props.precision}"` : ''}${styleAttr(style)}${visAttr} />`

    case 'countdown':
      return `<div${classStr}${visAttr}><span style="font-size:24px;font-weight:bold">${props.title || '倒计时'}</span><el-countdown :value="${props.value || Date.now() + 86400000}" format="${props.format || 'DD天HH时mm分ss秒'}"${styleAttr(style)} /></div>`

    case 'tree':
      return genTree(comp, visAttr, classStr)

    default:
      return `<!-- 未知组件: ${comp.type} -->`
  }
}

// ========== 辅助函数 ==========

function hasClickEvent(comp) {
  return comp.events && comp.events.some(e => e.trigger?.type === 'click')
}

function hasValueChangeEvent(comp) {
  return comp.events && comp.events.some(e => e.trigger?.type === 'valueChange')
}

function buildStyleAttr(style) {
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

function styleAttr(style) {
  return buildStyleAttr(style)
}

function sizeAttr(size) {
  const map = { large: ' size="large"', small: ' size="small"', default: '' }
  return map[size] || ''
}

// ========== 组件模板生成器 ==========

function genSelect(id, props, style, visAttr, changeAttr = '') {
  const options = (props.options || []).map(o =>
    `<el-option label="${o.label}" value="${o.value}" />`
  ).join('\n          ')
  return `<el-select v-model="formData.${id}" placeholder="${props.placeholder || ''}"${props.clearable ? ' clearable' : ''}${props.disabled ? ' disabled' : ''}${changeAttr}${styleAttr(style)}${visAttr}>
          ${options}
        </el-select>`
}

function genRadio(id, props, style, visAttr, changeAttr = '') {
  const options = (props.options || []).map(o =>
    `<el-radio label="${o.value}">${o.label}</el-radio>`
  ).join('\n          ')
  return `<el-radio-group v-model="formData.${id}"${props.disabled ? ' disabled' : ''}${changeAttr}${visAttr}>
          ${options}
        </el-radio-group>`
}

function genCheckbox(id, props, style, visAttr, changeAttr = '') {
  const options = (props.options || []).map(o =>
    `<el-checkbox label="${o.value}">${o.label}</el-checkbox>`
  ).join('\n          ')
  return `<el-checkbox-group v-model="formData.${id}"${props.disabled ? ' disabled' : ''}${changeAttr}${visAttr}>
          ${options}
        </el-checkbox-group>`
}

function genContainer(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const children = comp.children ? generateTemplate(comp.children, indent + 2) : ''
  return `<div${classStr}${styleAttr(comp.style)}${visAttr}>\n${children}${pad}</div>`
}

function genRow(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const children = comp.children ? generateTemplate(comp.children, indent + 2) : ''
  return `<el-row${classStr} :gutter="${comp.props?.gutter || 10}"${visAttr}>\n${children}${pad}</el-row>`
}

function genCol(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const children = comp.children ? generateTemplate(comp.children, indent + 2) : ''
  return `<el-col${classStr} :span="${comp.props?.span || 12}"${visAttr}>\n${children}${pad}</el-col>`
}

function genCard(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const children = comp.children ? generateTemplate(comp.children, indent + 2) : ''
  const header = comp.props?.showHeader !== false ? `<template #header>${comp.props?.title || '卡片'}</template>\n${pad}  ` : ''
  return `<el-card${classStr}${styleAttr(comp.style)}${visAttr}>\n${pad}  ${header}${children}${pad}</el-card>`
}

function genTabs(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const tabs = (comp.props?.tabs || []).map(t =>
    `<el-tab-pane label="${t.label}" name="${t.name}">${t.label}内容</el-tab-pane>`
  ).join('\n' + pad + '  ')
  return `<el-tabs${classStr} model-value="${comp.props?.activeTab || ''}"${visAttr}>\n${pad}  ${tabs}\n${pad}</el-tabs>`
}

function genCollapse(comp, indent, visAttr, classStr = '') {
  const pad = ' '.repeat(indent)
  const items = (comp.props?.items || []).map((item, i) =>
    `<el-collapse-item title="${item.title}" name="${i}">${item.content}</el-collapse-item>`
  ).join('\n' + pad + '  ')
  return `<el-collapse${classStr}${visAttr}>\n${pad}  ${items}\n${pad}</el-collapse>`
}

function genTable(comp, visAttr, classStr = '') {
  const props = comp.props || {}
  const columns = (props.columns || []).map(col =>
    `<el-table-column prop="${col.prop}" label="${col.label}"${col.width ? ` width="${col.width}"` : ''} />`
  ).join('\n          ')
  return `<el-table${classStr} :data="${comp.id}_data"${props.border ? ' border' : ''}${props.stripe ? ' stripe' : ''}${visAttr}>
          ${columns}
        </el-table>`
}

function genCarousel(comp, visAttr, classStr = '') {
  const images = (comp.props?.images || []).map(img =>
    `<el-carousel-item><img src="${img.src}" alt="${img.alt}" style="width:100%;height:300px;object-fit:cover" /></el-carousel-item>`
  ).join('\n          ')
  return `<el-carousel${classStr}${visAttr}>\n          ${images}\n        </el-carousel>`
}

function genBreadcrumb(comp, visAttr, classStr = '') {
  const items = (comp.props?.items || []).map(item =>
    `<el-breadcrumb-item${item.path ? ` to="${item.path}"` : ''}>${item.label}</el-breadcrumb-item>`
  ).join('\n          ')
  return `<el-breadcrumb${classStr} separator="${comp.props?.separator || '/'}"${visAttr}>\n          ${items}\n        </el-breadcrumb>`
}

function genTree(comp, visAttr, classStr = '') {
  return `<el-tree${classStr} :data="${comp.id}_treeData" default-expand-all${comp.props?.showCheckbox ? ' show-checkbox' : ''}${visAttr} />`
}

// ========== 脚本生成 ==========

function generateScript(components, pageConfig) {
  const formData = {}
  const tableData = {}
  const treeData = {}
  const chartInits = []
  const eventHandlers = []

  // 收集数据
  collectData(components, formData, tableData, treeData, chartInits, eventHandlers)

  // formData
  const formDataStr = Object.entries(formData).map(([k, v]) => `        ${k}: ${JSON.stringify(v)}`).join(',\n')

  // table data
  const tableDataStr = Object.entries(tableData).map(([k, v]) =>
    `        ${k}: ${JSON.stringify(v)}`
  ).join(',\n')

  // tree data
  const treeDataStr = Object.entries(treeData).map(([k, v]) =>
    `        ${k}: ${JSON.stringify(v)}`
  ).join(',\n')

  // chart init functions
  const chartInitStr = chartInits.map(({ id, config }) => `
        function initChart_${id}(el) {
          if (!el || charts['${id}']) return;
          const chart = echarts.init(el);
          charts['${id}'] = chart;
          chart.setOption(${JSON.stringify(config)});
          window.addEventListener('resize', () => chart.resize());
        }`).join('\n')

  // event handlers - click
  const clickHandlers = eventHandlers.filter(e => e.trigger === 'click')
  const mountHandlers = eventHandlers.filter(e => e.trigger === 'mount')
  const valueChangeHandlers = eventHandlers.filter(e => e.trigger === 'valueChange')

  const eventHandlerStr = [
    ...clickHandlers.map(({ id, actions }) => `
        function on_${id}_click() {
${generateActionCode(actions, '          ')}
        }`),
    ...valueChangeHandlers.map(({ id, actions }) => `
        function on_${id}_change() {
${generateActionCode(actions, '          ')}
        }`)
  ].join('\n')

  const mountHandlerStr = mountHandlers.length > 0 ? `
        onMounted(() => {
${mountHandlers.map(({ id, actions }) => `          // mount: ${id}\n${generateActionCode(actions, '          ')}`).join('\n')}
        })` : ''

  return `    const { createApp, ref, reactive, onMounted, watch } = Vue;
    const app = createApp({
      setup() {
        const formData = reactive({
${formDataStr}
        });

${tableDataStr ? `        const tableData = reactive({\n${tableDataStr}\n        });` : '        const tableData = reactive({});'}
${treeDataStr ? `        const treeData = reactive({\n${treeDataStr}\n        });` : '        const treeData = reactive({});'}

        const runtimeState = reactive({});
        const charts = {};

${chartInitStr}
${eventHandlerStr}
${mountHandlerStr}

        return { formData, tableData, treeData, runtimeState, charts${chartInits.map(c => `, initChart_${c.id}`).join('')}${clickHandlers.map(e => `, on_${e.id}_click`).join('')}${valueChangeHandlers.map(e => `, on_${e.id}_change`).join('')} };
      }
    });
    app.use(ElementPlus);
    app.mount('#app');`
}

function collectData(components, formData, tableData, treeData, chartInits, eventHandlers) {
  const formTypes = ['input', 'select', 'radio', 'checkbox', 'switchComp', 'textarea', 'datePicker', 'timePicker', 'rate', 'slider']

  for (const comp of components) {
    const props = comp.props || {}

    // 表单组件 -> formData
    if (formTypes.includes(comp.type)) {
      formData[comp.id] = props.modelValue ?? (comp.type === 'checkbox' ? [] : comp.type === 'switchComp' ? false : '')
    }

    // 表格 -> tableData
    if (comp.type === 'table') {
      tableData[`${comp.id}_data`] = props.data || []
    }

    // 树 -> treeData
    if (comp.type === 'tree') {
      treeData[`${comp.id}_treeData`] = props.data || []
    }

    // 图表
    if (['lineChart', 'barChart', 'pieChart', 'radarChart', 'gaugeChart'].includes(comp.type)) {
      const config = getChartOption(comp)
      chartInits.push({ id: comp.id, config })
    }

    // 事件
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

    // 递归子组件
    if (comp.children) {
      collectData(comp.children, formData, tableData, treeData, chartInits, eventHandlers)
    }
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
      return {
        series: [{ type: 'pie', data: props.data || [] }]
      }
    case 'radarChart':
      return {
        radar: { indicator: (props.indicators || []).map(i => ({ name: i.name, max: i.max })) },
        series: [{ type: 'radar', data: (props.series || []).map(s => ({ name: s.name, value: s.data || [] })) }]
      }
    case 'gaugeChart':
      return {
        series: [{ type: 'gauge', data: [{ value: props.value || 0, name: props.title || '' }] }]
      }
    default:
      return {}
  }
}

function generateActionCode(actions, pad) {
  return actions.map(action => {
    switch (action.type) {
      case 'showComponent':
        return `${pad}runtimeState['${action.targetId}'] = true;`
      case 'hideComponent':
        return `${pad}runtimeState['${action.targetId}'] = false;`
      case 'setVariable':
        return `${pad}formData['${action.key}'] = ${JSON.stringify(action.value)};`
      case 'resetForm':
        return `${pad}Object.keys(formData).forEach(k => formData[k] = typeof formData[k] === 'boolean' ? false : '');`
      case 'setProps': {
        const entries = Object.entries(action.props || {})
        return entries.map(([key, val]) => {
          if (key === 'modelValue') {
            return `${pad}formData['${action.targetId}'] = ${JSON.stringify(val)};`
          }
          return `${pad}if (!runtimeState['${action.targetId}']) runtimeState['${action.targetId}'] = {}; runtimeState['${action.targetId}'].${key} = ${JSON.stringify(val)};`
        }).join('\n')
      }
      default:
        return `${pad}// ${action.type}`
    }
  }).join('\n')
}

// ========== 样式生成 ==========

function generateStyle(components) {
  const styles = []
  collectStyles(components, styles)
  return styles.join('\n')
}

function collectStyles(components, styles) {
  for (const comp of components) {
    const style = comp.style || {}
    const rules = []
    if (style.width && style.width !== 'auto') rules.push(`width:${style.width}`)
    if (style.height && style.height !== 'auto') rules.push(`height:${style.height}`)
    if (style.margin) rules.push(`margin:${style.margin}`)
    if (style.padding) rules.push(`padding:${style.padding}`)
    if (style.fontSize) rules.push(`font-size:${style.fontSize}`)
    if (style.color) rules.push(`color:${style.color}`)
    if (style.textAlign) rules.push(`text-align:${style.textAlign}`)
    if (style.fontWeight) rules.push(`font-weight:${style.fontWeight}`)
    if (style.lineHeight) rules.push(`line-height:${style.lineHeight}`)
    if (style.backgroundColor) rules.push(`background-color:${style.backgroundColor}`)
    if (style.borderRadius) rules.push(`border-radius:${style.borderRadius}`)
    if (style.border && style.border !== 'none') rules.push(`border:${style.border}`)
    if (style.opacity !== undefined && style.opacity !== 1) rules.push(`opacity:${style.opacity}`)
    if (style.boxShadow) rules.push(`box-shadow:${style.boxShadow}`)
    if (style.minHeight) rules.push(`min-height:${style.minHeight}`)
    if (style.minWidth) rules.push(`min-width:${style.minWidth}`)

    if (rules.length > 0) {
      styles.push(`.comp-${comp.id} { ${rules.join('; ')} }`)
    }

    if (comp.children) {
      collectStyles(comp.children, styles)
    }
  }
}
