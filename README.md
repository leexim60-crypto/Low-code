# Low-Code 低代码可视化编辑平台

一个基于 Vue 3 的可视化低代码编辑器，通过拖拽组件、配置属性和样式，无需编写代码即可快速搭建页面。

---

## 技术栈

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
│ 布局组件  │   │   （拖拽/选中）    │      │                     │
│ 高级组件  │   │                   │      │                     │
│ 图表组件  │   └───────────────────┘      │                     │
│ 数据展示  │                              │                     │
└──────────┴──────────────────────────────┴─────────────────────┘
```

核心思想：**JSON Schema 描述页面 -> 渲染引擎解析 JSON -> 生成可视化页面**

所有组件在内存中以 JSON 树形结构存储，画布上的渲染、属性配置、导入导出都围绕这份 JSON 展开。

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
        │  └─ history[]                撤销栈
        │
        ▼
  Vue 响应式组件
        │  ├─ Canvas 读取 pageConfig.components -> RenderComponent 渲染
        │  ├─ RightPanel 读取 selectedComponent -> 展示配置表单
        │  └─ Toolbar 读取 history 状态 -> 控制撤销/重做按钮
        │
        ▼
  RenderComponent（渲染调度器）
        │
        ▼
  分类渲染器（Base / Form / Layout / Advanced / Chart / Data）
        │
        ▼
  画布上的可视化输出
```

### 拖拽流程

1. 左侧面板中，组件卡片设置 `draggable="true"`，拖拽开始时将组件类型写入 `dataTransfer`
2. 画布区域监听 `drop` 事件，读取组件类型，调用 `store.addComponent(type)`
3. `addComponent` 从组件注册表中深拷贝默认配置，生成唯一 ID，推入 `pageConfig.components[]`
4. 对于布局组件（容器、行、列、卡片），其渲染器内部也监听 `drop` 事件，支持将组件嵌套拖入子级
5. `vue-draggable-plus` 负责画布内和布局容器内的拖拽排序

### 配置流程

1. 用户点击画布上的组件 -> `store.selectComponent(id)` 设置选中状态
2. 右侧面板根据选中组件展示属性/样式两个 Tab
3. 属性面板根据组件类型分发到对应的子表单（基础+表单 / 布局+高级 / 图表+数据）
4. 子表单维护一份 `draftProps`（深拷贝副本），用户编辑的是草稿
5. 点击"确定"后调用 `store.updateComponentProps()` 合并到组件数据
6. Vue 响应式触发画布上对应组件重新渲染

### 撤销/重做

- 每次修改 `pageConfig` 前调用 `saveHistory()`，将当前状态深拷贝压入历史栈（上限 50 条）
- 拖拽操作使用 `saveHistoryDebounced()`（300ms 防抖），避免拖拽过程中频繁记录
- 撤销时从历史栈恢复上一条快照，重做时恢复下一条

---

## 项目目录结构

```
low-code/
├── index.html                          # SPA 入口 HTML，挂载 Vue 应用到 #app
├── package.json                        # 项目配置，定义 dev/build/preview 三个脚本
├── vite.config.js                      # Vite 配置，仅启用 Vue 插件
├── public/
│   ├── favicon.svg                     # 网站图标
│   └── icons.svg                       # 图标精灵图
├── src/
│   ├── main.js                         # 应用引导文件
│   ├── App.vue                         # 根组件
│   ├── assets/                         # 静态资源
│   ├── config/                         # 组件注册配置
│   ├── stores/                         # Pinia 状态管理
│   ├── utils/                          # 工具函数
│   ├── views/                          # 页面视图
│   ├── components/                     # 组件目录
│   │   ├── layout/                     # 布局组件（编辑器 UI 骨架）
│   │   └── render/                     # 渲染组件（画布上的组件渲染）
│   └── materials/                      # 物料目录（预留，当前为空）
└── 要求.txt                             # 需求规格说明
```

---

## 各文件详细说明

### 根目录文件

