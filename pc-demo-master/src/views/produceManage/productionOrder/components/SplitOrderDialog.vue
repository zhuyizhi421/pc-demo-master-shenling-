<template>
  <el-dialog
    v-model="visible"
    title="订单拆分"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <!-- 订单信息表格 -->
      <el-table :data="orderInfoTable" border size="small" class="mb-4">
        <el-table-column prop="no" label="生产订单" min-width="120" />
        <el-table-column prop="productInfo" label="产品信息" min-width="150" />
        <el-table-column prop="orderAmount" label="订单数量" min-width="90" align="right" />
        <el-table-column prop="scheduledQuantity" label="已排产" min-width="90" align="right" />
        <el-table-column prop="splittableQuantity" label="可拆分数量" min-width="90" align="right" />
      </el-table>

      <el-divider content-position="center">拆分方案</el-divider>

      <el-form-item label="拆分数量" prop="splitCount">
        <el-input-number v-model="formData.splitCount" :min="1" :max="10" @change="handleSplitCountChange" />
        <span class="form-tip">（1-10个日计划）</span>
      </el-form-item>

      <el-form-item label="分配方式">
        <el-radio-group v-model="formData.distributeType">
          <el-radio value="average">平均分配</el-radio>
          <el-radio value="custom">手动分配</el-radio>
        </el-radio-group>
      </el-form-item>

      <div v-for="(item, index) in formData.splitItems" :key="index" class="split-item-row" :class="{ 'exceed-warning': cumulativeExceedStatus[index] }">
        <el-form-item
          :label="`日计划${index + 1}`"
          class="split-item-form"
        >
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :max="splittableQuantity"
            @change="handleQuantityChange(index)"
          />
          <span class="cumulative-tip">
            累计: {{ formData.splitItems.slice(0, index + 1).reduce((sum, i) => sum + i.quantity, 0) }}
          </span>
        </el-form-item>
        <el-form-item class="split-date-form">
          <el-date-picker
            v-model="item.planDate"
            type="date"
            placeholder="交货日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
        </el-form-item>
      </div>

    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定拆分</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestAddScheduleToPlan } from "@/api/scheduling"
import type { IDynamicProductionOrderPageItem } from "@/types/production-manage/product-order"

interface SplitItem {
  quantity: number
  planDate: string
}

