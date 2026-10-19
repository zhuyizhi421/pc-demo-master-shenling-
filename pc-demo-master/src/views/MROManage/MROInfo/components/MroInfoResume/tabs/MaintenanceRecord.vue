<template>
  <div class="verify-config">
    <CustomTitle title="保养记录" />
    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #mroNo-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroInfo(row)">
          {{ row.mroNo }}
        </el-button>
      </template>

      <template #mroModelName-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)">
          {{ row.mroModelName }}
        </el-button>
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="openDetail(row.id)">查看详情</el-button>
      </template>
    </CustomTable>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { queryMroMaintenanceTaskPageList } from "@/api/operation/mro/mro-maintenance-task"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumMROMaintenanceTaskResult,
  EnumMROMaintenanceTaskResultMap,
  EnumMROMaintenanceTaskStatus,
  EnumMROMaintenanceTaskStatusMap
} from "@/constant/enums"
import type { IMroMaintenanceTaskPageListItem as ITableRow } from "@/types/maintain/mro-manage/mro-maintenance-task"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import { formatDateTime } from "../../../status"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const { openDetail } = inject("maintenanceTaskDetail") as any

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "maintenanceNo",
      label: "任务单号",
      minWidth: 160
    },
    {
      prop: "maintenanceStatus",
      label: "任务状态",
      width: 160,
      align: "center",
      formatter: (row) =>
        EnumMROMaintenanceTaskStatusMap[row.maintenanceStatus as EnumMROMaintenanceTaskStatus]
    },
    {
      prop: "maintenanceResult",
      label: "保养结果",
      width: 160,
      align: "center",
      formatter: (row) =>
        EnumMROMaintenanceTaskResultMap[row.maintenanceResult as EnumMROMaintenanceTaskResult]
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center",
      formatter: (row) => formatDateTime(row.createTime)
    },
    {
      prop: "mroNo",
      label: "MRO编号",
      minWidth: 160,
      slots: {
        default: "mroNo-default"
      }
    },
    {
      prop: "mroModelName",
      label: "MRO型号",
      minWidth: 160,
      slots: {
        default: "mroModelName-default"
      }
    },
    {
      prop: "departments",
      label: "执行部门",
      minWidth: 160
    },
    {
      prop: "maintenanceStart",
      label: "保养开始时间",
      width: 160,
      align: "center",
      formatter: (row) => formatDateTime(row.maintenanceStart)
    },
    {
      prop: "maintenanceComplete",
      label: "保养结束时间",
      width: 160,
      align: "center",
      formatter: (row) => formatDateTime(row.maintenanceComplete)
    },
    {
      prop: "timeConsuming",
      label: "保养耗时",
      width: 160,
      align: "right",
      formatter: (row) => timeConsuming(row)
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  void getMroMaintenanceRecord()
})

const onReviewMroInfo = (row: ITableRow) => {
  mroInfoVisible.value = true
  selectedRow.value = row
}

const onReviewMroModelInfo = (row: ITableRow) => {
  mroModelInfoVisible.value = true
  selectedRow.value = row
}

const getMroMaintenanceRecord = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroMaintenanceTaskPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { mroInformationId: props.mroId },
      sort: [{ field: "createTime", order: "asc" }]
    })
    customTableData.value = records
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const timeConsuming = (row: any) => {
  const start = row?.inspectionStart || row?.maintenanceStart
  const end = row?.inspectionComplete || row?.maintenanceComplete
  if (start && end) {
    try {
      return dayjs(end).diff(dayjs(start), "minute") + "分钟"
    } catch (error) {
      return "-"
    }
  }
  return "-"
}
</script>

<style lang="scss" scoped>
.verify-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-title {
    margin-top: 0;
  }

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
