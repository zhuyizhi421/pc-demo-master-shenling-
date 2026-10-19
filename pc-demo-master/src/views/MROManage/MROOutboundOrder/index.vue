<template>
  <div class="layout-container">
    <div v-show="curPageKey === EnumPageType.Main" class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO出库单">
          <div v-if="canAdd">
            <el-button type="primary" icon="Plus" @click="onCreateClick">新建出库单</el-button>
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
              v-if="
                canUpdate &&
                row.sourceType === 'manual_create' &&
                row.status === EnumMRORegisterStatus.NOT_REVIEWED
              "
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
              v-if="
                canCheck &&
                row.sourceType === 'manual_create' &&
                row.status === EnumMRORegisterStatus.NOT_REVIEWED
              "
              link
              type="primary"
              size="small"
              @click="onReviewClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="
                canDelete &&
                row.sourceType === 'manual_create' &&
                row.status === EnumMRORegisterStatus.NOT_REVIEWED
              "
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="row.status === EnumMRORegisterStatus.REVIEWED"
              link
              type="primary"
              size="small"
              @click="onPrintClick(row)"
            >
              打印出库单
            </el-button>
            <el-button
              v-if="row.sourceBizNo"
              link
              type="primary"
              size="small"
              @click="onViewLinkedBiz(row)"
            >
              查看关联业务单
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

      <MroOutboundOrderCreateOrUpdate
        v-if="
          curPageKey === EnumPageType.Outbound_create || curPageKey === EnumPageType.Outbound_update
        "
        :data="selectedRow"
        @close="onChildClose"
        @success="onChildSuccess"
      />

      <MroOutboundOrderDetail
        v-if="curPageKey === EnumPageType.Outbound_detail"
        :data="selectedRow"
        @close="onChildClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroOutboundOrderPageList,
  requestDeleteMroOutboundOrder,
  requestReviewMroOutboundOrder
} from "@/api/operation/mro/mro-outbound-order"
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
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import { useButtonSingleAuth } from "@/hooks/useButtonAuth"
import type {
  IMroOutboundOrderPageListItem as ITableRow,
  IMroOutboundOrderPageListParams,
  MroOutboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-outbound-order"

import MroOutboundOrderCreateOrUpdate from "./components/MroOutboundOrderCreateOrUpdate.vue"
import MroOutboundOrderDetail from "./components/MroOutboundOrderDetail.vue"

defineOptions({
  name: "MROOutboundOrder"
})

const sourceTypeMap: Record<MroOutboundOrderSourceType, string> = {
  manual_create: "手工新增",
  pickup_auto: "MRO领用单"
}
const outboundOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const canAdd = useButtonSingleAuth("MROOutboundOrder_add")
const canUpdate = useButtonSingleAuth("MROOutboundOrder_update")
const canDelete = useButtonSingleAuth("MROOutboundOrder_delete")
const canCheck = useButtonSingleAuth("MROOutboundOrder_check")
const canDetail = useButtonSingleAuth("MROOutboundOrder_detail")
const canQuery = useButtonSingleAuth("MROOutboundOrder_query")
const canViewDetail = computed(() => canDetail.value || canUpdate.value || canQuery.value)

enum EnumPageType {
  Main,
  Outbound_create,
  Outbound_update,
  Outbound_detail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO出库单",
    key: EnumPageType.Main,
    children: [
      { name: "新建MRO出库单", key: EnumPageType.Outbound_create },
      { name: "编辑MRO出库单", key: EnumPageType.Outbound_update },
      { name: "MRO出库单详情", key: EnumPageType.Outbound_detail }
    ]
  }
])

