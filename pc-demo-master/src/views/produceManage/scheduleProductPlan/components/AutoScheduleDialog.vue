<template>
  <SelectProductOrderDialog
    v-model="visible"
    v-model:selected-row-keys="selectedOrderIds"
    :multiple="true"
    :only-reviewed="true"
    :before-confirm="validateBeforeConfirm"
    @success="handleOrderSelectSuccess"
    @cancel="visible = false"
  >
    <template v-if="showUrgentInsert" #extra>
      <div class="urgent-insert-section">
        <el-checkbox v-model="isUrgentInsert">紧急插单</el-checkbox>
        <el-input
          v-if="isUrgentInsert"
          v-model="urgentInsertReason"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入插单原因"
        />
      </div>
    </template>
  </SelectProductOrderDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import SelectProductOrderDialog from "@/components/SelectProductOrderDialog/index.vue"
import type { IProductionOrderPageItem } from "@/types/production-manage/product-order"

type AutoScheduleConfirmPayload = {
  orders: IProductionOrderPageItem[]
  isUrgentInsert: boolean
  urgentInsertReason: string
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  defaultSelectedOrderIds?: string[]
  showUrgentInsert?: boolean
}>(), {
  showUrgentInsert: false
})

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "confirm", payload: AutoScheduleConfirmPayload): void
}>()

const selectedOrderIds = ref<string[]>([])
const isUrgentInsert = ref(false)
const urgentInsertReason = ref("")

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const getDeliveryDateTime = (order: IProductionOrderPageItem) => {
  const time = new Date(order.deliveryDate || "").getTime()
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER
}

const sortOrdersByDeliveryDate = (orders: IProductionOrderPageItem[]) =>
  orders
    .map((order, index) => ({ order, index }))
    .sort((a, b) => getDeliveryDateTime(a.order) - getDeliveryDateTime(b.order) || a.index - b.index)
    .map(({ order }) => order)

watch(
  () => props.modelValue,
  (value) => {
    selectedOrderIds.value = value ? [...(props.defaultSelectedOrderIds || [])] : []
    if (!value) {
      isUrgentInsert.value = false
      urgentInsertReason.value = ""
    }
  }
)

const validateBeforeConfirm = () => {
  const reason = urgentInsertReason.value.trim()
  if (props.showUrgentInsert && isUrgentInsert.value && !reason) {
    ElMessage.warning("请输入插单原因")
    return false
  }
  return true
}

const handleOrderSelectSuccess = (orders: IProductionOrderPageItem[]) => {
  const reason = urgentInsertReason.value.trim()
  emit("confirm", {
    orders: isUrgentInsert.value ? orders : sortOrdersByDeliveryDate(orders),
    isUrgentInsert: isUrgentInsert.value,
    urgentInsertReason: isUrgentInsert.value ? reason : ""
  })
  visible.value = false
}
</script>

<style scoped lang="scss">
.urgent-insert-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
</style>
