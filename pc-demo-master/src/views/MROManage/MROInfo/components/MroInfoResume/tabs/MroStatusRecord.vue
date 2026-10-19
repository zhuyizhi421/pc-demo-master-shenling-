<template>
  <div class="status-record">
    <CustomTitle :title="statusRecordTitle" />
    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig" />
    <el-empty v-if="!customTableData.length" :description="emptyText" />
  </div>
</template>

<script setup lang="ts">
import { queryMroInfoDetail } from "@/api/operation/mro/mro-info"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"

import { formatDateTime, formatLedgerStatus, formatUnarchiveMethod } from "../../../status"

defineOptions({
  name: "MroStatusRecord"
})

interface IStatusRecordRow {
  id: string
  actionType: string
  fromStatus: string
  operateMethod: string
  operateReason: string
  operateTime: string
  operateUserName: string
  toStatus: string
}

const statusRecordTitle = "\u72b6\u6001\u8bb0\u5f55"
const emptyText = "\u6682\u65e0\u72b6\u6001\u8bb0\u5f55"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IStatusRecordRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "actionType",
      label: "\u64cd\u4f5c\u7c7b\u578b",
      width: 120,
      align: "center"
    },
    {
      prop: "fromStatus",
      label: "\u53d8\u66f4\u524d\u72b6\u6001",
      width: 140,
      align: "center"
    },
    {
      prop: "toStatus",
      label: "\u53d8\u66f4\u540e\u72b6\u6001",
      width: 140,
      align: "center"
    },
    {
      prop: "operateMethod",
      label: "\u64cd\u4f5c\u65b9\u5f0f",
      width: 140,
      align: "center"
    },
    {
      prop: "operateReason",
      label: "\u539f\u56e0",
      minWidth: 220
    },
    {
      prop: "operateUserName",
      label: "\u64cd\u4f5c\u4eba",
      width: 120,
      align: "center"
    },
    {
      prop: "operateTime",
      label: "\u64cd\u4f5c\u65f6\u95f4",
      width: 180
    }
  ]
})

onMounted(() => {
  void getStatusRecords()
})

const getStatusRecords = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const detail = await queryMroInfoDetail({ id: props.mroId })
    const rows: IStatusRecordRow[] = []

    if (detail.archiveTime) {
      rows.push({
        id: `${detail.id}-archive`,
        actionType: "\u5c01\u5b58",
        fromStatus: formatLedgerStatus(detail.archiveFromStatus || "enabled"),
        toStatus: formatLedgerStatus(detail.archiveToStatus || "archived"),
        operateMethod: "-",
        operateReason: detail.archiveReason || "-",
        operateUserName: detail.archiveUserName || "-",
        operateTime: formatDateTime(detail.archiveTime)
      })
    }

    if (detail.unarchiveTime) {
      rows.push({
        id: `${detail.id}-unarchive`,
        actionType: "\u89e3\u5c01",
        fromStatus: formatLedgerStatus(detail.unarchiveFromStatus || "archived"),
        toStatus: formatLedgerStatus(detail.unarchiveToStatus || "enabled"),
        operateMethod: formatUnarchiveMethod(detail.unarchiveMethod),
        operateReason: detail.unarchiveReason || "-",
        operateUserName: detail.unarchiveUserName || "-",
        operateTime: formatDateTime(detail.unarchiveTime)
      })
    }

    customTableData.value = rows.sort((prev, next) => (prev.operateTime < next.operateTime ? 1 : -1))
  } finally {
    customTableRef.value?.setLoading(false)
  }
}
</script>

<style lang="scss" scoped>
.status-record {
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
