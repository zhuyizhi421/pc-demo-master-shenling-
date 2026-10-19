<!-- 审核记录查看弹窗 -->
<template>
  <CustomDialog v-model="visible" title="审核记录" width="600px" @close="visible = false">
    <el-table :data="tableData" border style="width: 100%" max-height="400">
      <el-table-column prop="reportNo" label="报工单号" width="160" />
      <el-table-column prop="originalQty" label="报工数量" width="100" align="right" />
      <el-table-column prop="reviewedQty" label="审核数量" width="100" align="right" />
      <el-table-column prop="reviewer" label="审核人" width="100" />
      <el-table-column prop="reviewTime" label="审核时间" width="160" />
      <el-table-column prop="remark" label="备注" min-width="120" />
    </el-table>
    <el-empty v-if="tableData.length === 0" description="暂无审核记录" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { getProductionReportReviews } from "@/api/scheduling"

const props = defineProps<{
  modelValue: boolean
  reportId?: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const tableData = ref<any[]>([])

// 加载审核记录
const loadReviewRecords = async () => {
  if (!props.reportId) return
  try {
    const res = await getProductionReportReviews(props.reportId)
    tableData.value = res?.list || []
  } catch (e) {
    console.error("加载审核记录失败", e)
    tableData.value = []
  }
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadReviewRecords()
    }
  }
)
</script>
