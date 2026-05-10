<template>
  <div class="event-config-panel">
    <div v-if="!component" class="empty-tip">请选择组件</div>
    <template v-else>
      <div class="event-list">
        <div v-for="(evt, evtIndex) in localEvents" :key="evt.id" class="event-item">
          <div class="event-header">
            <el-select v-model="evt.trigger.type" size="small" style="width: 120px" @change="emitUpdate">
              <el-option label="点击" value="click" />
              <el-option label="值变化" value="valueChange" />
              <el-option label="加载" value="mount" />
            </el-select>
            <el-button size="small" type="danger" text @click="removeEvent(evtIndex)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>

          <div class="action-list">
            <div v-for="(action, actIndex) in evt.actions" :key="action.id" class="action-item">
              <div class="action-row">
                <el-select v-model="action.type" size="small" style="width: 110px" @change="onActionTypeChange(action)">
                  <el-option label="显示组件" value="showComponent" />
                  <el-option label="隐藏组件" value="hideComponent" />
                  <el-option label="设置变量" value="setVariable" />
                  <el-option label="设置属性" value="setProps" />
                  <el-option label="重置表单" value="resetForm" />
                </el-select>
                <el-button size="small" text @click="removeAction(evtIndex, actIndex)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>

              <!-- 目标组件选择 -->
              <div v-if="['showComponent', 'hideComponent', 'setProps'].includes(action.type)" class="action-field">
                <span class="field-label">目标:</span>
                <el-select v-model="action.targetId" size="small" placeholder="选择组件" style="flex:1" @change="onTargetChange(action)">
                  <el-option
                    v-for="comp in allComponents"
                    :key="comp.id"
                    :label="`${comp.name} (${comp.id})`"
                    :value="comp.id"
                  />
                </el-select>
              </div>

              <!-- 变量名 -->
              <div v-if="action.type === 'setVariable'" class="action-field">
                <span class="field-label">变量:</span>
                <el-input v-model="action.key" size="small" placeholder="变量名" style="flex:1" @change="emitUpdate" />
              </div>

              <!-- 值 -->
              <div v-if="['setVariable'].includes(action.type)" class="action-field">
                <span class="field-label">值:</span>
                <el-input v-model="action.value" size="small" placeholder="值或表达式 {{ }}" style="flex:1" @change="emitUpdate" />
              </div>

              <!-- setProps 属性选择 -->
              <template v-if="action.type === 'setProps'">
                <div class="action-field">
                  <span class="field-label">属性:</span>
                  <el-select v-model="action._propKey" size="small" placeholder="选择属性" style="flex:1" @change="onPropKeyChange(action)">
                    <el-option
                      v-for="prop in getAvailableProps(action.targetId)"
                      :key="prop.key"
                      :label="prop.label"
                      :value="prop.key"
                    />
                  </el-select>
                </div>
                <div v-if="action._propKey" class="action-field">
                  <span class="field-label">值:</span>
                  <!-- 布尔类型显示开关 -->
                  <el-switch
                    v-if="getPropType(action.targetId, action._propKey) === 'boolean'"
                    v-model="action._propValue"
                    size="small"
                    @change="onPropValueChange(action)"
                  />
                  <!-- 选项类型显示下拉 -->
                  <el-select
                    v-else-if="getPropType(action.targetId, action._propKey) === 'select'"
                    v-model="action._propValue"
                    size="small"
                    placeholder="选择值"
                    style="flex:1"
                    @change="onPropValueChange(action)"
                  >
                    <el-option
                      v-for="opt in getPropOptions(action.targetId, action._propKey)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <!-- 其他类型显示输入框 -->
                  <el-input
                    v-else
                    v-model="action._propValue"
                    size="small"
                    :placeholder="getPropPlaceholder(action.targetId, action._propKey)"
                    style="flex:1"
                    @change="onPropValueChange(action)"
                  />
                </div>
              </template>
            </div>

            <el-button size="small" type="primary" text @click="addAction(evtIndex)">
              <el-icon><Plus /></el-icon> 添加动作
            </el-button>
          </div>
        </div>
      </div>

      <el-button size="small" type="primary" @click="addEvent">
        <el-icon><Plus /></el-icon> 添加事件
      </el-button>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Delete, Close, Plus } from '@element-plus/icons-vue'
import { useEditorStore } from '../../../stores/editor'
import { componentConfigs } from '../../../config/components'

const props = defineProps({
  component: { type: Object, default: null }
})

const emit = defineEmits(['update'])
const store = useEditorStore()

const localEvents = ref([])

// 获取所有组件（扁平化）
const allComponents = computed(() => {
  const result = []
  function walk(components) {
    for (const comp of components) {
      result.push({ id: comp.id, name: comp.name, type: comp.type })
      if (comp.children) walk(comp.children)
    }
  }
  walk(store.pageConfig.components)
  return result
})

// 监听组件变化，同步事件配置
watch(() => props.component, (comp) => {
  if (comp) {
    localEvents.value = JSON.parse(JSON.stringify(comp.events || []))
  } else {
    localEvents.value = []
  }
}, { immediate: true, deep: true })

