<template>
  <CustomDialog v-model="visible" title="关联用户" size="medium">
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
      :border="false"
      @change="customTableRef?.requestData()"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()">确定</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryBindExistUserAccount } from "@/api/employee"
import { queryUserInfoList } from "@/api/user"
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
import type { IUserInfoListItem as ITableRow, IUserInfoListParams } from "@/types/base-info/user"

const emits = defineEmits<{
  (e: "onOk", userId: string): void
}>()

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "nickname",
    label: "用户名称",
    value: "",
    placeholder: "请输入用户名称"
  },
  {
    type: EnumComponentType.Input,
    key: "username",
    label: "用户账号",
    value: "",
    placeholder: "请输入用户账号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  nickname: string
  username: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const empId = ref("")
const visible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
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
      prop: "empNo",
      label: "关联员工编号",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.empNo || "未关联"
      }
    },
    {
      prop: "empName",
      label: "关联员工姓名",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.empName || "未关联"
      }
    },
    {
      prop: "",
      label: "",
      width: 50,
      type: "selection",
      align: "center",
      fixed: "right",
      selectable: (row: ITableRow) => {
        return !row.empNo
      }
    }
  ]
})

const setVisible = (value: boolean, _empId: string) => {
  visible.value = value
  empId.value = _empId
  if (visible.value) {
    nextTick(() => {
      customTableRef.value?.requestData()
    })
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

const queryConfig: ITableRequestConfig<[IUserInfoListParams], ITableRow, true> = {
  api: queryUserInfoList,
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

const onConfirmClick = async () => {
  const selectedData = customTableRef.value?.getCurrentSingleRow()
  if (!selectedData) {
    ElMessage.warning("请选择用户")
    return
  }
  await queryBindExistUserAccount({
    empId: empId.value,
    userId: (selectedData as ITableRow).id
  })
  ElMessageBox({
    title: "提示",
    message: `关联成功`,
    dangerouslyUseHTMLString: true,
    confirmButtonText: "确认"
  })
  emits("onOk", (selectedData as ITableRow).id)
  visible.value = false
}

const onCancelClick = () => {
  visible.value = false
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped></style>
