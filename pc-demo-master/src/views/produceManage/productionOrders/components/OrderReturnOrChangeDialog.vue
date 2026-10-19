<template>
  <CustomDialog v-model="dialogVisible" :title="dialogTitle" size="large" @close="emit('close')">
    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button type="primary" size="small" link @click="onReviewAuditClick(row)"
          >查看评审记录</el-button
        >
      </template>
    </CustomTable>
  </CustomDialog>

  <AuditRecordDialog
    v-if="auditRecordVisible"
    :ids="clickReviewTaskIds"
    @close="auditRecordVisible = false"
  />
</template>

<script setup lang="ts">
import { requestProductionOrderReturnOrChangeInfo } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import { EnumProductionOrderType } from "@/constant/enums"
import type { IProductionOrderReturnItem } from "@/types/production-manage/product-order"

import AuditRecordDialog from "./AuditRecordDialog.vue"

interface IProps {
  id: string
  processId: string
  type: EnumProductionOrderType
}

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "close"): void
}>()

const dialogVisible = ref(true)
const tableData = ref<IProductionOrderReturnItem[]>([])
const auditRecordVisible = ref(false) // 评审记录弹窗显示标识
const clickReviewTaskIds = ref<string[]>([]) // 点击查看评审记录按钮时，需要传递的任务id数组

const dialogTitle = computed(() => {
  const titleList: Record<number, string> = {
    [EnumProductionOrderType.REPAIR]: "订单返工情况",
    [EnumProductionOrderType.REMODEL]: "订单改制情况"
  }
  return titleList[props.type]
})
const orderType = computed(() => (props.type === EnumProductionOrderType.REPAIR ? "返工" : "改制"))
const tableConfig = ref({
  height: 500,
  columns: [
    {
      prop: "processSerial",
      label: "原订单工序",
      minWidth: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "productModelName",
      get label() {
        return `需${orderType.value}产品名称`
      },
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "totalAmount",
      get label() {
        return `需${orderType.value}总数`
      },
      width: 120,
      align: "right"
    },
    {
      prop: "didAmount",
      get label() {
        return `已${orderType.value}总数`
      },
      width: 120,
      align: "right"
    },
    {
      prop: "undoAmount",
      get label() {
        return `剩余可${orderType.value}数量`
      },
      width: 160,
      align: "right"
    },
    {
      prop: "suggestionAmount",
      label: "建议订单数量",
      width: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  getTableData()
})

/** 获取订单返工情况 / 订单改制表格数据 */
const getTableData = async () => {
  let params = {
    orderId: props.id,
    type: props.type,
    processId: props.processId
  }
  const { items } = await requestProductionOrderReturnOrChangeInfo(params)
  tableData.value = items || []
}

/** 查看评审记录 */
const onReviewAuditClick = (row: IProductionOrderReturnItem) => {
  auditRecordVisible.value = true
  clickReviewTaskIds.value = row.reviewTaskId || []
}
</script>

<style lang="scss" scoped></style>
