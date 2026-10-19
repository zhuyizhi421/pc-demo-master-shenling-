<template>
  <div class="layout-container">
    <div v-show="curPageKey === EnumPageType.Main" class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO入库单">
          <div v-if="canAdd">
            <el-button type="primary" icon="Plus" @click="onCreateClick">新建入库单</el-button>
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

      <MroInboundOrderCreateOrUpdate
        v-if="
          curPageKey === EnumPageType.Inbound_create ||
          curPageKey === EnumPageType.Inbound_update
        "
        :data="selectedRow"
        @close="onChildClose"
        @success="onChildSuccess"
      />

      <MroInboundOrderDetail
        v-if="curPageKey === EnumPageType.Inbound_detail"
        :data="selectedRow"
        @close="onChildClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroInboundOrderPageList,
  requestDeleteMroInboundOrder,
  requestReviewMroInboundOrder
} from "@/api/operation/mro/mro-inbound-order"
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
import { useButtonSingleAuth } from "@/hooks/useButtonAuth"
import type {
  IMroInboundOrderPageListItem as ITableRow,
  IMroInboundOrderPageListParams,
  MroInboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-inbound-order"

import MroInboundOrderCreateOrUpdate from "./components/MroInboundOrderCreateOrUpdate.vue"
import MroInboundOrderDetail from "./components/MroInboundOrderDetail.vue"

defineOptions({
  name: "MROInboundOrder"
})

const sourceTypeMap: Record<MroInboundOrderSourceType, string> = {
  manual_create: "手工新增",
  register_auto: "登记自动生成"
}

const canAdd = useButtonSingleAuth("MROInboundOrder_add")
const canUpdate = useButtonSingleAuth("MROInboundOrder_update")
const canDelete = useButtonSingleAuth("MROInboundOrder_delete")
const canCheck = useButtonSingleAuth("MROInboundOrder_check")
const canDetail = useButtonSingleAuth("MROInboundOrder_detail")
const canQuery = useButtonSingleAuth("MROInboundOrder_query")
const canViewDetail = computed(() => canDetail.value || canUpdate.value || canQuery.value)

enum EnumPageType {
  Main,
  Inbound_create,
  Inbound_update,
  Inbound_detail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO入库单",
    key: EnumPageType.Main,
    children: [
      { name: "新建MRO入库单", key: EnumPageType.Inbound_create },
      { name: "编辑MRO入库单", key: EnumPageType.Inbound_update },
      { name: "MRO入库单详情", key: EnumPageType.Inbound_detail }
    ]
  }
])

const sourceTypeOptions = ref<{ label: string; value: MroInboundOrderSourceType }[]>([
  { label: "手工新增", value: "manual_create" },
  { label: "登记自动生成", value: "register_auto" }
])
const statusOptions = ref(
  Object.keys(EnumMRORegisterStatusMap).map((key) => ({
    label: EnumMRORegisterStatusMap[key as EnumMRORegisterStatus],
    value: key as EnumMRORegisterStatus
  }))
)

const searchFormData = ref<ISearchItem[]>([
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
    key: "warehouseName",
    label: "仓库名称",
    value: "",
    placeholder: "请输入仓库名称"
  },
  {
    type: EnumComponentType.Input,
    key: "sourceBizNo",
    label: "关联来源单号",
    value: "",
    placeholder: "请输入关联来源单号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroInboundNo",
    label: "入库单号",
    value: "",
    placeholder: "请输入入库单号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroInboundNo: string
  sourceBizNo: string
  sourceType?: MroInboundOrderSourceType
  status?: number
  warehouseName: string
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
  return EnumMRORegisterStatusMap[
    (status || EnumMRORegisterStatus.NOT_REVIEWED) as EnumMRORegisterStatus
  ]
}

const getSourceTypeText = (sourceType?: string) => {
  if (sourceType === "manual_create" || sourceType === "register_auto") {
    return sourceTypeMap[sourceType]
  }
  return "--"
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroInboundNo",
      label: "入库单号",
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
      label: "关联来源单号",
      width: 180,
      formatter: ({ sourceBizNo }: ITableRow) => sourceBizNo || "--"
    },
    {
      prop: "inboundContent",
      label: "入库内容",
      minWidth: 180,
      formatter: ({ inboundContent }: ITableRow) => inboundContent || "--"
    },
    {
      prop: "mroInboundEmpName",
      label: "入库人",
      width: 150,
      formatter: ({ mroInboundEmpName }: ITableRow) => mroInboundEmpName || "--"
    },
    {
      prop: "warehouseName",
      label: "仓库名称",
      width: 160,
      formatter: ({ warehouseName }: ITableRow) => warehouseName || "--"
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
      prop: "checkByName",
      label: "复核人",
      width: 140,
      formatter: ({ checkByName }: ITableRow) => checkByName || "--"
    },
    {
      prop: "completeTime",
      label: "入库完成时间",
      width: 180,
      align: "center",
      formatter: ({ completeTime }: ITableRow) => formatDisplayTime(completeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 220,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IMroInboundOrderPageListParams], ITableRow, true> = {
  api: queryMroInboundOrderPageList,
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
  curPageKey.value = EnumPageType.Inbound_create
}

const onEditClick = (row: ITableRow, isEdit: boolean) => {
  selectedRow.value = cloneDeep(row)
  curPageKey.value = isEdit ? EnumPageType.Inbound_update : EnumPageType.Inbound_detail
}

const onReviewClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("复核后将正式生成入库结果，是否继续？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestReviewMroInboundOrder({ id: row.id })
  ElMessage.success("复核成功")
  customTableRef.value?.requestData()
}

const onDeleteClick = async (id: string) => {
  await ElMessageBox.confirm("确认要删除该入库单吗？", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroInboundOrder(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
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