#### `index.html`
SPA 入口文件。包含一个 `<div id="app">` 挂载点，页面标题为"Low-Code 低代码可视化平台"。Vite 开发时自动注入模块脚本。

#### `package.json`
项目清单。项目名为 `temp-project`，设为私有包。定义了三个脚本：
- `dev`：启动 Vite 开发服务器
- `build`：构建生产版本
- `preview`：预览构建产物

#### `vite.config.js`
Vite 构建配置。仅启用 `@vitejs/plugin-vue` 插件，无额外别名、代理或自定义配置。

#### `要求.txt`
项目需求文档。列出了完整的功能清单：组件库体系、画布编辑能力、属性/样式/事件配置、页面管理、高级功能等。作为项目的功能规格参考。

---

### `src/main.js` — 应用引导

应用的启动入口。依次完成：
1. 创建 Vue 应用实例
2. 安装 Pinia（状态管理插件）
3. 安装 Element Plus（UI 组件库）并注册所有图标
4. 导入全局 CSS 重置样式和主题变量文件
5. 挂载到 `#app` DOM 节点

#### `src/App.vue` — 根组件

最顶层组件。仅做两件事：
1. 全局 CSS 重置（margin、padding、box-sizing、html/body 全屏）
2. 渲染 `<Editor />` 视图组件

---

### `src/assets/` — 静态资源

#### `theme.css` — 设计令牌（Design Tokens）

通过 CSS 自定义属性定义全局设计系统，所有组件通过 `var(--lc-*)` 引用：
- 主色 `--lc-primary: #409eff`
- 功能色：success（绿）、warning（橙）、danger（红）、info（灰）
- 文本色：primary、regular、secondary、placeholder 四级灰度
- 边框色、背景色、禁用色
- 选中态和悬浮态的边框/轮廓样式

#### `hero.png`、`vite.svg`、`vue.svg`
项目中使用的图片资源，分别为示例图片和框架 Logo。

---

### `src/config/components.js` — 组件注册表

整个系统的**核心配置文件**，定义了所有可用组件的元信息和默认值。

导出两个东西：

**1. `componentConfigs`（组件配置对象）**

以组件类型字符串为 key，每个条目包含：
- `type`：类型标识符（如 `'button'`、`'lineChart'`）
- `name`：中文显示名
- `icon`：Element Plus 图标组件名
- `category`：所属分类（base / form / layout / advanced / chart / data）
- `props`：属性默认值对象
- `style`：样式默认值对象
- `children`：（仅布局组件）空数组，用于嵌套子组件

共注册 **37 种组件**：
- 基础组件（7 种）：button、text、input、image、divider、icon、link
- 表单组件（10 种）：select、radio、checkbox、switchComp、textarea、datePicker、timePicker、rate、slider、upload
- 布局组件（6 种）：container、row、col、card、tabs、collapse
- 高级组件（9 种）：table、carousel、progress、badge、tag、alert、avatar、breadcrumb、pagination
- 图表组件（5 种）：lineChart、barChart、pieChart、radarChart、gaugeChart
- 数据展示（3 种）：statistic、countdown、tree

**2. `componentCategories`（分类数组）**

定义 6 个分类对象，每个包含 `name`（英文标识）、`label`（中文名）、`icon`（图标名）。用于左侧面板的分组展示。

---

### `src/stores/editor.js` — 状态管理（Pinia Store）

编辑器的**中央状态管理器**，使用 Composition API 风格的 `defineStore`。是整个应用的单一数据源。

#### 状态（State）

| 状态 | 类型 | 说明 |
|------|------|------|
| `pageConfig` | Object | 页面配置，包含 id、name、components（组件树数组） |
| `selectedComponentId` | String/null | 当前选中的组件 ID |
| `selectedComponentIds` | Set | 多选组件 ID 集合（预留） |
| `history` | Array | 撤销历史栈，最多 50 条快照 |
| `historyIndex` | Number | 当前在历史栈中的位置 |
| `clipboard` | Object/null | 剪贴板，用于复制粘贴 |
| `canvasConfig` | Object | 画布配置：zoom（0.5-2）、showGrid、deviceType（pc/tablet/mobile） |

