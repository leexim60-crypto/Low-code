<template>
  <!-- 表格 -->
  <div v-if="component.type === 'table'" class="table-wrapper" :style="{ width: component.style.width }">
    <table class="custom-table" :class="{ 'is-border': component.props.border, 'is-stripe': component.props.stripe }">
      <thead v-if="component.props.showHeader">
        <tr>
          <th v-for="col in component.props.columns" :key="col.prop" :style="{ width: col.width ? col.width + 'px' : '' }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in component.props.data" :key="index">
          <td v-for="col in component.props.columns" :key="col.prop">{{ row[col.prop] }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 轮播图 -->
  <div v-else-if="component.type === 'carousel'" class="carousel-wrapper" :style="{ width: component.style.width }">
    <div class="carousel-container">
      <div class="carousel-track">
        <div class="carousel-slide">
          <img :src="component.props.images[0]?.src" :alt="component.props.images[0]?.alt" />
        </div>
      </div>
      <div class="carousel-indicators">
        <span v-for="(img, index) in component.props.images" :key="index" class="indicator"
          :class="{ 'is-active': index === 0 }"></span>
      </div>
      <div class="carousel-arrow carousel-arrow-left">&lt;</div>
      <div class="carousel-arrow carousel-arrow-right">&gt;</div>
    </div>
  </div>

  <!-- 进度条 -->
  <div v-else-if="component.type === 'progress'" class="progress-wrapper" :style="{ width: component.style.width }">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: component.props.percentage + '%', backgroundColor: component.props.color || 'var(--lc-primary)' }">
        <span v-if="component.props.textInside && component.props.showText" class="progress-text">
          {{ component.props.percentage }}%
        </span>
      </div>
    </div>
    <span v-if="!component.props.textInside && component.props.showText" class="progress-text-outside">
      {{ component.props.percentage }}%
    </span>
  </div>

  <!-- 徽标 -->
  <div v-else-if="component.type === 'badge'" class="badge-wrapper">
    <span class="badge-content">{{ component.props.text }}</span>
    <span class="badge-value" :class="[`badge--${component.props.type}`, { 'is-dot': component.props.isDot }]"
      v-if="!component.props.hidden">
      {{ component.props.isDot ? '' : (component.props.value > component.props.max ? component.props.max + '+' : component.props.value) }}
    </span>
  </div>

  <!-- 标签 -->
  <span v-else-if="component.type === 'tag'" class="custom-tag"
    :class="[`tag--${component.props.type || 'default'}`, `tag--${component.props.effect}`, `tag--${component.props.size}`]">
    {{ component.props.text }}
    <span v-if="component.props.closable" class="tag-close">×</span>
  </span>

  <!-- 提示 -->
  <div v-else-if="component.type === 'alert'" class="custom-alert"
    :class="[`alert--${component.props.type}`, { 'is-center': component.props.center }]">
    <span v-if="component.props.showIcon" class="alert-icon">{{ alertIcon }}</span>
    <div class="alert-content">
      <span class="alert-title">{{ component.props.title }}</span>
      <span v-if="component.props.description" class="alert-description">{{ component.props.description }}</span>
    </div>
    <span v-if="component.props.closable" class="alert-close">×</span>
  </div>

  <!-- 头像 -->
  <div v-else-if="component.type === 'avatar'" class="avatar-wrapper">
    <img v-if="component.props.src" :src="component.props.src" class="avatar-image"
      :class="[`avatar--${component.props.shape}`, `avatar--${component.props.size}`]" />
    <div v-else class="avatar-icon"
      :class="[`avatar--${component.props.shape}`, `avatar--${component.props.size}`]">
      <el-icon><User /></el-icon>
    </div>
  </div>

  <!-- 面包屑 -->
  <div v-else-if="component.type === 'breadcrumb'" class="breadcrumb-wrapper">
    <span v-for="(item, index) in component.props.items" :key="index" class="breadcrumb-item">
      <a v-if="item.path" :href="item.path">{{ item.label }}</a>
      <span v-else>{{ item.label }}</span>
      <span v-if="index < component.props.items.length - 1" class="breadcrumb-separator">{{ component.props.separator }}</span>
    </span>
  </div>

  <!-- 分页 -->
  <div v-else-if="component.type === 'pagination'" class="pagination-wrapper">
    <span class="pagination-total">共 {{ component.props.total }} 条</span>
    <div class="pagination-pager">
      <span class="pager-item" :class="{ 'is-disabled': currentPage <= 1 }" @click="changePage(currentPage - 1)">&lt;</span>
      <span v-for="page in displayPages" :key="page"
        class="pager-item" :class="{ 'is-active': page === currentPage, 'is-ellipsis': page === '...' }"
        @click="page !== '...' && changePage(page)">
        {{ page }}
      </span>
      <span class="pager-item" :class="{ 'is-disabled': currentPage >= totalPages }" @click="changePage(currentPage + 1)">&gt;</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { User } from '@element-plus/icons-vue'

const props = defineProps({
  component: { type: Object, required: true }
})

const alertIcon = computed(() => {
  const icons = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' }
  return icons[props.component.props.type] || 'ℹ'
})

// 分页相关
const currentPage = ref(1)

const totalPages = computed(() => {
  const p = props.component.props
  return Math.ceil((p.total || 0) / (p.pageSize || 10))
})

const displayPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<style scoped>
.table-wrapper { overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; font-size: 14px; color: #606266; }
.custom-table th, .custom-table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #ebeef5; }
.custom-table th { background: #f5f7fa; font-weight: 500; }
.custom-table.is-border th, .custom-table.is-border td { border: 1px solid #ebeef5; }
.custom-table.is-stripe tbody tr:nth-child(even) { background: #fafafa; }

.carousel-wrapper { position: relative; overflow: hidden; }
.carousel-container { position: relative; }
.carousel-track { overflow: hidden; }
.carousel-slide img { width: 100%; height: 300px; object-fit: cover; display: block; }
.carousel-indicators {
  position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px;
}
.indicator { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }
.indicator.is-active { background: #fff; }
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px;
  background: rgba(0,0,0,0.3); color: #fff; display: flex; align-items: center;
  justify-content: center; cursor: pointer; border-radius: 50%; font-size: 18px;
}
.carousel-arrow-left { left: 10px; }
.carousel-arrow-right { right: 10px; }

.progress-wrapper { display: flex; align-items: center; }
.progress-bar { flex: 1; height: 6px; background: #e4e7ed; border-radius: 3px; overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: 3px; transition: width 0.3s;
  display: flex; align-items: center; justify-content: flex-end;
}
.progress-text { font-size: 12px; color: #fff; padding: 0 8px; }
.progress-text-outside { font-size: 14px; color: #606266; margin-left: 10px; }

.badge-wrapper { display: inline-flex; position: relative; }
.badge-content { font-size: 14px; }
.badge-value {
  position: absolute; top: -8px; right: -10px; height: 18px; line-height: 18px;
  padding: 0 6px; font-size: 12px; color: #fff; border-radius: 10px; background: #f56c6c;
}
.badge-value.is-dot { width: 8px; height: 8px; padding: 0; right: -4px; top: -4px; }
.badge--primary { background: var(--lc-primary); }
.badge--success { background: #67c23a; }
.badge--warning { background: #e6a23c; }
.badge--danger { background: #f56c6c; }
.badge--info { background: #909399; }

.custom-tag {
  display: inline-flex; align-items: center; height: 24px; padding: 0 10px;
  font-size: 12px; border-radius: 4px; border: 1px solid #e9ecf0; background: #f4f4f5; color: #909399;
}
.custom-tag.tag--light { background: #fff; }
.custom-tag.tag--dark { color: #fff; }
.tag--primary { color: var(--lc-primary); border-color: var(--lc-primary-border); background: var(--lc-primary-light); }
.tag--success { color: #67c23a; border-color: #e1f3d8; background: #f0f9eb; }
.tag--warning { color: #e6a23c; border-color: #faecd8; background: #fdf6ec; }
.tag--danger { color: #f56c6c; border-color: #fde2e2; background: #fef0f0; }
.tag--info { color: #909399; border-color: #e9ecf0; background: #f4f4f5; }
.tag-close { margin-left: 6px; cursor: pointer; }

.custom-alert {
  display: flex; align-items: flex-start; padding: 12px 16px; border-radius: 4px; font-size: 14px;
}
.alert--success { background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8; }
.alert--warning { background: #fdf6ec; color: #e6a23c; border: 1px solid #faecd8; }
.alert--error { background: #fef0f0; color: #f56c6c; border: 1px solid #fde2e2; }
.alert--info { background: #f4f4f5; color: #909399; border: 1px solid #e9ecf0; }
.alert-icon { margin-right: 10px; font-size: 16px; }
.alert-content { flex: 1; }
.alert-title { font-weight: 500; }
.alert-description { display: block; margin-top: 8px; font-size: 12px; opacity: 0.8; }
.alert-close { cursor: pointer; font-size: 16px; opacity: 0.6; }
.alert-close:hover { opacity: 1; }

.avatar-wrapper { display: inline-flex; }
.avatar-image, .avatar-icon {
  display: flex; align-items: center; justify-content: center;
  background: #c0c4cc; color: #fff; overflow: hidden;
}
.avatar--circle { border-radius: 50%; }
.avatar--square { border-radius: 4px; }
.avatar--large { width: 40px; height: 40px; font-size: 20px; }
.avatar--default { width: 32px; height: 32px; font-size: 16px; }
.avatar--small { width: 24px; height: 24px; font-size: 12px; }
.avatar-image { object-fit: cover; }

.breadcrumb-wrapper { font-size: 14px; }
.breadcrumb-item a { color: #606266; text-decoration: none; }
.breadcrumb-item a:hover { color: var(--lc-primary); }
.breadcrumb-separator { margin: 0 8px; color: #c0c4cc; }

.pagination-wrapper { display: flex; align-items: center; font-size: 14px; }
.pagination-total { margin-right: 16px; color: #606266; }
.pagination-pager { display: flex; gap: 4px; }
.pager-item {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px; padding: 0 8px; background: #fff;
  border: 1px solid #dcdfe6; border-radius: 4px; color: #606266; cursor: pointer;
}
.pager-item:hover { color: var(--lc-primary); }
.pager-item.is-active { background: var(--lc-primary); color: #fff; border-color: var(--lc-primary); }
.pager-item.is-disabled { opacity: 0.5; cursor: not-allowed; }
.pager-item.is-ellipsis { cursor: default; border: none; background: transparent; }
</style>
