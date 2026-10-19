<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="history-header">
        <el-button plain icon="ArrowLeft" @click="onBack">返回</el-button>
      </div>

      <div class="history-summary">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="产品编号">{{ queryInfo.productNo || "-" }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ queryInfo.productName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="工艺编号">{{ queryInfo.craftNo || "-" }}</el-descriptions-item>
          <el-descriptions-item label="工艺名称">{{ queryInfo.craftName || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="custom-table-container">
        <CustomTitle title="历史工价" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          class="custom-table"
        >
          <template #status-default="{ row }">
            <el-tag :type="statusTagMap[row.status]">{{ pieceworkPriceStatusMap[row.status] }}</el-tag>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="loadTableData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type IPieceworkPriceItem,
  pieceworkPriceStatusMap,
  queryPieceworkPriceHistoryList
} from "@/api/pieceworkPrice"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { useRoute, useRouter } from "vue-router"

defineOptions({
  name: "PieceworkPriceHistory"
})

type PriceStatus = IPieceworkPriceItem["status"]

const route = useRoute()
const router = useRouter()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IPieceworkPriceItem[]>([])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const getQueryText = (key: string) => {
  const value = route.query[key]
  if (Array.isArray(value)) return value[0] || ""
  return String(value || "")
}

const queryInfo = computed(() => ({
  productNo: getQueryText("productNo"),
  productName: getQueryText("productName"),
  craftNo: getQueryText("craftNo"),
  craftName: getQueryText("craftName")
}))

const statusTagMap: Record<PriceStatus, "info" | "success" | "danger"> = {
  NOT_EFFECTIVE: "info",
  EFFECTIVE: "success",
  INVALID: "danger"
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  columns: [
    { prop: "productNo", label: "产品编号", minWidth: 130 },
    { prop: "productName", label: "产品名称", minWidth: 160 },
    { prop: "productCategoryNo", label: "产品类别编号", minWidth: 130 },
    { prop: "productCategoryName", label: "产品类别名称", minWidth: 140 },
    { prop: "craftNo", label: "工艺编号", minWidth: 120 },
    { prop: "craftName", label: "工艺名称", minWidth: 150 },
    { prop: "price", label: "工价", minWidth: 90 },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      slots: { default: "status-default" }
    },
    { prop: "effectiveDate", label: "生效日期", minWidth: 120 },
    { prop: "invalidTime", label: "作废日期", minWidth: 160 },
    { prop: "createBy", label: "创建人", minWidth: 120 },
    { prop: "createTime", label: "创建日期", minWidth: 160 },
    { prop: "auditBy", label: "审核人", minWidth: 120 },
    { prop: "auditTime", label: "审核日期", minWidth: 160 },
    { prop: "invalidBy", label: "作废人", minWidth: 120 },
    { prop: "invalidTime", label: "作废时间", minWidth: 160 }
  ]
})

const loadTableData = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const data = await queryPieceworkPriceHistoryList({
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      productNo: queryInfo.value.productNo,
      craftNo: queryInfo.value.craftNo
    })
    customTableData.value = data.records
    pagination.value.total = data.total
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onBack = () => {
  router.push({ name: "PieceworkPrice" })
}

watch(
  () => route.query,
  () => {
    pagination.value.currentPage = 1
    loadTableData()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.history-header {
  margin-bottom: 12px;
}

.history-summary {
  margin-bottom: 16px;
}
</style>
