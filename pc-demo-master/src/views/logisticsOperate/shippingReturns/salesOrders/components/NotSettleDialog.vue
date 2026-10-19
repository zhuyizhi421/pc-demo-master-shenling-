<template>
  <CustomDialog v-model="dialogVisible" title="提示" size="medium" @close="emit('close')">
    <div class="tip">以下发货计划未结案，销售订单无法进行结案。</div>
    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig"></CustomTable>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('close')">取消</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import type { ISettleDeliveryPlan } from "@/types/logistics/saleOrder"

interface IProps {
  data: ISettleDeliveryPlan[]
}

const props = withDefaults(defineProps<IProps>(), {})

const emit = defineEmits<{
  (e: "close"): void
  (e: "update:data", val: ISettleDeliveryPlan[]): void
}>()

const tableData = computed({
  get: () => props.data,
  set: (val) => emit("update:data", val)
})

const tableConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "taskNo",
      label: "计划单号",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 90,
      align: "center",
      formatter: ({ status }) => (status ? "已结案" : "未结案")
    },
    {
      prop: "deliveryTime",
      label: "发货日期",
      width: 160
    }
  ]
})

const dialogVisible = ref(true)
</script>

<style lang="scss" scoped>
.tip {
  font-size: 14px;
  color: #a8abb2;
  margin-bottom: 12px;
}
</style>