#### 计算属性（Computed）

- `selectedComponent`：根据 `selectedComponentId` 在组件树中递归查找，返回当前选中的组件对象

#### 核心方法

**组件增删改查**
- `addComponent(type, index, parentId)`：从注册表深拷贝配置，生成唯一 ID，插入组件树。支持指定位置和父容器
- `deleteComponent(id)` / `deleteComponents(ids)`：从组件树中移除，支持单个和批量删除
- `duplicateComponent(id)`：深拷贝组件并生成新 ID，插入到原组件后面
- `findComponentById(components, id)`：递归遍历组件树查找指定 ID 的组件

**属性更新**
- `updateComponentProps(id, props)`：合并更新组件的 props 属性
- `updateComponentStyle(id, style)`：合并更新组件的 style 样式

**选中管理**
- `selectComponent(id)`：设置选中组件
- `deselectComponent()`：取消选中
- `toggleSelect(id)`：切换选中状态（用于多选）

**排序与层级**
- `moveComponent(from, to)`：拖拽排序
- `moveUp(id)` / `moveDown(id)`：上移/下移一位
- `moveTop(id)` / `moveBottom(id)`：置顶/置底

**剪贴板**
- `copyComponent()`：复制当前选中组件到剪贴板
- `pasteComponent()`：从剪贴板粘贴组件（生成新 ID）
- `cutComponent()`：剪切（复制 + 删除原组件）

**历史记录**
- `saveHistory()`：立即保存当前状态快照
- `saveHistoryDebounced()`：300ms 防抖版本，用于拖拽场景
- `undo()`：撤销，恢复上一条快照
- `redo()`：重做，恢复下一条快照

**画布操作**
- `clearCanvas()`：清空所有组件
- `exportJSON()`：导出当前页面配置为 JSON
- `importJSON(json)`：导入 JSON 配置覆盖当前页面
- `setZoom(zoom)`：设置缩放比例（限制在 0.5-2）
- `setDeviceType(type)`：切换设备类型
- `toggleGrid()`：切换网格显示

**内部辅助**
- `findParentArray(components, id)`：递归查找指定组件所在的父数组
- `removeFromTree(components, id)`：从组件树中移除指定节点

---

### `src/utils/helper.js` — 工具函数

导出 5 个实用函数：

| 函数 | 说明 |
|------|------|
| `generateId(prefix)` | 生成唯一 ID，格式为 `前缀_时间戳_随机字符串` |
| `deepClone(obj)` | 基于 JSON.parse/stringify 的深拷贝 |
| `downloadJSON(json, filename)` | 触发浏览器下载 JSON 文件（通过 data URI） |
| `readLocalJSON()` | 打开文件选择器，读取并解析本地 JSON 文件，返回 Promise |
| `saveToLocalStorage(key, data)` / `loadFromLocalStorage(key)` | localStorage 读写封装（已定义但未实际使用） |

---

### `src/views/Editor.vue` — 编辑器主页面

编辑器的整体布局容器。结构为：
- 顶部 `Toolbar`（工具栏）
- 下方 Flex 行：`LeftPanel` + `Canvas` + `RightPanel`

全视口尺寸（100vw x 100vh），背景色 `#f0f2f5`。

---

### `src/components/layout/` — 编辑器 UI 组件

#### `Toolbar.vue` — 顶部工具栏

分为三个区域：

**左侧操作区**
- 撤销/重做按钮（到达历史边界时禁用）
- 删除/复制按钮（无选中组件时禁用）
- 排序按钮：上移、下移、置顶、置底（选中组件后显示）

**中央控制区**
- 设备类型切换：PC、平板、手机（切换画布宽度约束）
- 网格开关
- 缩放滑块：50% - 200%