let idCounter = 0
function genId() {
  return 'evt_' + (++idCounter) + '_' + Math.random().toString(36).slice(2, 6)
}

// 属性配置映射表 - 定义每个组件可设置的属性及其类型
const propConfigMap = {
  button: [
    { key: 'text', label: '按钮文字', type: 'string' },
    { key: 'type', label: '按钮类型', type: 'select', options: [
      { label: '默认', value: 'default' },
      { label: '主要', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '信息', value: 'info' }
    ]},
    { key: 'size', label: '尺寸', type: 'select', options: [
      { label: '大', value: 'large' },
      { label: '默认', value: 'default' },
      { label: '小', value: 'small' }
    ]},
    { key: 'disabled', label: '禁用', type: 'boolean' },
    { key: 'round', label: '圆角', type: 'boolean' }
  ],
  text: [
    { key: 'content', label: '文本内容', type: 'string' },
    { key: 'tag', label: '标签类型', type: 'select', options: [
      { label: '段落', value: 'p' },
      { label: '标题1', value: 'h1' },
      { label: '标题2', value: 'h2' },
      { label: '标题3', value: 'h3' },
      { label: 'span', value: 'span' }
    ]}
  ],
  input: [
    { key: 'placeholder', label: '占位文本', type: 'string' },
    { key: 'modelValue', label: '绑定值', type: 'string' },
    { key: 'type', label: '输入类型', type: 'select', options: [
      { label: '文本', value: 'text' },
      { label: '密码', value: 'password' },
      { label: '数字', value: 'number' }
    ]},
    { key: 'disabled', label: '禁用', type: 'boolean' },
    { key: 'clearable', label: '可清空', type: 'boolean' }
  ],
  image: [
    { key: 'src', label: '图片地址', type: 'string' },
    { key: 'alt', label: '替代文本', type: 'string' },
    { key: 'fit', label: '填充模式', type: 'select', options: [
      { label: '填充', value: 'fill' },
      { label: '包含', value: 'contain' },
      { label: '覆盖', value: 'cover' },
      { label: '无', value: 'none' },
      { label: '缩放', value: 'scale-down' }
    ]}
  ],
  select: [
    { key: 'placeholder', label: '占位文本', type: 'string' },
    { key: 'modelValue', label: '绑定值', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' },
    { key: 'clearable', label: '可清空', type: 'boolean' }
  ],
  radio: [
    { key: 'modelValue', label: '绑定值', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' }
  ],
  checkbox: [
    { key: 'disabled', label: '禁用', type: 'boolean' }
  ],
  switchComp: [
    { key: 'modelValue', label: '绑定值', type: 'boolean' },
    { key: 'activeText', label: '开启文字', type: 'string' },
    { key: 'inactiveText', label: '关闭文字', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' }
  ],
  textarea: [
    { key: 'placeholder', label: '占位文本', type: 'string' },
    { key: 'modelValue', label: '绑定值', type: 'string' },
    { key: 'rows', label: '行数', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' },
    { key: 'maxlength', label: '最大长度', type: 'string' },
    { key: 'showWordLimit', label: '显示字数', type: 'boolean' }
  ],
  rate: [
    { key: 'modelValue', label: '评分值', type: 'string' },
    { key: 'max', label: '最大分值', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' },
    { key: 'showText', label: '显示文字', type: 'boolean' }
  ],
  slider: [
    { key: 'modelValue', label: '绑定值', type: 'string' },
    { key: 'min', label: '最小值', type: 'string' },
    { key: 'max', label: '最大值', type: 'string' },
    { key: 'step', label: '步长', type: 'string' },
    { key: 'disabled', label: '禁用', type: 'boolean' }
  ],
  progress: [
    { key: 'percentage', label: '百分比', type: 'string' },
    { key: 'showText', label: '显示文字', type: 'boolean' },
    { key: 'textInside', label: '文字内置', type: 'boolean' },
    { key: 'color', label: '颜色', type: 'string' }
  ],
  badge: [
    { key: 'value', label: '值', type: 'string' },
    { key: 'max', label: '最大值', type: 'string' },
    { key: 'isDot', label: '小圆点', type: 'boolean' },
    { key: 'hidden', label: '隐藏', type: 'boolean' },
    { key: 'text', label: '内容文字', type: 'string' }
  ],
  tag: [
    { key: 'text', label: '标签文字', type: 'string' },
    { key: 'type', label: '标签类型', type: 'select', options: [
      { label: '默认', value: '' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '信息', value: 'info' }
    ]},
    { key: 'effect', label: '效果', type: 'select', options: [
      { label: '浅色', value: 'light' },
      { label: '深色', value: 'dark' },
      { label: '朴素', value: 'plain' }
    ]},
    { key: 'closable', label: '可关闭', type: 'boolean' }
  ],
  alert: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'description', label: '描述', type: 'string' },
    { key: 'type', label: '类型', type: 'select', options: [
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'error' },
      { label: '信息', value: 'info' }
    ]},
    { key: 'showIcon', label: '显示图标', type: 'boolean' },
    { key: 'closable', label: '可关闭', type: 'boolean' }
  ],
  avatar: [
    { key: 'src', label: '图片地址', type: 'string' },
    { key: 'shape', label: '形状', type: 'select', options: [
      { label: '圆形', value: 'circle' },
      { label: '方形', value: 'square' }
    ]},
    { key: 'size', label: '大小', type: 'string' }
  ],
  pagination: [
    { key: 'total', label: '总条数', type: 'string' },
    { key: 'pageSize', label: '每页条数', type: 'string' }
  ],
  statistic: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'value', label: '数值', type: 'string' },
    { key: 'prefix', label: '前缀', type: 'string' },
    { key: 'suffix', label: '后缀', type: 'string' },
    { key: 'precision', label: '精度', type: 'string' }
  ],
  container: [
    { key: 'minHeight', label: '最小高度', type: 'string' }
  ],
  card: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'showHeader', label: '显示头部', type: 'boolean' }
  ],
  tabs: [
    { key: 'activeTab', label: '激活标签', type: 'string' }
  ],
  lineChart: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'showLegend', label: '显示图例', type: 'boolean' },
    { key: 'smooth', label: '平滑曲线', type: 'boolean' }
  ],
  barChart: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'showLegend', label: '显示图例', type: 'boolean' }
  ],
  pieChart: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'showLegend', label: '显示图例', type: 'boolean' },
    { key: 'roseType', label: '玫瑰图', type: 'boolean' },
    { key: 'radius', label: '半径', type: 'string' }
  ],
  gaugeChart: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'value', label: '值', type: 'string' },
    { key: 'min', label: '最小值', type: 'string' },
    { key: 'max', label: '最大值', type: 'string' }
  ]
}

