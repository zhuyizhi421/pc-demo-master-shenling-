<!-- 生产过程检 - 附件 -->
<template>
  <div class="operation-list">
    <UploadFile
      v-model="imageList"
      accept=".jpeg,.png,.jpg,.bmp,.gif"
      :limit="5"
      multiple
      :show-tip="false"
      :show-file-list="false"
      @success="handleSuccess"
      style="margin: 0 0 16px 0"
    >
      <el-button icon="Upload">上传附件</el-button>
    </UploadFile>
  </div>
  <div class="table-box">
    <CustomTable
      ref="tableRef"
      v-model:tableData="tableData"
      :config="tableConfig"
      :queryConfig="queryConfig"
    >
      <template #operation-default="{ row }">
        <el-button
          link
          type="primary"
          :disabled="!row.attachmentUrl"
          @click="onPreviewImg(row.attachmentUrl)"
          >查看</el-button
        >
      </template>
    </CustomTable>
  </div>
  <el-image-viewer v-if="showImageViewer" :url-list="imgUrlList" @close="showImageViewer = false" />
</template>
<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryProcessInspectAttachmentList,
  uploadAttachmentFile
} from "@/api/quality/processInspect"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import UploadFile from "@/components/UploadFile/index.vue"
import type { IFile } from "@/types/base-info/implement-config"
import type { AttachmentModel as ITableRow } from "@/types/quality-manage/inspection-task"
import { formatImgUrlPreview } from "@/utils/common"

type IAttachmentParams = {
  taskId: string
}

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

const imageList = ref<IFile[]>([])
const imgUrlList = ref<string[]>()
const showImageViewer = ref(false)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "attachmentName",
      label: "图片名称",
      minWidth: 160
    },
    {
      prop: "uploadTime",
      label: "上传时间",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IAttachmentParams], ITableRow, false> = {
  api: queryProcessInspectAttachmentList,
  getParams: () => {
    return [
      {
        taskId: props.id
      }
    ]
  }
}

/**
 * 图片预览
 * @param url 图片地址
 */
const onPreviewImg = (url: string | string[]) => {
  if (!url) {
    return
  }
  if (Array.isArray(url)) {
    imgUrlList.value = url.map((item) => formatImgUrlPreview(item))
  } else {
    imgUrlList.value = [formatImgUrlPreview(url as string)]
  }
  showImageViewer.value = true
}

const handleSuccess = async () => {
  let params = {
    fileIds: imageList.value.map((item) => item.fileId),
    taskId: props.id
  }
  await uploadAttachmentFile(params)
  ElMessage.success("上传成功")
  tableRef.value?.requestData()
}

onMounted(async () => {
  await tableRef.value?.requestData()
  imageList.value =
    tableData.value.map((item) => ({
      fileName: item.attachmentName,
      fileId: item.id,
      fileUrl: formatImgUrlPreview(item.attachmentUrl)
    })) || []
})
</script>

<style lang="scss" scoped>
.operation-list {
  display: flex;
  justify-content: flex-end;
}
</style>
