<!-- 委外退料 - 委外退料清单 -->
<template>
  <CustomTable ref="tableRef" v-model:tableData="tableData" :config="tableConfig">
    <template #operation-default="{ row }">
      <el-button type="primary" link @click="onViewOutRecordClick(row.productModelId)"
        >入库记录</el-button
      >
    </template>
  </CustomTable>
</template>
<script setup lang="ts">
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import type { IDelegateMaterialReturnAddItem } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    originList: IDelegateMaterialReturnAddItem[]
  }>(),
  {
    originList: () => []
  }
)

const emit = defineEmits<{
  (e: "update:originList", value: IDelegateMaterialReturnAddItem[]): void
  (e: "onViewOutRecordClick", value: string): void
}>()

const tableData = computed({
  get: () => props.originList,
  set: (val: IDelegateMaterialReturnAddItem[]) => emit("update:originList", val)
})

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      minWidth: 160
    },
    {
      prop: "returnAmount",
      label: "退料数量",
      width: 120,
      align: "right",
      formatter: ({ returnAmount, decimalNumber }) => {
        return precisionConversion(returnAmount, decimalNumber)
      }
    },
    {
      prop: "inboundAmount",
      label: "入库数量",
      width: 120,
      align: "right",
      formatter: ({ inboundAmount, decimalNumber }) => {
        return precisionConversion(inboundAmount, decimalNumber)
      }
    },
    {
      prop: "outboundAmount",
      label: "出库数量",
      width: 120,
      align: "right",
      formatter: ({ outboundAmount, decimalNumber }) => {
        return precisionConversion(outboundAmount, decimalNumber)
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "delegateOrderNo",
      label: "关联委外订单",
      minWidth: 160
    },
    {
      prop: "operation",
      width: 120,
      fixed: "right",
      label: "",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

/** 点击查看入库记录 */
const onViewOutRecordClick = (productModelId?: string) => {
  emit("onViewOutRecordClick", productModelId || "")
}
</script>

<style lang="scss" scoped></style>
