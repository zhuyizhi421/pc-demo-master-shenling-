<!-- 组件 销售订单详情 -->
<template>
  <div class="sale-order-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle :is-table-title="false" show-short-bar>
        <template #title>
          <span>销售单号：{{ formData.saleCode }}</span>
          <span class="ml-[20px]">{{ formData.saleStatus }}</span>
        </template>
      </CustomTitle>
      <CustomDescription :data="formData" :configs="detailConfig" style="padding: 0">
        <template #attachmentFileId-content>
          <div class="attachment-file" v-if="formData.attachmentFileId">
            <el-button type="primary" link @click="fileDownloadHandle(formData.attachmentFileId)"
              >附件</el-button
            >
            <span class="tip">（点击下载）</span>
          </div>
        </template>
      </CustomDescription>
    </div>
    <div class="table-wrap">
      <CustomTitle title="产品明细" :is-table-title="false" show-short-bar />
      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
        class="custom-detail-table"
      ></CustomTable>
    </div>
    <div class="layout-footer">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { querySaleOrderDetail } from "@/api/logistics/sale"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumSaleOrderPriority,
  EnumSaleOrderPriorityMap,
  EnumSaleOrderStatus,
  EnumSaleOrderStatusMap
} from "@/constant/enums"
import { useImplementConfig } from "@/hooks/useImplementConfig"
import type { ICustomFieldItemInfo } from "@/types/base-info/implement-config"
import { precisionConversion } from "@/utils/common"

interface IProps {
  selectId: string
}
interface ITableRow {
  productModelName: string
  productModelCode: string
  quantity: number
  planDeliveryQty: number
  deliveryQty: number
  decimalNumber?: number
  specifiedOutboundWarehouseId: string
  unitName: string
  planDeliveryTime: string
}

const { formatConfigDetail } = useImplementConfig()

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "close"): void
}>()

const formData = reactive({
  saleCode: "",
  customerName: "",
  customerShortName: "",
  customerCode: "",
  priority: "",
  dataSource: "",
  planDeliveryTime: "",
  createTime: "",
  createBy: "",
  saleStatus: "",
  attachmentFileId: "",
  remarks: ""
})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "客户名称：",
    field: "customerName"
  },
  {
    label: "客户简称：",
    field: "customerShortName"
  },
  {
    label: "客户编号：",
    field: "customerCode"
  },
  {
    label: "计划交货日期：",
    field: "planDeliveryTime",
    formatter: () => {
      return formData.planDeliveryTime?.slice(0, 10)
    }
  },
  {
    label: "优先级：",
    field: "priority"
  },
  {
    label: "创建人：",
    field: "createBy"
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "来源：",
    field: "dataSource"
  },
  {
    label: "附件：",
    field: "attachmentFileId",
    slots: {
      content: "attachmentFileId-content"
    }
  },
  {
    label: "备注：",
    field: "remarks",
    colspan: -1
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 65,
      align: "center",
      type: "index"
    },
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
      prop: "planDeliveryTime",
      label: "计划发货日期",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "quantity",
      label: "销售数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "planDeliveryQty",
      label: "已计划发货数量",
      minWidth: 140,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.planDeliveryQty || row.planDeliveryQty == 0
          ? precisionConversion(row.planDeliveryQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "deliveryQty",
      label: "已发货数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.deliveryQty || row.deliveryQty == 0
          ? precisionConversion(row.deliveryQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

// 自定义字段
const customList = ref<ICustomFieldItemInfo[]>([])

onBeforeMount(() => {
  getSaleOrderDetail()
})

/** 获取销售订单详情 */
const getSaleOrderDetail = async () => {
  const data = await querySaleOrderDetail({ id: props.selectId })
  if (data) {
    for (let key in formData) {
      ;(formData as any)[key] = (data as any)[key]
      if (key === "dataSource") {
        formData[key] = EnumProductionOrderSourceMap[data.dataSource as EnumProductionOrderSource]
      }
      if (key === "saleStatus") {
        formData[key] = EnumSaleOrderStatusMap[data.saleStatus as EnumSaleOrderStatus]
      }
      if (key === "priority") {
        formData[key] = EnumSaleOrderPriorityMap[data.priority as EnumSaleOrderPriority]
      }

      if (key === "attachmentFileId") {
        formData[key] = data.attachmentFileId
      }
    }
    tableData.value = data.details || []

    // 自定义字段处理
    if (data.customizedFields?.length) {
      customList.value = formatConfigDetail(data.customizedFields)
    }
  }
}
</script>

<style scoped lang="scss">
.sale-order-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: var(--g-color);
}

.detail-top {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.attachment-file {
  .tip {
    color: #a8abb2;
  }
}

.table-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px 20px 16px;

  .custom-detail-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
