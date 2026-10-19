<template>
  <div class="maintenance-config">
    <CustomTitle title="保养配置" />

    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #files-default="{ row }">
        <div v-if="row.files?.length" class="image-list-cell">
          <el-image
            v-for="item in row.files"
            :key="item.fileId"
            class="image-item"
            :src="item.fileUrl"
            :preview-src-list="[item.fileUrl]"
            :preview-teleported="true"
            fit="contain"
          />
        </div>
        <span v-else>-</span>
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { queryMroInfoConfigPageList } from "@/api/operation/mro/mro-info"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IPhoto } from "@/types/common"
import type { IMroInfoConfigPageListItem, IMroInfoConfigTableRow } from "@/types/maintain/mro-manage/mro-info"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

import { formatDateTime } from "../../../status"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IMroInfoConfigTableRow[]>([])
const loaded = ref(false)

const maintenanceTypeEnum: Record<string, string> = {
  count: "按次数",
  week: "按周"
}

const standardTypeEnum: Record<number, string> = {
  1: "定量",
  2: "定性"
}

const formatDepartmentPosition = (
  row: Pick<IMroInfoConfigTableRow, "executeDepartmentName" | "executePositionName">
) => {
  const departmentName = String(row.executeDepartmentName || "").trim()
  const positionName = String(row.executePositionName || "").trim()
  if (!departmentName) return positionName || "-"
  if (!positionName) return departmentName
  if (positionName.startsWith(`${departmentName}-`)) return positionName
  return `${departmentName}-${positionName}`
}

const formatStandard = (row: IMroInfoConfigTableRow) => typeNumberHandle(row.checkStandardValue, true)

const formatNullableCount = (value?: number | null) =>
  value === null || value === undefined || value === "" ? "-" : String(value)

const formatMaintenanceFrequency = (row: IMroInfoConfigTableRow) => {
  const unit = row.maintenanceType === "count" ? "次" : "周"
  return `${Number(row.configFrequency || 0)}${unit}`
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "configItemNo",
      label: "保养项编号",
      width: 160
    },
    {
      prop: "configItemName",
      label: "保养项名称",
      minWidth: 180
    },
    {
      prop: "standardType",
      label: "检测标准类型",
      width: 120,
      align: "center",
      formatter: ({ checkStandardValue }) => standardTypeEnum[Number(checkStandardValue?.standardType)] || "-"
    },
    {
      prop: "detectMethod",
      label: "检测方式",
      minWidth: 140,
      formatter: ({ detectMethod }) => detectMethod || "-"
    },
    {
      prop: "standardDesc",
      label: "检测标准",
      minWidth: 220,
      formatter: (row) => formatStandard(row) || "-"
    },
    {
      prop: "files",
      label: "图片说明",
      minWidth: 180,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "maintenanceType",
      label: "保养类型",
      width: 110,
      align: "center",
      formatter: ({ maintenanceType }) => maintenanceTypeEnum[maintenanceType || "week"] || "-"
    },
    {
      prop: "configFrequency",
      label: "保养周期",
      width: 120,
      align: "center",
      formatter: (row) => formatMaintenanceFrequency(row)
    },
    {
      prop: "executePositionName",
      label: "保养执行职位",
      minWidth: 180,
      formatter: (row) => formatDepartmentPosition(row)
    },
    {
      prop: "lastMaintenanceTime",
      label: "上次保养时间",
      minWidth: 180,
      align: "center",
      formatter: ({ lastMaintenanceTime }) => formatDateTime(lastMaintenanceTime)
    },
    {
      prop: "lastMaintenanceCount",
      label: "上次保养次数",
      width: 120,
      align: "right",
      formatter: ({ lastMaintenanceCount }) => formatNullableCount(lastMaintenanceCount)
    },
    {
      prop: "nextMaintenanceTime",
      label: "预计保养时间",
      minWidth: 180,
      align: "center",
      formatter: ({ nextMaintenanceTime }) => formatDateTime(nextMaintenanceTime)
    },
    {
      prop: "nextMaintenanceCount",
      label: "预计保养次数",
      width: 120,
      align: "right",
      formatter: ({ nextMaintenanceCount }) => formatNullableCount(nextMaintenanceCount)
    }
  ]
})

const toPhotoList = (files: IMroInfoConfigPageListItem["files"] = []): IPhoto[] =>
  (Array.isArray(files) ? files : [])
    .filter((item) => item?.path)
    .map((item, index) => ({
      fileId: String(item.deploymentId || item.fileId || item.id || `maintenance-file-${index}`),
      fileName: item.fileName || `图片说明${index + 1}.png`,
      fileUrl: formatImgUrlPreview(item.path)
    }))

const mapMaintenanceRow = (item: IMroInfoConfigPageListItem): IMroInfoConfigTableRow => ({
  checkStandardValue: item.checkStandardValue,
  configFrequency: Number(item.configFrequency || 0),
  configItemName: item.configItemName,
  configItemNo: item.configItemNo,
  detectMethod: item.detectMethod || item.methodRequire || "",
  executeDepartmentId: item.executeDepartmentId || "",
  executeDepartmentName: item.executeDepartmentName || "",
  executePositionId: item.executePositionId || "",
  executePositionName: item.executePositionName || "",
  fileDesc: item.fileDesc || "",
  id: item.id,
  methodRequire: item.detectMethod || item.methodRequire || "",
  maintenanceType: item.maintenanceType || "week",
  lastMaintenanceTime: item.lastMaintenanceTime || "",
  lastMaintenanceCount: item.lastMaintenanceCount,
  nextMaintenanceTime: item.nextMaintenanceTime || "",
  nextMaintenanceCount: item.nextMaintenanceCount,
  files: toPhotoList(item.files)
})

const getMroInfoMaintenanceConfig = async () => {
  if (!props.mroId) {
    customTableData.value = []
    loaded.value = true
    return
  }
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroInfoConfigPageList({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        mroItemType: 2,
        mroId: props.mroId
      }
    })

    customTableData.value = (records || []).map(mapMaintenanceRow)
  } finally {
    loaded.value = true
    customTableRef.value?.setLoading(false)
  }
}

watch(
  () => props.mroId,
  () => {
    loaded.value = false
    void getMroInfoMaintenanceConfig()
  },
  {
    immediate: true
  }
)

defineExpose({
  getTableList: () => customTableData.value,
  isLoaded: () => loaded.value
})
</script>

<style lang="scss" scoped>
.maintenance-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    height: 100%;
  }
}

.image-list-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}
</style>
