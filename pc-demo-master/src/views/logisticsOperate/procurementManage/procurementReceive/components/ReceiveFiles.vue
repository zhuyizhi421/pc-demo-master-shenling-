<!-- 委外收货 - 附件 -->
<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    :config="tableConfig"
    :queryConfig="queryConfig"
  >
    <template #operation-default="{ row }">
      <el-button type="primary" link @click="onPreviewClick(row)">预览</el-button>
      <el-button type="primary" link @click="onDownloadClick(row)">下载</el-button>
    </template>
  </CustomTable>

  <el-image-viewer v-if="showImageViewer" :url-list="imgUrlList" @close="showImageViewer = false" />
</template>
<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { requestPurchaseReceiveAttachment } from "@/api/logistics/purchase-manage/parchaseReceive"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { LogisticsPurchaseReceiveAttachment as ITableRow } from "@/types/logistics/purchaseReceive"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

const imgUrlList = ref<string[]>()
const showImageViewer = ref<boolean>(false)

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
      prop: "sourceName",
      label: "附件",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.sourceName + "." + row.extension
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[{ id: string }], ITableRow, false> = {
  api: requestPurchaseReceiveAttachment,
  getParams: () => {
    return [
      {
        id: props.id
      }
    ]
  }
}

/** 预览图片 */
const onPreviewClick = (row: ITableRow) => {
  imgUrlList.value = [formatImgUrlPreview(row.path)]
  showImageViewer.value = true
}

/** 下载图片 */
const onDownloadClick = (row: ITableRow) => {
  fileDownloadHandle(row.path)
}

onMounted(() => {
  tableRef.value?.requestData()
})

defineExpose({
  getAttachFiles: () => {
    tableRef.value?.requestData()
  }
})
</script>

<style lang="scss" scoped></style>
