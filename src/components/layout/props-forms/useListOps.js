// 通用列表操作：添加/删除选项、标签、面包屑项等
export function useListOps(draftProps) {
  function addToList(key, item) {
    if (draftProps.value[key]) {
      draftProps.value[key].push(item)
    }
  }

  function removeFromList(key, index) {
    if (draftProps.value[key]) {
      draftProps.value[key].splice(index, 1)
    }
  }

  // 选项类（select/radio/checkbox）
  function addOption() {
    addToList('options', { label: '新选项', value: String(Date.now()) })
  }
  function removeOption(index) { removeFromList('options', index) }

  // 标签页
  function addTab() {
    addToList('tabs', { label: '新标签', name: String(Date.now()) })
  }
  function removeTab(index) { removeFromList('tabs', index) }

  // 折叠面板
  function addCollapseItem() {
    addToList('items', { title: '新面板', content: '内容' })
  }
  function removeCollapseItem(index) { removeFromList('items', index) }

  // 面包屑
  function addBreadcrumbItem() {
    addToList('items', { label: '新项', path: '' })
  }
  function removeBreadcrumbItem(index) { removeFromList('items', index) }

  // 表格列
  function addColumn() {
    if (draftProps.value.columns) {
      draftProps.value.columns.push({
        prop: 'field' + (draftProps.value.columns.length + 1),
        label: '新列',
        width: ''
      })
    }
  }
  function removeColumn(index) { removeFromList('columns', index) }

  // 表格数据行
  function addDataRow() {
    if (draftProps.value.data && draftProps.value.columns) {
      const newRow = {}
      draftProps.value.columns.forEach(col => { newRow[col.prop] = '' })
      draftProps.value.data.push(newRow)
    }
  }
  function removeDataRow(index) { removeFromList('data', index) }

  // 轮播图
  function addCarouselImage() {
    addToList('images', { src: 'https://via.placeholder.com/800x400?text=New+Image', alt: '新图片' })
  }
  function removeCarouselImage(index) { removeFromList('images', index) }

  // 图表X轴
  function addXData() {
    if (draftProps.value.xData) {
      draftProps.value.xData.push('新数据')
      if (draftProps.value.series) {
        draftProps.value.series.forEach(s => { s.data.push(0) })
      }
    }
  }
  function removeXData(index) {
    if (draftProps.value.xData) {
      draftProps.value.xData.splice(index, 1)
      if (draftProps.value.series) {
        draftProps.value.series.forEach(s => { s.data.splice(index, 1) })
      }
    }
  }

  // 图表系列
  function addSeries() {
    if (draftProps.value.series) {
      const len = draftProps.value.xData ? draftProps.value.xData.length : 5
      draftProps.value.series.push({ name: '新系列', data: new Array(len).fill(0) })
    }
  }
  function removeSeries(index) { removeFromList('series', index) }
  function addSeriesData(sIndex) {
    if (draftProps.value.series && draftProps.value.series[sIndex]) {
      draftProps.value.series[sIndex].data.push(0)
    }
  }

  // 饼图数据
  function addPieData() {
    addToList('data', { value: 0, name: '新数据' })
  }
  function removePieData(index) { removeFromList('data', index) }

  // 雷达图指标
  function addIndicator() {
    if (draftProps.value.indicators) {
      draftProps.value.indicators.push({ name: '新指标', max: 100 })
      if (draftProps.value.series) {
        draftProps.value.series.forEach(s => { s.data.push(0) })
      }
    }
  }
  function removeIndicator(index) {
    if (draftProps.value.indicators) {
      draftProps.value.indicators.splice(index, 1)
      if (draftProps.value.series) {
        draftProps.value.series.forEach(s => { s.data.splice(index, 1) })
      }
    }
  }

  // 树节点
  function addTreeNode() {
    addToList('data', { label: '新节点', children: [] })
  }
  function removeTreeNode(index) { removeFromList('data', index) }
  function addChildNode(node) {
    if (!node.children) node.children = []
    node.children.push({ label: '子节点', children: [] })
  }
  function removeChildNode(node, index) {
    if (node.children) node.children.splice(index, 1)
  }
  function addGrandchildNode(child) {
    if (!child.children) child.children = []
    child.children.push({ label: '子节点' })
  }
  function removeGrandchildNode(child, index) {
    if (child.children) child.children.splice(index, 1)
  }

  return {
    addOption, removeOption,
    addTab, removeTab,
    addCollapseItem, removeCollapseItem,
    addBreadcrumbItem, removeBreadcrumbItem,
    addColumn, removeColumn,
    addDataRow, removeDataRow,
    addCarouselImage, removeCarouselImage,
    addXData, removeXData,
    addSeries, removeSeries, addSeriesData,
    addPieData, removePieData,
    addIndicator, removeIndicator,
    addTreeNode, removeTreeNode,
    addChildNode, removeChildNode,
    addGrandchildNode, removeGrandchildNode
  }
}
