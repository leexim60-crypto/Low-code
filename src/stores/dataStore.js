import { defineStore } from 'pinia'
import { ref, reactive, computed, toRaw } from 'vue'
import { resolveValue } from '../utils/expressionEngine'

/**
 * 数据源 Store - 管理表单数据、用户变量、组件运行时状态
 */
export const useDataStore = defineStore('data', () => {
  // ========== 表单数据（表单组件自动注册） ==========
  const formData = reactive({})

  // ========== 用户自定义变量 ==========
  const variables = reactive({})

  // ========== 组件运行时状态（可见性、额外属性） ==========
  const componentRuntimeState = reactive({})

  // ========== 计算属性 ==========

  /**
   * 获取表达式求值上下文
   */
  const context = computed(() => ({
    formData: toRaw(formData),
    variables: toRaw(variables)
  }))

  // ========== 表单数据操作 ==========

  /**
   * 注册表单组件（添加组件时调用）
   */
  function registerFormComponent(componentId, defaultValue = '') {
    if (!(componentId in formData)) {
      formData[componentId] = defaultValue
    }
  }

  /**
   * 注销表单组件（删除组件时调用）
   */
  function unregisterFormComponent(componentId) {
    delete formData[componentId]
  }

  /**
   * 更新表单值（表单组件交互时调用）
   */
  function updateFormValue(componentId, value) {
    formData[componentId] = value
  }

  /**
   * 获取表单值
   */
  function getFormValue(componentId) {
    return formData[componentId]
  }

  // ========== 变量操作 ==========

  /**
   * 设置用户变量
   */
  function setVariable(key, value) {
    variables[key] = value
  }

  /**
   * 删除用户变量
   */
  function removeVariable(key) {
    delete variables[key]
  }

  /**
   * 批量设置变量
   */
  function setVariables(vars) {
    Object.assign(variables, vars)
  }

  // ========== 组件运行时状态 ==========

  /**
   * 确保组件运行时状态存在
   */
  function ensureRuntimeState(componentId) {
    if (!componentRuntimeState[componentId]) {
      componentRuntimeState[componentId] = {
        visible: true,
        extraProps: {}
      }
    }
    return componentRuntimeState[componentId]
  }

  /**
   * 设置组件可见性
   */
  function setComponentVisible(componentId, visible) {
    const state = ensureRuntimeState(componentId)
    state.visible = visible
  }

  /**
   * 获取组件可见性
   */
  function isComponentVisible(componentId) {
    const state = componentRuntimeState[componentId]
    return state ? state.visible : true // 默认可见
  }

  /**
   * 设置组件额外属性（联动覆盖）
   */
  function setComponentExtraProps(componentId, props) {
    const state = ensureRuntimeState(componentId)
    Object.assign(state.extraProps, props)
  }

  /**
   * 获取组件额外属性
   */
  function getComponentExtraProps(componentId) {
    const state = componentRuntimeState[componentId]
    return state ? state.extraProps : {}
  }

  /**
   * 清除组件运行时状态
   */
  function clearRuntimeState(componentId) {
    delete componentRuntimeState[componentId]
  }

  // ========== 动作执行器 ==========

  /**
   * 执行单个动作
   */
  function executeAction(action) {
    // 解析动作中的表达式值
    const resolvedValue = action.value
      ? resolveValue(action.value, context.value)
      : undefined

    switch (action.type) {
      case 'showComponent':
        if (action.targetId) setComponentVisible(action.targetId, true)
        break

      case 'hideComponent':
        if (action.targetId) setComponentVisible(action.targetId, false)
        break

      case 'setVariable':
        if (action.key) setVariable(action.key, resolvedValue)
        break

      case 'setProps':
        if (action.targetId && action.props) {
          const resolvedProps = {}
          for (const [key, val] of Object.entries(action.props)) {
            resolvedProps[key] = resolveValue(val, context.value)
          }
          setComponentExtraProps(action.targetId, resolvedProps)
        }
        break

      case 'resetForm':
        Object.keys(formData).forEach(key => {
          formData[key] = typeof formData[key] === 'boolean' ? false : ''
        })
        break

      default:
        console.warn(`[EventBus] 未知动作类型: ${action.type}`)
    }
  }

  /**
   * 执行一组动作
   */
  function executeActions(actions) {
    if (!actions || !Array.isArray(actions)) return
    actions.forEach(action => executeAction(action))
  }

  // ========== 初始化表单数据 ==========

  /**
   * 从组件树中批量注册表单组件
   */
  function initFormDataFromComponents(components) {
    const formTypes = ['input', 'select', 'radio', 'checkbox', 'switchComp', 'textarea', 'datePicker', 'timePicker', 'rate', 'slider']

    for (const comp of components) {
      if (formTypes.includes(comp.type)) {
        registerFormComponent(comp.id, comp.props.modelValue ?? '')
      }
      if (comp.children) {
        initFormDataFromComponents(comp.children)
      }
    }
  }

  /**
   * 重置所有运行时状态（预览/编辑切换时用）
   */
  function resetAll() {
    Object.keys(formData).forEach(key => delete formData[key])
    Object.keys(variables).forEach(key => delete variables[key])
    Object.keys(componentRuntimeState).forEach(key => delete componentRuntimeState[key])
  }

  return {
    // 状态
    formData,
    variables,
    componentRuntimeState,
    context,

    // 表单操作
    registerFormComponent,
    unregisterFormComponent,
    updateFormValue,
    getFormValue,

    // 变量操作
    setVariable,
    removeVariable,
    setVariables,

    // 运行时状态
    ensureRuntimeState,
    setComponentVisible,
    isComponentVisible,
    setComponentExtraProps,
    getComponentExtraProps,
    clearRuntimeState,

    // 动作执行
    executeAction,
    executeActions,

    // 初始化
    initFormDataFromComponents,
    resetAll
  }
})
