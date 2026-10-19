<!-- 选择包装工序弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择包装工序" size="medium">
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
      <template #operation-default="{ row }">
        <el-button type="primary" size="small" link @click="onReview(row)">查看</el-button>
      </template>
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

import {
  queryPackageProcessDetails,
  queryPackageProcessPageList
} from "@/api/baseInfo/package-manage/packageProcess"
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
import type {
  IPackageProcessPageListItem as ITableRow,
  IPackageProcessPageListParams
} from "@/types/base-info/package-process"

import type { IPackageProcessDialogEmits, IPackageProcessDialogProps } from "./type"

defineOptions({
  name: "SelectDocumentDialog"
})

const props = withDefaults(defineProps<IPackageProcessDialogProps>(), {
  rowKey: "id",
  multiple: false,
  enable: true
})

const emit = defineEmits<IPackageProcessDialogEmits>()

const router = useRouter()

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
}>([
  {
    type: EnumComponentType.Input,
    label: "包装工序名称",
    key: "name",
    value: "",
    placeholder: "请输入包装工序名称"
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
      prop: "name",
      label: "包装工序名称",
      minWidth: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "查看",
      width: 120,
      align: "center",
      slots: {
        default: "operation-default"
      }
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
const queryConfig: ITableRequestConfig<[IPackageProcessPageListParams], ITableRow, true> = {
  api: queryPackageProcessPageList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          status: props.enable ? "enable" : undefined
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
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getPackageProcessDetails)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getPackageProcessDetails)
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

/** 获取指定id的包装工序详情 */
const getPackageProcessDetails = async () => {
  const data = await queryPackageProcessDetails(props.selectedRowKeys)
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择包装工序")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择包装工序")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}

/** 查看包装工序操作 */
const onReview = (row: ITableRow) => {
  router.push({
    name: "PackageProcess",
    query: {
      packageProcessId: row.id
    }
  })
}
</script>

<style lang="scss" scoped></style>
