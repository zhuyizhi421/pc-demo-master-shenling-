<template>
  <div class="layout-container">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="custom-table-container">
      <CustomTitle title="员工列表">
        <div v-if="isAuth">
          <el-button type="primary" icon="Plus" @click="detailDialogRef?.setVisible(true)">
            新建员工
          </el-button>
          <el-button type="primary" @click="onBatchOpen()">批量开通系统账户</el-button>
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
        <template #status-default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ formatJobStatus(row.status) }}
          </el-tag>
        </template>

        <template #bindUserId-default="{ row }">
          <el-tag :type="row.bindUserId ? 'success' : 'danger'">
            {{ row.bindUserId ? "已开通" : "未开通" }}
          </el-tag>
        </template>

        <template #operation-default="{ row }">
          <el-button
            v-if="isAuth"
            link
            type="danger"
            size="small"
            @click.stop="onDeleteClick(row.id)"
          >
            删除
          </el-button>
          <el-button link type="primary" size="small" @click="detailDialogRef?.setVisible(true, row)">
            详情
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="printBarcode([row.barcode])"
            :disabled="!row.barcode"
          >
            打印标签码
          </el-button>
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

    <StaffDetailDialog ref="detailDialogRef" @on-ok="init()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryDepartmentList } from "@/api/department"
import { queryBatchOpen, queryEmployeePageList, requestDeleteEmployee } from "@/api/employee"
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
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IEmployeeListItem as ITableRow,
  IEmployeePageListParams,
  IJobListItem,
  ILicenseListItem,
  IPositionListItem
} from "@/types/base-info/employee"

import StaffDetailDialog from "./components/StaffDetailHandle.vue"

defineOptions({
  name: "StaffInfo"
})

const { printBarcode } = useBarcodePrint()
const isAuth = useButtonAuth("StaffInfo_update", "StaffInfo_query")

const departmentSelectOptions = ref<{ label: string; value: string }[]>([])
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
    label: "员工编号",
    value: "",
    placeholder: "请输入员工编号"
  },
  {
    type: EnumComponentType.Select,
    key: "depId",
    label: "所属部门",
    value: "",
    placeholder: "请选择所属部门",
    filterable: true,
    options: departmentSelectOptions
  },
  {
    type: EnumComponentType.Select,
    key: "isAccountOpen",
    label: "账号开通",
    value: "",
    placeholder: "请选择",
    options: [
      {
        label: "已开通",
        value: true
      },
      {
        label: "未开通",
        value: false
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  empNo: string
  depId: string
  isAccountOpen: boolean
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const detailDialogRef = ref<InstanceType<typeof StaffDetailDialog>>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "",
      label: "",
      width: 50,
      type: "selection",
      multiple: true,
      align: "center",
      fixed: "left",
      selectable: (row: ITableRow) => {
        return !row.bindUserId
      }
    },
    {
      prop: "empNo",
      label: "员工编号",
      width: 160
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160
    },
    {
      prop: "name",
      label: "员工姓名",
      width: 160
    },
    {
      prop: "status",
      label: "在职状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "depName",
      label: "所属部门",
      width: 160
    },
    {
      prop: "positionList",
      label: "职位",
      width: 160,
      formatter: (row: ITableRow) => {
        return formatPosition(row.positionList)
      }
    },
    {
      prop: "jobList",
      label: "岗位",
      width: 160,
      formatter: (row: ITableRow) => {
        return formatJob(row.jobList)
      }
    },
    {
      prop: "licenseList",
      label: "上岗证",
      width: 160,
      formatter: (row: ITableRow) => {
        return formatLicense(row.licenseList)
      }
    },
    {
      prop: "bindUserId",
      label: "用户账号",
      width: 120,
      align: "center",
      slots: {
        default: "bindUserId-default"
      }
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

const statusType: Record<number, string> = {
  0: "离职",
  1: "在职"
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
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

const formatJobStatus = (status: number) => {
  return statusType[status]
}

const formatLicense = (licenseList: ILicenseListItem[]) => {
  return licenseList?.filter(Boolean)?.map((item) => item.licenseName)?.join("、")
}

const formatPosition = (positionList: IPositionListItem[]) => {
  return positionList?.length
    ? positionList.filter(Boolean).map((position) => position.name || "普通员工").join("、")
    : "普通员工"
}

const formatJob = (jobList: IJobListItem[]) => {
  return jobList?.filter(Boolean)?.map((job) => job.jobName)?.join("、")
}

const getDepartmentOptions = async () => {
  const departments = await queryDepartmentList({})
  departmentSelectOptions.value = departments.map((item) => ({
    label: item.depName,
    value: item.id
  }))
}

const onBatchOpen = async () => {
  const multipleSelection = (customTableRef.value?.getCurrentMultipleRows() || []) as ITableRow[]
  if (!multipleSelection.length) {
    ElMessage.warning("请勾选需要批量开通的员工")
    return
  }

  const ids = multipleSelection.map((item) => item.id)
  await queryBatchOpen({ empIds: ids })
  await customTableRef.value?.requestData()
  ElMessage.success("批量开通系统账户成功")
  customTableRef.value?.clearSelectedRow()
}

const onDeleteClick = async (id: string) => {
  const confirm = await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  if (!confirm) {
    return
  }

  await requestDeleteEmployee(id)
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

const init = async () => {
  await getDepartmentOptions()
  await customTableRef.value?.requestData()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.layout-container {
  overflow: hidden;
}
</style>
