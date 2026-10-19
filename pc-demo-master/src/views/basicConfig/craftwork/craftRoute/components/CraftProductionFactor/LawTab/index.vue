<!-- 法-文档管理 -->
<template>
  <div class="law-tab">
    <CustomTitle title="">
      <div v-if="!isOnlyView" style="display: flex">
        <UploadFile
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

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ row, $index }">
        <el-button type="primary" size="small" link @click="fileDownloadHandle(row.fileId)"
          >下载</el-button
        >
        <el-button
          v-if="Number(row.documentSourceType) !== 1"
          type="danger"
          size="small"
          link
          @click="onDeleteRowClick($index)"
          :disabled="isOnlyView"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardMethodList, saveTechStandardMethodList } from "@/api/craft"
import { fileDownloadHandle } from "@/api/fileResource"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDocumentDialog from "@/components/SelectDocumentDialog/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import { EnumDocumentStatus, EnumDocumentStatusMap } from "@/constant/enums"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import type { IFileResourcePageItem } from "@/types/base-info/file"

interface ITableRow {
  id: string
  fileId: string
  fileName: string
  sourceName: string
  directoryName: string
  extension: string
  fileStatus: number
  size: string
  documentSourceType: 1 | 2
}

const documentSourceTypeMap: Record<1 | 2, string> = {
  1: "文档库下发",
  2: "自己上传"
}

const isOnlyView = inject("isOnlyView")

defineOptions({
  name: "PersonTab"
})

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const uploadFileList = ref<any[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "fileName",
      label: "文件名称",
      minWidth: 160
    },
    {
      prop: "sourceName",
      label: "源文件名",
      minWidth: 160
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
      formatter: ({ documentSourceType }) =>
        documentSourceTypeMap[Number(documentSourceType) as 1 | 2] || ""
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      width: 120,
      formatter: (row: ITableRow) => {
        return EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus]
      }
    },
    {
      prop: "size",
      label: "文档大小",
      width: 120
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const hasChange = ref(false) // 是否有修改

onBeforeMount(() => {
  getTableData()
})

/** 获取文档表格数据 */
const getTableData = async () => {
  const data = await getTechStandardMethodList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId
  })
  if (data) {
    customTableData.value = data.map((item) => {
      const fileInfo = item.tsesFileResource
      return {
        id: item.id,
        fileId: fileInfo.id,
        fileName: fileInfo.fileName,
        sourceName: fileInfo.sourceName,
        directoryName: fileInfo.directoryName,
        extension: fileInfo.extension,
        fileStatus: fileInfo.fileStatus,
        size: fileInfo.fileSize,
        documentSourceType: Number(item.documentSourceType || 2) as 1 | 2
      }
    })
    hasChange.value = false
  }
}


/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确定删除确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
    hasChange.value = true
  }
}

const getFileExtension = (fileName: string) => {
  const name = String(fileName || "").trim()
  const index = name.lastIndexOf(".")
  return index > -1 ? name.slice(index + 1) : ""
}

/** 上传文件成功回调 */
const onUploadSuccess = (files: any[], fileId: string) => {
  const currentFile = files.find((item) => item.fileId === fileId)
  if (currentFile) {
    customTableData.value.unshift({
      id: "",
      fileId: currentFile.fileId,
      fileName: currentFile.fileName,
      sourceName: currentFile.fileName,
      directoryName: "默认目录",
      extension: String(currentFile.extension || getFileExtension(currentFile.fileName)),
      fileStatus: 1,
      size: currentFile.size || "",
      documentSourceType: 2
    })
    hasChange.value = true
    uploadFileList.value = []
    ElMessage.success("上传成功")
  }
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  hasChange.value = false
  let methodReqList = customTableData.value.map((item) => {
    return {
      id: item.id,
      fileId: item.fileId,
      type: 9, // 目前都是普通文件
      documentSourceType: item.documentSourceType || 2
    }
  })
  let params = {
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId,
    methodReqList
  }
  await saveTechStandardMethodList(params)
  ElMessage.success("保存成功")
  isUpdate && getTableData()
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    onSaveClick(false)
  }
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 16px;
}

.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}
</style>
