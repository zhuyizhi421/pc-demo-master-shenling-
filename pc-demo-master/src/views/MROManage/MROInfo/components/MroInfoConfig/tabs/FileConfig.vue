<template>
  <div class="file-config">
    <CustomTitle title="相关文件" />

    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #fileStatus-default="{ row }">
        <el-tag :type="EnumDocumentStatusTagMap[row.fileStatus as EnumDocumentStatus] || 'info'">
          {{ EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus] || "-" }}
        </el-tag>
      </template>

      <template #operation-default="{ row }">
        <el-button
          v-if="getRowFileId(row)"
          link
          type="primary"
          size="small"
          @click="onDownloadFile(row)"
        >
          下载
        </el-button>
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { queryMroInfoConfigPageList } from "@/api/operation/mro/mro-info"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumDocumentStatus,
  EnumDocumentStatusMap,
  EnumDocumentStatusTagMap
} from "@/constant/enums"

import { formatDateTime } from "../../../status"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

interface ITableRow {
  id: string
  deploymentId: string
  fileId: string
  fileName: string
  sourceName: string
  fileDesc: string
  extension: string
  fileSize: string
  fileStatus: number
  path: string
  createBy: string
  createTime: string
  updateTime: string
  documentSourceType: 1 | 2
}

const documentSourceTypeMap: Record<1 | 2, string> = {
  1: "文档库文件",
  2: "主数据关联"
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const loaded = ref(false)

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "fileName",
      label: "文件名称",
      minWidth: 180
    },
    {
      prop: "sourceName",
      label: "源文件名",
      minWidth: 180,
      formatter: ({ sourceName }) => sourceName || "-"
    },
    {
      prop: "fileDesc",
      label: "图片说明",
      minWidth: 220,
      formatter: ({ fileDesc }) => fileDesc || "-"
    },
    {
      prop: "extension",
      label: "文件类型",
      width: 120,
      align: "center",
      formatter: ({ extension }) => extension || "-"
    },
    {
      prop: "documentSourceType",
      label: "来源类型",
      width: 120,
      align: "center",
      formatter: ({ documentSourceType }) =>
        documentSourceTypeMap[Number(documentSourceType || 2) === 1 ? 1 : 2]
    },
    {
      prop: "fileStatus",
      label: "文件状态",
      width: 120,
      align: "center",
      slots: {
        default: "fileStatus-default"
      }
    },
    {
      prop: "fileSize",
      label: "文件大小",
      width: 120,
      align: "right",
      formatter: ({ fileSize }) => fileSize || "-"
    },
    {
      prop: "createBy",
      label: "上传人",
      minWidth: 120,
      formatter: ({ createBy }) => createBy || "-"
    },
    {
      prop: "updateTime",
      label: "上传时间",
      minWidth: 180,
      align: "center",
      formatter: ({ updateTime, createTime }) => formatDateTime(updateTime || createTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const getRowFileId = (row: Partial<ITableRow>) =>
  String(row.deploymentId || row.fileId || row.id || "")

const getFileExtension = (fileName: string) => {
  const name = String(fileName || "").trim()
  const index = name.lastIndexOf(".")
  return index > -1 ? name.slice(index + 1) : ""
}

const normalizeFileRow = (item: Record<string, any>): ITableRow => {
  const fileId = String(item.deploymentId || item.fileId || item.id || "")
  const fileName = String(item.fileName || item.sourceName || "")
  return {
    id: String(item.id || fileId),
    deploymentId: fileId,
    fileId,
    fileName,
    sourceName: String(item.sourceName || fileName),
    fileDesc: String(item.fileDesc || ""),
    extension: String(item.extension || getFileExtension(fileName)),
    fileSize: String(item.fileSize || item.size || ""),
    fileStatus: Number(item.fileStatus || EnumDocumentStatus.Normal),
    path: String(item.path || ""),
    createBy: String(item.createBy || ""),
    createTime: String(item.createTime || ""),
    updateTime: String(item.updateTime || item.uploadTime || item.createTime || ""),
    documentSourceType: Number(item.documentSourceType || 2) === 1 ? 1 : 2
  }
}

const getMroInfoFileConfig = async () => {
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
        mroItemType: 3,
        mroId: props.mroId
      }
    })

    customTableData.value = (records || []).flatMap((record: Record<string, any>) =>
      (record.files || []).map((item: Record<string, any>) =>
        normalizeFileRow({
          ...item,
          fileDesc: item.fileDesc || record.fileDesc || ""
        })
      )
    )
  } finally {
    loaded.value = true
    customTableRef.value?.setLoading(false)
  }
}

const onDownloadFile = (row: ITableRow) => {
  if (row.path) {
    const link = document.createElement("a")
    link.href = new URL(row.path, window.location.origin).toString()
    link.download = row.fileName || row.sourceName || "download"
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }
  const fileId = getRowFileId(row)
  if (!fileId) return
  void fileDownloadHandle(fileId, row.fileName || row.sourceName)
}

watch(
  () => props.mroId,
  () => {
    loaded.value = false
    void getMroInfoFileConfig()
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
.file-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
