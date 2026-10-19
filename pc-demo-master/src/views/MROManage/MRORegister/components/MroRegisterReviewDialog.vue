<template>
  <CustomDialog v-model="dialogVisible" title="复核 MRO 登记单" size="large">
    <div class="review-dialog">
      <div class="review-head">
        <div class="review-head__title">标签码逐条录入</div>
        <div class="review-head__desc">
          系统已按登记数量展开为足量台账明细。每一行对应一个必填标签码，扫码后按回车可自动跳到下一行。
        </div>

        <div class="review-head__stats">
          <div class="stat-card">
            <span class="stat-card__label">待录明细</span>
            <strong class="stat-card__value">{{ reviewRows.length }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">已录标签</span>
            <strong class="stat-card__value">{{ filledSlotCount }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">剩余标签</span>
            <strong class="stat-card__value">{{ remainingSlotCount }}</strong>
          </div>
          <div class="stat-card" :class="{ 'is-danger': duplicateBarcodeSet.size }">
            <span class="stat-card__label">完成项数</span>
            <strong class="stat-card__value">{{ completedItemCount }}</strong>
          </div>
        </div>

        <div v-if="duplicateBarcodeSet.size" class="review-head__warning">
          检测到重复标签码，请先处理重复值后再提交。
        </div>
      </div>

      <el-table
        v-if="reviewRows.length"
        class="review-table"
        :data="reviewRows"
        border
        stripe
        height="560"
        :span-method="getSpanMethod"
        :row-class-name="getTableRowClassName"
      >
        <el-table-column prop="groupIndex" label="序号" width="68" align="center" />
        <el-table-column prop="mroModelNo" label="MRO 编号" min-width="140" />
        <el-table-column prop="mroModelName" label="MRO 名称" min-width="180" />
        <el-table-column prop="mroSpec" label="规格" min-width="140">
          <template #default="{ row }">
            {{ row.mroSpec || "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouseLocationName" label="库位" min-width="120">
          <template #default="{ row }">
            {{ row.warehouseLocationName || "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="slotIndex" label="标签序号" width="88" align="center" />
        <el-table-column label="标签码" min-width="280">
          <template #default="{ row }">
            <el-input
              :ref="createInputRefSetter(row.slotKey)"
              v-model="slotValueMap[row.slotKey]"
              clearable
              placeholder="请扫描或输入标签码"
              @keyup.enter="focusNextSlot(row.slotKey)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getSlotStatus(row).type" size="small">
              {{ getSlotStatus(row).text }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="当前登记单无需手工绑定标签码，可直接复核" />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick">确认复核</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import type {
  IMroRegisterItem,
  IMroRegisterLabelBinding,
  IMroRegisterPageListItem
} from "@/types/maintain/mro-manage/mro-register"

defineOptions({
  name: "MroRegisterReviewDialog"
})

interface IReviewSlotRow {
  groupIndex: number
  slotKey: string
  registerItemId: string
  slotIndex: number
  isGroupHead: boolean
  rowspan: number
  mroModelNo: string
  mroModelName: string
  mroSpec: string
  warehouseLocationName?: string
  registerNums: number
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    record?: IMroRegisterPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "confirm", value: IMroRegisterLabelBinding[]): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const slotValueMap = ref<Record<string, string>>({})
const inputRefMap = ref<Record<string, { focus?: () => void } | null>>({})

const normalizeBarcodeHandleType = (row: IMroRegisterItem) => {
  if (row.barcodeHandleType) {
    return row.barcodeHandleType
  }
  if (!row.identityManage) {
    return ""
  }
  return row.autoGenerateCode ? "system_generate" : "customer_existing"
}

const manualRows = computed(() =>
  (props.record?.registerItemVos || []).filter((row) => {
    return row.identityManage && normalizeBarcodeHandleType(row) === "customer_existing"
  })
)

const reviewRows = computed<IReviewSlotRow[]>(() =>
  manualRows.value.flatMap((row, groupIndex) => {
    const count = Number(row.registerNums || 0)
    return Array.from({ length: count }, (_, index) => ({
      groupIndex: groupIndex + 1,
      slotKey: `${row.id}__${index + 1}`,
      registerItemId: row.id,
      slotIndex: index + 1,
      isGroupHead: index === 0,
      rowspan: count,
      mroModelNo: row.mroModelNo,
      mroModelName: row.mroModelName,
      mroSpec: row.mroSpec,
      warehouseLocationName: row.warehouseLocationName,
      registerNums: count
    }))
  })
)

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      slotValueMap.value = {}
      inputRefMap.value = {}
      return
    }

    const nextMap: Record<string, string> = {}
    manualRows.value.forEach((row) => {
      const count = Number(row.registerNums || 0)
      const barcodes = row.barcodes || []

      Array.from({ length: count }, (_, index) => {
        nextMap[`${row.id}__${index + 1}`] = barcodes[index] || ""
      })
    })
    slotValueMap.value = nextMap
  }
)

const duplicateBarcodeSet = computed(() => {
  const frequencyMap = new Map<string, number>()

  reviewRows.value.forEach((row) => {
    const value = String(slotValueMap.value[row.slotKey] || "").trim()
    if (!value) {
      return
    }
    frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1)
  })

  return new Set(
    Array.from(frequencyMap.entries())
      .filter(([, count]) => count > 1)
      .map(([barcode]) => barcode)
  )
})

const filledSlotCount = computed(
  () => reviewRows.value.filter((row) => String(slotValueMap.value[row.slotKey] || "").trim()).length
)

const remainingSlotCount = computed(() => reviewRows.value.length - filledSlotCount.value)

const completedItemCount = computed(
  () =>
    manualRows.value.filter((row) => {
      const rows = reviewRows.value.filter((item) => item.registerItemId === row.id)
      return rows.length > 0 && rows.every((item) => getSlotStatus(item).type === "success")
    }).length
)

const getSlotStatus = (row: IReviewSlotRow) => {
  const value = String(slotValueMap.value[row.slotKey] || "").trim()
  if (!value) {
    return {
      type: "info" as const,
      text: "待录入"
    }
  }

  if (duplicateBarcodeSet.value.has(value)) {
    return {
      type: "danger" as const,
      text: "重复"
    }
  }

  return {
    type: "success" as const,
    text: "已录入"
  }
}

const getSpanMethod = ({
  row,
  columnIndex
}: {
  row: IReviewSlotRow
  columnIndex: number
}) => {
  const mergeColumns = [0, 1, 2, 3, 4]
  if (!mergeColumns.includes(columnIndex)) {
    return undefined
  }

  if (row.isGroupHead) {
    return [row.rowspan, 1]
  }

  return [0, 0]
}

const getTableRowClassName = ({ row }: { row: IReviewSlotRow }) => {
  const status = getSlotStatus(row).type
  if (status === "success") {
    return "review-row--success"
  }
  if (status === "danger") {
    return "review-row--danger"
  }
  return ""
}

const setInputRef = (slotKey: string, el: { focus?: () => void } | null) => {
  if (el) {
    inputRefMap.value[slotKey] = el
  } else {
    delete inputRefMap.value[slotKey]
  }
}

const createInputRefSetter = (slotKey: string) => {
  return (el: { focus?: () => void } | null) => {
    setInputRef(slotKey, el)
  }
}

const focusNextSlot = async (slotKey: string) => {
  const currentIndex = reviewRows.value.findIndex((row) => row.slotKey === slotKey)
  if (currentIndex < 0) {
    return
  }

  const currentValue = String(slotValueMap.value[slotKey] || "").trim()
  slotValueMap.value[slotKey] = currentValue

  const nextRow = reviewRows.value[currentIndex + 1]
  if (!nextRow) {
    return
  }

  await nextTick()
  inputRefMap.value[nextRow.slotKey]?.focus?.()
}

const onConfirmClick = () => {
  const bindings: IMroRegisterLabelBinding[] = []
  const duplicateSet = new Set<string>()

  for (const row of manualRows.value) {
    const slotRows = reviewRows.value.filter((item) => item.registerItemId === row.id)
    const barcodes = slotRows.map((item) => String(slotValueMap.value[item.slotKey] || "").trim())

    const emptyIndex = barcodes.findIndex((item) => !item)
    if (emptyIndex >= 0) {
      ElMessage.warning(`${row.mroModelName} 第 ${emptyIndex + 1} 个标签码未填写`)
      return
    }

    for (const barcode of barcodes) {
      if (duplicateSet.has(barcode)) {
        ElMessage.warning(`标签码 ${barcode} 重复，请检查后再提交`)
        return
      }
      duplicateSet.add(barcode)
    }

    bindings.push({
      registerItemId: row.id,
      barcodeHandleType: "customer_existing",
      barcodes
    })
  }

  emit("confirm", bindings)
}
</script>

<style scoped lang="scss">
.review-dialog {
  display: grid;
  gap: 12px;
}

.review-head {
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  padding: 16px 18px;
  background: var(--el-fill-color-blank);
}

.review-head__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.review-head__desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.review-head__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.stat-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--el-fill-color-light);
}

.stat-card.is-danger {
  border-color: rgba(245, 108, 108, 0.3);
  background: var(--el-color-danger-light-9);
}

.stat-card__label {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stat-card__value {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  color: var(--el-text-color-primary);
}

.review-head__warning {
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.review-table {
  width: 100%;
}

:deep(.review-row--success td) {
  background: rgba(103, 194, 58, 0.06) !important;
}

:deep(.review-row--danger td) {
  background: rgba(245, 108, 108, 0.06) !important;
}

@media (max-width: 1200px) {
  .review-head__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .review-head__stats {
    grid-template-columns: 1fr;
  }
}
</style>
