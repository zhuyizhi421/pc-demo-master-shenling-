<template>
  <div class="layout-container">
    <!-- 主体列表页部分 -->
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="生产任务"></CustomTitle>
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
              :type="EnumProductionTaskStatusTagType[row.status as EnumProductionTaskStatus]"
              >{{
                EnumProductionTaskStatusMap[row.status as EnumProductionTaskStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #isUrgent-default="{ row }">
            <el-tag :type="isUrgentProductionTask(row) ? 'danger' : 'success'" size="small">
              {{ isUrgentProductionTask(row) ? "是" : "否" }}
            </el-tag>
          </template>

          <template #productionProgress-default="{ row }">
            <div class="progress-wrap">
              <div class="progress-text">
                {{ (Number(row.productionProgress) * 100).toFixed(2) + "%" }}
              </div>
              <div class="progress">
                <div
                  class="progress-slid"
                  :style="{ width: (row.productionProgress || 0) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button
                v-if="row.status !== EnumProductionTaskStatus.REVIEWED"
                type="primary"
                size="small"
                link
                @click="onReviewReportClick(row)"
                >查看报工</el-button
              >
              <el-button
                v-if="
                  [EnumProductionTaskStatus.REVIEWED, EnumProductionTaskStatus.PAUSE].includes(
                    row.status
                  ) && isAuth
                "
                type="danger"
                size="small"
                link
                @click="archiveTask(row.id)"
                >结案</el-button
              >
              <el-dropdown
                v-if="
                  row.hasChildren ||
                  ([
                    EnumProductionTaskStatus.REVIEWED,
                    EnumProductionTaskStatus.RUNNING,
                    EnumProductionTaskStatus.PAUSE
                  ].includes(row.status) &&
                    isAuth)
                "
              >
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onScheduleDetail(row)" v-if="row.hasChildren">
                      <el-button type="primary" size="small" link>排产详情</el-button>
                    </el-dropdown-item>

                    <template v-if="[1, 8].includes(row.status) && isAuth">
                      <el-dropdown-item @click="onTransferOutClick(row)">
                        <el-button type="primary" size="small" link>转委外</el-button>
                      </el-dropdown-item>
                      <el-dropdown-item @click="onScheduleAgainClick(row)">
                        <el-button type="primary" size="small" link>再排产</el-button>
                      </el-dropdown-item>
                    </template>
                    <el-dropdown-item
                      @click="onReAddClick(row)"
                      v-if="[1, 6, 8].includes(row.status) && isAuth"
                    >
                      <el-button type="primary" size="small" link>追加数量</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 排产详情子页面 -->
      <ScheduleDetail
        v-if="curPageKey === EnumPageType.Schedule_detail"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="scheduleDetailSuccess($event)"
      />

      <!-- 转委外子页面 -->
      <TransferOut
        v-if="curPageKey === EnumPageType.Transfer_out"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />

      <!-- 再排产页面 -->
      <ScheduleAgain
        v-if="curPageKey === EnumPageType.Schedule_again"
        :id="curClickRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />
      <!-- 追加数量弹窗 -->
    </div>

    <ReAddDialog
      v-model="reAddVisible"
      :productionTaskId="curClickRowId"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"

import { archiveProductionTaskCase, queryProductTaskPageList } from "@/api/scheduling"
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
import { SelectType } from "@/components/SelectFactoryModel/types"
import {
  EnumProductionOrderType,
  EnumProductionOrderTypeMap,
  EnumProductionTaskStatus,
  EnumProductionTaskStatusMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IProductionTaskPageItem as ITableRow,
  IProductionTaskPageParams
} from "@/types/production-manage/product-task"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import ReAddDialog from "./ReAddDialog.vue"
import ScheduleAgain from "./ScheduleAgain.vue"
import ScheduleDetail from "./ScheduleDetail.vue"
import TransferOut from "./TransferOut.vue"

defineOptions({
  name: "ProductionSchedulingTask"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Transfer_out, // 转委外
  Schedule_detail, // 排产详情
  Schedule_again // 再排产
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "生产任务",
    key: EnumPageType.Main,
    children: [
      {
        name: "排产详情",
        key: EnumPageType.Schedule_detail
      },
      {
        name: "转委外",
        key: EnumPageType.Transfer_out
      },
      {
        name: "再排产",
        key: EnumPageType.Schedule_again
      }
    ]
  }
])

const EnumProductionTaskStatusTagType = {
  [EnumProductionTaskStatus.REVIEWED]: "danger",
  [EnumProductionTaskStatus.RUNNING]: "primary",
  [EnumProductionTaskStatus.PAUSE]: "warning",
  [EnumProductionTaskStatus.COMPLETED]: "success"
}

const router = useRouter()
const isAuth = useButtonAuth("ProductionSchedulingTask_update", "ProductionSchedulingTask_query")

const statusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "任务时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Input,
    key: "productionTaskNo",
    label: "任务编号",
    value: "",
    placeholder: "请输入任务编号"
  },
  {
    type: EnumComponentType.Area,
    key: "entityIds",
    label: "生产区域",
    value: "",
    placeholder: "请选择生产区域",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      multiple: true
    }
  },
  {
    type: EnumComponentType.Input,
    key: "productionOrderNo",
    label: "生产订单",
    value: "",
    placeholder: "请输入生产订单"
  },
  {
    type: EnumComponentType.Input,
    key: "productModelName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    key: "productModelNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    key: "drawingNumber",
    label: "产品图号",
    value: "",
    placeholder: "请输入产品图号"
  },
  {
    type: EnumComponentType.Select,
    key: "statuses",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: statusOptions,
    multiple: true,
    maxTag: 2
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  entityIds?: string[]
  drawingNumber?: string
  productModelName?: string
  productModelNo?: string
  productionOrderNo?: string
  productionTaskNo?: string
  status?: number
  statuses?: number[]
  startDate?: string
  endDate?: string
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
      prop: "no",
      label: "任务编号",
      width: 160
    },
    {
      prop: "isUrgent",
      label: "是否紧急",
      width: 100,
      align: "center",
      slots: {
        default: "isUrgent-default"
      }
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
      prop: "productionOrderNo",
      label: "生产订单",
      width: 160
    },
    {
      prop: "productionOrderType",
      label: "订单类型",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumProductionOrderTypeMap[row.productionOrderType as EnumProductionOrderType] || "-"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      width: 160,
      formatter: (row: ITableRow) => {
        const data = row as any
        return data.productModelSpec || data.productModel?.specification || "-"
      }
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      width: 160
    },
    {
      prop: "processSerial",
      label: "工序",
      width: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "taskAmount",
      label: "计划加工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return isEffectiveValue(row.taskAmount)
          ? precisionConversion(row.taskAmount, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "completeAmount",
      label: "完工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.bizType === 2
          ? ""
          : isEffectiveValue(row.completeAmount)
            ? precisionConversion(row.completeAmount, row.decimalNumber ?? 2)
            : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "archiveManName",
      label: "结案人",
      width: 120,
      align: "center"
    },
    {
      prop: "planBeginTime",
      label: "计划开始时间",
      width: 160,
      align: "center",
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "planEndTime",
      label: "计划完工时间",
      width: 160,
      align: "center"
    },
    {
      prop: "beginTime",
      label: "实际开始时间",
      width: 160,
      align: "center"
    },
    {
      prop: "endTime",
      label: "结案时间",
      width: 160,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IProductionTaskPageParams], ITableRow, true> = {
  api: queryProductTaskPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startDate, endDate, statuses, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest,
          statuses: statuses?.length ? statuses : [1, 6, 8, 9]
        },
        dateRange: {
          endDate,
          startDate
        },
        sort: sortData.map((item) => ({ field: item.sortField, order: item.order! }))
      }
    ]
  }
}

