<template>
  <div class="custom-pagination" :class="{ border: props.border }">
    <el-pagination
      :page-size="props.pageSize"
      :current-page="props.currentPage"
      :total="Number(props.total)"
      :page-sizes="props.pageSizes"
      :default-page-size="props.pageSizes[0]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { IPaginationEmits, IPaginationProps } from "./type"

defineOptions({
  name: "CustomPagination"
})

const props = withDefaults(defineProps<IPaginationProps>(), {
  pageSizes: () => [20, 30, 50, 100],
  border: true
})
const emit = defineEmits<IPaginationEmits>()

/**
 * page-size 改变时触发
 * @param pageSize 每页显示条目个数
 */
const onSizeChange = (pageSize: number) => {
  emit("update:pageSize", pageSize)
}

/**
 * current-page 改变时触发
 * @param currentPage 当前页码
 */
const onCurrentChange = (currentPage: number) => {
  emit("update:currentPage", currentPage)
}
</script>

<style lang="scss" scoped>
.custom-pagination {
  padding: 16px 20px;

  &.border {
    border-top: 1px solid #e5e5e5;
  }
  &:deep(.el-pagination) {
    .el-pagination__total {
      margin-right: auto;
    }
  }
}
</style>
