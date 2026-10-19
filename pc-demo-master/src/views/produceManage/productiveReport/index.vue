<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="生产报工">
          <el-button
            v-if="hasReviewAuth"
            type="primary"
            :disabled="selectedRows.length === 0"
            @click="onBatchReviewClick"
          >
            批量审核 ({{ selectedRows.length }})
          </el-button>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
          @selection-change="handleSelectionChange"
        >
          <template #index-default="{ row }">
            {{ row.index }}
          </template>

          <template #reviewStatus-default="{ row }">
            <span
              :style="{
                color: row.reviewedQty === null || row.reviewedQty === undefined ? '#E6A23C' : '#67C23A'
              }"
            >
              {{ row.reviewedQty === null || row.reviewedQty === undefined ? "未审核" : "已审核" }}
            </span>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="hasReviewAuth && (row.reviewedQty === null || row.reviewedQty === undefined)"
              type="primary"
              size="small"
              link
              @click="onReviewClick(row)"
              >审核</el-button
            >
            <el-button
              v-if="hasReviewAuth && row.reviewedQty !== null && row.reviewedQty !== undefined"
              type="primary"
              size="small"
              link
              @click="onReviewClick(row)"
              >查看</el-button
            >
            <el-button
              type="primary"
              size="small"
              link
              @click="onPackDetailClick(row)"
              v-if="row.bizType === 2"
              >查看包装记录</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="onTableRequestData"
      />
    </div>

    <PackRecordDialog v-model="packVisible" :id="currentRow?.id!" />
    <ReviewDialog v-model="reviewVisible" :row="currentRow" @success="onTableRequestData" />
    <BatchReviewDialog v-model="batchReviewVisible" :rows="selectedRows" @success="onBatchReviewSuccess" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { ElMessage } from "element-plus"
import { useRoute } from "vue-router"

import { getProductionReportPaged } from "@/api/scheduling"
import { queryFactoryModelList } from "@/api/fm"
import useUserStore from "@/store/modules/user"
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
import { SelectType } from "@/components/SelectFactoryModel/types"
import { EnumProductionRecordType } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import type {
  IProductionReportPageItem as ITableRow,
  IProductionReportPageParams
} from "@/types/production-manage/product-order"
import { precisionConversion } from "@/utils/common"

import PackRecordDialog from "./components/PackRecordDialog.vue"
import ReviewDialog from "./components/ReviewDialog.vue"
import BatchReviewDialog from "./components/BatchReviewDialog.vue"

defineOptions({
  name: "ProductionReport"
})

const packVisible = ref(false)
const reviewVisible = ref(false)
const batchReviewVisible = ref(false)
const selectedRows = ref<ITableRow[]>([])

const userStore = useUserStore()

// 配置允许查看审核/查看按钮的角色列表
const ALLOWED_ROLES = ["admin", "生产主管", "车间主任"]

// 审核权限：检查用户角色是否在允许列表中
const hasReviewAuth = computed(() => {
  // 静态演示环境（无角色）默认显示
  if (userStore.roleCodes.length === 0) return true
  // 检查用户角色是否在允许列表中
  return userStore.roleCodes.some((role: string) => ALLOWED_ROLES.includes(role))
})

// 用户负责的生产区域ID列表
const userAreaIds = ref<string[]>([])

// 根据用户角色获取负责的生产区域
const loadUserProductionAreas = async () => {
  // 静态演示环境（无角色）或admin不限制
  if (userStore.roleCodes.length === 0 || userStore.roleCodes.includes("admin")) {
    userAreaIds.value = []
    return
  }

  try {
    // 查询所有生产区域
    const areaList = await queryFactoryModelList({
      levelTag: "productionArea",
      isEnable: true
    })

    if (!areaList || areaList.length === 0) return

    // 获取用户角色名称列表
    const userRoles = userStore.roleCodes || []

    // 筛选用户角色负责的区域（匹配 leader 字段）
    const matchedAreas = areaList.filter((area: any) => {
      const leader = area.leader || ""
      // 检查leader是否包含用户角色名称
      return userRoles.some((role: string) => leader.includes(role))
    })

    userAreaIds.value = matchedAreas.map((area: any) => area.id)
  } catch (e) {
    console.error("获取用户负责区域失败:", e)
    userAreaIds.value = []
  }
}