const curClickRowId = ref("") // 当前点击行的id
const reAddVisible = ref(false) // 追加数量弹窗标识

const isUrgentProductionTask = (row: ITableRow) => {
  const data = row as any
  return Boolean(
    data?.isUrgent ||
      data?.urgent ||
      data?.isUrgentInsert ||
      Number(data?.priority || data?.orderPriority || data?.productionOrderPriority || 0) === 3
  )
}

onMounted(() => {
  buildOptions()
  customTableRef.value?.requestData()
})

/** 构建下拉选项 */
const buildOptions = () => {
  statusOptions.value = Object.keys(EnumProductionTaskStatusMap).map((key) => ({
    label: EnumProductionTaskStatusMap[key as unknown as EnumProductionTaskStatus],
    value: +key
  }))
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 排产详情 */
const onScheduleDetail = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Schedule_detail
  curClickRowId.value = row.id
}

/** 排产详情成功回调 */
const scheduleDetailSuccess = (no: string) => {
  resetForm()
  searchList.value.find((item) => item.key === "productionTaskNo")!.value = no
  onSubmit()
}

/** 查看报工 */
const onReviewReportClick = (row: ITableRow) => {
  router.push({
    name: "ProductionReport",
    query: {
      productionTaskNo: row.no ?? ""
    }
  })
}

/** 转委外 */
const onTransferOutClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Transfer_out
  curClickRowId.value = row.id
}

/** 再排产 */
const onScheduleAgainClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Schedule_again
  curClickRowId.value = row.id
}

/** 结案 */
const archiveTask = async (id: string) => {
  await ElMessageBox.confirm("此操作将结案此生产任务?", "提示", {
    type: "warning"
  })
  await archiveProductionTaskCase(id)
  ElMessage.success("结案成功")
  customTableRef.value?.requestData()
}

/** 已复核订单追加数量 */
const onReAddClick = (row: ITableRow) => {
  curClickRowId.value = row.id
  reAddVisible.value = true
}
</script>

<style scoped lang="scss">
.layout-main-page {
  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }
    &:focus-visible {
      outline: none;
    }
  }
}
</style>
