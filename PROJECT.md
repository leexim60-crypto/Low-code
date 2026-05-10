# 项目文档 - Low-Code 低代码可视化编辑平台

本文档详细描述项目的架构设计、核心逻辑和各模块的实现方式。

---

## 目录

- [整体架构](#整体架构)
- [数据流](#数据流)
- [组件体系](#组件体系)
- [渲染引擎](#渲染引擎)
- [拖拽系统](#拖拽系统)
- [事件联动系统](#事件联动系统)
- [表达式引擎](#表达式引擎)
- [撤销重做（命令模式）](#撤销重做命令模式)
- [属性与样式配置](#属性与样式配置)
- [导出与预览](#导出与预览)
- [各文件详细说明](#各文件详细说明)

---

## 整体架构

编辑器采用经典的 **三栏布局**：

```
┌───────────────────────────────────────────────────────────────┐
│                      Toolbar（顶部工具栏）                      │
│   撤销/重做 │ 复制/删除/排序 │ 设备切换 │ 网格 │ 缩放 │ 导入导出  │
├──────────┬──────────────────────────────┬─────────────────────┤
│          │                              │                     │
│  Left    │          Canvas              │    Right            │
│  Panel   │        （画布区域）            │    Panel            │
│（物料库） │                              │  （配置面板）         │
│          │   ┌───────────────────┐      │                     │
│ 基础组件  │   │                   │      │  属性配置 Tab        │
│ 表单组件  │   │   组件渲染区域     │      │  样式配置 Tab        │
│ 布局组件  │   │   （拖拽/选中）    │      │  事件配置 Tab        │
│ 高级组件  │   │                   │      │                     │
│ 图表组件  │   └───────────────────┘      │                     │
│ 数据展示  │                              │                     │
└──────────┴──────────────────────────────┴─────────────────────┘
```

核心思想：**JSON Schema 描述页面 -> 渲染引擎解析 JSON -> 生成可视化页面**

所有组件在内存中以 JSON 树形结构存储，画布上的渲染、属性配置、导入导出都围绕这份 JSON 展开。

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 (Composition API, `<script setup>`) | ^3.5.32 |
| 构建工具 | Vite | ^8.0.10 |
| 状态管理 | Pinia | ^3.0.4 |
| UI 组件库 | Element Plus | ^2.13.7 |
| 图表库 | ECharts | ^6.0.0 |
| 拖拽库 | vue-draggable-plus | ^0.6.1 |
| 图标库 | @element-plus/icons-vue | ^2.3.2 |

- 纯 JavaScript 项目，未使用 TypeScript
- 无路由（单页应用，整个页面就是编辑器）
- 无后端，纯客户端实现

---

## 数据流

```
用户操作（拖拽 / 点击 / 配置）
        │
        ▼
  Pinia Store（editor.js）── 唯一数据源
        │  ├─ pageConfig.components[]  组件树
        │  ├─ selectedComponentId      当前选中
        │  ├─ canvasConfig             画布设置
        │  └─ commandManager           命令栈
        │
        ▼
  Vue 响应式组件
        │  ├─ Canvas 读取 pageConfig.components -> RenderComponent 渲染
        │  ├─ RightPanel 读取 selectedComponent -> 展示配置表单
        │  └─ Toolbar 读取 canUndo/canRedo -> 控制按钮状态
        │
        ▼
  RenderComponent（渲染调度器）
        │  ├─ 解析表达式（expressionEngine）
        │  ├─ 合并联动属性（dataStore.extraProps）
        │  └─ 检查可见性（dataStore.isComponentVisible）
        │
        ▼
  分类渲染器（Base / Form / Layout / Advanced / Chart / Data）
        │
        ▼
  画布上的可视化输出
```

### 两个 Store 的分工

| Store | 职责 | 数据 |
|-------|------|------|
| `editor.js` | 编辑器状态管理：组件树、选中、撤销重做、画布配置 | `pageConfig`, `selectedComponentId`, `canvasConfig` |
| `dataStore.js` | 运行时数据：表单值、用户变量、组件可见性、联动属性 | `formData`, `variables`, `componentRuntimeState` |

`editor.js` 管「有哪些组件、长什么样」，`dataStore.js` 管「运行时数据是什么、组件是否可见」。

---

## 组件体系

### 组件注册表

文件：`src/config/components.js`

导出两个东西：

**`componentConfigs`** — 以组件类型字符串为 key 的配置对象，每个条目包含：

```js
{
  type: 'button',           // 类型标识符
  name: '按钮',             // 中文显示名
  icon: 'Pointer',          // Element Plus 图标名
  category: 'base',         // 所属分类
  props: {                  // 属性默认值
    text: '按钮',
    type: 'primary',
    size: 'default',
    disabled: false,
    round: false
  },
  style: {                  // 样式默认值
    width: 'auto',
    height: 'auto'
  },
  events: [],               // 事件配置（初始为空）
  children: []              // 仅布局组件有此字段
}
```

**`componentCategories`** — 6 个分类的元信息，用于左侧面板分组展示。

### 组件 ID 生成

`editor.js` 中的 `generateId()` 函数生成唯一 ID：

```
comp_1_a3b2c4
│    │ │
│    │ └── 6 位随机字符串
│    └── 递增计数器
└── 固定前缀
```

### 37 种组件

| 分类 | 数量 | 组件 |
|------|------|------|
| 基础 | 7 | button, text, input, image, divider, icon, link |
| 表单 | 10 | select, radio, checkbox, switchComp, textarea, datePicker, timePicker, rate, slider, upload |
| 布局 | 6 | container, row, col, card, tabs, collapse |
| 高级 | 9 | table, carousel, progress, badge, tag, alert, avatar, breadcrumb, pagination |
| 图表 | 5 | lineChart, barChart, pieChart, radarChart, gaugeChart |
| 数据 | 3 | statistic, countdown, tree |

### 组件 JSON 树结构

```json
{
  "id": "page_1",
  "name": "我的页面",
  "components": [
    {
      "id": "comp_1_xxx",
      "type": "container",
      "props": { "minHeight": "200px" },
      "style": { "width": "100%" },
      "events": [],
      "children": [
        {
          "id": "comp_2_yyy",
          "type": "button",
          "props": { "text": "提交", "type": "primary" },
          "style": {},
          "events": [
            {
              "id": "evt_1",
              "trigger": { "type": "click" },
              "actions": [
                { "type": "showComponent", "targetId": "comp_3_zzz" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

布局组件（container, row, col, card）通过 `children` 数组嵌套子组件，形成树形结构。

---

## 渲染引擎

### 渲染调度器 — RenderComponent.vue

`RenderComponent` 是整个渲染引擎的入口，负责：

1. **类型分发**：根据组件类型分发到对应的渲染器
2. **表达式解析**：调用 `expressionEngine.resolveProps()` 解析 `{{ }}` 表达式
3. **联动合并**：将 `dataStore.getComponentExtraProps()` 合并到解析后的 props
4. **可见性检查**：通过 `dataStore.isComponentVisible()` 控制 `v-if`
5. **mount 事件**：在 `onMounted` 生命周期中触发 `mount` 类型事件
6. **包裹层**：提供悬浮/选中边框、操作按钮、组件标签

```
RenderComponent
  ├─ isVisible? (v-if)
  │   └─ dataStore.isComponentVisible(id)
  ├─ mergedComponent (computed)
  │   ├─ resolveProps(component.props, context)  ← 表达式解析
  │   └─ + getComponentExtraProps(id)            ← 联动属性合并
  └─ 分发到渲染器
      ├─ BaseRenderer      (button, text, input, image, divider, icon, link)
      ├─ FormRenderer      (select, radio, checkbox, switchComp, textarea, ...)
      ├─ LayoutRenderer    (container, row, col, card, tabs, collapse)
      ├─ AdvancedRenderer  (table, carousel, progress, badge, tag, ...)
      ├─ ChartRenderer     (lineChart, barChart, pieChart, radarChart, gaugeChart)
      └─ DataRenderer      (statistic, countdown, tree)
```

### 渲染与配置分离

画布上的渲染器使用 **原生 HTML/CSS** 而非 Element Plus 交互组件：

| 场景 | 渲染方式 | 原因 |
|------|---------|------|
| 画布编辑器 | 原生 HTML + CSS 模拟 | 避免表单双向绑定干扰拖拽/选中操作 |
| 预览页面 | 真实 Element Plus 组件 | 展示最终效果 |
| 导出源码 | 真实 Element Plus 组件 | 生成可运行代码 |

例如，画布上的 `<select>` 用原生 `<select>` 元素，而非 `<el-select>`，因为 Element Plus 的下拉会干扰编辑器的点击选中。

### ChartRenderer — 唯一使用真实渲染库的渲染器

图表组件使用真实的 ECharts 实例渲染，实现所见即所得：

```
onMounted -> nextTick -> initChart()
  ├─ echarts.init(chartRef)
  ├─ chartInstance.setOption(buildOption(), true)
  └─ ResizeObserver 监听容器尺寸变化

watch(component.props, deep) -> chartInstance.setOption(buildOption(), true)
watch(chartRef) -> dispose old -> reinit
onBeforeUnmount -> disconnect ResizeObserver + dispose
```

`buildOption()` 根据组件类型构建 ECharts 配置：
- 折线图/柱状图：category xAxis + value yAxis + series
- 饼图：pie series + radius + roseType
- 雷达图：radar indicator + series
- 仪表盘：gauge series + min/max/value

### LayoutRenderer — 嵌套渲染

布局组件的核心特性是支持子组件嵌套：

```
LayoutRenderer
  ├─ container: <div> + VueDraggable(children)
  ├─ row: <div flex> + VueDraggable(children)
  ├─ col: <div flex:1> + VueDraggable(children)
  ├─ card: <div border> + header + VueDraggable(children)
  ├─ tabs: tab header + 内容占位（未接入 VueDraggable）
  └─ collapse: 折叠面板（静态渲染）
```

所有支持嵌套的布局组件都：
1. 使用 `VueDraggable` 的 `group="components"` 实现跨容器拖拽
2. 监听原生 `drop` 事件，处理从左侧面板拖入的新组件
3. 使用 `@drop.stop` 阻止事件冒泡到 Canvas

---

## 拖拽系统

### 拖拽流程

```
左侧面板                    画布/布局容器
  │                            │
  │ dragstart                  │
  │ dataTransfer.setData(      │
  │   'componentType',         │
  │   'button'                 │
  │ )                          │
  │ ──────────────────────────>│ drop
  │                            │ dataTransfer.getData('componentType')
  │                            │ store.addComponent('button', index, parentId)
  │                            │
  │                            │ AddComponentCommand.execute()
  │                            │   -> 深拷贝 componentConfigs.button
  │                            │   -> 生成新 ID
  │                            │   -> 插入 pageConfig.components[]
  │                            │
  │                            │ Vue 响应式触发重渲染
  │                            │   -> Canvas 的 VueDraggable 更新
  │                            │   -> 新的 RenderComponent 渲染
```

### 两个拖拽入口

| 入口 | 文件 | 作用 |
|------|------|------|
| 画布根级 | `Canvas.vue` | 处理从左侧面板拖入的组件，添加到顶层 `components[]` |
| 布局嵌套 | `LayoutRenderer.vue` | 处理拖入布局容器的组件，添加到 `parent.children[]` |

两者都调用 `store.addComponent(type, index, parentId)`，区别在于 `parentId` 是否有值。

### 画布内排序

画布内和布局容器内使用 `VueDraggable` 实现拖拽排序：

```html
<VueDraggable
  v-model="components"
  group="components"
  handle=".drag-handle"
  @start="onDragStart"
  @end="onDragEnd"
>
  <RenderComponent v-for="comp in components" :component="comp" />
</VueDraggable>
```

- `group="components"` 允许跨容器拖拽（从画布拖入布局容器，或反之）
- `handle=".drag-handle"` 限制拖拽手柄为组件标签区域
- 排序变更通过 `MoveComponentCommand` 记录到撤销栈

### 对齐辅助线

拖拽过程中显示画布中心对齐线：

```
calculateAlignLines(e)
  -> 计算画布中心 X/Y 坐标
  -> 生成水平线和垂直线
  -> 渲染为绝对定位的 <div> 元素
```

---

## 事件联动系统

### 事件数据模型

每个组件的 `events` 数组包含多个事件配置：

```js
{
  id: 'evt_1',
  trigger: { type: 'click' },     // 触发器
  actions: [                       // 动作列表（按顺序执行）
    {
      id: 'act_1',
      type: 'showComponent',       // 动作类型
      targetId: 'comp_3_zzz'       // 目标组件
    },
    {
      id: 'act_2',
      type: 'setVariable',
      key: 'username',
      value: '张三'
    }
  ]
}
```

### 触发器类型

| 触发器 | 触发时机 | 编辑器中的绑定方式 |
|--------|---------|-------------------|
| `click` | 用户点击组件 | BaseRenderer 中 `@click` 事件 |
| `valueChange` | 表单值变化 | FormRenderer 中 `updateProp()` 调用 |
| `mount` | 组件挂载时 | RenderComponent 中 `onMounted` 生命周期 |

### 动作类型

| 动作 | 作用 | 实现 |
|------|------|------|
| `showComponent` | 显示目标组件 | `dataStore.setComponentVisible(targetId, true)` |
| `hideComponent` | 隐藏目标组件 | `dataStore.setComponentVisible(targetId, false)` |
| `setVariable` | 设置用户变量 | `dataStore.setVariable(key, resolvedValue)` |
| `setProps` | 修改组件属性 | `dataStore.setComponentExtraProps(targetId, resolvedProps)` |
| `resetForm` | 重置所有表单 | 遍历 `formData`，布尔值设为 `false`，其他设为 `''` |

### 事件执行流程

```
用户点击按钮
  │
  ▼
BaseRenderer.handleClick()
  │  过滤 component.events 中 trigger.type === 'click' 的事件
  │
  ▼
dataStore.executeActions(actions)
  │  遍历每个 action
  │
  ▼
dataStore.executeAction(action)
  │  1. resolveValue(action.value, context)  ← 解析表达式
  │  2. switch(action.type)
  │     ├─ showComponent -> setComponentVisible(targetId, true)
  │     ├─ hideComponent -> setComponentVisible(targetId, false)
  │     ├─ setVariable   -> setVariable(key, resolvedValue)
  │     ├─ setProps      -> setComponentExtraProps(targetId, resolvedProps)
  │     └─ resetForm     -> 遍历 formData 重置
  │
  ▼
Vue 响应式更新
  │  ├─ runtimeState[targetId].visible 变化 -> RenderComponent v-if 更新
  │  ├─ variables[key] 变化 -> context 更新 -> 表达式重新求值
  │  └─ extraProps 变化 -> mergedComponent 更新 -> props 重新渲染
  │
  ▼
画布上组件状态变化（显示/隐藏/属性变化）
```

### 可见性控制

```
RenderComponent
  │
  ├─ isVisible = computed(() => dataStore.isComponentVisible(id))
  │
  └─ v-if="isVisible"
      ├─ true  -> 正常渲染组件
      └─ false -> 组件从 DOM 中移除
```

`dataStore.componentRuntimeState` 中每个组件有 `{ visible: true, extraProps: {} }`，`isComponentVisible()` 返回 `visible` 值（默认 `true`）。

### 联动属性覆盖

```
RenderComponent.mergedComponent
  │
  ├─ 1. resolveProps(component.props, context)  ← 解析表达式
  │     例如: "{{ formData.username }}" -> "张三"
  │
  ├─ 2. getComponentExtraProps(id)              ← 获取联动覆盖
  │     例如: { text: "已提交", disabled: true }
  │
  └─ 3. { ...resolved, ...extraProps }          ← 合并（extraProps 优先）
        最终 props: { text: "已提交", disabled: true, type: "primary" }
```

---

## 表达式引擎

文件：`src/utils/expressionEngine.js`

### 三种表达式类型

| 类型 | 示例 | 返回值 |
|------|------|--------|
| 纯表达式 | `"{{ formData.age }}"` | 原始类型（数字、布尔、对象） |
| 模板字符串 | `"你好，{{ formData.name }}"` | 字符串 |
| 字面量 | `"固定文本"` | 原样返回 |

### 求值过程

```
resolveValue("{{ formData.age > 18 ? '成年' : '未成年' }}", context)
  │
  ├─ 检测到 {{ }} 标记
  ├─ 判断为纯表达式
  │
  ▼
evaluate("formData.age > 18 ? '成年' : '未成年'", { formData, variables })
  │
  ├─ 提取 context 的 key: ['formData', 'variables']
  ├─ 创建函数: new Function('formData', 'variables', 'return (formData.age > 18 ? '成年' : '未成年')')
  │
  ▼
执行函数(formData = { age: 25 }, variables = {})
  │
  ▼
返回 '成年'
```

### 上下文

表达式可以访问两个数据源：

```js
context = {
  formData: { comp_1: "张三", comp_2: 25, ... },  // 表单组件的值
  variables: { username: "admin", ... }             // 用户自定义变量
}
```

在组件属性中使用：
- `"{{ formData.comp_1 }}"` — 引用输入框的值
- `"{{ variables.username }}"` — 引用用户变量
- `"{{ formData.comp_2 > 18 ? '成年' : '未成年' }}"` — 条件表达式

---

## 撤销重做（命令模式）

### CommandManager

文件：`src/stores/history/CommandManager.js`

```
CommandManager
  ├─ undoStack: []     最多 100 条
  ├─ redoStack: []
  │
  ├─ execute(command)
  │   ├─ command.execute()
  │   ├─ 尝试与栈顶命令合并 (top.merge(command))
  │   │   ├─ 成功 -> 替换栈顶
  │   │   └─ 失败 -> push 到 undoStack
  │   └─ 清空 redoStack
  │
  ├─ undo()
  │   ├─ pop from undoStack
  │   ├─ command.undo()
  │   └─ push to redoStack
  │
  └─ redo()
      ├─ pop from redoStack
      ├─ command.execute()
      └─ push to undoStack
```

### 五种命令

| 命令 | execute | undo | merge |
|------|---------|------|-------|
| AddComponent | 插入组件到树中 | 从树中移除 | 无 |
| DeleteComponent | 从树中移除 | 插回原位置 | 无 |
| MoveComponent | 从 fromIndex 移到 toIndex | 从 toIndex 移回 fromIndex | 合并连续移动，只保留最终目标 |
| UpdateProps | 设置 prop 新值 | 恢复 prop 旧值 | 同组件同属性 500ms 内合并 |
| UpdateStyle | 设置 style 新值 | 恢复 style 旧值 | 同组件同样式 500ms 内合并 |

### 合并机制

合并是防止撤销栈膨胀的关键。以 `UpdatePropsCommand` 为例：

```
用户快速拖动滑块，产生连续的 props 变更：
  UpdateProps(comp_1, 'percentage', 10 -> 20)  t=0ms
  UpdateProps(comp_1, 'percentage', 20 -> 30)  t=100ms
  UpdateProps(comp_1, 'percentage', 30 -> 40)  t=200ms

合并后 undoStack 中只有一条：
  UpdateProps(comp_1, 'percentage', 10 -> 40)

撤销一次就回到 10，而不是需要撤销三次。
```

合并条件：
1. 同一个组件（`componentId` 相同）
2. 同一个属性（`propName` 相同）
3. 时间间隔 < 500ms

### BatchCommand

将多个命令包装成一个撤销步骤：

```js
const batch = commandManager.beginBatch()
batch.add(new UpdatePropsCommand(...))
batch.add(new UpdateStyleCommand(...))
commandManager.execute(batch)
// 撤销时两条变更一起回退
```

---

## 属性与样式配置

### 配置面板结构

```
RightPanel
  ├─ 无选中 -> "请选择一个组件进行配置"
  └─ 有选中 -> el-tabs
      ├─ "属性" Tab -> PropsPanel
      │   ├─ BaseAndFormProps    (基础 + 表单组件，17 种)
      │   ├─ LayoutAndAdvancedProps (布局 + 高级组件，15 种)
      │   └─ ChartAndDataProps   (图表 + 数据组件，8 种)
      ├─ "样式" Tab -> StylePanel
      │   └─ 根据 styleConfigMap 显示可用样式字段
      └─ "事件" Tab -> EventConfigPanel
          └─ 配置触发器和动作列表
```

### 草稿-确认模式

属性和样式编辑采用「草稿-确认」模式，避免实时修改污染撤销历史：

```
用户选中组件
  │
  ▼
PropsPanel 创建 draftProps = deepClone(component.props)
  │
  ▼
用户在表单中编辑 draftProps（不影响真实组件）
  │
  ├─ 点击"确定" -> store.updateComponentProps(id, draftProps)
  │                 -> 创建 UpdatePropsCommand -> 记入撤销栈
  │
  └─ 点击"重置" -> draftProps = deepClone(component.props)  // 恢复
```

### 样式可配置字段

`StylePanel` 通过 `styleConfigMap` 为每种组件定义可用的样式字段：

```
样式分组：
  ├─ 尺寸：width, height, minHeight
  ├─ 间距：margin, padding
  ├─ 背景：backgroundColor, opacity
  ├─ 边框：border, borderColor, borderWidth, borderStyle, borderRadius, boxShadow
  └─ 文字：fontSize, color, lineHeight, textAlign, fontWeight
```

不同组件开放不同字段，例如：
- `button`：width, borderRadius
- `text`：fontSize, color, lineHeight, textAlign, fontWeight
- `container`：width, minHeight, padding, backgroundColor, opacity, border, borderRadius, boxShadow

---

## 导出与预览

### 导出源码（codeGenerator.js）

将页面 JSON 转换为 Vue 3 SFC 单文件组件：

```
pageConfig (JSON)
  │
  ▼
generateVueSFC(json)
  │
  ├─ generateTemplate(components, usedImports)
  │   ├─ 遍历组件树
  │   ├─ 为每个组件生成 Element Plus 模板标签
  │   ├─ 添加 v-if（可见性）、@click（点击事件）、@change（值变化）
  │   ├─ 添加 class="comp-{id}" 和 inline style
  │   └─ 递归处理布局组件的 children
  │
  ├─ generateScript(components, pageConfig, usedImports)
  │   ├─ collectData() 遍历组件树收集：
  │   │   ├─ formData（表单组件的默认值）
  │   │   ├─ tableData（表格数据）
  │   │   ├─ treeData（树数据）
  │   │   ├─ chartInits（图表配置）
  │   │   ├─ eventHandlers（事件处理函数）
  │   │   └─ tabVars（标签页状态）
  │   ├─ 生成 import 语句
  │   ├─ 生成 reactive() 声明
  │   ├─ 生成 onMounted() 图表初始化
  │   ├─ 生成事件处理函数（click/mount/valueChange）
  │   └─ 生成 runtimeState（可见性 + extraProps）
  │
  ├─ generateStyle(components)
  │   └─ 为每个组件生成 .comp-{id} CSS 规则
  │
  └─ 拼接为完整 SFC 字符串
```

生成的 SFC 结构：

```vue
<!-- 依赖提示注释 -->
<template>
  <div class="page-container">
    <!-- 组件模板（Element Plus 真实组件） -->
  </div>
</template>

<script setup>
import { ... } from 'element-plus'
import { reactive, ref, onMounted, watch } from 'vue'

const formData = reactive({ ... })     // 表单数据
const runtimeState = reactive({ ... }) // 可见性 + 联动属性

// 图表初始化（onMounted）
// 事件处理函数
</script>

<style scoped>
.page-container { ... }    // 页面容器样式
.comp-xxx { ... }          // 组件级 CSS 规则
</style>
```

### 导出的事件处理

| 触发器 | 导出方式 |
|--------|---------|
| `click` | 生成 `on_{id}Click()` 函数 + 模板 `@click` 绑定 |
| `valueChange` | 生成 `on_{id}Change()` 函数 + 模板 `@change` 绑定 |
| `mount` | 生成 `onMounted()` 钩子代码 |

| 动作 | 导出方式 |
|------|---------|
| `showComponent` | `runtimeState.{id}.visible = true` |
| `hideComponent` | `runtimeState.{id}.visible = false` |
| `setVariable` (modelValue) | `formData.{targetId} = value` |
| `setVariable` (其他) | `formData.{key} = value` |
| `setProps` (modelValue) | `formData.{targetId} = value` |
| `setProps` (其他) | `runtimeState.{targetId}.extraProps.{key} = value` |
| `resetForm` | 遍历 formData 重置 |

### 预览页面（previewGenerator.js）

生成独立的 HTML 文件，通过 CDN 加载 Vue 3 + Element Plus + ECharts：

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://unpkg.com/element-plus"></script>
  <script src="https://unpkg.com/echarts@5/dist/echarts.min.js"></script>
</head>
<body>
  <div id="app">
    <!-- 组件模板 -->
  </div>
  <script>
    const { createApp, reactive, onMounted } = Vue;
    const app = createApp({
      setup() {
        // formData, runtimeState, 事件处理函数
        return { ... };
      }
    });
    app.use(ElementPlus);
    app.mount('#app');
  </script>
</body>
</html>
```

预览与导出源码的区别：

| 方面 | 预览 HTML | 导出 SFC |
|------|----------|---------|
| Vue 使用方式 | CDN + Options API setup() | `<script setup>` |
| Element Plus | CDN 全局注册 | import 按需引入 |
| 运行方式 | Blob URL 新窗口打开 | 下载 .vue 文件 |
| 可见性语法 | `v-if="runtimeState.id !== false"` | `v-if="runtimeState.id.visible"` |
| 函数命名 | `on_{id}_click()` | `on_{id}Click()` |

---

## 各文件详细说明

### 根目录文件

| 文件 | 说明 |
|------|------|
| `index.html` | SPA 入口，包含 `<div id="app">` 挂载点 |
| `package.json` | 项目配置，定义 dev/build/preview 脚本 |
| `vite.config.js` | Vite 配置，仅启用 `@vitejs/plugin-vue` |

### `src/main.js` — 应用引导

启动入口，依次完成：
1. 创建 Vue 应用实例
2. 安装 Pinia
3. 安装 Element Plus 并注册所有图标
4. 导入全局 CSS 重置和主题变量
5. 挂载到 `#app`

### `src/assets/theme.css` — 设计令牌

CSS 自定义属性定义全局设计系统：

```css
--lc-primary: #f08a5d          /* 主色（暖橙） */
--lc-primary-light: #fef0e8    /* 主色浅色背景 */
--lc-primary-dark: #d97040     /* 主色深色 */
--lc-selected-outline: 2px solid var(--lc-primary)   /* 选中态轮廓 */
--lc-hover-outline: 1px dashed var(--lc-primary-border) /* 悬浮态轮廓 */
```

### `src/config/components.js` — 组件注册表

导出 `componentConfigs`（37 种组件配置）和 `componentCategories`（6 个分类元信息）。每个组件定义 type、name、icon、category、props 默认值、style 默认值、events 初始值。

### `src/stores/editor.js` — 编辑器状态

Pinia Store，管理：
- `pageConfig`：页面配置（组件树）
- `selectedComponentId`：当前选中
- `canvasConfig`：画布设置（缩放、网格、设备类型）
- `commandManager`：命令管理器实例

所有组件变更操作（add/delete/move/updateProps/updateStyle）都通过 Command 模式执行，支持撤销重做。

### `src/stores/dataStore.js` — 运行时数据

Pinia Store，管理：
- `formData`：表单组件的当前值
- `variables`：用户自定义变量
- `componentRuntimeState`：组件可见性和联动属性

包含 `executeAction()` 动作执行器，是事件联动系统的核心。

### `src/stores/history/CommandManager.js` — 命令管理器

实现 Command 模式：
- `CommandManager` 类：管理 undoStack/redoStack，支持命令合并
- `BatchCommand` 类：将多个命令包装为一个撤销步骤
- 最大栈深度 100

### `src/stores/history/commands/` — 五种命令

| 文件 | 功能 |
|------|------|
| `AddComponentCommand.js` | 添加组件（execute: 插入, undo: 移除） |
| `DeleteComponentCommand.js` | 删除组件（execute: 移除, undo: 插回原位） |
| `MoveComponentCommand.js` | 移动组件（execute/undo: 反向 splice, merge: 合并连续移动） |
| `UpdatePropsCommand.js` | 更新属性（execute: 设新值, undo: 恢复旧值, merge: 500ms 内合并） |
| `UpdateStyleCommand.js` | 更新样式（同 UpdatePropsCommand 逻辑） |
| `index.js` | 统一导出 |

### `src/utils/codeGenerator.js` — 源码生成器

`generateVueSFC(pageConfig)` 函数将页面 JSON 转换为 Vue 3 SFC：
- `generateTemplate()`：递归生成 Element Plus 模板
- `generateScript()`：生成 `<script setup>` 代码（formData、runtimeState、事件处理）
- `generateStyle()`：生成 `<style scoped>` CSS 规则

### `src/utils/previewGenerator.js` — 预览生成器

`generatePreviewHtml(pageConfig)` 函数生成独立 HTML 预览页面：
- 使用 CDN 加载 Vue 3 + Element Plus + ECharts
- 生成 `createApp({ setup() { ... } })` 脚本
- 通过 Blob URL 在新窗口打开

### `src/utils/expressionEngine.js` — 表达式引擎

处理 `{{ }}` 模板语法：
- `resolveValue(value, context)`：解析单个值中的表达式
- `resolveProps(props, context)`：批量解析对象所有属性
- `evaluate(expression, context)`：使用 `new Function()` 执行表达式
- `interpolate(template, context)`：模板字符串插值

### `src/utils/helper.js` — 工具函数

| 函数 | 说明 |
|------|------|
| `generateId(prefix)` | 生成 `前缀_计数器_随机串` 格式的唯一 ID |
| `deepClone(obj)` | JSON.parse/stringify 深拷贝 |
| `downloadJSON(json, filename)` | 触发浏览器下载 JSON 文件 |
| `readLocalJSON()` | 打开文件选择器读取本地 JSON |

### `src/views/Editor.vue` — 编辑器主页面

布局容器，结构为：
- 顶部 `Toolbar`
- 下方 Flex 行：`LeftPanel` + `Canvas` + `RightPanel`
- 全视口尺寸（100vw x 100vh）

### `src/components/layout/Toolbar.vue` — 顶部工具栏

三个区域：
- **左侧**：撤销/重做、删除/复制、上移/下移/置顶/置底
- **中央**：设备切换（PC/平板/手机）、网格开关、缩放滑块
- **右侧**：下拉菜单（清空、导出JSON、导入JSON、预览、导出源码）

### `src/components/layout/LeftPanel.vue` — 左侧物料面板

宽度 260px，使用 `el-collapse` 折叠面板按 6 个分类展示 37 种组件。每个组件卡片设置 `draggable="true"`，拖拽时将组件类型写入 `dataTransfer`。

### `src/components/layout/Canvas.vue` — 中间画布

核心交互区域：
- `VueDraggable` 实现画布内拖拽排序
- 监听原生 `drop` 事件处理从左侧拖入的组件
- 设备宽度适配（PC: 100%, 平板: 1024px, 手机: 375px）
- CSS 网格背景
- 框选功能（选框绘制，选中逻辑未完成）
- 全局键盘快捷键（Ctrl+Z/Y/C/V/X/D, Delete）

### `src/components/layout/RightPanel.vue` — 右侧配置面板

宽度 320px，三个 Tab：
- 属性 -> `PropsPanel`
- 样式 -> `StylePanel`
- 事件 -> `EventConfigPanel`

### `src/components/layout/PropsPanel.vue` — 属性配置调度

根据组件类型分发到三个子表单：
- `BaseAndFormProps`：基础 + 表单组件
- `LayoutAndAdvancedProps`：布局 + 高级组件
- `ChartAndDataProps`：图表 + 数据组件

### `src/components/layout/StylePanel.vue` — 样式配置

通过 `styleConfigMap` 控制每种组件可配置的样式字段。分五个区域：尺寸、间距、背景、边框、文字。

### `src/components/layout/props-forms/EventConfigPanel.vue` — 事件配置

支持：
- 添加/删除事件（每个事件一个触发器 + 多个动作）
- 触发器选择：点击、值变化、加载时
- 动作类型：显示组件、隐藏组件、设置变量、设置属性、重置表单
- 动作配置：目标组件选择、变量名、属性名、属性值

### `src/components/render/RenderComponent.vue` — 渲染调度器

渲染引擎入口，负责类型分发、表达式解析、联动合并、可见性检查、mount 事件触发、包裹层（选中/悬浮边框、操作按钮）。

### `src/components/render/renderers/` — 六个分类渲染器

| 渲染器 | 渲染方式 | 特点 |
|--------|---------|------|
| BaseRenderer | 原生 HTML | 按钮点击事件绑定 |
| FormRenderer | 原生 HTML | 表单值变化事件绑定 |
| LayoutRenderer | 原生 HTML + VueDraggable | 嵌套子组件、跨容器拖拽 |
| AdvancedRenderer | 原生 HTML | 表格、轮播图、进度条等 |
| ChartRenderer | 真实 ECharts | 所见即所得，ResizeObserver 响应式 |
| DataRenderer | 原生 HTML + el-* | 统计数值、倒计时、树 |

### `src/components/render/ErrorBoundary.vue` — 错误边界

Vue 错误捕获组件，包裹渲染器，当渲染出错时显示错误信息而非白屏。

---

## 已知限制

1. **标签页/折叠面板不支持嵌套拖入子组件** — 仅静态渲染
2. **框选功能未完成** — 选框可绘制但不会选中组件
3. **setProps 非 modelValue 属性在导出中有限制** — `extraProps` 修改不会自动反映到模板的非 v-model 属性
4. **表达式引擎无沙箱隔离** — 使用 `new Function()` 执行，可访问全局作用域
5. **无数据源对接** — 表格/树数据需手动配置，不支持接口获取
6. **无响应式布局** — 导出的页面是固定宽度，不支持自适应
