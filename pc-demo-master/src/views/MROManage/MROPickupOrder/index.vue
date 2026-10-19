<template>
  <div class="layout-container">
    <div v-show="curPageKey === EnumPageType.Main" class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO领用单">
          <div v-if="canAdd">
            <el-button type="primary" icon="Plus" @click="onCreateClick">新建领用单</el-button>
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
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>

          <template #sourceType-default="{ row }">
            {{ getSourceTypeText(row.sourceType) }}
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="canUpdate && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onEditClick(row, true)"
            >
              编辑
            </el-button>
            <el-button
              v-else-if="canViewDetail"
              link
              type="primary"
              size="small"
              @click="onEditClick(row, false)"
            >
              详情
            </el-button>
            <el-button
              v-if="canCheck && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onReviewClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="canDelete && row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row.id)"
            >
              删除
            </el-button>
            <!-- <el-button
              v-if="row.status === EnumMRORegisterStatus.REVIEWED && row.linkedMroOutboundNo"
              link
              type="primary"
              size="small"
              @click="onViewLinkedOutbound(row)"
            >
              查看关联出库单
            </el-button> -->
            <el-button
              v-if="row.status === EnumMRORegisterStatus.REVIEWED"
              link
              type="primary"
              size="small"
              @click="onPrintClick(row)"
            >
              打印领用单
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

    <div v-if="curPageKey !== EnumPageType.Main" class="layout-child-page">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <MroPickupOrderCreateOrUpdate
        v-if="curPageKey === EnumPageType.PickupCreate || curPageKey === EnumPageType.PickupUpdate"
        :data="selectedRow"
        @close="onChildClose"
        @success="onChildSuccess"
      />

      <MroPickupOrderDetail
        v-if="curPageKey === EnumPageType.PickupDetail"
        :data="selectedRow"
        @close="onChildClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroPickupOrderPageList,
  requestDeleteMroPickupOrder,
  requestReviewMroPickupOrder
} from "@/api/operation/mro/mro-pickup-order"
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
import { EnumMRORegisterStatus } from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import { useButtonSingleAuth } from "@/hooks/useButtonAuth"
import type {
  IMroPickupOrderPageListItem as ITableRow,
  IMroPickupOrderPageListParams,
  MroPickupOrderSourceType
} from "@/types/maintain/mro-manage/mro-pickup-order"

import MroPickupOrderCreateOrUpdate from "./components/MroPickupOrderCreateOrUpdate.vue"
import MroPickupOrderDetail from "./components/MroPickupOrderDetail.vue"

defineOptions({
  name: "MROPickupOrder"
})

const sourceTypeMap: Record<MroPickupOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const pickupOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const canAdd = useButtonSingleAuth("MROPickupOrder_add")
const canUpdate = useButtonSingleAuth("MROPickupOrder_update")
const canDelete = useButtonSingleAuth("MROPickupOrder_delete")
const canCheck = useButtonSingleAuth("MROPickupOrder_check")
const canDetail = useButtonSingleAuth("MROPickupOrder_detail")
const canQuery = useButtonSingleAuth("MROPickupOrder_query")
const canViewDetail = computed(() => canDetail.value || canUpdate.value || canQuery.value)

enum EnumPageType {
  Main,
  PickupCreate,
  PickupUpdate,
  PickupDetail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO领用单",
    key: EnumPageType.Main,
    children: [
      { name: "新建MRO领用单", key: EnumPageType.PickupCreate },
      { name: "编辑MRO领用单", key: EnumPageType.PickupUpdate },
      { name: "MRO领用单详情", key: EnumPageType.PickupDetail }
    ]
  }
])

