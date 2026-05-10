<template>
  <!-- 容器 -->
  <template v-if="component.type === 'container'">
    <el-form-item label="容器说明"><span class="tip-text">容器可嵌套其他组件</span></el-form-item>
  </template>

  <!-- 行布局 -->
  <template v-else-if="component.type === 'row'">
    <el-form-item label="栅格间隔"><el-input-number v-model="dp.gutter" :min="0" :max="50" /></el-form-item>
    <el-form-item label="水平排列">
      <el-select v-model="dp.justify">
        <el-option label="左对齐" value="start" /><el-option label="居中" value="center" />
        <el-option label="右对齐" value="end" /><el-option label="两端对齐" value="space-between" />
        <el-option label="等距" value="space-around" />
      </el-select>
    </el-form-item>
    <el-form-item label="垂直对齐">
      <el-select v-model="dp.align">
        <el-option label="顶部" value="top" /><el-option label="居中" value="middle" /><el-option label="底部" value="bottom" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 列布局 -->
  <template v-else-if="component.type === 'col'">
    <el-form-item label="栅格宽度"><el-slider v-model="dp.span" :min="1" :max="24" show-stops /></el-form-item>
  </template>

  <!-- 卡片 -->
  <template v-else-if="component.type === 'card'">
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="阴影">
      <el-select v-model="dp.shadow">
        <el-option label="总是显示" value="always" /><el-option label="悬浮显示" value="hover" /><el-option label="不显示" value="never" />
      </el-select>
    </el-form-item>
    <el-form-item label="显示头部"><el-switch v-model="dp.showHeader" /></el-form-item>
  </template>

  <!-- 标签页 -->
  <template v-else-if="component.type === 'tabs'">
    <el-form-item label="标签项">
      <div v-for="(tab, index) in dp.tabs" :key="index" class="option-item">
        <el-input v-model="tab.label" placeholder="标签名" />
        <el-input v-model="tab.name" placeholder="值" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeTab(index)" />
      </div>
      <el-button type="primary" link @click="ops.addTab">添加标签</el-button>
    </el-form-item>
    <el-form-item label="风格">
      <el-select v-model="dp.type">
        <el-option label="默认" value="" /><el-option label="卡片" value="card" /><el-option label="边框" value="border-card" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 折叠面板 -->
  <template v-else-if="component.type === 'collapse'">
    <el-form-item label="面板项">
      <div v-for="(item, index) in dp.items" :key="index" class="collapse-item-config">
        <el-input v-model="item.title" placeholder="标题" />
        <el-input v-model="item.content" placeholder="内容" type="textarea" :rows="2" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeCollapseItem(index)" />
      </div>
      <el-button type="primary" link @click="ops.addCollapseItem">添加面板</el-button>
    </el-form-item>
    <el-form-item label="手风琴"><el-switch v-model="dp.accordion" /></el-form-item>
  </template>

  <!-- 表格 -->
  <template v-else-if="component.type === 'table'">
    <el-divider content-position="left">列配置</el-divider>
    <div class="table-config-section">
      <div v-for="(col, index) in dp.columns" :key="'col-'+index" class="table-col-item">
        <div class="col-row">
          <el-input v-model="col.prop" placeholder="字段名" size="small" />
          <el-input v-model="col.label" placeholder="列标题" size="small" />
          <el-input v-model="col.width" placeholder="宽度" size="small" style="width: 80px;" />
          <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeColumn(index)" />
        </div>
      </div>
      <el-button type="primary" size="small" @click="ops.addColumn">添加列</el-button>
    </div>

    <el-divider content-position="left">数据编辑</el-divider>
    <div class="table-data-section">
      <div class="data-table-wrapper">
        <table class="data-edit-table">
          <thead><tr>
            <th v-for="col in dp.columns" :key="col.prop">{{ col.label || col.prop }}</th>
            <th width="60">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="(row, rowIndex) in dp.data" :key="'row-'+rowIndex">
              <td v-for="col in dp.columns" :key="col.prop"><el-input v-model="row[col.prop]" size="small" /></td>
              <td><el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeDataRow(rowIndex)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <el-button type="primary" size="small" @click="ops.addDataRow" style="margin-top: 8px;">添加行</el-button>
    </div>

    <el-divider content-position="left">表格设置</el-divider>
    <el-form-item label="显示边框"><el-switch v-model="dp.border" /></el-form-item>
    <el-form-item label="斑马纹"><el-switch v-model="dp.stripe" /></el-form-item>
    <el-form-item label="显示表头"><el-switch v-model="dp.showHeader" /></el-form-item>
  </template>

  <!-- 轮播图 -->
  <template v-else-if="component.type === 'carousel'">
    <el-divider content-position="left">图片列表</el-divider>
    <div class="carousel-images-section">
      <div v-for="(img, index) in dp.images" :key="index" class="carousel-image-item">
        <el-input v-model="img.src" placeholder="图片地址" size="small" />
        <el-input v-model="img.alt" placeholder="描述" size="small" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="ops.removeCarouselImage(index)" />
      </div>
      <el-button type="primary" size="small" @click="ops.addCarouselImage">添加图片</el-button>
    </div>
    <el-divider content-position="left">轮播设置</el-divider>
    <el-form-item label="高度"><el-input v-model="dp.height" /></el-form-item>
    <el-form-item label="自动播放"><el-switch v-model="dp.autoplay" /></el-form-item>
    <el-form-item label="间隔(ms)"><el-input-number v-model="dp.interval" :min="1000" :max="10000" :step="500" /></el-form-item>
    <el-form-item label="箭头">
      <el-select v-model="dp.arrow">
        <el-option label="悬浮显示" value="hover" /><el-option label="始终显示" value="always" /><el-option label="不显示" value="never" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 进度条 -->
  <template v-else-if="component.type === 'progress'">
    <el-form-item label="百分比"><el-slider v-model="dp.percentage" :min="0" :max="100" /></el-form-item>
    <el-form-item label="进度条宽度"><el-input-number v-model="dp.strokeWidth" :min="4" :max="20" /></el-form-item>
    <el-form-item label="文字内置"><el-switch v-model="dp.textInside" /></el-form-item>
    <el-form-item label="显示文字"><el-switch v-model="dp.showText" /></el-form-item>
    <el-form-item label="状态">
      <el-select v-model="dp.status">
        <el-option label="默认" value="" /><el-option label="成功" value="success" />
        <el-option label="异常" value="exception" /><el-option label="警告" value="warning" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 徽标 -->
  <template v-else-if="component.type === 'badge'">
    <el-form-item label="显示文字"><el-input v-model="dp.text" /></el-form-item>
    <el-form-item label="值"><el-input-number v-model="dp.value" :min="0" /></el-form-item>
    <el-form-item label="最大值"><el-input-number v-model="dp.max" :min="1" /></el-form-item>
    <el-form-item label="小圆点"><el-switch v-model="dp.isDot" /></el-form-item>
    <el-form-item label="类型">
      <el-select v-model="dp.type">
        <el-option label="主要" value="primary" /><el-option label="成功" value="success" />
        <el-option label="警告" value="warning" /><el-option label="危险" value="danger" /><el-option label="信息" value="info" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 标签 -->
  <template v-else-if="component.type === 'tag'">
    <el-form-item label="标签文字"><el-input v-model="dp.text" /></el-form-item>
    <el-form-item label="类型">
      <el-select v-model="dp.type">
        <el-option label="默认" value="" /><el-option label="主要" value="primary" /><el-option label="成功" value="success" />
        <el-option label="警告" value="warning" /><el-option label="危险" value="danger" /><el-option label="信息" value="info" />
      </el-select>
    </el-form-item>
    <el-form-item label="效果">
      <el-select v-model="dp.effect">
        <el-option label="浅色" value="light" /><el-option label="深色" value="dark" /><el-option label="朴素" value="plain" />
      </el-select>
    </el-form-item>
    <el-form-item label="尺寸">
      <el-select v-model="dp.size">
        <el-option label="大" value="large" /><el-option label="默认" value="default" /><el-option label="小" value="small" />
      </el-select>
    </el-form-item>
    <el-form-item label="可关闭"><el-switch v-model="dp.closable" /></el-form-item>
  </template>

  <!-- 提示 -->
  <template v-else-if="component.type === 'alert'">
    <el-form-item label="标题"><el-input v-model="dp.title" /></el-form-item>
    <el-form-item label="描述"><el-input v-model="dp.description" type="textarea" :rows="2" /></el-form-item>
    <el-form-item label="类型">
      <el-select v-model="dp.type">
        <el-option label="成功" value="success" /><el-option label="警告" value="warning" />
        <el-option label="错误" value="error" /><el-option label="信息" value="info" />
      </el-select>
    </el-form-item>
    <el-form-item label="显示图标"><el-switch v-model="dp.showIcon" /></el-form-item>
    <el-form-item label="可关闭"><el-switch v-model="dp.closable" /></el-form-item>
    <el-form-item label="居中"><el-switch v-model="dp.center" /></el-form-item>
  </template>

  <!-- 头像 -->
  <template v-else-if="component.type === 'avatar'">
    <el-form-item label="图片地址"><el-input v-model="dp.src" /></el-form-item>
    <el-form-item label="形状">
      <el-select v-model="dp.shape">
        <el-option label="圆形" value="circle" /><el-option label="方形" value="square" />
      </el-select>
    </el-form-item>
    <el-form-item label="大小">
      <el-select v-model="dp.size">
        <el-option label="大" value="large" /><el-option label="默认" value="default" /><el-option label="小" value="small" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 面包屑 -->
  <template v-else-if="component.type === 'breadcrumb'">
    <el-form-item label="分隔符"><el-input v-model="dp.separator" /></el-form-item>
    <el-form-item label="面包屑项">
      <div v-for="(item, index) in dp.items" :key="index" class="option-item">
        <el-input v-model="item.label" placeholder="名称" />
        <el-input v-model="item.path" placeholder="路径(可选)" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeBreadcrumbItem(index)" />
      </div>
      <el-button type="primary" link @click="ops.addBreadcrumbItem">添加项</el-button>
    </el-form-item>
  </template>

  <!-- 分页 -->
  <template v-else-if="component.type === 'pagination'">
    <el-form-item label="总条数"><el-input-number v-model="dp.total" :min="0" /></el-form-item>
    <el-form-item label="当前页"><el-input-number v-model="dp.currentPage" :min="1" /></el-form-item>
    <el-form-item label="每页条数"><el-input-number v-model="dp.pageSize" :min="1" /></el-form-item>
    <el-form-item label="背景"><el-switch v-model="dp.background" /></el-form-item>
  </template>
</template>

<script setup>
import { toRef } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useListOps } from './useListOps'

const props = defineProps({
  component: { type: Object, required: true },
  draftProps: { type: Object, required: true }
})

const dp = toRef(props, 'draftProps')
const ops = useListOps(dp)
</script>

<style scoped>
.option-item { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.option-item .el-input { flex: 1; }
.tip-text { font-size: 12px; color: #909399; }
.collapse-item-config { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 8px; background: #f5f7fa; border-radius: 4px; }
.table-config-section { margin-bottom: 12px; }
.table-col-item { margin-bottom: 8px; }
.col-row { display: flex; gap: 6px; align-items: center; }
.col-row .el-input { flex: 1; }
.table-data-section { margin-bottom: 12px; }
.data-table-wrapper { overflow-x: auto; border: 1px solid #ebeef5; border-radius: 4px; }
.data-edit-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-edit-table th, .data-edit-table td { padding: 6px 8px; border: 1px solid #ebeef5; text-align: left; }
.data-edit-table th { background: #f5f7fa; font-weight: 500; }
.data-edit-table .el-input { width: 100%; }
.carousel-images-section { margin-bottom: 12px; }
.carousel-image-item { display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }
.carousel-image-item .el-input { flex: 1; }
</style>
