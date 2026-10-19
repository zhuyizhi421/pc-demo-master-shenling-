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
      <el-button type="primary" size="small" link @click="onReviewClick(row)">查看详情</el-button>
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
import { queryEquipmentMaintenanceTaskPageList } from "@/api/operation/equipment/equipment-maintenance-task"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import { EnumEquipmentSpotTaskTypeMap } from "@/constant/enums"
import type {
  IEquipmentMaintenanceTaskPageItem as ITableRow,
  IEquipmentMaintenanceTaskPageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-task"
import { formatDateTime } from "@/views/maintOperate/status"

const props = defineProps<{
  deviceId: string
}>()

const emit = defineEmits<{
  (e: "onReviewClick", data: ITableRow): void
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
    {
      prop: "taskNo",
      label: "任务单号",
      width: 160
    },
    {
      prop: "taskStatus",
      label: "任务状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumEquipmentSpotTaskTypeMap[row.taskStatus] ?? "-"
      }
    },
    {
      prop: "result",
      label: "检验结果",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return ["NG", "OK", "未出结果"][row.maintenanceResult] ?? "-"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      formatter: ({ createTime }) => formatDateTime(createTime)
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return ["", "点检", "巡检", "计划", "手动"][row.sourceType] ?? "-"
      }
    },
    {
      prop: "planName",
      label: "所属月计划",
      width: 160
    },
    {
      prop: "depNames",
      label: "执行部门",
      width: 160,
      formatter: (row: ITableRow) => {
        return row?.departments?.map((item) => item || "").join(",") || "-"
      }
    },
    {
      prop: "rotationNames",
      label: "保养班次",
      width: 160,
      formatter: (row: ITableRow) => {
        return row?.schedulingRotations?.map((item) => item?.rotationName || "").join(",") || "-"
      }
    },
    {
      prop: "maintenanceEmployeeName",
      label: "保养人姓名",
      width: 160
    },
    {
      prop: "inspectionEmployeeNo",
      label: "保养人工号",
      width: 160
    },
    {
      prop: "maintenanceStart",
      label: "保养开始时间",
      width: 160,
      formatter: ({ maintenanceStart }) => formatDateTime(maintenanceStart)
    },
    {
      prop: "maintenanceComplete",
      label: "保养结束时间",
      width: 160,
      formatter: ({ maintenanceComplete }) => formatDateTime(maintenanceComplete)
    },
    {
      prop: "maintenanceCostSeconds",
      label: "保养耗时",
      width: 160
    },
    {
      prop: "remarks",
      label: "备注",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceTaskPageParams], ITableRow, true> = {
  api: queryEquipmentMaintenanceTaskPageList,
  getParams: () => {
    return [
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
}

const onReviewClick = (data: ITableRow) => {
  emit("onReviewClick", data)
}

onMounted(() => {
  customTableRef.value?.requestData()
})

defineOptions({
  name: "maintainRecord"
})
</script>

<style scoped lang="scss"></style>
