<!-- 选择用户弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择用户" size="medium">
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

import { queryUserInfoList, requestUserInfoListByIds } from "@/api/user"
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
import type { IUserInfo as ITableRow, IUserInfoListParams } from "@/types/base-info/user"

import type { IUserDialogEmits, IUserDialogProps } from "./type"

defineOptions({
  name: "SelectUserDialog"
})

const props = withDefaults(defineProps<IUserDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emit = defineEmits<IUserDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  nickname: string
  username: string
}>([
  {
    type: EnumComponentType.Input,
    label: "用户名称",
    key: "nickname",
    value: "",
    placeholder: "请输入用户名称"
  },
  {
    type: EnumComponentType.Input,
    label: "用户账号",
    key: "username",
    value: "",
    placeholder: "请输入用户账号"
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
      prop: "nickname",
      label: "用户名称",
      minWidth: 160
    },
    {
      prop: "username",
      label: "用户账号",
      minWidth: 160
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
const queryConfig: ITableRequestConfig<[IUserInfoListParams], ITableRow, true> = {
  api: queryUserInfoList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
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
  set: (val: boolean) => {
    emit("update:modelValue", val)
  }
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
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedTableList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedTableList)
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

/** 获取指定id列表的用户列表 */
const getSelectedTableList = async () => {
  const data = await requestUserInfoListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 确认选择 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择用户")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择用户")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
