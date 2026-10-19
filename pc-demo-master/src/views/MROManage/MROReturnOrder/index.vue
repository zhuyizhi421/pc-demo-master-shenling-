<template>
  <div class="layout-container">
    <div v-show="curPageKey === EnumPageType.Main" class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO还回单">
          <div>
            <el-button type="primary" icon="Plus" @click="onCreateClick">新建还回单</el-button>
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
              v-if="row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onEditClick(row, true)"
            >
              编辑
            </el-button>
            <el-button v-else link type="primary" size="small" @click="onEditClick(row, false)">
              详情
            </el-button>
            <el-button
              v-if="row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="primary"
              size="small"
              @click="onReviewClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="row.status === EnumMRORegisterStatus.NOT_REVIEWED"
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="row.status === EnumMRORegisterStatus.REVIEWED && row.linkedMroInboundNo"
              link
              type="primary"
              size="small"
              @click="onViewLinkedInbound(row)"
            >
              查看关联入库单
            </el-button>
            <el-button
              v-if="row.status === EnumMRORegisterStatus.REVIEWED"
              link
              type="primary"
              size="small"
              @click="onPrintClick(row)"
            >
              打印还回单
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

      <MroReturnOrderCreateOrUpdate
        v-if="curPageKey === EnumPageType.ReturnCreate || curPageKey === EnumPageType.ReturnUpdate"
        :data="selectedRow"
        @close="onChildClose"
        @success="onChildSuccess"
      />

      <MroReturnOrderDetail
        v-if="curPageKey === EnumPageType.ReturnDetail"
        :data="selectedRow"
        @close="onChildClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroReturnOrderPageList,
  requestDeleteMroReturnOrder,
  requestReviewMroReturnOrder
} from "@/api/operation/mro/mro-return-order.ts"
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
import type {
  IMroReturnOrderPageListItem as ITableRow,
  IMroReturnOrderPageListParams,
  MroReturnOrderSourceType
} from "@/types/maintain/mro-manage/mro-return-order"

import MroReturnOrderCreateOrUpdate from "./components/MroReturnOrderCreateOrUpdate.vue"
import MroReturnOrderDetail from "./components/MroReturnOrderDetail.vue"

defineOptions({
  name: "MROReturnOrder"
})

const sourceTypeMap: Record<MroReturnOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const returnOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

enum EnumPageType {
  Main,
  ReturnCreate,
  ReturnUpdate,
  ReturnDetail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO还回单",
    key: EnumPageType.Main,
    children: [
      { name: "新建MRO还回单", key: EnumPageType.ReturnCreate },
      { name: "编辑MRO还回单", key: EnumPageType.ReturnUpdate },
      { name: "MRO还回单详情", key: EnumPageType.ReturnDetail }
    ]
  }
])

const statusOptions = ref(
  Object.keys(returnOrderStatusMap).map((key) => ({
    label: returnOrderStatusMap[key as EnumMRORegisterStatus],
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
    key: "mroReturnNo",
    label: "还回单号",
    value: "",
    placeholder: "请输入还回单号"
  },
  {
    type: EnumComponentType.Input,
    key: "linkedMroInboundNo",
    label: "关联入库单号",
    value: "",
    placeholder: "请输入关联入库单号"
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
    key: "returnEmpNo",
    label: "还回人工号",
    value: "",
    placeholder: "请输入还回人工号"
  },
  {
    type: EnumComponentType.Input,
    key: "returnArea",
    label: "还回区域",
    value: "",
    placeholder: "请输入还回区域"
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
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  linkedMroInboundNo: string
  mroModelNo: string
  mroNo: string
  mroReturnNo: string
  returnArea: string
  returnEmpNo: string
  status?: number
  warehouseName: string
  warehouseNo: string
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
  return returnOrderStatusMap[
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
      prop: "mroReturnNo",
      label: "还回单号",
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
      prop: "linkedMroInboundNo",
      label: "关联MRO入库单号",
      width: 180,
      formatter: ({ linkedMroInboundNo }: ITableRow) => linkedMroInboundNo || "--"
    },
    {
      prop: "returnEmpName",
      label: "还回人姓名",
      width: 140,
      formatter: ({ returnEmpName }: ITableRow) => returnEmpName || "--"
    },
    {
      prop: "returnEmpNo",
      label: "还回人工号",
      width: 140,
      formatter: ({ returnEmpNo }: ITableRow) => returnEmpNo || "--"
    },
    {
      prop: "returnArea",
      label: "还回区域",
      width: 130,
      formatter: ({ returnArea }: ITableRow) => returnArea || "--"
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
      prop: "returnTime",
      label: "还回时间",
      width: 180,
      align: "center",
      formatter: ({ returnTime }: ITableRow) => formatDisplayTime(returnTime)
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
      width: 350,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IMroReturnOrderPageListParams], ITableRow, true> = {
  api: queryMroReturnOrderPageList,
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
  curPageKey.value = EnumPageType.ReturnCreate
}

const onEditClick = (row: ITableRow, isEdit: boolean) => {
  selectedRow.value = cloneDeep(row)
  curPageKey.value = isEdit ? EnumPageType.ReturnUpdate : EnumPageType.ReturnDetail
}

const onReviewClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("复核后将自动生成对应 MRO 入库结果，是否继续？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  const result = await requestReviewMroReturnOrder({ id: row.id })
  ElMessage.success(
    result?.linkedMroInboundNo ? `复核成功，已生成入库单：${result.linkedMroInboundNo}` : "复核成功"
  )
  customTableRef.value?.requestData()
}

const onDeleteClick = async (id: string) => {
  await ElMessageBox.confirm("确认要删除该还回单吗？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroReturnOrder(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onViewLinkedInbound = (row: ITableRow) => {
  if (!row.linkedMroInboundNo) return
  ElMessage.info(`关联 MRO 入库单号：${row.linkedMroInboundNo}`)
}

const onPrintClick = (row: ITableRow) => {
  ElMessage.info(`已触发打印：${row.mroReturnNo}`)
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
