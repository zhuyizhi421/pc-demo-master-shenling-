<!-- 批量审核弹窗 -->
<template>
  <CustomDialog v-model="visible" title="批量审核" width="600px" @close="visible = false">
    <div class="batch-review-content">
      <div class="summary-info">
        <span class="label">已选记录：</span>
        <span class="value">{{ uncheckedRows.length }} 条</span>
        <span class="label">报工总数：</span>
        <span class="value">{{ totalReportQty }}</span>
      </div>

      <hr class="divider" />

      <div class="review-setting">
        <div class="setting-item">
          <span class="label">审核数量：</span>
          <el-radio-group v-model="reviewType">
            <el-radio value="same">与报工数量相同</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
        </div>

        <div v-if="reviewType === 'custom'" class="custom-qty">
          <el-input-number
            v-model="customReviewQty"
            :min="0"
            :max="totalReportQty"
            controls-position="right"
          />
          <span class="tip">(将统一设置所有记录的审核数量)</span>
        </div>
      </div>

      <hr class="divider" />

      <div class="remark-section">
        <span class="label">备注：</span>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（可选）"
          maxlength="200"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认审核 ({{ uncheckedRows.length }})
      </el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"
import axios from "axios"
import useUserStore from "@/store/modules/user"
import CustomDialog from "@/components/CustomDialog/index.vue"

interface ITableRow {
  id?: string
  reportQty: number
  reviewedQty?: number | null
}

const props = defineProps<{
  modelValue: boolean
  rows: ITableRow[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  success: []
}>()

const userStore = useUserStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const loading = ref(false)
const reviewType = ref<"same" | "custom">("same")
const customReviewQty = ref(0)
const remark = ref("")

// 未审核的记录
const uncheckedRows = computed(() =>
  props.rows.filter((row) => row.reviewedQty === null || row.reviewedQty === undefined)
)

// 报工总数
const totalReportQty = computed(() =>
  uncheckedRows.value.reduce((sum, row) => sum + (row.reportQty || 0), 0)
)

// 初始化默认值
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      reviewType.value = "same"
      customReviewQty.value = totalReportQty.value
      remark.value = ""
    }
  }
)

const handleSubmit = async () => {
  if (uncheckedRows.value.length === 0) {
    ElMessage.warning("没有未审核的记录")
    return
  }

  loading.value = true
  try {
    // 逐条提交审核
    for (const row of uncheckedRows.value) {
      const reviewQty = reviewType.value === "same" ? row.reportQty : customReviewQty.value
      await axios.post("/production/report/review", {
        id: row.id,
        physicalCheckQty: reviewQty,
        reviewedQty: reviewQty,
        reviewer: userStore.name || userStore.nickname || "审核员",
        remark: remark.value
      })
    }

    ElMessage.success(`成功审核 ${uncheckedRows.value.length} 条记录`)
    visible.value = false
    emit("success")
  } catch (error: any) {
    ElMessage.error(error?.message || "批量审核失败")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.batch-review-content {
  padding: 8px 0;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 4px;

  .label {
    color: #606266;
    font-size: 14px;
  }

  .value {
    color: #303133;
    font-weight: 700;
    font-size: 16px;
  }
}

.divider {
  border: none;
  border-top: 1px solid #ebeef5;
  margin: 16px 0;
}

.review-setting {
  padding: 0 16px;

  .setting-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .label {
      color: #303133;
      font-size: 14px;
    }
  }

  .custom-qty {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 84px;

    .tip {
      color: #909399;
      font-size: 12px;
    }
  }
}

.remark-section {
  padding: 0 16px;

  .label {
    display: block;
    color: #303133;
    font-size: 14px;
    margin-bottom: 8px;
  }
}
</style>
