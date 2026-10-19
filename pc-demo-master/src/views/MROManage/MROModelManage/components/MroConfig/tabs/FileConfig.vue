<template>
  <div class="file-config">
    <CustomTitle title="相关文件配置">
      <UploadFile
        v-if="isAuth"
        v-model="uploadFileList"
        :limit="999"
        multiple
        :show-tip="false"
        :show-file-list="false"
        @success="onUploadSuccess"
      >
        <el-button type="primary" icon="Upload">上传文件</el-button>
      </UploadFile>
    </CustomTitle>

    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #fileStatus-default="{ row }">
        <el-tag :type="EnumDocumentStatusTagMap[row.fileStatus as EnumDocumentStatus] || 'info'">
          {{ EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus] || "-" }}
        </el-tag>
      </template>

      <template #operation-default="{ row, $index }">
        <el-button
          v-if="getRowFileId(row)"
          link
          type="primary"
          size="small"
          @click="onDownloadFile(row)"
        >
          下载
        </el-button>
        <el-button
          v-if="isAuth && Number(row.documentSourceType || 2) !== 1"
          link
          type="danger"
          size="small"
          @click="onDeleteRow($index)"
        >
          删除
        </el-button>
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle,getFileResourceListById } from "@/api/fileResource"
import { queryMroItemConfigPageList } from "@/api/operation/mro/mro-model"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumDocumentStatus,
  EnumDocumentStatusMap,
  EnumDocumentStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IFileResourcePageItem } from "@/types/base-info/file"
import type { IFile } from "@/types/base-info/implement-config"

const props = withDefaults(
  defineProps<{
    mroModelId: string
  }>(),
  {}
)

interface ITableRow {
  id: string
  deploymentId: string
  fileId: string
  fileName: string
  sourceName: string
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
  1: "文档库下发",
  2: "自己上传"
}

const isAuth = useButtonAuth("MROModel_update", "MROModel_query")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const uploadFileList = ref<IFile[]>([])
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
      prop: "extension",
      label: "文档类型",
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
      label: "文档状态",
      width: 120,
      align: "center",
      slots: {
        default: "fileStatus-default"
      }
    },
    {
      prop: "fileSize",
      label: "文件大小",
      align: "right",
      width: 120,
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
      formatter: ({ updateTime, createTime }) => updateTime || createTime || "-"
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  void getMroModelFileConfig()
})

const getRowFileId = (row: Partial<ITableRow>) =>
  String(row.deploymentId || row.fileId || row.id || "")

const getFileExtension = (fileName: string) => {
  const name = String(fileName || "").trim()
  const index = name.lastIndexOf(".")
  return index > -1 ? name.slice(index + 1) : ""
}

const normalizeFileRow = (
  item: Partial<ITableRow> & Partial<IFileResourcePageItem> & Record<string, any>,
  fallback?: Partial<IFile>
): ITableRow => {
  const fileId = String(item.deploymentId || item.fileId || item.id || fallback?.fileId || "")
  const fileName = String(item.fileName || fallback?.fileName || "")
  const fileSize = String(item.fileSize || item.size || "")
  return {
    id: String(item.id || fileId),
    deploymentId: fileId,
    fileId,
    fileName,
    sourceName: String(item.sourceName || fileName),
    extension: String(item.extension || getFileExtension(fileName)),
    fileSize,
    fileStatus: Number(item.fileStatus || EnumDocumentStatus.Normal),
    path: String(item.path || ""),
    createBy: String(item.createBy || ""),
    createTime: String(item.createTime || ""),
    updateTime: String(item.updateTime || item.uploadTime || item.createTime || ""),
    documentSourceType: Number(item.documentSourceType || 2) === 1 ? 1 : 2
  }
}

const appendTableRow = (row: ITableRow) => {
  const index = customTableData.value.findIndex((item) => getRowFileId(item) === getRowFileId(row))
  if (index === -1) {
    customTableData.value.unshift(row)
    return
  }
  customTableData.value[index] = row
}

const getMroModelFileConfig = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroItemConfigPageList({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        mroItemType: 3,
        mroModelId: props.mroModelId
      }
    })

    customTableData.value = (records[0]?.files || []).map((item) => normalizeFileRow(item))
  } finally {
    loaded.value = true
    customTableRef.value?.setLoading(false)
  }
}

const onDownloadFile = (row: ITableRow) => {
  const fileId = getRowFileId(row)
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
  if (!fileId) return
  void fileDownloadHandle(fileId, row.fileName || row.sourceName)
}

const onDeleteRow = (rowIndex: number) => {
  customTableData.value.splice(rowIndex, 1)
}

const onUploadSuccess = async (files: IFile[], fileId: string) => {
  const currentFile = files.find((item) => item.fileId === fileId)
  const rows = await getFileResourceListById({ idList: [fileId] }).catch(() => [])
  appendTableRow(normalizeFileRow(rows?.[0] || {}, currentFile))
  uploadFileList.value = []
}

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
