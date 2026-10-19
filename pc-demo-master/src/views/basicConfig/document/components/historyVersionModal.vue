<template>
  <CustomDialog v-model="modalStatus.show" size="medium" title="历史版本">
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      :query-config="queryConfig"
      class="custom-table"
    >
      <template #operation-default="{ row }">
        <el-button
          link
          type="primary"
          size="small"
          @click="onDownload(row.fileId || row.id, row.sourceName || row.fileName)"
        >
          下载
        </el-button>
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script lang="ts" setup>
import {
  fileDownloadHandle,
  getHistoryFileList,
  type IFileHistory as ITableRow
} from "@/api/fileResource"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IFileResourcePageItem } from "@/types/base-info/file"

defineOptions({
  name: "HistoryVersionModal"
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "fileName",
      label: "文档名",
      width: 160
    },
    {
      prop: "version",
      label: "当前版本",
      width: 120,
      align: "center"
    },
    {
      prop: "extension",
      label: "格式",
      width: 160,
      align: "center"
    },
    {
      prop: "sourceName",
      label: "源文档名",
      width: 160
    },
    {
      prop: "fileSize",
      label: "文档大小",
      width: 120
    },
    {
      prop: "updateTime",
      label: "变更时间",
      width: 160
    },
    {
      prop: "changeReason",
      label: "变更原因",
      minWidth: 220,
      showOverflowTooltip: true
    },
    {
      prop: "operation",
      label: "操作",
      width: 60,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

type ICurrentHistoryFile = Partial<IFileResourcePageItem & ITableRow>

const modalStatus = ref({
  show: false,
  id: "",
  currentFile: undefined as ICurrentHistoryFile | undefined
})

const getVersionNumber = (value?: string) => Number(String(value || "").replace(/[^\d]/g, "")) || 0

const sortHistoryRows = (rows: ITableRow[]) =>
  [...rows].sort((a, b) => {
    const versionDiff = getVersionNumber(b.version) - getVersionNumber(a.version)
    if (versionDiff) return versionDiff

    return (
      new Date(b.updateTime || b.createTime || 0).getTime() -
      new Date(a.updateTime || a.createTime || 0).getTime()
    )
  })

const excludeCurrentVersion = (rows: ITableRow[], currentFile?: ICurrentHistoryFile) => {
  if (!currentFile) return sortHistoryRows(rows)

  return sortHistoryRows(
    rows.filter((item) => {
      if (currentFile.version && String(item.version || "") === String(currentFile.version)) return false
      if (currentFile.fileId && String(item.fileId || "") === String(currentFile.fileId)) return false
      return true
    })
  )
}

watch(
  () => modalStatus.value.show,
  async (val) => {
    if (val) {
      modalStatus.value.show = true
      await nextTick()
      await customTableRef.value?.requestData()
    }
  }
)

/** 下载操作 */
const onDownload = (fileId: string, fileName?: string) => {
  fileDownloadHandle(fileId, fileName)
}

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: async (id: string) => {
    let rows = await getHistoryFileList(id)
    if (!rows.length && modalStatus.value.currentFile?.fileId) {
      rows = await getHistoryFileList(String(modalStatus.value.currentFile.fileId))
    }
    return excludeCurrentVersion(rows, modalStatus.value.currentFile)
  },
  getParams: () => {
    return [modalStatus.value.id]
  }
}

/** 设置弹窗数据状态 */
const setModalStatus = (value: { show: boolean; id: string; currentFile?: ICurrentHistoryFile }) => {
  modalStatus.value = value
}

defineExpose({
  setModalStatus
})
</script>
