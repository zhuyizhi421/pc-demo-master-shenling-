<!-- 法-文档管理 -->
<template>
  <div class="law-tab">
    <CustomTitle title="文档列表">
      <div v-if="!isOnlyView">
        <el-button type="primary" icon="Plus" @click="onAddDocumentClick()">新增文档</el-button>
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
          v-if="!isOnlyView"
          type="danger"
          size="small"
          link
          @click="onDeleteRowClick($index)"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择文档弹窗 -->
    <SelectDocumentDialog
      v-model="selectDocumentDialogVisible"
      :selected-row-keys="selectedDocumentIdList"
      :status-list="[EnumDocumentStatus.Normal]"
      row-key="fileId"
      multiple
      @success="onSelectDocumentSuccess"
    />
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
import { EnumDocumentStatus, EnumDocumentStatusMap } from "@/constant/enums"
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
}

const isOnlyView = inject("isOnlyView")

defineOptions({
  name: "PersonTab"
})

const props = withDefaults(
  defineProps<{
    techVersionId: string
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
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
      prop: "directoryName",
      label: "文档类型",
      minWidth: 160
    },
    {
      prop: "extension",
      label: "格式",
      width: 120,
      align: "center"
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

const selectDocumentDialogVisible = ref(false) // 选择文档弹窗可见
const selectedDocumentIdList = ref<string[]>([]) // 选择的文档ID
const hasChange = ref(false) // 是否有修改

onBeforeMount(() => {
  getTableData()
})

/** 获取文档表格数据 */
const getTableData = async () => {
  const data = await getTechStandardMethodList({
    techVersionId: props.techVersionId
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
        size: fileInfo.fileSize
      }
    })
    selectedDocumentIdList.value = customTableData.value.map((item) => item.fileId)
    hasChange.value = false
  }
}

/** 新增文档 */
const onAddDocumentClick = () => {
  selectDocumentDialogVisible.value = true
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
    selectedDocumentIdList.value.splice(index, 1)
    hasChange.value = true
  }
}

/** 选择文档成功回调 */
const onSelectDocumentSuccess = (data: IFileResourcePageItem[]) => {
  if (data.length) {
    data.forEach((item) => {
      // 若已存在该文档，则不再添加
      if (selectedDocumentIdList.value.includes(item.fileId)) {
        return
      } else {
        customTableData.value.push({
          id: "",
          fileId: item.fileId,
          fileName: item.fileName,
          sourceName: item.sourceName,
          directoryName: item.directoryName,
          extension: item.extension,
          fileStatus: item.fileStatus,
          size: item.size
        })
        selectedDocumentIdList.value.push(item.fileId)
        hasChange.value = true
      }
    })
  }
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  hasChange.value = false
  let methodReqList = customTableData.value.map((item) => {
    return {
      id: item.id,
      fileId: item.fileId,
      type: 9 // 目前都是普通文件
    }
  })
  let params = {
    techVersionId: props.techVersionId,
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
