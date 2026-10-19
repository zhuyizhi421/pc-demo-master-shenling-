<template>
  <div class="layout-container">
    <!-- 主体列表页部分 -->
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="包装任务"></CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row }">
            <el-tag
              :type="EnumProductionTaskStatusTagType[row.status as EnumProductionTaskStatus]"
              >{{
                EnumProductionTaskStatusMap[row.status as EnumProductionTaskStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #packageContent-default="{ row }">
            <el-popover placement="top-start" width="600">
              <template #reference>
                {{ formatPackageContent(row) }}
              </template>
              <CustomTable v-model:table-data="row.products" :config="productTableConfig">
              </CustomTable>
            </el-popover>
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
              <el-button
                v-if="
                  row.hasChildren ||
                  ([
                    EnumProductionTaskStatus.REVIEWED,
                    EnumProductionTaskStatus.RUNNING,
                    EnumProductionTaskStatus.PAUSE
                  ].includes(row.status) &&
                    isAuth)
                "
                type="primary"
                size="small"
                @click="onReAddClick(row)"
                link
                >追加数量</el-button
              >
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

    <!-- 追加数量弹窗 -->
    <ReAddDialog
      v-model="reAddVisible"
      :package-task-id="curClickRowId"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"

import { queryPackageTaskPageList } from "@/api/produce/package-task/package-task"
import { archiveProductionTaskCase } from "@/api/scheduling"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import { EnumProductionTaskStatus, EnumProductionTaskStatusMap } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IPackageTaskListItem as ITableRow,
  IPackageTaskPageListParams
} from "@/types/production-manage/package-task"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import ReAddDialog from "./ReAddDialog.vue"

defineOptions({
  name: "PackageTask"
})

const EnumProductionTaskStatusTagType = {
  [EnumProductionTaskStatus.REVIEWED]: "danger",
  [EnumProductionTaskStatus.RUNNING]: "primary",
  [EnumProductionTaskStatus.PAUSE]: "warning",
  [EnumProductionTaskStatus.COMPLETED]: "success"
}

const router = useRouter()
const isAuth = useButtonAuth("PackageTask_update", "PackageTask_query")

const statusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  entityIds?: string[]
  drawingNumber?: string
  productModelName?: string
  productModelNo?: string
  deliveryPlanNo?: string
  productionTaskNo?: string
  status?: number
  statuses?: number[]
  startDate?: string
  endDate?: string
}>([
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
    key: "deliveryPlanNo",
    label: "发货计划",
    value: "",
    placeholder: "请输入发货计划"
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
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: statusOptions
  }
])

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
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "deliveryCode",
      label: "发货计划",
      width: 160
    },
    {
      prop: "packageContent",
      label: "包装内容",
      width: 200,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "packageContent-default"
      }
    },
    {
      prop: "entityNames",
      label: "生产区域",
      width: 160
    },
    {
      prop: "completeEmpName",
      label: "结案人",
      width: 120,
      align: "center"
    },
    {
      prop: "planStartTime",
      label: "计划开始时间",
      width: 160,
      align: "center",
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "planEndTime",
      label: "计划完工时间",
      width: 160
    },
    {
      prop: "startTime",
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
      width: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IPackageTaskPageListParams], ITableRow, true> = {
  api: queryPackageTaskPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startDate, endDate, status, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest,
          status,
          statuses: status ? undefined : [1, 6, 8, 9]
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
const productTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: ITableRow["products"][0]) => {
        const data = row as any
        return data.productModelSpec || data.productModel?.specification || "-"
      }
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      minWidth: 160
    },
    {
      prop: "planQty",
      label: "计划加工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow["products"][0]) => {
        return isEffectiveValue(row.planQty)
          ? precisionConversion(row.planQty, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    }
  ]
})

const curClickRowId = ref("") // 当前点击行的id
const reAddVisible = ref(false) // 追加数量弹窗标识

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

/** 包装内容格式化 */
const formatPackageContent = (row: ITableRow) => {
  return row.products?.map((item) => item.productModelName)?.join("、")
}

/** 查看报工 */
const onReviewReportClick = (row: ITableRow) => {
  router.push({
    name: "ProductionReport",
    query: {
      packTaskNo: row.no ?? ""
    }
  })
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

<style scoped lang="scss"></style>
