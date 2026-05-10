<template>
  <!-- 按钮 -->
  <template v-if="component.type === 'button'">
    <el-form-item label="按钮文字"><el-input v-model="dp.text" /></el-form-item>
    <el-form-item label="按钮类型">
      <el-select v-model="dp.type">
        <el-option label="主要按钮" value="primary" />
        <el-option label="成功按钮" value="success" />
        <el-option label="警告按钮" value="warning" />
        <el-option label="危险按钮" value="danger" />
        <el-option label="信息按钮" value="info" />
      </el-select>
    </el-form-item>
    <el-form-item label="尺寸">
      <el-select v-model="dp.size">
        <el-option label="大" value="large" /><el-option label="默认" value="default" /><el-option label="小" value="small" />
      </el-select>
    </el-form-item>
    <el-form-item label="圆角"><el-switch v-model="dp.round" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 文本 -->
  <template v-else-if="component.type === 'text'">
    <el-form-item label="文本内容"><el-input v-model="dp.content" type="textarea" :rows="3" /></el-form-item>
    <el-form-item label="标签类型">
      <el-select v-model="dp.tag">
        <el-option label="段落" value="p" /><el-option label="标题1" value="h1" /><el-option label="标题2" value="h2" />
        <el-option label="标题3" value="h3" /><el-option label="标题4" value="h4" /><el-option label="标题5" value="h5" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 输入框 -->
  <template v-else-if="component.type === 'input'">
    <el-form-item label="占位符"><el-input v-model="dp.placeholder" /></el-form-item>
    <el-form-item label="类型">
      <el-select v-model="dp.type">
        <el-option label="文本" value="text" /><el-option label="密码" value="password" /><el-option label="数字" value="number" />
      </el-select>
    </el-form-item>
    <el-form-item label="可清空"><el-switch v-model="dp.clearable" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 图片 -->
  <template v-else-if="component.type === 'image'">
    <el-form-item label="图片地址"><el-input v-model="dp.src" /></el-form-item>
    <el-form-item label="适应方式">
      <el-select v-model="dp.fit">
        <el-option label="填充" value="fill" /><el-option label="包含" value="contain" />
        <el-option label="覆盖" value="cover" /><el-option label="无" value="none" />
      </el-select>
    </el-form-item>
    <el-form-item label="替代文本"><el-input v-model="dp.alt" /></el-form-item>
  </template>

  <!-- 分割线 -->
  <template v-else-if="component.type === 'divider'">
    <el-form-item label="方向">
      <el-radio-group v-model="dp.direction">
        <el-radio label="horizontal">水平</el-radio><el-radio label="vertical">垂直</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="样式">
      <el-select v-model="dp.borderStyle">
        <el-option label="实线" value="solid" /><el-option label="虚线" value="dashed" /><el-option label="点线" value="dotted" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 图标 -->
  <template v-else-if="component.type === 'icon'">
    <el-form-item label="图标名称"><el-input v-model="dp.name" placeholder="如: Star, Edit, Delete" /></el-form-item>
    <el-form-item label="大小"><el-input-number v-model="dp.size" :min="12" :max="100" /></el-form-item>
    <el-form-item label="颜色"><el-color-picker v-model="dp.color" /></el-form-item>
  </template>

  <!-- 链接 -->
  <template v-else-if="component.type === 'link'">
    <el-form-item label="链接文字"><el-input v-model="dp.text" /></el-form-item>
    <el-form-item label="链接地址"><el-input v-model="dp.href" /></el-form-item>
    <el-form-item label="打开方式">
      <el-select v-model="dp.target">
        <el-option label="新窗口" value="_blank" /><el-option label="当前窗口" value="_self" />
      </el-select>
    </el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 下拉选择 -->
  <template v-else-if="component.type === 'select'">
    <el-form-item label="占位符"><el-input v-model="dp.placeholder" /></el-form-item>
    <el-form-item label="选项">
      <div v-for="(option, index) in dp.options" :key="index" class="option-item">
        <el-input v-model="option.label" placeholder="标签" />
        <el-input v-model="option.value" placeholder="值" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeOption(index)" />
      </div>
      <el-button type="primary" link @click="ops.addOption">添加选项</el-button>
    </el-form-item>
    <el-form-item label="可清空"><el-switch v-model="dp.clearable" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 单选框 -->
  <template v-else-if="component.type === 'radio'">
    <el-form-item label="选项">
      <div v-for="(option, index) in dp.options" :key="index" class="option-item">
        <el-input v-model="option.label" placeholder="标签" />
        <el-input v-model="option.value" placeholder="值" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeOption(index)" />
      </div>
      <el-button type="primary" link @click="ops.addOption">添加选项</el-button>
    </el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 多选框 -->
  <template v-else-if="component.type === 'checkbox'">
    <el-form-item label="选项">
      <div v-for="(option, index) in dp.options" :key="index" class="option-item">
        <el-input v-model="option.label" placeholder="标签" />
        <el-input v-model="option.value" placeholder="值" />
        <el-button type="danger" :icon="Delete" circle @click="ops.removeOption(index)" />
      </div>
      <el-button type="primary" link @click="ops.addOption">添加选项</el-button>
    </el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 开关 -->
  <template v-else-if="component.type === 'switchComp'">
    <el-form-item label="开启文字"><el-input v-model="dp.activeText" /></el-form-item>
    <el-form-item label="关闭文字"><el-input v-model="dp.inactiveText" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 文本域 -->
  <template v-else-if="component.type === 'textarea'">
    <el-form-item label="占位符"><el-input v-model="dp.placeholder" /></el-form-item>
    <el-form-item label="行数"><el-input-number v-model="dp.rows" :min="2" :max="20" /></el-form-item>
    <el-form-item label="最大长度"><el-input v-model="dp.maxlength" placeholder="不限制" /></el-form-item>
    <el-form-item label="显示字数"><el-switch v-model="dp.showWordLimit" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 日期选择 -->
  <template v-else-if="component.type === 'datePicker'">
    <el-form-item label="占位符"><el-input v-model="dp.placeholder" /></el-form-item>
    <el-form-item label="格式"><el-input v-model="dp.format" /></el-form-item>
    <el-form-item label="可清空"><el-switch v-model="dp.clearable" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 时间选择 -->
  <template v-else-if="component.type === 'timePicker'">
    <el-form-item label="占位符"><el-input v-model="dp.placeholder" /></el-form-item>
    <el-form-item label="格式"><el-input v-model="dp.format" /></el-form-item>
    <el-form-item label="可清空"><el-switch v-model="dp.clearable" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 评分 -->
  <template v-else-if="component.type === 'rate'">
    <el-form-item label="默认值"><el-input-number v-model="dp.modelValue" :min="0" :max="dp.max" /></el-form-item>
    <el-form-item label="最大值"><el-input-number v-model="dp.max" :min="1" :max="10" /></el-form-item>
    <el-form-item label="允许半选"><el-switch v-model="dp.allowHalf" /></el-form-item>
    <el-form-item label="显示文字"><el-switch v-model="dp.showText" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 滑块 -->
  <template v-else-if="component.type === 'slider'">
    <el-form-item label="默认值"><el-input-number v-model="dp.modelValue" :min="dp.min" :max="dp.max" /></el-form-item>
    <el-form-item label="最小值"><el-input-number v-model="dp.min" /></el-form-item>
    <el-form-item label="最大值"><el-input-number v-model="dp.max" /></el-form-item>
    <el-form-item label="步长"><el-input-number v-model="dp.step" :min="1" /></el-form-item>
    <el-form-item label="显示输入框"><el-switch v-model="dp.showInput" /></el-form-item>
    <el-form-item label="禁用"><el-switch v-model="dp.disabled" /></el-form-item>
  </template>

  <!-- 上传 -->
  <template v-else-if="component.type === 'upload'">
    <el-form-item label="多选"><el-switch v-model="dp.multiple" /></el-form-item>
    <el-form-item label="数量限制"><el-input-number v-model="dp.limit" :min="1" :max="20" /></el-form-item>
    <el-form-item label="文件类型"><el-input v-model="dp.accept" placeholder="如: .jpg,.png" /></el-form-item>
    <el-form-item label="拖拽上传"><el-switch v-model="dp.drag" /></el-form-item>
    <el-form-item label="提示文字"><el-input v-model="dp.tip" /></el-form-item>
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
</style>
