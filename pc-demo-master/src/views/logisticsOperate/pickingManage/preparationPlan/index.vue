<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="领料计划单号列表">
          <el-button v-if="isAuth" type="primary" icon="Plus" @click="onCreateClick()">
            新建领料计划
          </el-button>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 状态 -->
          <template #status-default="{ row }">
            <el-tag
              :type="
                EnumPreparationMaterialPlanStatusTagMap[
                  row.status as EnumPreparationMaterialPlanStatus
                ]
              "
              >{{
                EnumPreparationMaterialPlanStatusMap[
                  row.status as EnumPreparationMaterialPlanStatus
                ] ?? ""
              }}</el-tag
            >
          </template>

          <!-- 备货内容 -->
          <template #planContent-default="{ row }">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <CustomTable :table-data="row.planContent" :config="contentTableConfig" />
              <template #reference>
                {{ planContentReference(row) }}
              </template>
            </el-popover>
          </template>

          <!-- 操作列 -->
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看
            </el-button>
            <el-button
              v-if="
                isAuth &&
                row.status === EnumPreparationMaterialPlanStatus.UN_RECHECK &&
                [EnumGetMaterialPurpose.PRODUCTION, EnumGetMaterialPurpose.OUTSOURCING].includes(
                  row.useFor
                )
              "
              link
              type="primary"
              size="small"
              @click="onCreateClick(row)"
              >编辑
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumPreparationMaterialPlanStatus.UN_RECHECK"
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row)"
              >删除
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumPreparationMaterialPlanStatus.UN_RECHECK"
              link
              type="primary"
              size="small"
              @click="onAuditClick(row)"
              >复核
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumPreparationMaterialPlanStatus.RECHECK"
              link
              type="primary"
              size="small"
              @click="onUnAuditClick(row)"
              >解复核
            </el-button>
            <el-button
              v-if="isAuth && row.status === EnumPreparationMaterialPlanStatus.RECHECK"
              link
              type="primary"
              size="small"
              @click="onSettleClick(row)"
              >结案
            </el-button>
          </template>
        </CustomTable>
      </div>
      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="tableRef?.requestData()"
      />
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 新增、编辑领料计划 -->
      <PreparationMaterialPlanCreate
        v-if="
          [EnumPageType.Preparation_plan_create, EnumPageType.Preparation_plan_update].includes(
            curPageKey
          )
        "
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      ></PreparationMaterialPlanCreate>

      <!-- 查看详情 -->
      <PreparationMaterialPlanDetail
        v-if="curPageKey === EnumPageType.Preparation_plan_detail"
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>

    <!-- 审核判断要指定仓库 -->
    <CustomDialog
      title="仓库指定"
      size="medium"
      v-model="showAuditDialog"
      @close="auditProductList = []"
    >
      <CustomTable v-model:table-data="auditProductList" :config="auditTableConfig">
        <template #defaultStorageId-default="{ row }">
          <SelectFacility v-model="row.defaultStorageId" :isEnable="true" />
        </template>
      </CustomTable>
      <template #footer>
        <el-button @click="showAuditDialog = false">取 消</el-button>
        <el-button type="primary" @click="onAuditStorageDesignClick()">确 定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryPreparationMaterialPageList,
  queryPreparationMaterialStorageList,
  requestAuditPreparationMaterialPlan,
  requestCheckPreparationMaterialPlan,
  requestDeletePreparationMaterialPlan,
  requestSettlePreparationMaterialPlan,
  requestUnAuditPreparationMaterialPlan
} from "@/api/logistics/preparationMaterial"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import {
  type ComponentExposed,
  type IColumnSortInfo,
  type ITableConfig,
  type ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectFacility from "@/components/SelectFacility/index.vue"
import {
  EnumGetMaterialPurpose,
  EnumGetMaterialPurposeMap,
  EnumPreparationMaterialPlanStatus,
  EnumPreparationMaterialPlanStatusMap,
  EnumPreparationMaterialPlanStatusTagMap,
  EnumPreparationMaterialPlanType,
  EnumPreparationMaterialPlanTypeMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IPreparationMaterialAuditItem,
  IPreparationMaterialItem as ITableRow,
  IPreparationMaterialPageReq
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"

import PreparationMaterialPlanCreate from "./components/PreparationMaterialPlanCreate.vue"
import PreparationMaterialPlanDetail from "./components/PreparationMaterialPlanDetail.vue"

defineOptions({
  name: "PreparationPlan"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 主体列表页
  Preparation_plan_create, // 领料计划新增
  Preparation_plan_update, // 领料计划编辑
  Preparation_plan_detail // 领料计划详情
}

const curPageKey = ref(EnumPageType.Main) // 当前显示页面种类
const pageTree = ref([
  {
    name: "领料计划",
    key: EnumPageType.Main,
    children: [
      {
        name: "领料计划新建",
        key: EnumPageType.Preparation_plan_create
      },
      {
        name: "领料计划编辑",
        key: EnumPageType.Preparation_plan_update
      },
      {
        name: "领料计划详情",
        key: EnumPageType.Preparation_plan_detail
      }
    ]
  }
])

const isAuth = useButtonAuth("PreparationPlan_update", "PreparationPlan_query")

const { searchList, resetForm, getFormData } = useSearchForm<{
  planNo: string
  productionOrderNo: string
  productionTaskNo: string
  delegateOrderNo: string
  deliveryTaskNo: string
  packTaskNo: string
  createTimeStart: string
  createTimeEnd: string
  useForList: number[]
  productName: string
  productNo: string
  planPickTimeStart: string
  planPickTimeEnd: string
  statusList: number[]
}>([
  {
    type: EnumComponentType.Input,
    key: "planNo",
    label: "领料计划单号",
    value: "",
    placeholder: "请输入领料计划单号"
  },
  {
    type: EnumComponentType.Input,
    key: "productionOrderNo",
    label: "生产订单号",
    value: "",
    placeholder: "请输入生产订单号"
  },
  {
    type: EnumComponentType.Input,
    key: "productionTaskNo",
    label: "生产任务号",
    value: "",
    placeholder: "请输入生产任务号"
  },
  {
    type: EnumComponentType.Input,
    key: "delegateOrderNo",
    label: "委外订单号",
    value: "",
    placeholder: "请输入委外订单号"
  },
  {
    type: EnumComponentType.Input,
    key: "deliveryTaskNo",
    label: "发货计划单号",
    value: "",
    placeholder: "请输入发货计划单号"
  },
  {
    type: EnumComponentType.Input,
    key: "packTaskNo",
    label: "包装任务号",
    value: "",
    placeholder: "请输入包装任务号"
  },
  {
    type: EnumComponentType.Select,
    key: "useForList",
    label: "领取用途",
    value: [],
    placeholder: "请选择领取用途（可多选）",
    options: Object.entries(EnumGetMaterialPurposeMap).map(([value, key]) => ({
      label: key,
      value: +value
    })),
    multiple: true
  },
  {
    type: EnumComponentType.Input,
    key: "productName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    key: "productNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Select,
    key: "statusList",
    label: "状态",
    value: "",
    placeholder: "请选择状态（可多选）",
    options: Object.entries(EnumPreparationMaterialPlanStatusMap).map(([value, key]) => ({
      label: key,
      value: +value
    })),
    multiple: true
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "创建时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "planTime",
    label: "计划领料时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["planPickTimeStart", "planPickTimeEnd"]
  }
])

const selectedRowId = ref("") // 选中行id
const auditProductList = ref<IPreparationMaterialAuditItem[]>([]) // 复核产品列表
const auditTableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "defaultStorageId",
      label: "选择仓库",
      minWidth: 140,
      slots: {
        default: "defaultStorageId-default"
      }
    }
  ]
})