const statusOptions = ref(
  Object.keys(pickupOrderStatusMap).map((key) => ({
    label: pickupOrderStatusMap[key as EnumMRORegisterStatus],
    value: key as EnumMRORegisterStatus
  }))
)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: statusOptions
  },
  {
    type: EnumComponentType.Input,
    key: "mroPickupNo",
    label: "领用单号",
    value: "",
    placeholder: "请输入领用单号"
  },
  {
    type: EnumComponentType.Input,
    key: "linkedMroOutboundNo",
    label: "关联出库单号",
    value: "",
    placeholder: "请输入关联出库单号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelNo",
    label: "MRO编号",
    value: "",
    placeholder: "请输入MRO编号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroNo",
    label: "MRO序列号",
    value: "",
    placeholder: "请输入MRO序列号"
  },
  {
    type: EnumComponentType.Input,
    key: "pickupEmpNo",
    label: "领用人工号",
    value: "",
    placeholder: "请输入领用人工号"
  },
  {
    type: EnumComponentType.Input,
    key: "pickupArea",
    label: "领用区域",
    value: "",
    placeholder: "请输入领用区域"
  },
  {
    type: EnumComponentType.Input,
    key: "pickupProdUnit",
    label: "领用生产单元",
    value: "",
    placeholder: "请输入领用生产单元"
  },
  {
    type: EnumComponentType.Input,
    key: "pickupStation",
    label: "领用工位",
    value: "",
    placeholder: "请输入领用工位"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  linkedMroOutboundNo: string
  mroModelNo: string
  mroNo: string
  mroPickupNo: string
  pickupArea: string
  pickupEmpNo: string
  pickupProdUnit: string
  pickupStation: string
  status?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const selectedRow = ref<ITableRow>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const getStatusText = (status?: string) => {
  return pickupOrderStatusMap[
    (status || EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  ]
}

const getSourceTypeText = (sourceType?: string) => {
  if (sourceType === "manual_create" || sourceType === "terminal_direct") {
    return sourceTypeMap[sourceType]
  }
  return "--"
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroPickupNo",
      label: "领用单号",
      width: 180
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: { default: "status-default" }
    },
    {
      prop: "sourceType",
      label: "来源类型",
      width: 130,
      align: "center",
      slots: { default: "sourceType-default" }
    },
    {
      prop: "linkedMroOutboundNo",
      label: "关联MRO出库单号",
      width: 180,
      formatter: ({ linkedMroOutboundNo }: ITableRow) => linkedMroOutboundNo || "--"
    },
    {
      prop: "pickupEmpName",
      label: "领用人姓名",
      width: 140,
      formatter: ({ pickupEmpName }: ITableRow) => pickupEmpName || "--"
    },
    {
      prop: "pickupEmpNo",
      label: "领用人工号",
      width: 140,
      formatter: ({ pickupEmpNo }: ITableRow) => pickupEmpNo || "--"
    },
    {
      prop: "pickupArea",
      label: "领用区域",
      width: 130,
      formatter: ({ pickupArea }: ITableRow) => pickupArea || "--"
    },
    {
      prop: "pickupProdUnit",
      label: "领用生产单元",
      width: 150,
      formatter: ({ pickupProdUnit }: ITableRow) => pickupProdUnit || "--"
    },
    {
      prop: "pickupStation",
      label: "领用工位",
      width: 130,
      formatter: ({ pickupStation }: ITableRow) => pickupStation || "--"
    },
    {
      prop: "warehouseNo",
      label: "仓库编号",
      width: 140,
      formatter: ({ warehouseNo }: ITableRow) => warehouseNo || "--"
    },
    {
      prop: "warehouseName",
      label: "仓库名称",
      width: 160,
      formatter: ({ warehouseName }: ITableRow) => warehouseName || "--"
    },
    {
      prop: "warehouseOperatorName",
      label: "仓管操作人",
      width: 140,
      formatter: ({ warehouseOperatorName }: ITableRow) => warehouseOperatorName || "--"
    },
    {
      prop: "pickupTime",
      label: "领用时间",
      width: 180,
      align: "center",
      formatter: ({ pickupTime }: ITableRow) => formatDisplayTime(pickupTime)
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
      prop: "operation",
      label: "操作",
      width: 320,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IMroPickupOrderPageListParams], ITableRow, true> = {
  api: queryMroPickupOrderPageList,
  getParams: (sortData: IColumnSortInfo[]) => [
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

const onCreateClick = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.PickupCreate
}

const onEditClick = (row: ITableRow, isEdit: boolean) => {
  selectedRow.value = cloneDeep(row)
  curPageKey.value = isEdit ? EnumPageType.PickupUpdate : EnumPageType.PickupDetail
}

const onReviewClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("复核后将自动生成对应 MRO 出库结果，是否继续？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  const result = await requestReviewMroPickupOrder({ id: row.id })
  ElMessage.success(
    result?.linkedMroOutboundNo
      ? `复核成功，已生成出库单：${result.linkedMroOutboundNo}`
      : "复核成功"
  )
  customTableRef.value?.requestData()
}

const onDeleteClick = async (id: string) => {
  await ElMessageBox.confirm("确认要删除该领用单吗？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroPickupOrder(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onViewLinkedOutbound = (row: ITableRow) => {
  if (!row.linkedMroOutboundNo) return
  ElMessage.info(`关联 MRO 出库单号：${row.linkedMroOutboundNo}`)
}

const onPrintClick = (row: ITableRow) => {
  ElMessage.info(`已触发打印：${row.mroPickupNo}`)
}

const onChildClose = () => {
  curPageKey.value = EnumPageType.Main
}

const onChildSuccess = () => {
  curPageKey.value = EnumPageType.Main
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss"></style>
