<template>
  <CustomTable
    ref="tableRef"
    :table-data="recordTableData"
    :config="recordTableConfigs"
    height="200"
  >
    <template #source-slot="{ row }">
      {{ EnumProductionOrderSourceMap[row.source as EnumProductionOrderSource] }}
    </template>
    <template #status-slot="{ row }">
      {{ row.status === 1 ? "已复核" : "未复核" }}
    </template>
    <template #deliveryDate-slot="{ row }">
      {{ row.deliveryDate || "/" }}
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestReAddRecordListByProductionOrder } from "@/api/scheduling"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import { EnumProductionOrderSource, EnumProductionOrderSourceMap } from "@/constant/enums"
import type { IReAddRecordListItem } from "@/types/production-manage/product-order"

const props = withDefaults(defineProps<{ id: string }>(), {})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const recordTableData = ref<IReAddRecordListItem[]>([]) // 追加记录表格数据
const recordTableConfigs = computed<ITableConfig>(() => {
  return {
    height: 200,
    stripe: true,
    columns: [
      {
        prop: "source",
        label: "来源",
        width: 90,
        align: "center",
        showOverflowTooltip: true,
        slots: {
          default: "source-slot"
        }
      },
      {
        prop: "status",
        label: "状态",
        width: 90,
        align: "center",
        showOverflowTooltip: true,
        slots: {
          default: "status-slot"
        }
      },
      {
        prop: "productModelName",
        label: "产品名称",
        minWidth: 160,
        showOverflowTooltip: true
      },
      {
        prop: "productModelSpec",
        label: "产品规格",
        minWidth: 160,
        formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
      },
      {
        prop: "productModelCode",
        label: "产品编号",
        minWidth: 160,
        showOverflowTooltip: true
      },
      {
        prop: "orderAmount",
        label: "订单数量",
        width: 120,
        align: "right",
        showOverflowTooltip: true
      },
      {
        prop: "addAmount",
        label: "追加数量",
        width: 120,
        align: "right",
        showOverflowTooltip: true
      },
      {
        prop: "unitName",
        label: "单位",
        width: 90,
        align: "center",
        showOverflowTooltip: true
      },
      {
        prop: "deliveryDate",
        label: "交货日期",
        width: 100,
        align: "center",
        showOverflowTooltip: true,
        slots: {
          default: "deliveryDate-slot"
        }
      },
      {
        prop: "createTime",
        label: "创建日期",
        width: 160,
        align: "center",
        showOverflowTooltip: true
      },
      {
        prop: "remark",
        label: "备注",
        width: 200,
        showOverflowTooltip: true
      }
    ]
  }
})

onMounted(() => {
  getReAddRecordList(props.id)
})

/** 获取生产订单对应追加记录信息 */
const getReAddRecordList = async (id: string) => {
  tableRef.value?.setLoading(true)
  const data = await requestReAddRecordListByProductionOrder({ id })
  recordTableData.value = data || []
  tableRef.value?.setLoading(false)
}
</script>

<style lang="scss" scoped></style>