**右侧功能区**
- 下拉菜单包含：清空画布、导出 JSON、导入 JSON、预览页面、导出源码
- `previewPage()`：生成包含页面配置 JSON 的 HTML 页面，在新窗口打开
- `exportCode()`：生成一个 Vue SFC 框架文件供下载

同时注册全局键盘快捷键：Ctrl+Z（撤销）、Ctrl+Y（重做）、Delete（删除选中组件）

#### `LeftPanel.vue` — 左侧物料面板

宽度 260px。使用 `el-collapse` 折叠面板将组件按 6 个分类分组展示。每个组件卡片：
- 显示图标和中文名称
- 2 列网格布局
- 设置 `draggable="true"`，拖拽开始时将组件类型写入 `dataTransfer`

#### `Canvas.vue` — 中间画布

编辑器的核心交互区域。

**拖拽支持**
- 使用 `VueDraggable`（vue-draggable-plus）实现画布内组件拖拽排序
- 监听原生 `drop` 事件，处理从左侧面板拖入的新组件
- 拖拽过程中显示对齐辅助线（水平居中线和垂直居中线）

**设备适配**
- 通过 CSS 类 `device-pc`、`device-tablet`、`device-mobile` 控制画布最大宽度
- 缩放通过 CSS `transform: scale()` 实现

**网格背景**
- 开启时使用 CSS `background-image` 绘制点阵网格

**框选功能**
- 鼠标在画布空白区域按下拖动可绘制选框，框选多个组件

**键盘快捷键**
- Ctrl+Z / Ctrl+Y：撤销 / 重做
- Ctrl+C / Ctrl+V / Ctrl+X：复制 / 粘贴 / 剪切
- Ctrl+D：复制当前组件
- Delete / Backspace：删除选中组件

**空状态**
- 组件列表为空时显示"从左侧拖拽组件到此处"提示

#### `RightPanel.vue` — 右侧配置面板

宽度 320px。选中组件时显示配置界面，未选中时显示占位提示。使用 `el-tabs` 提供两个 Tab：
- **属性 Tab**：渲染 `PropsPanel`
- **样式 Tab**：渲染 `StylePanel`

#### `PropsPanel.vue` — 属性配置面板

属性编辑的调度中心。根据选中组件的类型，分发到三个子表单：
- `BaseAndFormProps`：处理基础组件和表单组件的属性编辑
- `LayoutAndAdvancedProps`：处理布局组件和高级组件的属性编辑
- `ChartAndDataProps`：处理图表组件和数据展示组件的属性编辑

采用"草稿-确认"模式：编辑时维护一份 `draftProps` 深拷贝副本，点击"确定"后才合并到组件数据，点击"重置"可恢复到当前组件状态。

#### `StylePanel.vue` — 样式配置面板

通过 `styleConfigMap` 为每种组件类型定义可配置的样式字段。提供以下样式分组：
- **尺寸**：width、height、minHeight
- **间距**：margin、padding
- **背景**：backgroundColor、opacity
- **边框**：border、borderColor、borderWidth、borderStyle、borderRadius、boxShadow
- **文字**：fontSize、color、lineHeight、textAlign、fontWeight

同样采用"草稿-确认"模式。

#### `props-forms/` — 属性编辑子表单目录

##### `BaseAndFormProps.vue`

为所有基础组件和表单组件（共 17 种）提供属性编辑表单。每种组件有独立的 `<template>` 块，使用 Element Plus 表单控件。涵盖：
- 按钮：文字、类型、尺寸、圆角、禁用
- 文本：内容、字号、颜色、行高、对齐、粗细
- 输入框：占位符、类型、禁用
- 图片：地址、适配方式、替代文本
- 分割线：方向、样式
- 图标：图标名、大小、颜色
- 链接：文字、地址、打开方式
- 下拉选择/单选/多选：选项列表管理
- 开关：开启/关闭文字
- 文本域：占位符、行数、最大长度
- 日期/时间选择：占位符、格式
- 评分：默认值、最大值、半选
- 滑块：默认值、范围、步长
- 上传：多选、数量限制、拖拽模式

