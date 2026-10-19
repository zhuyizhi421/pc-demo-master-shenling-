<template>
  <div class="attachment-tab">
    <div class="operation-row">
      <UploadFile
        v-model="fileList"
        accept=".jpeg,.png,.jpg,.bmp,.gif"
        :limit="5"
        :show-tip="false"
        :show-file-list="false"
        @success="uploadSuccess"
      >
        <el-button icon="Upload" plain>上传附件</el-button>
      </UploadFile>
    </div>
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      :query-config="queryConfig"
    >
      <template #operation-default="{ row }">
        <el-button type="primary" link size="small" @click="onPreview(row)">查看</el-button>
      </template>
    </CustomTable>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="imgUrlList"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup lang="ts">
import {
  queryMroInspectionTaskAttachmentList,
  requestUploadMroInspectionTaskAttachment
} from "@/api/operation/mro/mro-verify-task"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import UploadFile from "@/components/UploadFile/index.vue"
import type { IFile } from "@/types/base-info/implement-config"
import type { IMroVerifyTaskAttachmentInfo as ITableRow } from "@/types/maintain/mro-manage/mro-verify-task"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    mroVerifyTaskId: string
  }>(),
  {}
)

const fileList = ref<IFile[]>([]) // 附件信息
const showImageViewer = ref(false)
const imgUrlList = ref<string[]>([])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "fileName",
      label: "文件名称",
      minWidth: 160
    },
    {
      prop: "uploadTime",
      label: "上传时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: queryMroInspectionTaskAttachmentList,
  getParams: () => {
    return [props.mroVerifyTaskId]
  }
}

onMounted(() => {
  getAttachmentList()
})

/** 获取附件列表 */
const getAttachmentList = async () => {
  await customTableRef.value?.requestData()
  const rows = Array.isArray(customTableData.value) ? customTableData.value : []
  fileList.value =
    rows.map((item) => ({
      fileName: item.fileName,
      fileId: item.fileId,
      fileUrl: formatImgUrlPreview(item.path),
      size: Number(item.size || 0)
    })) || []
}

/** 文件上传成功回调 */
const uploadSuccess = async (fileList: IFile[], fileId: string) => {
  let params = {
    fileId: fileId,
    inspectionTaskId: props.mroVerifyTaskId
  }
  await requestUploadMroInspectionTaskAttachment(params)
  getAttachmentList()
}

/** 查看附件 */
const onPreview = (row: ITableRow) => {
  showImageViewer.value = true
  imgUrlList.value = [formatImgUrlPreview(row.path)]
}
</script>

<style lang="scss" scoped>
.attachment-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .operation-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  &:deep(.custom-table) {
    flex: 1;
    overflow: hidden;
  }
}
</style>