const route = useRoute()

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "报工时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Select,
    key: "reviewStatus",
    label: "审核状态",
    value: "",
    placeholder: "请选择审核状态",
    options: [
      { label: "全部", value: "" },
      { label: "未审核", value: "0" },
      { label: "已审核", value: "1" }
    ]
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
    key: "productModelCode",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    key: "barcode",
    label: "标签码",
    value: "",
    placeholder: "请输入产品标签码"
  },
  {
    type: EnumComponentType.Input,
    key: "productionOrderNo",
    label: "生产订单",
    value: "",
    placeholder: "请输入生产订单"
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
      multiple: true,
      rootLevelTag: "productionArea",
      showAllLevels: false
    }
  },
  {
    type: EnumComponentType.Input,
    key: "reportName",
    label: "报工人",
    value: "",
    placeholder: "请输入报工人"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  entityIds?: string[]
  productModelName?: string
  productModelCode?: string
  productionOrderNo?: string
  reportName?: string
  startDate?: string
  endDate?: string
  barcode?: string
  reviewStatus?: string
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
  rowKey: "id",
  columns: [
    {
      type: "selection",
      multiple: true,
      width: 55
    },
    {
      prop: "reviewStatus",
      label: "审核状态",
      width: 100,
      align: "center",
      slots: {
        default: "reviewStatus-default"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.productModelName || "—"
      }
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      width: 160,
      formatter: (row: ITableRow) => {
        const data = row as any
        return data.productModelSpec || data.productModel?.specification || "—"
      }
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.productModelCode || "—"
      }
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160
    },
    {
      prop: "reportQty",
      label: "数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.reportQty || row.reportQty === 0
          ? precisionConversion(row.reportQty, row?.decimalNumber || 0)
          : "—"
      }
    },
    {
      prop: "reviewedQty",
      label: "审核数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        const data = row as any
        return data.reviewedQty !== null && data.reviewedQty !== undefined
          ? precisionConversion(data.reviewedQty, row?.decimalNumber || 0)
          : "—"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.reportType === EnumProductionRecordType.TIME ? "小时" : row.unitName || "—"
      }
    },
    {
      prop: "sourceName",
      label: "来源",
      width: 120,
      align: "center"
    },
    {
      prop: "productionTaskNo",
      label: "任务编号",
      width: 160
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.sourceNo || "—"
      }
    },
    {
      prop: "processSerial",
      label: "工序编号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.processSerial || "—"
      }
    },
    {
      prop: "techName",
      label: "工艺名称",
      width: 160
    },
    {
      prop: "bizTypeName",
      label: "业务类型",
      width: 160,
      align: "center"
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "reportName",
      label: "报工人",
      width: 120,
      align: "center"
    },
    {
      prop: "reportTime",
      label: "报工时间",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const currentRow = ref<ITableRow>()

onMounted(async () => {
  // 先加载用户负责的生产区域
  await loadUserProductionAreas()
  // 如果用户有负责的区域，自动设置过滤条件
  if (userAreaIds.value.length > 0) {
    searchList.value.find((item) => item.key === "entityIds")!.value = userAreaIds.value
  }
  onTableRequestData()
})

// 请求并处理数据
const onTableRequestData = async () => {
  await customTableRef.value?.requestData()
  // customTableData.value = customTableData.value.map((item, index) => {
  //   item.index = index + 1
  //   // 通过改变row-key绑定值，来触发表格的重新渲染
  //   item.methodRecordId = "parent-" + item.methodRecordId
  //   item.level = 1
  //   if (item.children && item.children.length) {
  //     item.children.forEach((child) => {
  //       child.level = 2
  //       // 通过改变row-key绑定值，来触发表格的重新渲染
  //       child.methodRecordId = "child-" + child.methodRecordId
  //       // 删除children属性，避免子集展示展开图标
  //       delete child.children
  //     })
  //   } else {
  //     delete item.children
  //   }
  //   return item
  // })
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await onTableRequestData()
}

// 页面加载时自动请求数据
onMounted(async () => {
  // 先加载用户负责的生产区域
  await loadUserProductionAreas()
  // 如果用户有负责的区域，自动设置过滤条件
  if (userAreaIds.value.length > 0) {
    searchList.value.find((item) => item.key === "entityIds")!.value = userAreaIds.value
  }
  onTableRequestData()
})

const queryConfig: ITableRequestConfig<[IProductionReportPageParams], ITableRow, true> = {
  api: getProductionReportPaged,
  getParams: () => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest
        },
        dateRange: {
          endDate,
          startDate
        }
      }
    ]
  }
}

const onPackDetailClick = (row: ITableRow) => {
  currentRow.value = row
  packVisible.value = true
}

const onReviewClick = (row: ITableRow) => {
  currentRow.value = row
  reviewVisible.value = true
}

// 批量审核
const onBatchReviewClick = () => {
  // 过滤出未审核的记录
  const uncheckedRows = selectedRows.value.filter(
    (row) => row.reviewedQty === null || row.reviewedQty === undefined
  )
  if (uncheckedRows.length === 0) {
    ElMessage.warning("请选择未审核的记录")
    return
  }
  batchReviewVisible.value = true
}

// 批量审核成功
const onBatchReviewSuccess = () => {
  selectedRows.value = []
  onTableRequestData()
}

// 表格选择变化
const handleSelectionChange = (rows: ITableRow[]) => {
  selectedRows.value = rows
}
</script>

<style scoped lang="scss"></style>
