<template>
  <CustomTable
    ref="customTableRef"
    v-model:table-data="customTableData"
    v-model:total="pagination.total"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-table"
  >
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="emit('onReviewRepairDetailClick', row)">
        查看详情
      </el-button>
    </template>
  </CustomTable>

  <CustomPagination
    v-model:currentPage="pagination.currentPage"
    v-model:pageSize="pagination.pageSize"
    :total="pagination.total"
    border
    @change="customTableRef?.requestData()"
  />
</template>

<script setup lang="ts">
import { queryEquipmentRepairPageList } from "@/api/operation/equipment/equipment-repair"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  IEquipmentRepairPageItem as ITableRow,
  IEquipmentRepairPageParams
} from "@/types/maintain/equipment-manage/equipment-repair"
import {
  formatDeviceRepairResult,
  formatDeviceRepairSourceType,
  formatDeviceRepairStatus
} from "@/views/maintOperate/deviceRepair/constants"
import { formatDateTime } from "@/views/maintOperate/status"

defineOptions({
  name: "repairRecord"
})

const props = defineProps<{
  deviceId: string
}>()

const emit = defineEmits<{
  (e: "onReviewRepairDetailClick", data: ITableRow): void
}>()

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "repairNo", label: "维修单号", minWidth: 160 },
    {
      prop: "repairStatus",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => formatDeviceRepairStatus(row.repairStatus)
    },
    { prop: "equipmentNo", label: "设备编号", minWidth: 150 },
    { prop: "equipmentName", label: "设备名称", minWidth: 160 },
    {
      prop: "repairResult",
      label: "维修结果",
      width: 140,
      align: "center",
      formatter: (row: ITableRow) => formatDeviceRepairResult(row.repairResult)
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      formatter: (row: ITableRow) => formatDateTime(row.createTime)
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => formatDeviceRepairSourceType(row.sourceType)
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      width: 160,
      formatter: (row: ITableRow) => row.sourceNo || "--"
    },
    {
      prop: "reportUser.name",
      label: "报修人",
      width: 140,
      formatter: (row: ITableRow) => row.reportUser?.name || "-"
    },
    {
      prop: "responsibleUser.name",
      label: "责任人",
      width: 140,
      formatter: (row: ITableRow) => row.responsibleUser?.name || "-"
    },
    {
      prop: "repairUser.name",
      label: "维修人",
      width: 140,
      formatter: (row: ITableRow) => row.repairUser?.name || "-"
    },
    { prop: "faultCategoryName", label: "故障类型", width: 160 },
    { prop: "faultDescription", label: "故障现象", minWidth: 200 },
    {
      prop: "closeTime",
      label: "关闭时间",
      width: 160,
      formatter: (row: ITableRow) => formatDateTime(row.closeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentRepairPageParams], ITableRow, true> = {
  api: queryEquipmentRepairPageList,
  getParams: () => [
    {
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: {
        equipmentId: props.deviceId
      }
    }
  ]
}

onMounted(() => {
  customTableRef.value?.requestData()
})
</script>
