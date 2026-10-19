<template>
  <el-popover
    placement="bottom"
    :width="180"
    trigger="click"
    @show="visible = true"
    @hide="visible = false"
  >
    <template #reference>
      <span class="column-header">
        <span class="column-label" :class="{ 'has-filter': hasFilter }">{{ label }}</span>
        <el-icon class="search-icon" :class="{ active: visible, 'has-filter': hasFilter }"><Search /></el-icon>
      </span>
    </template>
    <div class="search-content">
      <slot />
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue"

defineProps<{
  label: string
  hasFilter?: boolean
}>()

const visible = defineModel<boolean>("visible", { default: false })
</script>

<style scoped>
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.column-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.column-label.has-filter {
  color: #409eff;
  font-weight: 600;
}
.search-icon {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
  flex-shrink: 0;
}
.search-icon:hover,
.search-icon.active {
  color: #409eff;
}
.search-icon.has-filter {
  color: #409eff;
}
</style>
