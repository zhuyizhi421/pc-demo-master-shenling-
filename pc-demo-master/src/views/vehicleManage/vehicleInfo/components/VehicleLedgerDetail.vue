<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="载具台账详情" showShortBar />
      <CustomDescription :data="detailData" :configs="ledgerConfig" :label-width="140" />

      <CustomTitle title="载具信息" showShortBar />
      <CustomDescription :data="detailData" :configs="mainDataConfig" :label-width="140" />

      <CustomTitle title="装载的产品" showShortBar />
      <el-tabs v-model="activeTab" class="product-tabs">
        <el-tab-pane label="按产品统计" name="statistics">
          <CustomTable v-model:table-data="productStatisticsTableData" :config="statisticsTableConfig" />
        </el-tab-pane>
        <el-tab-pane label="装载明细" name="detail">
          <div v-if="canEdit" class="product-toolbar">
            <el-button
              type="danger"
              :disabled="!detailSelectedRows.length"
              @click="onBatchUnloadProductClick()"
            >
              批量卸载
            </el-button>
          </div>
          <CustomTable
            ref="detailTableRef"
            v-model:table-data="detailTableData"
            :config="detailTableConfig"
            class="product-table"
            @select-change="syncDetailSelectedRows"
            @select-all="syncDetailSelectedRows"
          >
            <template #barcode-default="{ row }">
              {{ row.barcode || "-" }}
            </template>
            <template #action-default="{ row }">
              <div class="flex items-center">
                <el-button link type="primary" size="small" @click="onUnloadProductClick(row)">
                  卸下
                </el-button>
              </div>
            </template>
          </CustomTable>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <div class="layout-footer">
    <el-button @click="emit('close')">返回</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getVehicleItem, updateVehicleUnload } from "@/api/operation/vehicle/vehicleInfo"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { IVehiclePageItem } from "@/types/maintain/vehicle"
import { formatDateTime } from "@/views/maintOperate/status"

import {
  formatVehicleLedgerStatus,
  formatVehicleRepairTaskStatus,
  formatVehicleScrapTaskStatus
} from "../status"

defineOptions({
  name: "VehicleLedgerDetail"
})

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "refresh"): void
}>()

const authType = useButtonAuth("VehicleInfoManage_update", "VehicleInfoManage_query")
const canEdit = computed(() => authType.value !== AuthType.View)

type IBindProductRow = NonNullable<IVehiclePageItem["bindProducts"]>[number]
type IBindProductDetailRow = IBindProductRow & {
  _rowKey: string
}
type IProductStatisticsRow = {
  productModelId: string
  productModelCode: string
  productModelName: string
  defaultUnitName: string
  quantityTotal: number
  detailCount: number
}

const detailData = ref<IVehiclePageItem>({} as IVehiclePageItem)
const activeTab = ref<"statistics" | "detail">("statistics")
const detailTableRef = ref<ComponentExposed<typeof CustomTable>>()
const detailTableData = ref<IBindProductDetailRow[]>([])
const detailSelectedRows = ref<IBindProductDetailRow[]>([])

const ledgerConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "no",
    label: "载具编号：",
    formatter: ({ data }) => data.no || "-"
  },
  {
    field: "name",
    label: "载具名称：",
    formatter: ({ data }) => data.name || "-"
  },
  {
    field: "barcode",
    label: "标签码：",
    formatter: ({ data }) => data.barcode || "-"
  },
  {
    field: "ledgerStatus",
    label: "台账状态：",
    formatter: ({ data }) => formatVehicleLedgerStatus(data)
  },
  {
    field: "repairTaskStatus",
    label: "维修状态：",
    formatter: ({ data }) => formatVehicleRepairTaskStatus(data)
  },
  {
    field: "scrapTaskStatus",
    label: "报废状态：",
    formatter: ({ data }) => formatVehicleScrapTaskStatus(data)
  },
  {
    field: "remarks",
    label: "备注：",
    formatter: ({ data }) => data.remarks || "-"
  },
  {
    field: "createTime",
    label: "创建时间：",
    formatter: ({ data }) => formatDateTime(data.createTime)
  }
])

const mainDataConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "vehicleModelNo",
    label: "类型编号：",
    formatter: ({ data }) => data.vehicleModelNo || "-"
  },
  {
    field: "vehicleModelName",
    label: "类型名称：",
    formatter: ({ data }) => data.vehicleModelName || "-"
  },
  {
    field: "vehicleCategoryName",
    label: "载具分类：",
    formatter: ({ data }) => data.vehicleCategoryName || "-"
  },
  {
    field: "repairProcdefName",
    label: "维修流程：",
    formatter: ({ data }) => data.repairProcdefName || "-"
  },
  {
    field: "scrapProcdefName",
    label: "报废流程：",
    formatter: ({ data }) => data.scrapProcdefName || "-"
  }
])

const productStatisticsTableData = computed<IProductStatisticsRow[]>(() => {
  const groupedMap = new Map<string, IProductStatisticsRow>()

  detailTableData.value.forEach((item) => {
    const productModelId = String(item.productModelId || "")
    const defaultUnitName = String(item.defaultUnitName || "")
    const mapKey = `${productModelId}__${defaultUnitName}`
    const existed = groupedMap.get(mapKey)

    if (existed) {
      existed.quantityTotal += Number(item.defaultQuantity || 0)
      existed.detailCount += 1
      return
    }

    groupedMap.set(mapKey, {
      productModelId,
      productModelCode: item.productModelCode || "-",
      productModelName: item.productModelName || "-",
      defaultUnitName: defaultUnitName || "-",
      quantityTotal: Number(item.defaultQuantity || 0),
      detailCount: 1
    })
  })

  return Array.from(groupedMap.values())
})

const statisticsTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 240,
  columns: [
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 180,
      showOverflowTooltip: true
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 180,
      showOverflowTooltip: true
    },
    {
      prop: "quantityTotal",
      label: "装载总数量",
      width: 140,
      align: "right",
      formatter: (row: IProductStatisticsRow) => `${row.quantityTotal || 0}`
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      width: 100,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "detailCount",
      label: "明细条数",
      width: 120,
      align: "center"
    }
  ]
}))

const detailTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 240,
  rowKey: "_rowKey",
  columns: [
    {
      prop: "",
      type: "selection",
      label: "",
      width: 60,
      align: "center",
      hidden: !canEdit.value,
      multiple: true
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160,
      showOverflowTooltip: true,
      slots: {
        default: "barcode-default"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "defaultQuantity",
      label: "数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "action",
      hidden: !canEdit.value,
      label: "操作",
      minWidth: 80,
      fixed: "right",
      slots: {
        default: "action-default"
      }
    }
  ]
}))

const getDetail = async () => {
  const res = await getVehicleItem(props.id)
  detailData.value = (res || {}) as IVehiclePageItem
  detailTableData.value = ((detailData.value.bindProducts || []) as IBindProductRow[]).map((item, index) => ({
    ...item,
    _rowKey: `${item.productId || "product"}-${item.barcode || "barcode"}-${index}`
  }))
  detailSelectedRows.value = []
}

const onUnloadProductClick = async (row: { productId: string }) => {
  await ElMessageBox.confirm("确认卸载该装载明细吗？", "卸载确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })

  await updateVehicleUnload(detailData.value.id, { productIds: [row.productId] })
  ElMessage.success("卸下成功")
  await getDetail()
  detailTableRef.value?.clearSelectedRow()
  emit("refresh")
}

const onBatchUnloadProductClick = async () => {
  const rows = detailSelectedRows.value
  if (!rows.length) {
    ElMessage.warning("请选择要卸载的装载明细")
    return
  }

  await ElMessageBox.confirm(`确认批量卸载选中的 ${rows.length} 条装载明细吗？`, "批量卸载确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })

  await updateVehicleUnload(detailData.value.id, {
    productIds: rows.map((item) => item.productId)
  })
  ElMessage.success("批量卸载成功")
  await getDetail()
  detailTableRef.value?.clearSelectedRow()
  emit("refresh")
}

const syncDetailSelectedRows = () => {
  detailSelectedRows.value = (detailTableRef.value?.getCurrentMultipleRows() || []) as IBindProductDetailRow[]
}

watch(
  () => props.id,
  () => {
    if (props.id) {
      void getDetail()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.product-tabs {
  margin-top: 8px;
}

.product-toolbar {
  margin-bottom: 8px;
}

.product-table {
  margin-top: 0;
}
</style>
