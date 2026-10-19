<template>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #planContent-default="{ row }">
      <el-popover effect="light" trigger="hover" placement="top" width="auto">
        <CustomTable :table-data="row.planContent" :config="contentTableConfig" />
        <template #reference>
          {{ planContentReference(row) }}
        </template>
      </el-popover>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestPreparationMaterialTaskPageList } from "@/api/logistics/preparationMaterial"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import {
  type EnumPreparationMaterialTaskStatus,
  EnumPreparationMaterialTaskStatusMap
} from "@/constant/enums"
import type {
  IPreparationMaterialItem,
  IPreparationMaterialTaskPageListParams,
  IPreparationTaskItem as ITableRow
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    no: string
  }>(),
  {
    no: ""
  }
)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "领料任务单号",
      minWidth: 160
    },
    {
      prop: "warehouseName",
      label: "仓库",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumPreparationMaterialTaskStatusMap[row.status as EnumPreparationMaterialTaskStatus]
      }
    },
    {
      prop: "planContent",
      label: "备货内容",
      minWidth: 160,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      fixed: "right",
      slots: {
        default: "planContent-default"
      }
    }
  ]
})

const contentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "备货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

const queryConfig: ITableRequestConfig<[IPreparationMaterialTaskPageListParams], ITableRow, true> =
  {
    api: requestPreparationMaterialTaskPageList,
    getParams: () => {
      return [
        {
          pageQuery: {
            pageNum: 1,
            pageSize: 1000
          },
          queryParam: {
            planNo: props.no
          }
        }
      ]
    }
  }

onMounted(async () => {
  await tableRef.value?.requestData()
})

/** 备货内容 */
const planContentReference = (data: IPreparationMaterialItem) => {
  if (!data.planContent.length) {
    return ""
  }
  return data.planContent.map((item) => item.productName).join(",")
}

defineOptions({
  name: "DepotListTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