const props = defineProps<{
  modelValue: boolean
  orderInfo: IDynamicProductionOrderPageItem | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

// 安全访问订单信息
const order = computed(() => props.orderInfo || {
  id: "",
  no: "",
  orderAmount: 0,
  scheduledQuantity: 0,
  productModelName: "",
  productModelSpec: "",
  unitName: ""
})

const loading = ref(false)
const formRef = ref()

const formData = ref({
  splitCount: 1,
  splitItems: [] as SplitItem[],
  distributeType: "average"
})

const rules = {
  splitCount: [{ required: true, message: "请输入拆分数量", trigger: "change" }],
  planDate: [{ required: true, message: "请选择计划日期", trigger: "change" }]
}

// 可拆分数量（可拆分数量 = 订单数量，支持在生产资源未完全锁定时先拆分部分订单）
const splittableQuantity = computed(() => {
  return order.value.orderAmount || 0
})

// 计算每个日计划的累计数量是否超过可拆分数量
const cumulativeExceedStatus = computed(() => {
  const status: boolean[] = []
  let cumulative = 0
  for (const item of formData.value.splitItems) {
    cumulative += item.quantity
    status.push(cumulative > splittableQuantity.value)
  }
  return status
})

// 订单信息表格数据
const orderInfoTable = computed(() => [
  {
    no: order.value.no,
    productInfo: `${order.value.productModelName || '-'} ${order.value.productModelSpec ? `(${order.value.productModelSpec})` : ''}`,
    orderAmount: `${order.value.orderAmount || 0} ${order.value.unitName || ''}`,
    scheduledQuantity: `${order.value.scheduledQuantity || 0} ${order.value.unitName || ''}`,
    splittableQuantity: `${splittableQuantity.value} ${order.value.unitName || ''}`
  }
])

// 初始化拆分项
const initSplitItems = () => {
  const count = formData.value.splitCount
  const avgQuantity = Math.floor(splittableQuantity.value / count)
  const remainder = splittableQuantity.value % count

  formData.value.splitItems = Array.from({ length: count }, (_, i) => ({
    quantity: avgQuantity + (i < remainder ? 1 : 0),
    planDate: ""
  }))
}

// 处理拆分数量变化
const handleSplitCountChange = (val: number) => {
  formData.value.splitCount = val
  // 两种模式都需要根据拆分数量更新日计划行数
  if (formData.value.distributeType === "average") {
    initSplitItems()
  } else {
    // 手动分配模式：保持现有数据，只调整数组长度
    adjustSplitItemsLength(val)
  }
}

// 调整手动分配模式下的日计划行数
const adjustSplitItemsLength = (count: number) => {
  const currentLength = formData.value.splitItems.length
  if (count > currentLength) {
    // 增加行：填充默认值
    for (let i = currentLength; i < count; i++) {
      formData.value.splitItems.push({
        quantity: 1,
        planDate: ""
      })
    }
  } else if (count < currentLength) {
    // 减少行：截断数组
    formData.value.splitItems.splice(count)
  }
}

// 处理数量变化
const handleQuantityChange = (index: number) => {
  formData.value.distributeType = "custom"
}

// 提交拆分
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  // 验证总数量（可小于等于可拆分数量，支持部分拆分）
  const total = formData.value.splitItems.reduce((sum, item) => sum + item.quantity, 0)
  if (total > splittableQuantity.value) {
    ElMessage.warning(`拆分数量总和不能超过可拆分数量 ${splittableQuantity.value}`)
    return
  }

  // 验证每个日计划都有计划日期
  const hasEmptyDate = formData.value.splitItems.some((item) => !item.planDate)
  if (hasEmptyDate) {
    ElMessage.warning("请填写每个日计划的计划日期")
    return
  }

  loading.value = true
  try {
    // 为每个拆分项创建日计划
    for (const item of formData.value.splitItems) {
      if (item.quantity > 0 && item.planDate) {
        await requestAddScheduleToPlan({
          orderId: order.value.id,
          orderNo: order.value.no,
          productModelName: order.value.productModelName || "",
          planAmount: item.quantity,
          planBeginTime: item.planDate,
          planEndTime: item.planDate,
          entityIdList: ["1"]
        })
      }
    }

    ElMessage.success("订单拆分成功")
    emit("success")
    handleClose()
  } catch (error) {
    ElMessage.error("订单拆分失败")
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  formData.value.splitCount = 1
  formData.value.splitItems = []
}

// 监听拆分数量和分配方式变化
watch(
  () => formData.value.splitCount,
  (val) => {
    if (formData.value.distributeType === "average") {
      initSplitItems()
    } else {
      adjustSplitItemsLength(val)
    }
  }
)

watch(
  () => formData.value.distributeType,
  (val) => {
    if (val === "average") {
      initSplitItems()
    }
  }
)

// 监听弹窗打开
watch(
  () => visible.value,
  (val) => {
    if (val) {
      initSplitItems()
    }
  }
)
</script>

<style scoped lang="scss">
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.cumulative-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  display: inline-block;
}

.split-item-row {
  display: flex;
  align-items: center;
  margin-bottom: 0;

  .split-item-form {
    flex: 1;
    margin-bottom: 18px;
  }

  .split-date-form {
    margin-bottom: 18px;
    margin-left: 10px;
  }

  &.exceed-warning {
    .split-item-form {
      :deep(.el-input-number) {
        .el-input__wrapper {
          box-shadow: 0 0 0 1px #f56c6c inset;
        }
      }
    }
    .cumulative-tip {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
