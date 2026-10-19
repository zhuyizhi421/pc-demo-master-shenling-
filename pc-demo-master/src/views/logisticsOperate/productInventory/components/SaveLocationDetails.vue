<template>
  <CustomDrawer v-model="visible" :title="`${warehouseData?.productModelName} 库位列表`">
    <div class="flex flex-col h-full">
      <div class="custom-table-container !p-0">
        <CustomTable
          ref="tableRef"
          :table-data="tableData"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #quantity-default="{ row }">
            {{
              row.quantity || row.quantity == 0
                ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
                : undefined
            }}
          </template>
          <template #operation-default="scope">
            <el-button link type="primary" size="small" @click="ViewPosition(scope.row)"
              >查看库位
            </el-button>
          </template>
        </CustomTable>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :border="false"
          @change="tableRef?.requestData()"
        />
      </div>
    </div>

    <template #footer>
      <div>
        <el-button size="large" @click="visible = false">返回</el-button>
      </div>
    </template>
  </CustomDrawer>
</template>

<script lang="ts" setup name="ApprovalDetails">
import { getLogProductPositionSearch } from "@/api/logistics/inventory"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  LogInventorySearchReturn,
  LogProductPositionSearchInter,
  LogProductPositionSearchReturn as ITableRow
} from "@/types/logistics/inventory"
import { precisionConversion } from "@/utils/common"

const props = defineProps<{
  modelValue: boolean
  warehouseData?: LogInventorySearchReturn
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: string): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: "100%",
  columns: [
    {
      prop: "warehouseName",
      label: "仓库名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "locationName",
      label: "库位名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "locationCode",
      label: "库位编号",
      minWidth: 120,
      showOverflowTooltip: true
    },
    {
      prop: "quantity",
      label: "存放数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "operation-default"
      }
    }
  ]
}))

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await nextTick()
      await tableRef.value?.requestData()
    }
  }
)

const queryConfig: ITableRequestConfig<[LogProductPositionSearchInter], ITableRow, true> = {
  api: getLogProductPositionSearch,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        facilityId: props.warehouseData!.facilityId!,
        productModelId: props.warehouseData!.productModelId!
      }
    ]
  }
}

const ViewPosition = (rowData: any) => {
  visible.value = false
  emits("success", rowData.locationId || "")
}
</script>

<style lang="scss" scoped>
.drawer-wrap {
  &:deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 20px;

    .el-table {
      flex: 1;
    }
  }
}
</style>