##### `LayoutAndAdvancedProps.vue`

为布局组件和高级组件（共 15 种）提供属性编辑表单。包含较复杂的编辑器：
- 表格：列配置（标题、字段名、宽度、对齐）+ 行数据内联编辑
- 轮播图：图片列表编辑器
- 标签页/折叠面板：面板项增删改
- 面包屑：路径项编辑
- 分页：总条数、当前页、每页条数
- 进度条：百分比、状态、显示文字
- 徽标：值、类型、最大值
- 标签：文字、类型、效果、尺寸
- 提示：标题、描述、类型、可关闭
- 头像：图片/图标、形状、大小

##### `ChartAndDataProps.vue`

为图表组件和数据展示组件（共 8 种）提供属性编辑表单：
- 折线图/柱状图：X 轴数据编辑器 + 系列数据编辑器（委托给 SeriesEditor）
- 饼图：数据项编辑器（名称 + 数值）
- 雷达图：指标配置 + 系列数据
- 仪表盘：名称、数值、最小值、最大值
- 统计数值：标题、数值、前缀、后缀
- 倒计时：标题、目标时间
- 树形控件：节点编辑器，支持递归嵌套子节点

##### `SeriesEditor.vue`

图表系列数据的可复用子组件。展示每个系列的名称和数据点（以 X 轴标签为列头），支持添加/删除数据点和系列。被 ChartAndDataProps 中的折线图、柱状图、雷达图配置调用。

##### `useListOps.js`

列表操作的组合函数。为 `draftProps` 中所有数组类型的属性提供统一的增删操作。覆盖的列表包括：
- options（下拉/单选/多选的选项列表）
- tabs（标签页面板项）
- collapseItems（折叠面板项）
- breadcrumbItems（面包屑路径项）
- tableColumns（表格列配置）
- tableData（表格行数据）
- carouselImages（轮播图图片列表）
- xData（图表 X 轴数据）
- series（图表系列）
- pieData（饼图数据项）
- radarIndicators（雷达图指标）
- treeNodes（树节点）

内部使用通用的 `addToList(key, item)` / `removeFromList(key, index)` 模式。

---

### `src/components/render/` — 渲染组件

#### `RenderComponent.vue` — 渲染调度器（核心）

整个渲染引擎的**入口和调度中心**。接收一个 `component` prop，执行以下工作：

1. **类型分发**：将组件类型归类为 6 个分组之一，分发给对应的渲染器
2. **包裹层**：用一个 div 包裹渲染结果，提供：
   - 悬浮态边框（虚线蓝色轮廓）
   - 选中态边框（实线蓝色轮廓）
   - 组件类型标签（悬浮/选中时显示，兼作拖拽手柄）
   - 操作按钮（选中时显示复制/删除按钮）
3. **递归渲染**：对于布局组件，提供 `#child` 插槽，内部递归渲染子组件的 `RenderComponent`，实现组件树的嵌套渲染
4. **点击选中**：点击组件时调用 `store.selectComponent(id)`

#### `renderers/` — 分类渲染器目录

##### `BaseRenderer.vue` — 基础组件渲染器

渲染 7 种基础组件。使用原生 HTML 元素而非 Element Plus 组件，避免画布上的交互干扰：
- **button**：`<button>` 元素，通过 CSS 类模拟 Element Plus 的 primary/success/warning/danger/info 样式和 size/round/disabled 状态
- **text**：`<p>` 元素，支持 fontSize、color、lineHeight、textAlign、fontWeight
- **input**：`<input readonly>` 元素，显示占位符
- **image**：`<img>` 元素，支持 object-fit 适配
- **divider**：`<div>` 元素，通过 border-top 实现分割线效果
- **icon**：`<el-icon>` 包裹动态组件，根据图标名渲染对应图标
- **link**：`<a>` 元素，支持 href 和 target 属性

##### `FormRenderer.vue` — 表单组件渲染器

