<template>
  <div class="file-config">
    <CustomTitle title="相关文件配置">
      <UploadFile
        v-if="!props.justSee"
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
          v-if="!props.justSee && Number(row.documentSourceType || 2) !== 1"
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
import { ElMessage, ElMessageBox } from "element-plus"

import { editEquipmentModelConfig, getEquipmentModelConfigPaged } from "@/api/equipmentModelConfig"
import { fileDownloadHandle, getFileResourceListById } from "@/api/fileResource"
import { DeviceInitSettingTabs } from "@/api/operation/equipment/types"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumDocumentStatus,
  EnumDocumentStatusMap,
  EnumDocumentStatusTagMap
} from "@/constant/enums"
import type { IFileResourcePageItem } from "@/types/base-info/file"
import type { IFile } from "@/types/base-info/implement-config"
import { formatDateTime } from "@/views/maintOperate/status"

const props = defineProps<{
  modelId: string
  justSee?: boolean
}>()

const emit = defineEmits<{
  (e: "success"): void
}>()

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

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const uploadFileList = ref<IFile[]>([])

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
      width: props.justSee ? 100 : 140,
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

const normalizeFileRow = (
  item: Partial<ITableRow> &
    Partial<IFileResourcePageItem> & {
      fileResource?: Record<string, any>
      size?: string | number
      path?: string
      documentSourceType?: number
    },
  fallback?: Partial<IFile>
): ITableRow => {
  const fileResource = item.fileResource || {}
  const fileId = String(
    fileResource.deploymentId ||
      item.deploymentId ||
      fileResource.id ||
      item.fileId ||
      item.id ||
      fallback?.fileId ||
      ""
  )
  const fileName = String(fileResource.fileName || item.fileName || fallback?.fileName || "")
  return {
    id: String(item.id || fileResource.id || fileId),
    deploymentId: fileId,
    fileId,
    fileName,
    sourceName: String(fileResource.sourceName || item.sourceName || fileName),
    extension: String(fileResource.extension || item.extension || getFileExtension(fileName)),
    fileSize: String(fileResource.size || item.fileSize || item.size || ""),
    fileStatus: Number(fileResource.fileStatus || item.fileStatus || EnumDocumentStatus.Normal),
    path: String(fileResource.path || item.path || ""),
    createBy: String(fileResource.createBy || item.createBy || ""),
    createTime: String(fileResource.createTime || item.createTime || ""),
    updateTime: String(
      fileResource.updateTime ||
        item.updateTime ||
        item.createTime ||
        fileResource.createTime ||
        ""
    ),
    documentSourceType: Number(item.documentSourceType || 2) === 1 ? 1 : 2
  }
}

const appendTableRow = (row: ITableRow) => {
  const targetIndex = customTableData.value.findIndex(
    (item) => getRowFileId(item) === getRowFileId(row)
  )
  if (targetIndex === -1) {
    customTableData.value.unshift(row)
    return
  }
  customTableData.value.splice(targetIndex, 1, row)
}

const getSelectedFileIds = () =>
  customTableData.value.map((item) => getRowFileId(item)).filter(Boolean)

const getTableData = async () => {
  if (!props.modelId) {
    customTableData.value = []
    return
  }

  customTableRef.value?.setLoading(true)
  try {
    const { records } = await getEquipmentModelConfigPaged({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        equipmentModelId: props.modelId,
        mconfigType: DeviceInitSettingTabs.file
      }
    })

    customTableData.value = (records || []).flatMap((item: Record<string, any>) => {
      if (item?.fileResource) {
        return [normalizeFileRow(item)]
      }
      if (Array.isArray(item?.files)) {
        return item.files.map((file: Record<string, any>) =>
          normalizeFileRow({
            ...item,
            id: file.id || file.deploymentId || file.fileId,
            fileResource: file
          })
        )
      }
      return [normalizeFileRow(item)]
    })
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const saveFileIds = async (fileIds: string[]) => {
  await editEquipmentModelConfig({
    equipmentModelId: props.modelId,
    fileIds: [...new Set(fileIds.filter(Boolean))],
    mconfigType: DeviceInitSettingTabs.file
  })
}

const onUploadSuccess = async (files: IFile[], fileId: string) => {
  const currentFile = files.find((item) => item.fileId === fileId)
  const rows = await getFileResourceListById({ idList: [fileId] }).catch(() => [])
  appendTableRow(normalizeFileRow(rows?.[0] || {}, currentFile))
  await saveFileIds(getSelectedFileIds())
  uploadFileList.value = []
  ElMessage.success("上传成功")
  await getTableData()
  emit("success")
}

const onDeleteRow = async (rowIndex: number) => {
  const confirmed = await ElMessageBox.confirm("此操作将删除该文件，是否继续？", "提示", {
    type: "warning"
  }).catch(() => false)
  if (!confirmed) return
  customTableData.value.splice(rowIndex, 1)
  await saveFileIds(getSelectedFileIds())
  ElMessage.success("删除成功")
  await getTableData()
  emit("success")
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
  () => props.modelId,
  () => {
    void getTableData()
  },
  {
    immediate: true
  }
)
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