// 获取目标组件可设置的属性列表
function getAvailableProps(targetId) {
  const comp = allComponents.value.find(c => c.id === targetId)
  if (!comp) return []
  const config = propConfigMap[comp.type]
  if (!config) return []
  return config
}

// 获取属性类型
function getPropType(targetId, propKey) {
  const comp = allComponents.value.find(c => c.id === targetId)
  if (!comp) return 'string'
  const config = propConfigMap[comp.type]
  if (!config) return 'string'
  const prop = config.find(p => p.key === propKey)
  return prop ? prop.type : 'string'
}

// 获取属性选项（用于 select 类型）
function getPropOptions(targetId, propKey) {
  const comp = allComponents.value.find(c => c.id === targetId)
  if (!comp) return []
  const config = propConfigMap[comp.type]
  if (!config) return []
  const prop = config.find(p => p.key === propKey)
  return prop ? (prop.options || []) : []
}

// 获取属性占位文本
function getPropPlaceholder(targetId, propKey) {
  const comp = allComponents.value.find(c => c.id === targetId)
  if (!comp) return '请输入值'
  const config = propConfigMap[comp.type]
  if (!config) return '请输入值'
  const prop = config.find(p => p.key === propKey)
  return prop ? `请输入${prop.label}` : '请输入值'
}

// 动作类型变化
function onActionTypeChange(action) {
  if (action.type === 'setProps') {
    action._propKey = ''
    action._propValue = ''
    action.props = {}
  }
  emitUpdate()
}

// 目标组件变化
function onTargetChange(action) {
  action._propKey = ''
  action._propValue = ''
  action.props = {}
  emitUpdate()
}

// 属性名变化
function onPropKeyChange(action) {
  action._propValue = ''
  if (action._propKey) {
    const propType = getPropType(action.targetId, action._propKey)
    if (propType === 'boolean') {
      action._propValue = false
    }
  }
  action.props = {}
  if (action._propKey) {
    action.props[action._propKey] = action._propValue
  }
  emitUpdate()
}

// 属性值变化
function onPropValueChange(action) {
  if (!action.props) action.props = {}
  if (action._propKey) {
    action.props[action._propKey] = action._propValue
  }
  emitUpdate()
}

function addEvent() {
  localEvents.value.push({
    id: genId(),
    trigger: { type: 'click' },
    actions: []
  })
  emitUpdate()
}

function removeEvent(index) {
  localEvents.value.splice(index, 1)
  emitUpdate()
}

function addAction(evtIndex) {
  localEvents.value[evtIndex].actions.push({
    id: genId(),
    type: 'showComponent',
    targetId: '',
    key: '',
    value: '',
    props: {},
    _propKey: '',
    _propValue: ''
  })
  emitUpdate()
}

function removeAction(evtIndex, actIndex) {
  localEvents.value[evtIndex].actions.splice(actIndex, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update', JSON.parse(JSON.stringify(localEvents.value)))
}
</script>

<style scoped>
.event-config-panel {
  padding: 0;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.event-list {
  margin-bottom: 12px;
}

.event-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 8px;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.action-list {
  padding-left: 8px;
}

.action-item {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 6px;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.action-field {
  display: flex;
  align-items: center;
  margin-top: 4px;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  min-width: 32px;
}
</style>
