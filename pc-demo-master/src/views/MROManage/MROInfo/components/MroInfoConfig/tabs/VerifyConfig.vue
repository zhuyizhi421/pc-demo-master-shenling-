<template>
  <div class="verify-config">
    <CustomTitle title="校验配置" />

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

const standardTypeEnum: Record<number, string> = {
  1: "定量",
  2: "定性"
}

const verifyTypeEnum: Record<string, string> = {
  count: "按次数",
  day: "按天"
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

const formatVerifyFrequency = (row: IMroInfoConfigTableRow) => {
  const unit = row.verifyType === "count" ? "次" : "天"
  return `${Number(row.configFrequency || 0)}${unit}`
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "configItemNo",
      label: "校验项编号",
      width: 160
    },
    {
      prop: "configItemName",
      label: "校验项名称",
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
      prop: "verifyType",
      label: "校验类型",
      width: 110,
      align: "center",
      formatter: ({ verifyType }) => verifyTypeEnum[verifyType || "day"] || "-"
    },
    {
      prop: "configFrequency",
      label: "校验周期",
      width: 120,
      align: "center",
      formatter: (row) => formatVerifyFrequency(row)
    },
    {
      prop: "executePositionName",
      label: "校验执行职位",
      minWidth: 180,
      formatter: (row) => formatDepartmentPosition(row)
    },
    {
      prop: "verifyOrg",
      label: "校验机构",
      minWidth: 160,
      formatter: ({ verifyOrg }) => verifyOrg || "-"
    },
    {
      prop: "lastVerifyTime",
      label: "上次校验时间",
      minWidth: 180,
      align: "center",
      formatter: ({ lastVerifyTime }) => formatDateTime(lastVerifyTime)
    },
    {
      prop: "lastVerifyCount",
      label: "上次校验次数",
      width: 120,
      align: "right",
      formatter: ({ lastVerifyCount }) => formatNullableCount(lastVerifyCount)
    },
    {
      prop: "nextVerifyTime",
      label: "预计校验时间",
      minWidth: 180,
      align: "center",
      formatter: ({ nextVerifyTime }) => formatDateTime(nextVerifyTime)
    },
    {
      prop: "nextVerifyCount",
      label: "预计校验次数",
      width: 120,
      align: "right",
      formatter: ({ nextVerifyCount }) => formatNullableCount(nextVerifyCount)
    }
  ]
})

const toPhotoList = (files: IMroInfoConfigPageListItem["files"] = []): IPhoto[] =>
  (Array.isArray(files) ? files : [])
    .filter((item) => item?.path)
    .map((item, index) => ({
      fileId: String(item.deploymentId || item.fileId || item.id || `verify-file-${index}`),
      fileName: item.fileName || `图片说明${index + 1}.png`,
      fileUrl: formatImgUrlPreview(item.path)
    }))

const mapVerifyRow = (item: IMroInfoConfigPageListItem): IMroInfoConfigTableRow => ({
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
  verifyOrg: item.verifyOrg || "",
  verifyType: item.verifyType || "day",
  lastVerifyTime: item.lastVerifyTime || "",
  lastVerifyCount: item.lastVerifyCount,
  nextVerifyTime: item.nextVerifyTime || "",
  nextVerifyCount: item.nextVerifyCount,
  files: toPhotoList(item.files)
})

const getMroInfoVerifyConfig = async () => {
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
        mroItemType: 1,
        mroId: props.mroId
      }
    })

    customTableData.value = (records || []).map(mapVerifyRow)
  } finally {
    loaded.value = true
    customTableRef.value?.setLoading(false)
  }
}

watch(
  () => props.mroId,
  () => {
    loaded.value = false
    void getMroInfoVerifyConfig()
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
.verify-config {
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
