<!-- 生产过程检 - 样本 -->
<template>
  <el-tabs v-model="activeName" @tab-click="handleClick" v-if="tabArr.length">
    <el-tab-pane v-for="(item, index) in tabArr" :key="index" :label="item" :name="item" />
  </el-tabs>
  <div class="table-box">
    <CustomTable v-model:tableData="tableData" :config="tableConfig">
      <template #imageUrls-default="{ row }">
        <el-button
          link
          type="primary"
          :disabled="!row.imageUrls?.length"
          @click="onPreviewImg(row.imageUrls, 1)"
          >查看</el-button
        >
      </template>

      <template #itemResult-default="{ row }">
        <div
          :class="[
            'choose-option',
            row.itemResult == 2 ? 'error-option' : '',
            row.itemResult == 1 ? 'success-option' : ''
          ]"
        >
          {{ itemResultType[row?.itemResult] || "未出" }}
        </div>
      </template>

      <template #remarkImageUrls-default="{ row }">
        <el-button
          link
          type="primary"
          :disabled="!row.remarkImageUrls"
          @click="onPreviewImg(row.remarkImageUrls, 2)"
          >查看</el-button
        >
      </template>
    </CustomTable>
  </div>
  <el-image-viewer v-if="showImageViewer" :url-list="imgUrlList" @close="showImageViewer = false" />
</template>
<script setup lang="ts">
import type { TabsPaneContext } from "element-plus"

import { queryProcessInspectSampleResultPanelDetail } from "@/api/quality/processInspect"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import type { IProcessInspectSampleItem as ITableRow } from "@/types/quality-manage/inspection-task"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

const itemResultType: Record<string, string> = {
  0: "未出",
  1: "OK",
  2: "NG"
}

const props = withDefaults(
  defineProps<{
    id: string
    tabArr: string[]
  }>(),
  {
    id: "",
    tabArr: () => []
  }
)

const imgUrlList = ref<string[]>()
const showImageViewer = ref(false)

const activeName = ref("样本1")
const listContent = ref<ITableRow[][]>([])

const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "inspectItemName",
      label: "检验项",
      minWidth: 160
    },
    {
      prop: "methodDesc",
      label: "方法要求",
      minWidth: 160
    },
    {
      prop: "inspectStandard",
      label: "检验标准",
      minWidth: 160
    },
    {
      prop: "imageUrls",
      label: "图片说明",
      width: 120,
      align: "center",
      slots: {
        default: "imageUrls-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "actualValue",
      label: "实测值",
      width: 120,
      formatter: (row: ITableRow) => {
        return row.actualValue !== null ? row.actualValue + row.unitName : ""
      }
    },
    {
      prop: "itemResult",
      label: "结果",
      width: 120,
      align: "center",
      slots: {
        default: "itemResult-default"
      }
    },
    {
      prop: "remarks",
      label: "备注说明",
      minWidth: 160
    },
    {
      prop: "remarkImageUrls",
      label: "备注图片",
      width: 120,
      align: "center",
      slots: {
        default: "remarkImageUrls-default"
      }
    }
  ]
})

/**
 * 图片预览
 * @param url 图片地址
 * @param type  1-单张；2-多张
 */
const onPreviewImg = (url: string | string[], type: number) => {
  if (!url) {
    return
  }
  if (type == 1) {
    if (Array.isArray(url)) {
      imgUrlList.value = url.map((item) => formatImgUrlPreview(item))
    } else {
      imgUrlList.value = [formatImgUrlPreview(url as string)]
    }
  } else if (type == 2) {
    let array = (url as string).split(",")
    imgUrlList.value = array.map((item) => formatImgUrlPreview(item))
  }
  showImageViewer.value = true
}

const handleClick = (tab: TabsPaneContext) => {
  const name = tab.props.name as string
  const index = Number(name.slice(2)) - 1
  tableData.value = listContent.value[index]
}

onMounted(async () => {
  listContent.value = []
  activeName.value = "样本1"

  const listData = await queryProcessInspectSampleResultPanelDetail({ taskId: props.id })
  listData?.map((itemTable) => {
    let singleTable: ITableRow[] = itemTable?.sampleItemDTOList?.map((item) => ({
      ...item,
      inspectStandard: typeNumberHandle(item)
    }))
    listContent.value.push(singleTable)
  })
  tableData.value = listContent.value.length > 0 ? listContent.value[0] : []
})
</script>

<style lang="scss" scoped>
.choose-option {
  width: 63px;
  height: 32px;
  background: #bbbbbb;
  border-radius: 4px 4px 4px 4px;
  text-align: center;
  font-size: 12px;
  font-family:
    PingFang SC-Bold,
    PingFang SC;
  font-weight: bold;
  line-height: 32px;
  margin: 0 auto;

  &.success-option {
    background: #f6ffed;
    border: 1px solid #d9f7be;
    color: #52c41a;
  }

  &.error-option {
    background: #fff1f0;
    border: 1px solid #ffccc7;
    color: #f5222d;
  }
}
</style>
