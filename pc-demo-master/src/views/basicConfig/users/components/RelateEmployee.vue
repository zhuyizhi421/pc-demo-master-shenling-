<template>
  <CustomDialog v-model="visible" title="关联员工" size="medium">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
      class="custom-table"
    >
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      border
      @change="customTableRef?.requestData()"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmitForm()"> 确定 </el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryEmployeePageList } from "@/api/employee"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  IEmployeeListItem as ITableRow,
  IEmployeePageListParams
} from "@/types/base-info/employee"

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "员工姓名",
    value: "",
    placeholder: "请输入员工姓名"
  },
  {
    type: EnumComponentType.Input,
    key: "empNo",
    label: "关联员工编号",
    value: "",
    placeholder: "请输入关联员工编号"
  },
  {
    type: EnumComponentType.Select,
    key: "isAccountOpen",
    label: "展示已关联员工",
    value: false,
    placeholder: "请选择",
    options: [
      {
        label: "是",
        value: true
      },
      {
        label: "否",
        value: false
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  empNo: string
  isAccountOpen: boolean
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const emits = defineEmits<{
  (e: "selectName", name: string, no: string, id: string): void
}>()

const visible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  reserveSelection: true,
  columns: [
    { prop: "name", label: "员工名称", minWidth: 160 },
    { prop: "empNo", label: "员工编号", minWidth: 160 },
    {
      prop: "bindNickname",
      label: "关联用户账号",
      minWidth: 160,
      formatter: (row) => {
        return row.bindNickname || "未关联"
      }
    },
    {
      prop: "bindUsername",
      label: "关联用户名",
      minWidth: 160,
      formatter: (row) => {
        return row.bindUsername || "未关联"
      }
    },
    {
      prop: "selection",
      label: "操作",
      width: 55,
      fixed: "right",
      type: "selection",
      multiple: false,
      selectable: (row) => {
        return row.bindNickname === "未关联" || !row.bindNickname
      }
    }
  ]
})

/** 设置弹窗显示状态 */
const setVisible = (value: boolean) => {
  visible.value = value
  if (value) {
    nextTick(() => {
      customTableRef.value?.requestData()
    })
  }
}

const queryConfig: ITableRequestConfig<[IEmployeePageListParams], ITableRow, true> = {
  api: queryEmployeePageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 提交操作 */
const onSubmitForm = () => {
  const selectedRow = customTableRef.value?.getCurrentSingleRow() as ITableRow
  if (!selectedRow) {
    return ElMessage.warning("请选择员工")
  }
  emits("selectName", selectedRow.name, selectedRow.empNo, selectedRow.id)
  visible.value = false
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped></style>
