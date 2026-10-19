<template>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    class="custom-detail-table"
  >
    <template #operation-default="{ row }">
      <el-button
        v-if="isAuth && row.replaceList?.length > 0"
        link
        type="primary"
        size="small"
        @click="openMaterialReplaceDialog(row)"
        >查看
      </el-button>
    </template>
  </CustomTable>

  <!-- 替代料编辑弹窗 -->
  <ReplaceMaterialDialog
    :replaceNeedAmount="replaceNeedAmount"
    :tableData="replaceTableData"
    :isReadonly="true"
    v-model="replaceMaterialVisible"
    @close="replaceMaterialVisible = false"
  />
</template>

<script setup lang="ts">
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import { EnumPreparationMaterialPlanStatus } from "@/constant/enums"
import type {
  IPreparationMaterialReplaceItem,
  IPreparationMaterialRes,
  IPreparationMaterialRes as ITableRow
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"

import ReplaceMaterialDialog from "./ReplaceMaterialDialog.vue"

const props = withDefaults(
  defineProps<{
    materialList: ITableRow[]
    status: EnumPreparationMaterialPlanStatus
    isAuth: boolean
  }>(),
  {
    materialList: () => [],
    status: EnumPreparationMaterialPlanStatus.UN_RECHECK,
    isAuth: false
  }
)

const emits = defineEmits<{
  (e: "update:materialList", materialList: ITableRow[]): void
}>()

const tableData = computed({
  get: () => props.materialList,
  set: (val) => emits("update:materialList", val)
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableConfig = ref<ITableConfig>({
  height: "100%",
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
      prop: "planAmount",
      label: "计划领取数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.planAmount || row.planAmount == 0
          ? precisionConversion(row.planAmount, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "planPickedAmount",
      label: "已领取数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.planPickedAmount || row.planPickedAmount == 0
          ? precisionConversion(row.planPickedAmount, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "替代料",
      width: 90,
      fixed: "right",
      get hidden() {
        return props.status !== EnumPreparationMaterialPlanStatus.UN_RECHECK
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const replaceMaterialVisible = ref(false) // 替代料编辑弹窗显示标识
const replaceNeedAmount = ref(0)
const replaceTableData = ref<IPreparationMaterialReplaceItem[]>([])

/** 打开替代料编辑弹窗 */
const openMaterialReplaceDialog = (row: IPreparationMaterialRes) => {
  replaceNeedAmount.value = row.planAmount
  replaceTableData.value = row.replaceList
  replaceMaterialVisible.value = true
}

defineOptions({
  name: "MaterialListTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
