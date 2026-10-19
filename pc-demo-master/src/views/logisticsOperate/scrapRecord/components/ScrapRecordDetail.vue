<template>
  <div class="scrap-record">
    <div class="base-info">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info-order">
        <span>报废单号：{{ detailInfo.no }}</span>
      </div>
      <CustomDescription
        :data="detailInfo"
        :configs="detailConfig"
        :label-width="100"
        style="padding: 0"
      >
        <template #attachmentId-content>
          <template v-if="detailInfo.attachmentId">
            <el-button type="primary" link @click="showImageViewer = true">预览</el-button>
          </template>
        </template>
      </CustomDescription>
    </div>
    <div class="product-detail">
      <CustomTitle title="产品明细" :is-table-title="false" show-short-bar />
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      ></CustomTable>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>

    <el-image-viewer
      v-if="showImageViewer"
      :url-list="imgUrlList"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { queryScrapRecordDetail } from "@/api/logistics/scrapRecord"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IScrapRecordItem } from "@/types/logistics/scrapRecord"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const imgUrlList = ref<string[]>()
const showImageViewer = ref(false)

const detailInfo = ref<Partial<IScrapRecordItem>>({})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "标签号：",
    field: "vehicleBarcodes"
  },
  {
    label: "报废时间：",
    field: "createTime"
  },
  {
    label: "登记人：",
    field: "reportUserName",
    formatter: ({ data: { reportUser } }) => {
      return reportUser?.name
    }
  },
  {
    label: "附件：",
    field: "attachmentId",
    slots: {
      content: "attachmentId-content"
    }
  },
  {
    label: "备注：",
    field: "remarks",
    colspan: -1
  }
])

const customTableData = ref<IScrapRecordItem["productList"]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
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
      prop: "defaultQuantity",
      label: "报废数量",
      minWidth: 160
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      width: 120,
      align: "center"
    }
  ]
})

onBeforeMount(() => {
  getScrapRecordDetail()
})

/** 获取报废记录详情 */
const getScrapRecordDetail = async () => {
  const data = await queryScrapRecordDetail(props.id)
  detailInfo.value = data
  customTableData.value = data.productList

  imgUrlList.value = data.attachmentUrl?.split(",")?.map((url) => formatImgUrlPreview(url))
}
</script>

<style lang="scss" scoped>
.scrap-record {
  flex: 1;
  color: #303133;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  height: 100%;
}

.base-info {
  font-size: 16px;
  padding-bottom: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;

  .base-info-order {
    font-weight: bold;
    margin-bottom: 12px;
  }
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 12px 20px 16px;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}

.footer-operation {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
