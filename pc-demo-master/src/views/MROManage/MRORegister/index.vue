<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO登记记录表">
          <div v-if="isAuth">
            <el-button type="primary" @click="onMroRegisterCreateClick" icon="Plus">
              新建登记
            </el-button>
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
            <el-tag
              :type="row.status === EnumMRORegisterStatus.NOT_REVIEWED ? 'danger' : 'success'"
            >
              {{ EnumMRORegisterStatusMap[row.status as EnumMRORegisterStatus] }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="isAuth && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onMroRegisterEditClick(row, true)"
            >
              编辑查看
            </el-button>
            <el-button
              v-if="!isAuth || row.status === EnumMRORegisterStatus.REVIEWED"
              link
              type="primary"
              size="small"
              @click="onMroRegisterEditClick(row, false)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onCheckClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="danger"
              size="small"
              @click="onDeleteRowClick(row.id)"
            >
              删除
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
    </div>

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs :model-value="curPageKey" :data="pageTree" @update:modelValue="setPageKey" />

      <MroRegisterCreateOrUpdate
        v-if="
          curPageKey === EnumPageType.Register_create || curPageKey === EnumPageType.Register_update
        "
        :data="selectedRow"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />

      <MroRegisterDetail
        v-if="curPageKey === EnumPageType.Register_detail"
        :data="selectedRow"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
    <MroRegisterReviewDialog
      v-model="reviewDialogVisible"
      :record="reviewingRow"
      @confirm="onReviewDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroRegisterPageList,
  requestDeleteMroRegister,
  requestReviewMroRegister
} from "@/api/operation/mro/mro-register"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMRORegisterStatus, EnumMRORegisterStatusMap } from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IMroRegisterLabelBinding,
  IMroRegisterPageListItem as ITableRow,
  IMroRegisterPageListParams
} from "@/types/maintain/mro-manage/mro-register"

import MroRegisterCreateOrUpdate from "./components/MroRegisterCreateOrUpdate.vue"
import MroRegisterDetail from "./components/MroRegisterDetail.vue"
import MroRegisterReviewDialog from "./components/MroRegisterReviewDialog.vue"

defineOptions({
  name: "MRORegister"
})

const isAuth = useButtonAuth("MRORegister_update", "MRORegister_query")
const { printBarcode } = useBarcodePrint()

enum EnumPageType {
  Main,
  Register_create,
  Register_update,
  Register_detail
}

const curPageKey = ref<EnumPageType>(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO登记",
    key: EnumPageType.Main,
    children: [
      {
        name: "MRO登记新建",
        key: EnumPageType.Register_create
      },
      {
        name: "MRO登记编辑",
        key: EnumPageType.Register_update
      },
      {
        name: "MRO登记详情",
        key: EnumPageType.Register_detail
      }
    ]
  }
])

const mroRegisterStatusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: mroRegisterStatusOptions
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseName",
    label: "仓库名称",
    value: "",
    placeholder: "请输入仓库名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  status?: number
  warehouseName: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const selectedRow = ref<ITableRow>()
const reviewingRow = ref<ITableRow>()
const reviewDialogVisible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const formatDisplayTime = (value?: string) => {
  if (!value) {
    return "--"
  }
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroRegisterNo",
      label: "登记单号",
      width: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "registerContent",
      label: "登记内容",
      width: 180
    },
    {
      prop: "mroRegisterEmpName",
      label: "登记人",
      width: 160
    },
    {
      prop: "warehouseName",
      label: "仓库名称",
      width: 160
    },
    {
      prop: "warehouseNo",
      label: "仓库编号",
      width: 160
    },
    {
      prop: "warehouseInEntryNo",
      label: "关联 MRO 入库单",
      width: 180
    },
    {
      prop: "createByName",
      label: "创建人",
      width: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 180,
      align: "center",
      sortable: true,
      sortOrder: "desc",
      formatter: ({ createTime }: ITableRow) => formatDisplayTime(createTime)
    },
    {
      prop: "checkByName",
      label: "复核人",
      width: 160
    },
    {
      prop: "completeTime",
      label: "登记完成时间",
      width: 180,
      align: "center",
      formatter: ({ completeTime }: ITableRow) => formatDisplayTime(completeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IMroRegisterPageListParams], ITableRow, true> = {
  api: queryMroRegisterPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        },
        sort: sortData.map((item) => ({
          field: item.sortField,
          order: item.order!
        }))
      }
    ]
  }
}

onMounted(() => {
  buildOptions()
  customTableRef.value?.requestData()
})

onActivated(() => {
  curPageKey.value = EnumPageType.Main
  customTableRef.value?.requestData()
})

const setPageKey = (value: string | number) => {
  curPageKey.value = Number(value) as EnumPageType
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const buildOptions = () => {
  mroRegisterStatusOptions.value = Object.keys(EnumMRORegisterStatusMap).map((key) => ({
    label: EnumMRORegisterStatusMap[key as unknown as EnumMRORegisterStatus],
    value: +key
  }))
}

const onMroRegisterCreateClick = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.Register_create
}

const onMroRegisterEditClick = (row: ITableRow, isEdit: boolean) => {
  selectedRow.value = cloneDeep(row)
  curPageKey.value = isEdit ? EnumPageType.Register_update : EnumPageType.Register_detail
}

const normalizeBarcodeHandleType = (row: ITableRow["registerItemVos"][number]) => {
  if (row.barcodeHandleType) {
    return row.barcodeHandleType
  }
  if (!row.identityManage) {
    return ""
  }
  return row.autoGenerateCode ? "system_generate" : "customer_existing"
}

const onCheckClick = async (row: ITableRow) => {
  const hasManualBinding = row.registerItemVos?.some((item) => {
    return item.identityManage && normalizeBarcodeHandleType(item) === "customer_existing"
  })

  reviewingRow.value = row

  if (hasManualBinding) {
    reviewDialogVisible.value = true
    return
  }

  await performReview(row, [])
}

const onReviewDialogConfirm = async (bindings: IMroRegisterLabelBinding[]) => {
  if (!reviewingRow.value) {
    return
  }
  reviewDialogVisible.value = false
  await performReview(reviewingRow.value, bindings)
}

const performReview = async (row: ITableRow, labelBindings: IMroRegisterLabelBinding[]) => {
  await ElMessageBox.confirm(
    "复核完成后，系统会自动生成对应的 MRO 入库单与 MRO 台账。是否继续？",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  )

  const result = await requestReviewMroRegister({
    id: row.id,
    labelBindings
  })

  ElMessage.success(
    result?.warehouseInEntryNo
      ? `复核成功，已生成入库单 ${result.warehouseInEntryNo}`
      : "复核成功"
  )

  if (result?.barcodeList?.length) {
    try {
      await ElMessageBox.confirm(
        `本次自动生成了 ${result.barcodeList.length} 个标签码，是否立即打印？`,
        {
          confirmButtonText: "打印",
          cancelButtonText: "稍后",
          type: "info"
        }
      )
      await printBarcode(result.barcodeList)
    } catch (_error) {
      // User skipped printing.
    }
  }

  reviewingRow.value = undefined
  customTableRef.value?.requestData()
}

const onDeleteRowClick = async (id: string) => {
  await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroRegister(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss"></style>
