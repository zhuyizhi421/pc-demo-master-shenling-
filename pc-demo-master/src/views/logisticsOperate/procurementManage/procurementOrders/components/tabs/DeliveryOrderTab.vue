<template>
  <CustomTitle title="送货单" style="margin-top: 0px"></CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="onReview(row)">查看</el-button>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { querySupplierDeliveryPageList } from "@/api/baseInfo/supplier-platform/supplier-platform"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  ISupplierDeliveryData,
  ISupplierDeliveryOrderItem as ITableRow,
  ISupplierDeliveryOrderPageParams
} from "@/types/base-info/supplier-platform"

defineOptions({
  name: "DeliveryOrderTab"
})

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

const { review } = inject<{
  review: (params: ISupplierDeliveryData) => void
}>("deliveryOrderDetail", {
  review: () => {}
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      type: "index",
      prop: "index",
      label: "序号",
      width: 60,
      align: "center",
      fixed: "left"
    },
    {
      prop: "sendOrderNo",
      label: "送货单号",
      minWidth: 160
    },
    {
      prop: "productContent",
      label: "送货内容",
      minWidth: 300
    },
    {
      prop: "sendTime",
      label: "送货日期",
      width: 120,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
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
      width: 60,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[ISupplierDeliveryOrderPageParams], ITableRow, false> = {
  api: querySupplierDeliveryPageList,
  getParams: () => {
    return [
      {
        orderNo: props.id,
        orderType: 1
      }
    ]
  }
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

/** 查看 */
const onReview = (row: ITableRow) => {
  review({
    sendOrderNo: row.sendOrderNo,
    orderNo: row.orderNo,
    orderType: row.orderType,
    supplierId: row.supplierId
  })
}
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
