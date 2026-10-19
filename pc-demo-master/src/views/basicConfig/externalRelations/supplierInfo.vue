<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="供应商列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onCreateSupplier()">新建供应商</el-button>
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
            <el-button link type="primary" size="small" @click="onUpdateSupplier(row.id)"
              >{{ isAuth ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="isAuth"
              link
              type="danger"
              size="small"
              @click="onDeleteSupplierClick(row.id)"
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

    <!-- 新增、编辑供应商弹窗 -->
    <SupplierCreateDialog
      v-model="createVisible"
      :id="selectedId"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  querySupplierPageList,
  requestDeleteSupplier,
  requestSwitchSupplierStatus,
  requestUpdateSupplier
} from "@/api/supplier"
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
import type { ISearchSupplierParams, ISupplierItem as ITableRow } from "@/types/base-info/supplier"

import SupplierCreateDialog from "./components/SupplierCreateDialog.vue"

defineOptions({
  name: "SupplierInfo"
})

const createVisible = ref(false)
const selectedId = ref("")
const isAuth = useButtonAuth("SupplierInfo_update", "SupplierInfo_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "supplierAbbr",
    label: "供应商简称",
    value: "",
    placeholder: "请输入供应商简称"
  },
  {
    type: EnumComponentType.Input,
    key: "supplierName",
    label: "供应商名称",
    value: "",
    placeholder: "请输入供应商名称"
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
  supplierName: string
  supplierAbbr: string
  stateList: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "supplierAbbr",
      label: "供应商简称",
      minWidth: 160
    },
    {
      prop: "supplierCode",
      label: "供应商编号",
      minWidth: 160
    },
    {
      prop: "supplierName",
      label: "供应商名称",
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
      prop: "isUncheck",
      label: "是否免检",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.isUncheck === 1 ? "是" : "否"
      }
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
const queryConfig: ITableRequestConfig<[ISearchSupplierParams], ITableRow, true> = {
  api: querySupplierPageList,
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

/** 删除供应商 */
const onDeleteSupplierClick = async (id: string) => {
  const confirm = await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  if (confirm === "confirm") {
    await requestDeleteSupplier({ id })
    ElMessage.success("删除成功")
    customTableRef.value?.requestData()
  }
}

/** 切换供应商状态 */
const onSwitchStatus = async (id: string, isEnable: boolean) => {
  await ElMessageBox.confirm(`确认${isEnable ? "启用" : "停用"}该供应商吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestSwitchSupplierStatus({
    id,
    state: isEnable ? 0 : 1
  })
  ElMessage.success(`${isEnable ? "启用" : "停用"}成功`)
  customTableRef.value?.requestData()
}

/** 新增供应商 */
const onCreateSupplier = () => {
  createVisible.value = true
  selectedId.value = ""
}

/** 编辑供应商 */
const onUpdateSupplier = (id: string) => {
  createVisible.value = true
  selectedId.value = id
}
</script>

<style scoped lang="scss"></style>
