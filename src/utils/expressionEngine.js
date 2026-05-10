/**
 * 表达式引擎 - 支持 {{ formData.xxx }} 变量绑定
 *
 * 三种表达式类型：
 * 1. 纯表达式: "{{ expr }}" -> 直接求值返回
 * 2. 模板字符串: "prefix {{ expr }} suffix" -> 字符串插值
 * 3. 字面量: "普通文字" -> 原样返回
 */

const EXPRESSION_REGEX = /\{\{\s*([^}]+)\s*\}\}/g

/**
 * 判断字符串是否包含表达式
 */
export function isExpression(value) {
  return typeof value === 'string' && EXPRESSION_REGEX.test(value)
}

/**
 * 判断字符串是否是纯表达式（整个字符串就是一个表达式）
 */
export function isPureExpression(value) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return /^\{\{\s*[^}]+\s*\}\}$/.test(trimmed)
}

/**
 * 安全求值表达式
 * @param {string} expression - 表达式内容（不含 {{ }}）
 * @param {object} context - 上下文对象 { formData, variables }
 * @returns {*} 求值结果
 */
export function evaluate(expression, context) {
  try {
    const keys = Object.keys(context)
    const values = Object.values(context)
    // 使用 Function 构造器，限制作用域
    const fn = new Function(...keys, `return (${expression})`)
    return fn(...values)
  } catch (err) {
    console.warn(`[表达式求值错误] ${expression}:`, err.message)
    return undefined
  }
}

/**
 * 模板字符串插值
 * @param {string} template - 包含 {{ }} 的模板字符串
 * @param {object} context - 上下文对象
 * @returns {string} 插值后的字符串
 */
export function interpolate(template, context) {
  return template.replace(EXPRESSION_REGEX, (match, expr) => {
    const value = evaluate(expr.trim(), context)
    return value !== undefined && value !== null ? String(value) : ''
  })
}

/**
 * 解析单个 prop 值
 * @param {*} value - prop 值
 * @param {object} context - 上下文对象
 * @returns {*} 解析后的值
 */
export function resolveValue(value, context) {
  if (typeof value !== 'string') return value
  if (!EXPRESSION_REGEX.test(value)) return value

  // 重置 regex 状态
  EXPRESSION_REGEX.lastIndex = 0

  if (isPureExpression(value)) {
    // 纯表达式：返回原始类型（数字、布尔、对象等）
    const expr = value.trim().slice(2, -2).trim()
    return evaluate(expr, context)
  }

  // 模板字符串：返回字符串
  EXPRESSION_REGEX.lastIndex = 0
  return interpolate(value, context)
}

/**
 * 批量解析组件的所有 props
 * @param {object} props - 组件的 props 对象
 * @param {object} context - 上下文对象
 * @returns {object} 解析后的新 props 对象
 */
export function resolveProps(props, context) {
  const resolved = {}
  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveValue(value, context)
  }
  return resolved
}
