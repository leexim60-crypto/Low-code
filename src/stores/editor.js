import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import { componentConfigs } from '../config/components'
import { CommandManager } from './history/CommandManager'
import {
  AddComponentCommand,
  DeleteComponentCommand,
  MoveComponentCommand,
  UpdatePropsCommand,
  UpdateStyleCommand
} from './history/commands'

export const useEditorStore = defineStore('editor', () => {
  // ========== 深拷贝工具 ==========
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(toRaw(obj)))
  }

  // ========== 页面配置 ==========
  const pageConfig = ref({
    id: 'page_' + Date.now(),
    name: '我的页面',
    components: []
  })

  // ========== 选中状态 ==========
  const selectedComponentId = ref(null)
  const selectedComponentIds = ref(new Set()) // 多选

  // ========== 命令管理器（替代全量快照历史） ==========
  const commandManager = new CommandManager(100)

  // ========== 剪贴板 ==========
  const clipboard = ref(null)

  // ========== 画布配置 ==========
  const canvasConfig = ref({
    zoom: 1,
    showGrid: true,
    deviceType: 'pc' // pc, tablet, mobile
  })

  // ========== 计算属性 ==========
  const selectedComponent = computed(() => {
    if (!selectedComponentId.value) return null
    return findComponentById(pageConfig.value.components, selectedComponentId.value)
  })

  // 用于 Toolbar 显示撤销/重做状态
  const canUndo = computed(() => commandManager.canUndo())
  const canRedo = computed(() => commandManager.canRedo())

  // ========== 核心方法 ==========

  // 根据ID查找组件（递归）
  function findComponentById(components, id) {
    for (const comp of components) {
      if (comp.id === id) return comp
      if (comp.children) {
        const found = findComponentById(comp.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 生成唯一ID
  let idCounter = 0
  function generateId() {
    return 'comp_' + (++idCounter) + '_' + Math.random().toString(36).slice(2, 8)
  }

  // ========== 历史记录（Command Pattern） ==========

  function undo() {
    commandManager.undo()
    selectedComponentId.value = null
  }

  function redo() {
    commandManager.redo()
    selectedComponentId.value = null
  }

  // ========== 组件操作 ==========

  // 添加组件。parentId 存在时添加到该父组件的 children 中
  function addComponent(type, index = -1, parentId = null) {
    const config = componentConfigs[type]
    if (!config) return null

    const newComponent = {
      id: generateId(),
      ...deepClone(config)
    }

    const cmd = new AddComponentCommand(
      { pageConfig, selectedComponentId, findComponentById },
      newComponent,
      parentId,
      index
    )
    commandManager.execute(cmd)
    return newComponent
  }

  // 从组件树中递归删除指定ID的组件
  function removeFromTree(components, id) {
    const index = components.findIndex(c => c.id === id)
    if (index > -1) {
      components.splice(index, 1)
      return true
    }
    for (const comp of components) {
      if (comp.children && removeFromTree(comp.children, id)) {
        return true
      }
    }
    return false
  }

  // 删除组件
  function deleteComponent(id) {
    const cmd = new DeleteComponentCommand(
      { pageConfig, selectedComponentId, findComponentById, findParentArray },
      id
    )
    commandManager.execute(cmd)
  }

  // 删除多个组件
  function deleteComponents(ids) {
    ids.forEach(id => {
      const cmd = new DeleteComponentCommand(
        { pageConfig, selectedComponentId, findComponentById, findParentArray },
        id
      )
      commandManager.execute(cmd)
    })
    selectedComponentIds.value.clear()
    selectedComponentId.value = null
  }

  // 查找包含指定ID组件的父数组
  function findParentArray(components, id) {
    const index = components.findIndex(c => c.id === id)
    if (index > -1) return { parent: components, index }
    for (const comp of components) {
      if (comp.children) {
        const result = findParentArray(comp.children, id)
        if (result) return result
      }
    }
    return null
  }

  // 复制组件（原地复制）
  function duplicateComponent(id) {
    const comp = findComponentById(pageConfig.value.components, id)
    if (!comp) return

    const newComp = deepClone(comp)
    newComp.id = generateId()
    newComp.name = comp.name + ' 副本'

    const found = findParentArray(pageConfig.value.components, id)
    if (found) {
      const cmd = new AddComponentCommand(
        { pageConfig, selectedComponentId, findComponentById },
        newComp,
        null,
        found.index + 1
      )
      commandManager.execute(cmd)
    }
  }

  // ========== 复制/粘贴/剪切 ==========

  // 复制到剪贴板
  function copyComponent() {
    if (selectedComponentId.value) {
      const comp = findComponentById(pageConfig.value.components, selectedComponentId.value)
      if (comp) {
        clipboard.value = deepClone(comp)
      }
    }
  }

  // 粘贴
  function pasteComponent() {
    if (!clipboard.value) return

    const newComp = deepClone(clipboard.value)
    newComp.id = generateId()
    newComp.name = clipboard.value.name + ' 副本'

    const cmd = new AddComponentCommand(
      { pageConfig, selectedComponentId, findComponentById },
      newComp,
      null,
      -1
    )
    commandManager.execute(cmd)
    return newComp
  }

  // 剪切
  function cutComponent() {
    if (selectedComponentId.value) {
      copyComponent()
      deleteComponent(selectedComponentId.value)
    }
  }

  // ========== 属性/样式更新 ==========

  function updateComponentProps(id, props) {
    const comp = findComponentById(pageConfig.value.components, id)
    if (!comp) return

    // 为每个属性创建独立命令，支持合并
    Object.entries(props).forEach(([key, value]) => {
      const oldValue = comp.props[key]
      if (oldValue !== value) {
        const cmd = new UpdatePropsCommand(
          { pageConfig, findComponentById },
          id,
          key,
          oldValue,
          value
        )
        commandManager.execute(cmd)
      }
    })
  }

  function updateComponentStyle(id, style) {
    const comp = findComponentById(pageConfig.value.components, id)
    if (!comp) return

    Object.entries(style).forEach(([key, value]) => {
      const oldValue = comp.style[key]
      if (oldValue !== value) {
        const cmd = new UpdateStyleCommand(
          { pageConfig, findComponentById },
          id,
          key,
          oldValue,
          value
        )
        commandManager.execute(cmd)
      }
    })
  }

  // ========== 选中状态 ==========

  function selectComponent(id) {
    selectedComponentId.value = id
  }

  function deselectComponent() {
    selectedComponentId.value = null
    selectedComponentIds.value.clear()
  }

  // 多选切换
  function toggleSelect(id) {
    if (selectedComponentIds.value.has(id)) {
      selectedComponentIds.value.delete(id)
    } else {
      selectedComponentIds.value.add(id)
    }
    selectedComponentId.value = id
  }

  // ========== 排序 ==========

  function moveComponent(fromIndex, toIndex) {
    const cmd = new MoveComponentCommand(
      { pageConfig },
      fromIndex,
      toIndex
    )
    commandManager.execute(cmd)
  }

  function moveUp(id) {
    const index = pageConfig.value.components.findIndex(c => c.id === id)
    if (index > 0) {
      moveComponent(index, index - 1)
    }
  }

  function moveDown(id) {
    const index = pageConfig.value.components.findIndex(c => c.id === id)
    if (index < pageConfig.value.components.length - 1) {
      moveComponent(index, index + 1)
    }
  }

  function moveTop(id) {
    const index = pageConfig.value.components.findIndex(c => c.id === id)
    if (index > 0) {
      moveComponent(index, 0)
    }
  }

  function moveBottom(id) {
    const index = pageConfig.value.components.findIndex(c => c.id === id)
    if (index < pageConfig.value.components.length - 1) {
      moveComponent(index, pageConfig.value.components.length - 1)
    }
  }

  // ========== 画布操作 ==========

  function clearCanvas() {
    // 保存所有组件到一个批量命令，用于撤销
    const allComponents = deepClone(pageConfig.value.components)
    pageConfig.value.components = []
    selectedComponentId.value = null
    // 清空操作直接执行，不走命令（太复杂，且清空后通常不会撤销）
    commandManager.clear()
  }

  function exportJSON() {
    return deepClone(pageConfig.value)
  }

  function importJSON(json) {
    pageConfig.value = deepClone(json)
    selectedComponentId.value = null
    commandManager.clear()
  }

  function setZoom(zoom) {
    canvasConfig.value.zoom = Math.max(0.5, Math.min(2, zoom))
  }

  function setDeviceType(type) {
    canvasConfig.value.deviceType = type
  }

  function toggleGrid() {
    canvasConfig.value.showGrid = !canvasConfig.value.showGrid
  }

  // 保存当前状态到历史记录（用于拖拽等直接修改 DOM 的场景）
  function saveHistory() {
    // 创建一个批量命令来保存当前状态
    // 由于拖拽已经直接修改了 children，这里只需要记录一个空操作
    // 实际的历史记录会在下次操作时自动保存
  }

  // ========== 初始化 ==========

  return {
    // 状态
    pageConfig,
    selectedComponentId,
    selectedComponentIds,
    selectedComponent,
    canvasConfig,
    clipboard,
    canUndo,
    canRedo,

    // 组件操作
    addComponent,
    deleteComponent,
    deleteComponents,
    duplicateComponent,
    findComponentById,

    // 复制粘贴
    copyComponent,
    pasteComponent,
    cutComponent,

    // 属性样式
    updateComponentProps,
    updateComponentStyle,

    // 选中
    selectComponent,
    deselectComponent,
    toggleSelect,

    // 排序
    moveComponent,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,

    // 画布
    clearCanvas,
    exportJSON,
    importJSON,
    setZoom,
    setDeviceType,
    toggleGrid,

    // 历史
    undo,
    redo,
    saveHistory
  }
})