渲染 10 种表单组件。同样使用原生 HTML/CSS 实现，而非 Element Plus 的交互式组件：
- **select**：原生 `<select>` + `<option>`
- **radio**：原生 `<input type="radio">` 组
- **checkbox**：原生 `<input type="checkbox">` 组
- **switchComp**：纯 CSS 实现的开关滑块
- **textarea**：`<textarea readonly>`
- **datePicker** / **timePicker**：原生 `<input type="date/time" readonly>`
- **rate**：纯 CSS 星级评分展示
- **slider**：原生 `<input type="range">`
- **upload**：带图标的上传区域样式展示

##### `LayoutRenderer.vue` — 布局组件渲染器

渲染 6 种布局组件。核心特性是**嵌套支持**：
- **container**：带虚线边框的容器区域，内部使用 `VueDraggable` 支持拖入子组件
- **row**：Flex 行布局，支持子组件
- **col**：Flex 列布局，支持子组件
- **card**：带标题头和内容体的卡片容器，子组件放入 body 区域
- **tabs**：静态标签页头部展示（内容区域为占位）
- **collapse**：静态折叠面板展示

所有支持嵌套的组件都监听原生 `drop` 事件，当拖入新组件时调用 `store.addComponent(type, -1, parentId)` 将其添加为子组件。

##### `AdvancedRenderer.vue` — 高级组件渲染器

渲染 9 种高级组件，使用自定义 HTML 实现：
- **table**：完整的 `<table>` 渲染，包含 thead（列标题）和 tbody（数据行），支持列配置和数据行
- **carousel**：静态展示第一张图片，带有指示点和左右箭头样式
- **progress**：CSS 进度条，根据百分比填充宽度
- **badge**：在内容文字上方定位显示徽标数值
- **tag**：`<span>` 标签，支持 type（颜色）、effect（plain/dark/light）、size 变体
- **alert**：带图标、标题、描述、关闭按钮的提示框，支持 type 变体
- **avatar**：图片或图标头像，支持 circle/square 形状和多种尺寸
- **breadcrumb**：面包屑路径展示，带分隔符
- **pagination**：静态分页器展示

##### `ChartRenderer.vue` — 图表组件渲染器

渲染 5 种图表组件。这是**唯一使用真实渲染库（ECharts）的渲染器**：
- **lineChart**：折线图
- **barChart**：柱状图
- **pieChart**：饼图
- **radarChart**：雷达图
- **gaugeChart**：仪表盘

核心逻辑：
- `buildOption()` 函数根据组件类型和 props 构建 ECharts 配置项
- `onMounted` 时初始化 ECharts 实例
- `watch` 组件 props 的深变化，自动重新渲染
- 监听窗口 `resize` 事件，自适应容器大小
- 当图表 DOM 元素变化时，销毁旧实例并重新初始化

##### `DataRenderer.vue` — 数据展示组件渲染器

渲染 3 种数据展示组件：
- **statistic**：标题 + 格式化数值，支持前缀和后缀
- **countdown**：标题 + 实时倒计时字符串（基于目标时间戳与当前时间的差值计算）
- **tree**：递归渲染树形节点（最多 3 层嵌套），带展开图标和可选复选框

---

### `src/materials/` — 物料目录（预留）

包含三个空目录：`base/`、`form/`、`layout/`。这是为未来重构预留的目录结构，计划将各组件的物料定义拆分为独立文件。

---

## 组件体系总览

### 基础组件（7 种）

| 组件 | 类型标识 | 可配置属性 | 可配置样式 |
|------|---------|-----------|-----------|
| 按钮 | button | 文字、类型、尺寸、圆角、禁用 | 宽度、圆角、外边距 |
| 文本 | text | 内容、字号、颜色、行高、对齐、粗细 | 字号、颜色、行高、对齐、粗细 |
| 输入框 | input | 占位符、类型、禁用 | 宽度、外边距 |
| 图片 | image | 地址、适配方式、替代文本 | 宽高、边框、圆角 |
| 分割线 | divider | 方向、样式 | 外边距 |
| 图标 | icon | 图标名、大小、颜色 | — |
| 链接 | link | 文字、地址、打开方式 | 字号 |

