<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="上岗证申请列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="licenseApplyDialogRef!.setVisible(true)"
              >申请上岗证</el-button
            >
            <el-button @click="applyConfigVisible = true">申请配置</el-button>
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
          <template #applyStatus-default="{ row }">
            <el-tag
              :type="
                row.applyStatus === 2 ? 'success' : row.applyStatus === 3 ? 'danger' : 'primary'
              "
            >
              {{ enumApplyStatus[row.applyStatus] }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="row.processInstanceId"
              link
              type="primary"
              size="small"
              @click="useFlowDetail.setStatus(true, row.processInstanceId, onRequest)"
              >审批详情</el-button
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

    <!-- 申请上岗证弹窗 -->
    <LicenseApplyDialog ref="licenseApplyDialogRef" @success="customTableRef?.requestData()" />

    <!-- 申请配置弹窗 -->
    <ApplyConfigDialog v-if="applyConfigVisible" @close="applyConfigVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { queryLicenseApplyPageList, queryLicenseCascade } from "@/api/license"
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
import useFlowDetailStore from "@/store/modules/flowDetail"
import type {
  ILicenseApplyListItem as ITableRow,
  ILicenseApplySearchParams
} from "@/types/base-info/employee"
import { transformLicenseCascade } from "@/utils/cascaderTransform"

import ApplyConfigDialog from "./components/ApplyConfigDialog.vue"
import LicenseApplyDialog from "./components/LicenseApplyDialog.vue"

defineOptions({
  name: "WorkLicense"
})

const isAuth = useButtonAuth("WorkLicense_update", "WorkLicense_query")
const useFlowDetail = useFlowDetailStore()
const licenseOptions = ref<any[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "empName",
    label: "员工姓名",
    value: "",
    placeholder: "请输入员工姓名"
  },
  {
    type: EnumComponentType.Input,
    key: "empNo",
    label: "员工编号",
    value: "",
    placeholder: "请输入员工编号"
  },
  {
    type: EnumComponentType.Select,
    key: "applyType",
    label: "申请类型",
    value: "",
    placeholder: "请选择",
    options: [
      {
        label: "新增申请",
        value: 1
      },
      {
        label: "解冻申请",
        value: 2
      }
    ]
  },
  {
    type: EnumComponentType.Cascader,
    key: "licenseId",
    label: "岗位/上岗证",
    value: "",
    placeholder: "请选择",
    options: licenseOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  empName: string
  empNo: string
  licenseId?: string
  applyType?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const licenseApplyDialogRef = ref<InstanceType<typeof LicenseApplyDialog>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "submitterName",
      label: "申请发起人",
      minWidth: 160
    },
    {
      prop: "processInstanceId",
      label: "流程单编号",
      minWidth: 160
    },
    {
      prop: "applyType",
      label: "申请类型",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.applyType === 1 ? "新增申请" : "解冻申请"
      }
    },
    {
      prop: "applyStatus",
      label: "申请状态",
      width: 120,
      align: "center",
      slots: {
        default: "applyStatus-default"
      }
    },
    {
      prop: "applyEmpNos",
      label: "申请员工编号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.applyEmpNos?.join("，")
      }
    },
    {
      prop: "applyEmpNames",
      label: "申请员工姓名",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.applyEmpNames?.join("，")
      }
    },
    {
      prop: "applyEmpDepNames",
      label: "所属部门",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.applyEmpDepNames?.join("，")
      }
    },
    {
      prop: "licenseName",
      label: "上岗证",
      width: 160
    },
    {
      prop: "licenseJobName",
      label: "所属岗位",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

/** 申请状态枚举 */
const enumApplyStatus: Record<string, string> = {
  1: "申请中",
  2: "已通过",
  3: "未通过"
}

const applyConfigVisible = ref(false) // 申请配置弹窗标识

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[ILicenseApplySearchParams], ITableRow, true> = {
  api: queryLicenseApplyPageList,
  getParams: () => {
    const { licenseId, ...rest } = getFormData()
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        licenseId: licenseId?.[1] || undefined,
        ...rest
      }
    ]
  }
}

/** 获取上岗证级联选择器选项 */
const getLicenseCascadeOptions = async () => {
  const data = await queryLicenseCascade({})
  if (!data) {
    return
  }
  licenseOptions.value = transformLicenseCascade(data)
}

const onRequest = () => {
  customTableRef.value?.requestData()
}

const init = async () => {
  getLicenseCascadeOptions()
  onRequest()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.fContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

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
</style>