const sourceTypeOptions = ref<{ label: string; value: MroOutboundOrderSourceType }[]>([
  { label: "手工新增", value: "manual_create" },
  { label: "MRO领用单", value: "pickup_auto" }
])
const statusOptions = ref(
  Object.keys(outboundOrderStatusMap).map((key) => ({
    label: outboundOrderStatusMap[key as EnumMRORegisterStatus],
    value: key as EnumMRORegisterStatus
  }))
)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroOutboundNo",
    label: "出库单号",
    value: "",
    placeholder: "请输入出库单号"
  },
  {
    type: EnumComponentType.Select,
    key: "sourceType",
    label: "来源类型",
    value: "",
    placeholder: "请选择来源类型",
    options: sourceTypeOptions
  },
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
    key: "sourceBizNo",
    label: "关联业务单号",
    value: "",
    placeholder: "请输入关联业务单号"
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
    key: "mroModelName",
    label: "MRO名称",
    value: "",
    placeholder: "请输入MRO名称"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "出库时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["outboundTimeStart", "outboundTimeEnd"]
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseNo",
    label: "仓库编号",
    value: "",
    placeholder: "请输入仓库编号"
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseName",
    label: "仓库名称",
    value: "",
    placeholder: "请输入仓库名称"
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseOperatorName",
    label: "仓管操作人",
    value: "",
    placeholder: "请输入仓管操作人"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroOutboundNo: string
  sourceBizNo: string
  sourceType?: MroOutboundOrderSourceType
  status?: number
  mroModelNo: string
  mroNo: string
  mroModelName: string
  outboundTimeStart?: string
  outboundTimeEnd?: string
  warehouseNo: string
  warehouseName: string
  warehouseOperatorName: string
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
  return outboundOrderStatusMap[
    (status || EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  ]
}

const getSourceTypeText = (sourceType?: string) => {
  if (sourceType === "manual_create" || sourceType === "pickup_auto") {
    return sourceTypeMap[sourceType]
  }
  return "--"
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroOutboundNo",
      label: "出库单号",
      width: 170
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
      width: 140,
      align: "center",
      slots: { default: "sourceType-default" }
    },
    {
      prop: "sourceBizNo",
      label: "关联业务单号",
      width: 180,
      formatter: ({ sourceBizNo }: ITableRow) => sourceBizNo || "--"
    },
    {
      prop: "warehouseNo",
      label: "仓库编号",
      width: 150,
      formatter: ({ warehouseNo }: ITableRow) => warehouseNo || "--"
    },
    {
      prop: "warehouseOperatorName",
      label: "仓管操作人",
      width: 150,
      formatter: ({ warehouseOperatorName }: ITableRow) => warehouseOperatorName || "--"
    },
    {
      prop: "warehouseName",
      label: "仓库名称",
      width: 160,
      formatter: ({ warehouseName }: ITableRow) => warehouseName || "--"
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      width: 180,
      align: "center",
      formatter: ({ outboundTime }: ITableRow) => formatDisplayTime(outboundTime)
    },
    {
      prop: "createByName",
      label: "创建人",
      width: 140,
      formatter: ({ createByName }: ITableRow) => createByName || "--"
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

const queryConfig: ITableRequestConfig<[IMroOutboundOrderPageListParams], ITableRow, true> = {
  api: queryMroOutboundOrderPageList,
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
  curPageKey.value = EnumPageType.Outbound_create
}

const onEditClick = (row: ITableRow, isEdit: boolean) => {
  selectedRow.value = cloneDeep(row)
  curPageKey.value = isEdit ? EnumPageType.Outbound_update : EnumPageType.Outbound_detail
}

const onReviewClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("复核后将正式生成出库结果，是否继续？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestReviewMroOutboundOrder({ id: row.id })
  ElMessage.success("复核成功")
  customTableRef.value?.requestData()
}

const onDeleteClick = async (id: string) => {
  await ElMessageBox.confirm("确认要删除该出库单吗？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroOutboundOrder(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onPrintClick = (row: ITableRow) => {
  ElMessage.info(`已触发打印：${row.mroOutboundNo}`)
}

const onViewLinkedBiz = (row: ITableRow) => {
  ElMessage.info(`关联业务单号：${row.sourceBizNo}`)
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