### 表单组件（10 种）

| 组件 | 类型标识 | 可配置属性 |
|------|---------|-----------|
| 下拉选择 | select | 占位符、选项列表、禁用 |
| 单选框 | radio | 选项列表、禁用 |
| 多选框 | checkbox | 选项列表、禁用 |
| 开关 | switchComp | 开启/关闭文字、禁用 |
| 文本域 | textarea | 占位符、行数、最大长度 |
| 日期选择 | datePicker | 占位符、格式 |
| 时间选择 | timePicker | 占位符、格式 |
| 评分 | rate | 默认值、最大值、半选 |
| 滑块 | slider | 默认值、范围、步长 |
| 上传 | upload | 多选、数量限制、拖拽模式 |

### 布局组件（6 种）

| 组件 | 类型标识 | 说明 |
|------|---------|------|
| 容器 | container | 通用容器，支持嵌套任意子组件 |
| 行 | row | 栅格行布局（Flex） |
| 列 | col | 栅格列布局（Flex） |
| 卡片 | card | 带标题头的内容卡片，body 区域支持嵌套 |
| 标签页 | tabs | 多标签切换面板 |
| 折叠面板 | collapse | 可折叠的内容面板组 |

### 高级组件（9 种）

| 组件 | 类型标识 | 功能说明 |
|------|---------|---------|
| 表格 | table | 完整表格渲染，支持列配置和数据行编辑 |
| 轮播图 | carousel | 图片轮播，支持图片列表管理 |
| 进度条 | progress | 百分比进度展示，支持多种状态 |
| 徽标 | badge | 数值标记，可附加在内容上 |
| 标签 | tag | 标签元素，支持多种颜色和效果 |
| 提示 | alert | 信息提示框，支持类型和可关闭 |
| 头像 | avatar | 图片或图标头像，支持形状和尺寸 |
| 面包屑 | breadcrumb | 导航路径展示 |
| 分页 | pagination | 分页器展示 |

### 图表组件（5 种）

| 组件 | 类型标识 | 数据配置 |
|------|---------|---------|
| 折线图 | lineChart | X 轴数据 + 多系列数据 |
| 柱状图 | barChart | X 轴数据 + 多系列数据 |
| 饼图 | pieChart | 名称-数值数据项 |
| 雷达图 | radarChart | 指标配置 + 系列数据 |
| 仪表盘 | gaugeChart | 名称、数值、范围 |

### 数据展示组件（3 种）

| 组件 | 类型标识 | 可配置属性 |
|------|---------|-----------|
| 统计数值 | statistic | 标题、数值、前缀、后缀 |
| 倒计时 | countdown | 标题、目标时间 |
| 树形控件 | tree | 节点配置、递归子节点、复选框 |

---

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

---

## 设计特点

1. **JSON 驱动**：整个编辑器围绕一份 JSON 配置运作，组件的增删改查、撤销重做、导入导出都是对这份 JSON 的操作
2. **渲染与配置分离**：渲染器使用原生 HTML/CSS 而非 Element Plus 交互组件，避免画布上的表单双向绑定干扰编辑操作
3. **递归组件树**：`RenderComponent` 自引用实现组件树的嵌套渲染，布局组件可无限嵌套子组件
4. **草稿-确认模式**：属性和样式编辑采用草稿副本，避免实时修改带来的历史记录污染
5. **设计令牌系统**：通过 CSS 自定义属性统一管理主题色和交互态样式
6. **ECharts 真实渲染**：图表组件使用真实的 ECharts 实例渲染，所见即所得

---

## 后续规划

- [ ] 事件交互配置（点击跳转、显隐联动）
- [ ] 数据绑定（接口数据对接）
- [ ] 后端对接（页面保存/加载、模板中心）
- [ ] 协同编辑
- [ ] 自定义组件开发