const showAuditDialog = ref(false) // 是否展示复核弹窗 必选仓库
const currentRow = ref<ITableRow>()
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "领料计划单号",
      minWidth: 160
    },
    {
      prop: "useFor",
      label: "领取用途",
      minWidth: 120,
      align: "center",
      formatter: ({ useFor }) => EnumGetMaterialPurposeMap[useFor as EnumGetMaterialPurpose]
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      minWidth: 160
    },
    {
      prop: "source",
      label: "来源",
      width: 120,
      align: "center",
      formatter: ({ source }) => EnumProductionOrderSourceMap[source as EnumProductionOrderSource]
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
      prop: "type",
      label: "类型",
      minWidth: 120,
      align: "center",
      formatter: ({ type }) =>
        EnumPreparationMaterialPlanTypeMap[type as EnumPreparationMaterialPlanType]
    },
    {
      prop: "planContent",
      label: "备货内容",
      minWidth: 200,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "planContent-default"
      }
    },
    {
      prop: "planTime",
      label: "计划领料时间",
      minWidth: 160,
      align: "center",
      sortable: true
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center",
      sortable: true
    },
    {
      prop: "checkTime",
      label: "复核时间",
      minWidth: 160,
      align: "center",
      sortable: true
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 190,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IPreparationMaterialPageReq], ITableRow, true> = {
  api: queryPreparationMaterialPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: { ...getFormData() },
        sort: sortData.map((item) => ({ field: item.sortField, order: item.order! }))
      }
    ]
  }
}

const contentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "备货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  tableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

/** 备货内容 */
const planContentReference = (data: ITableRow) => {
  if (!data.planContent.length) {
    return ""
  }
  return data.planContent.map((item) => item.productName).join(",")
}

/** 新建采购退货操作 */
const onCreateClick = (row?: ITableRow) => {
  curPageKey.value = row
    ? EnumPageType.Preparation_plan_update
    : EnumPageType.Preparation_plan_create
  selectedRowId.value = row?.id || ""
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Preparation_plan_detail
  selectedRowId.value = row.id
}

/** 删除操作 */
const onDeleteClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("删除订单后将无法找回，是否确认删除？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestDeletePreparationMaterialPlan(row.id)
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}

/** 复核操作 */
const onAuditClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认复核吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  currentRow.value = row
  const valid = await getPreAuditProductStorageList(row.id)
  valid && (await onAuditRequest(row.id))
}

/** 复核操作先查询是否都选了仓库，没有则需要让其选仓库 */
const getPreAuditProductStorageList = async (id: string) => {
  const res = await queryPreparationMaterialStorageList(id)
  auditProductList.value = res ?? []
  if (res?.length && res.some((item) => !item.defaultStorageId)) {
    ElMessage.warning("请先选择仓库")
    showAuditDialog.value = true
    return false
  }
  return true
}

/** 复核操作调接口 */
const onAuditRequest = async (id: string) => {
  await requestAuditPreparationMaterialPlan(
    id,
    auditProductList.value.map((item) => ({
      productModelId: item.productModelId,
      storageId: item.defaultStorageId as string
    }))
  )
  ElMessage.success("复核成功")
  tableRef.value?.requestData()
}

/** 指定仓库确定 */
const onAuditStorageDesignClick = async () => {
  if (auditProductList.value.some((item) => !item.defaultStorageId)) {
    ElMessage.warning("请先选择仓库")
    return
  }
  await onAuditRequest(currentRow.value?.id as string)
  showAuditDialog.value = false
}

/** 解复核操作 */
const onUnAuditClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认解复核吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestUnAuditPreparationMaterialPlan(row.id)
  ElMessage.success("解复核成功")
  tableRef.value?.requestData()
}

/** 结案操作 */
const onSettleClick = async (row: ITableRow) => {
  const valid = await requestCheckPreparationMaterialPlan(row.id)
  if (valid) {
    await requestSettlePreparationMaterialPlan(row.id)
    ElMessage.success("结案成功")
    tableRef.value?.requestData()
  } else {
    await ElMessageBox.confirm(`领料计划${row.no}未完成，是否确认结案？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      closeOnClickModal: false,
      closeOnPressEscape: false,
      autofocus: false,
      type: "warning"
    })
    await requestSettlePreparationMaterialPlan(row.id)
    ElMessage.success("结案成功")
    tableRef.value?.requestData()
  }
}
</script>

<style lang="scss" scoped></style>
