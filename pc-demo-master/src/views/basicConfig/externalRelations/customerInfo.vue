<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="客户列表">
          <div v-if="isAuth">
            <el-button
              type="primary"
              icon="Plus"
              @click="newCustomerHandleRef!.setVisible(true, false)"
              >新建客户</el-button
            >
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #state-default="{ row }">
            <el-tag :type="row.state ? 'danger' : 'success'">{{
              !row.state ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="newCustomerHandleRef!.setVisible(true, true, row)"
              >{{ isAuth ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="isAuth"
              type="danger"
              size="small"
              link
              @click="onDeleteCustomerClick(row.id)"
              >删除</el-button
            >
            <el-button
              v-if="isAuth && row.state"
              link
              type="primary"
              size="small"
              @click="onSwitchStatus(row.id, true)"
              >启用</el-button
            >
            <el-button
              v-if="isAuth && !row.state"
              link
              type="danger"
              size="small"
              @click="onSwitchStatus(row.id, false)"
              >停用</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 新增、编辑客户弹窗 -->
    <NewCustomerHandle ref="newCustomerHandleRef" @success="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getDeleteCustomer, getSearchCustomer, requestSwitchCustomerStatus } from "@/api/customer"
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
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  ISearchCustomerItem as ITableRow,
  ISearchCustomerParams
} from "@/types/base-info/customer"

import NewCustomerHandle from "./components/NewCustomerHandle.vue"

defineOptions({
  name: "CustomerInfo"
})

const isAuth = useButtonAuth("CustomerInfo_update", "CustomerInfo_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "customerAbbr",
    label: "客户简称",
    value: "",
    placeholder: "请输入客户简称"
  },
  {
    type: EnumComponentType.Input,
    key: "customerName",
    label: "客户名称",
    value: "",
    placeholder: "请输入客户名称"
  },
  {
    type: EnumComponentType.Select,
    key: "stateList",
    label: "状态",
    value: [],
    placeholder: "请选择状态（可多选）",
    options: [
      { label: "启用", value: 0 },
      { label: "停用", value: 1 }
    ],
    multiple: true
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  customerAbbr: string
  customerName: string
  stateList: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const newCustomerHandleRef = ref<InstanceType<typeof NewCustomerHandle>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "customerAbbr",
      label: "客户简称",
      minWidth: 160
    },
    {
      prop: "customerCode",
      label: "客户编号",
      minWidth: 160
    },
    {
      prop: "customerName",
      label: "客户全称",
      minWidth: 160
    },
    {
      prop: "taxNo",
      label: "税号",
      width: 160
    },
    {
      prop: "state",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "state-default"
      }
    },
    {
      prop: "contactName",
      label: "联系人",
      width: 160
    },
    {
      prop: "phone",
      label: "联系电话",
      width: 160,
      align: "center"
    },
    {
      prop: "businessAddress",
      label: "地址",
      width: 200
    },
    {
      prop: "remarks",
      label: "备注",
      width: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 180,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[ISearchCustomerParams], ITableRow, true> = {
  api: getSearchCustomer,
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

onMounted(() => {
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 删除客户 */
const onDeleteCustomerClick = async (id: string) => {
  const confirm = await ElMessageBox.confirm("确认要删除吗?", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  if (confirm === "confirm") {
    await getDeleteCustomer({ id })
    ElMessage.success("删除成功")
    customTableRef.value?.requestData()
  }
}

/** 切换客户状态 */
const onSwitchStatus = async (id: string, isEnable: boolean) => {
  await ElMessageBox.confirm(`确认${isEnable ? "启用" : "停用"}该客户吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestSwitchCustomerStatus({
    id,
    state: isEnable ? 0 : 1
  })

  ElMessage.success(`${isEnable ? "启用" : "停用"}成功`)
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.fContainer {
  display: flex;
  flex-direction: column;
  height: 100%;

  .titleTableBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &:deep(.el-table) {
      flex: 1;
      margin-bottom: 16px;
    }
  }
}
</style>
