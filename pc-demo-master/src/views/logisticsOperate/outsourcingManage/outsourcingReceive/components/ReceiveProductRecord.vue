<!-- 委外收货 - 产品记录 -->
<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    :config="tableConfig"
    :queryConfig="queryConfig"
  ></CustomTable>
</template>
<script setup lang="ts">
import { queryOutsourcingReceiveDetail } from "@/api/logistics/outsourcingReceive"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { ReveiveItems as ITableRow } from "@/types/logistics/outsourcingReceive"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

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
      prop: "quantity",
      label: "收货数量",
      width: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    }
  ]
})
const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: queryOutsourcingReceiveDetail,
  getParams: () => {
    return [props.id]
  }
}

onMounted(() => {
  tableRef.value?.requestData()
})
</script>

<style lang="scss" scoped></style>
