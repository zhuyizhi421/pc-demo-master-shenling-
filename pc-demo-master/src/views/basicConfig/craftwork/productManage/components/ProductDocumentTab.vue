<template>
  <CustomTitle title="" style="margin-top: 0">
    <div style="display: flex;">
      <UploadFile
        v-if="!isReadonly"
        v-model="uploadFileList"
        :limit="999"
        multiple
        :show-tip="false"
        :show-file-list="false"
        @success="onUploadSuccess"
      >
        <el-button type="primary" icon="Upload">上传文件</el-button>
      </UploadFile>
    </div>
  </CustomTitle>
  <CustomTable v-model:table-data="tableData" :config="tableConfig" class="custom-detail-table">
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="fileDownloadHandle(row.fileId)"
        >下载</el-button
      >
      <el-button
        v-if="Number(row.documentSourceType || 2) !== 1"
        link
        type="danger"
        :disabled="!!isReadonly"
        size="small"
        @click="onDelete(row)"
        >删除</el-button
      >
    </template>
  </CustomTable>

</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { fileDownloadHandle, getFileResourceListById } from "@/api/fileResource"
import { deleteProductModelDoc, getDocIdList, saveDocList } from "@/api/product"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import { type EnumDocumentStatus, EnumDocumentStatusMap } from "@/constant/enums"
import type { IFileResourcePageItem } from "@/types/base-info/file"
import type { IFile } from "@/types/base-info/implement-config"

type ITableRow = IFileResourcePageItem & {
  deleteId?: string
}

const props = withDefaults(
  defineProps<{
    id: string
    isReadonly?: boolean
  }>(),
  {
    id: "",
    isReadonly: false
  }
)

const tableData = ref<ITableRow[]>([])
const uploadFileList = ref<IFile[]>([])

const documentSourceTypeMap: Record<1 | 2, string> = {
  1: "文档库下发",
  2: "自己上传"
}

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
      minWidth: 120,
      align: "center",
      formatter: ({ extension }) => extension || "-"
    },
    {
      prop: "documentSourceType",
      label: "来源类型",
      width: 120,
      align: "center",
      formatter: ({ documentSourceType }) => documentSourceTypeMap[Number(documentSourceType) as 1 | 2] || ""
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus] || ""
      }
    },
    {
      prop: "size",
      label: "文件大小",
      align: "right",
      width: 120,
      formatter: ({ size }) => size || "-"
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
      get hidden() {
        return props.isReadonly
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const getDocList = async () => {
  try {
    const docRes = await getDocIdList(props.id)
    if (docRes.length) {
      const docs = await getFileResourceListById({ idList: docRes.map((item) => item.fileId) })
      // 还需保存一份原数据，用来取消时恢复
      tableData.value = docs.map((item) => ({
        ...item,
        deleteId: docRes.find((doc) => doc.fileId === item.id)?.id || "",
        documentSourceType: docRes.find((doc) => doc.fileId === item.id)?.documentSourceType || 2,
      }))
    } else {
      tableData.value = []
    }
  } catch (error) {
    console.error(error)
  }
}


const getFileExtension = (fileName: string) => {
  const name = String(fileName || "").trim()
  const index = name.lastIndexOf(".")
  return index > -1 ? name.slice(index + 1) : ""
}

const normalizeFileRow = (
  item: Partial<ITableRow> & Partial<IFileResourcePageItem> & Record<string, any>,
  fallback?: Partial<IFile>
): ITableRow => {
  const fileId = String(item.id || fallback?.fileId || "")
  const fileName = String(item.fileName || fallback?.fileName || "")
  return {
    ...item,
    id: fileId,
    fileId,
    fileName,
    sourceName: String(item.sourceName || fileName),
    extension: String(item.extension || getFileExtension(fileName)),
    size: String(item.size || ""),
    fileStatus: Number(item.fileStatus || 0),
    createBy: String(item.createBy || ""),
    createTime: String(item.createTime || ""),
    updateTime: String(item.updateTime || item.uploadTime || item.createTime || ""),
    documentSourceType: 2
  }
}

const appendTableRow = (row: ITableRow) => {
  const index = tableData.value.findIndex((item) => item.id === row.id)
  if (index === -1) {
    tableData.value.unshift(row)
    return
  }
  tableData.value[index] = row
}

/** 上传文件成功回调 */
const onUploadSuccess = async (files: IFile[], fileId: string) => {
  const currentFile = files.find((item) => item.fileId === fileId)
  try {
    await saveDocList({ fileIds: [fileId], productModelId: props.id, documentSourceType: 2 })
    const rows = await getFileResourceListById({ idList: [fileId] }).catch(() => [])
    const fileDoc = rows?.[0]
    if (fileDoc) {
      appendTableRow(
        normalizeFileRow(fileDoc, currentFile)
      )
    }
    ElMessage.success("上传成功")
    uploadFileList.value = []
  } catch (error) {
    console.error(error)
  }
}
/** 取消关联 */
const onDelete = async (row: ITableRow) => {
  const confirm = await ElMessageBox.confirm("此操作将取消文档和产品的关联，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  if (confirm === "confirm") {
    await deleteProductModelDoc(row.deleteId!)
    ElMessage.success("操作成功")
    await getDocList()
  }
}

onMounted(async () => {
  await getDocList()
})

defineOptions({
  name: "ProductDocumentTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
