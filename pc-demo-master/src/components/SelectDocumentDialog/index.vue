<!-- 选择文档弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择文档" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="tableRef?.requestData()"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getFileResourceListById, searchFileResourceList } from "@/api/fileResource"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import { EnumDocumentStatus, EnumDocumentStatusMap } from "@/constant/enums"
import type {
  IFileResourcePageItem as ITableRow,
  IFileResourceParams
} from "@/types/base-info/file"

import type { IDocumentDialogEmits, IDocumentDialogProps } from "./type"

defineOptions({
  name: "SelectDocumentDialog"
})

const props = withDefaults(defineProps<IDocumentDialogProps>(), {
  rowKey: "id",
  multiple: false,
  statusList: () => [EnumDocumentStatus.Normal, EnumDocumentStatus.Review]
})

const emit = defineEmits<IDocumentDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  fileName: string
  directoryName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "文档名称",
    key: "fileName",
    value: "",
    placeholder: "请输入文档名称"
  },
  {
    type: EnumComponentType.Input,
    label: "文档类型",
    key: "directoryName",
    value: "",
    placeholder: "请输入文档类型"
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "fileName",
      label: "文档名称",
      minWidth: 160
    },
    {
      prop: "sourceName",
      label: "源文档名",
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
      minWidth: 120,
      align: "center"
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      minWidth: 120,
      align: "center",
      formatter: ({ fileStatus }) => EnumDocumentStatusMap[fileStatus as EnumDocumentStatus]
    },
    {
      prop: "size",
      label: "文档大小",
      minWidth: 120
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      get multiple() {
        return props.multiple
      },
      fixed: "right",
      selectable: (row) => {
        return props.multiple ? !props.selectedRowKeys?.includes(row[props.rowKey]) : true
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IFileResourceParams], ITableRow, true> = {
  api: searchFileResourceList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          statusList: props.statusList?.length ? props.statusList : undefined
        },
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        }
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }

        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getDocumentListById)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getDocumentListById)
      })
    } else {
      resetForm()
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取指定id的文件信息 */
const getDocumentListById = async () => {
  const data = await getFileResourceListById({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择文档")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择文档")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
