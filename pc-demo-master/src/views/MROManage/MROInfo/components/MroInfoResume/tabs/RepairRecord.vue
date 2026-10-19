<template>
  <div class="verify-config">
    <CustomTitle title="维修记录" />
    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #mroNo-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroInfo(row)">
          {{ row.mroNo }}
        </el-button>
      </template>

      <template #mroModelNo-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)">
          {{ row.mroModelNo }}
        </el-button>
      </template>

      <template #mroModelName-default="{ row }">
        <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)">
          {{ row.mroModelName }}
        </el-button>
      </template>

      <template #repairAfterLife-default="{ row }">
        {{
          Number(row.repairStatus) === EnumMRORepairStatus.FINISHED &&
          Number(row.repairResult) === EnumMRORepairResult.RESOLVED
            ? formatPercent(Number(row.repairAfterLife || 0))
            : ""
        }}
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="onReview(row)">查看详情</el-button>
      </template>
    </CustomTable>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />
    <MroRepairOrderInfoDialog
      v-model="mroRepairInfoVisible"
      :mro-repair-id="selectedRow?.id || ''"
      @success="getMroRepairRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { queryMroRepairPageList } from "@/api/operation/mro/mro-repair"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumMRORepairMode,
  EnumMRORepairModeMap,
  EnumMRORepairResult,
  EnumMRORepairResultMap,
  EnumMRORepairSourceType,
  EnumMRORepairSourceTypeMap,
  EnumMRORepairStatus,
  EnumMRORepairStatusMap
} from "@/constant/enums"
import type { IMroRepairPageListItem as ITableRow } from "@/types/maintain/mro-manage/mro-repair"
import { formatPercent } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"
import MroRepairOrderInfoDialog from "@/views/MROManage/MRORepairOrders/components/MroRepairOrderInfoDialog.vue"

import { formatDateTime } from "../../../status"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const mroRepairInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "repairNo", label: "维修单号", minWidth: 160 },
    {
      prop: "repairRound",
      label: "维修轮次",
      width: 110,
      align: "center"
    },
    {
      prop: "repairStatus",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row) => EnumMRORepairStatusMap[row.repairStatus as EnumMRORepairStatus]
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row) => EnumMRORepairSourceTypeMap[row.sourceType as EnumMRORepairSourceType]
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      minWidth: 160
    },
    {
      prop: "mroNo",
      label: "MRO序列号",
      minWidth: 150,
      slots: { default: "mroNo-default" }
    },
    {
      prop: "mroModelNo",
      label: "MRO编号",
      minWidth: 150,
      slots: { default: "mroModelNo-default" }
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 160,
      slots: { default: "mroModelName-default" }
    },
    {
      prop: "repairBeforeLife",
      label: "维修前寿命",
      width: 120,
      align: "right",
      formatter: (row) => formatPercent(Number(row.repairBeforeLife || 0))
    },
    {
      prop: "handlePosition",
      label: "处理职位",
      minWidth: 180
    },
    {
      prop: "responsibleUserName",
      label: "责任人",
      width: 140,
      formatter: (row) => row.responsibleUser?.name || ""
    },
    {
      prop: "repairMode",
      label: "维修方式",
      width: 120,
      formatter: (row) => EnumMRORepairModeMap[row.repairMode as EnumMRORepairMode]
    },
    {
      prop: "repairResult",
      label: "维修结果",
      minWidth: 160,
      formatter: (row) =>
        Number(row.repairStatus) === EnumMRORepairStatus.FINISHED
          ? EnumMRORepairResultMap[row.repairResult as EnumMRORepairResult]
          : ""
    },
    {
      prop: "repairAfterLife",
      label: "维修后寿命",
      width: 130,
      align: "right",
      slots: {
        default: "repairAfterLife-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      formatter: (row) => formatDateTime(row.createTime)
    },
    {
      prop: "completeTime",
      label: "办结时间",
      width: 160,
      align: "center",
      formatter: (row) => formatDateTime(row.completeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

onMounted(() => {
  void getMroRepairRecord()
})

const onReviewMroInfo = (row: ITableRow) => {
  mroInfoVisible.value = true
  selectedRow.value = row
}

const onReviewMroModelInfo = (row: ITableRow) => {
  mroModelInfoVisible.value = true
  selectedRow.value = row
}

const getMroRepairRecord = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroRepairPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { mroInformationId: props.mroId },
      sort: [{ field: "createTime", order: "asc" }]
    })
    customTableData.value = records
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onReview = (row: ITableRow) => {
  selectedRow.value = row
  mroRepairInfoVisible.value = true
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
