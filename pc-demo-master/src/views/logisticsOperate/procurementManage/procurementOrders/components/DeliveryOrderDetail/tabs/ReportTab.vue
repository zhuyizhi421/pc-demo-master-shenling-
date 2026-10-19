<template>
  <CustomTable
    ref="customTableRef"
    v-model:table-data="customTableData"
    :config="tableConfig"
    :query-config="queryConfig"
  >
    <template #review-default="{ row }">
      <el-button type="primary" link size="small" @click="fileDownloadHandleSupplier(row.fileId)"
        >下载</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { querySupplierDeliveryReportList } from "@/api/baseInfo/supplier-platform/supplier-platform"
import { fileDownloadHandleSupplier } from "@/api/fileResource"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  ISupplierDeliveryData,
  ISupplierDeliveryOrderReportItem as ITableRow,
  ISupplierDeliveryOrderReportParams
} from "@/types/base-info/supplier-platform"

const props = withDefaults(
  defineProps<{
    data: ISupplierDeliveryData
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      type: "index",
      prop: "index",
      label: "序号",
      align: "center",
      width: 60
    },
    {
      prop: "fileName",
      label: "文件名称",
      minWidth: 160
    },
    {
      prop: "sendOrderNo",
      label: "送货单",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "uploadTime",
      label: "上传时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "review",
      label: "操作",
      minWidth: 90,
      align: "center",
      slots: {
        default: "review-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[ISupplierDeliveryOrderReportParams], ITableRow, false> = {
  api: querySupplierDeliveryReportList,
  getParams: () => {
    const { sendOrderNo, supplierId } = props.data
    return [
      {
        sendOrderNo,
        supplierId
      }
    ]
  }
}

onMounted(() => {
  customTableRef.value?.requestData()
})
</script>

<style lang="scss" scoped></style>
