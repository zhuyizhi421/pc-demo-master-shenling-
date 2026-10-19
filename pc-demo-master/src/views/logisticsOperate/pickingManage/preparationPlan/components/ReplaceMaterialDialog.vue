<template>
  <CustomDialog v-model="dialogVisible" title="替代料" @close="emit('close')" size="medium">
    <div class="tips">额定原料计划领取数量：{{ replaceNeedAmount }}</div>
    <CustomTable v-model:table-data="renderTableData" :config="tableConfig" class="custom-table">
      <template #quantity-default="{ row }">
        <NoNegativeInput
          v-model="row.quantity"
          :disabled="isReadonly"
          @blur="calcReplaceQuantity"
        />
      </template>
    </CustomTable>
    <template #footer>
      <el-button @click="dialogVisible = false">{{ isReadonly ? "返回" : "取消" }}</el-button>
      <el-button type="primary" @click="handleSave()" v-if="!isReadonly">确认</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import NoNegativeInput from "@/components/NoNegativeInput/index.vue"
import type { IPreparationMaterialReplaceItem } from "@/types/logistics/preparationMaterial"

interface IProps {
  modelValue: boolean
  replaceNeedAmount: number
  tableData: IPreparationMaterialReplaceItem[]
  isReadonly?: boolean
}

type ITableRow = IPreparationMaterialReplaceItem & { replaceQuantity: number }

const props = withDefaults(defineProps<IProps>(), {
  isReadonly: false
})
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IPreparationMaterialReplaceItem[]): void
  (e: "close"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emit("update:modelValue", val)
  }
})

const renderTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      minWidth: 160
    },
    {
      prop: "replaceRatio",
      label: "比例（X:原料）",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return `${row.replaceRatio}:${row.originalRatio}`
      }
    },
    {
      prop: "quantity",
      label: "实际物料计划领取数量",
      width: 200,
      align: "center",
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "replaceQuantity",
      label: "换算成原料后的计划领取数量",
      width: 210,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    }
  ]
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      renderTableData.value = props.tableData.map((item) => ({
        ...item,
        replaceQuantity: 0
      }))
      calcReplaceQuantity()
    } else {
      renderTableData.value = []
    }
  }
)

const calcReplaceQuantity = () => {
  const list = renderTableData.value.map((item) => {
    const { replaceRatio, originalRatio, quantity } = item
    const replaceQuantity = (Number(quantity) * originalRatio) / (replaceRatio || 1)
    return {
      ...item,
      replaceQuantity
    }
  })
  renderTableData.value = list
}

/** 保存操作 */
const handleSave = () => {
  const total = renderTableData.value.reduce((acc, item) => acc + (item.replaceQuantity || 0), 0)
  console.log(total, props.replaceNeedAmount)
  if (total !== props.replaceNeedAmount) {
    ElMessage.warning("当前物料换算成原料后的计划领取数量总和与额定原料计划领取数量不同")
  } else {
    emit(
      "success",
      renderTableData.value.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { replaceQuantity, ...rest } = item
        rest.quantity = rest.quantity || 0
        return rest
      })
    )
  }
}
</script>

<style lang="scss" scoped>
.tips {
  margin-bottom: 16px;
}
</style>
