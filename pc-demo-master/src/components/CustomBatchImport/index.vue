<template>
  <div>
    <!-- 批量导入统一组件 -->
    <el-dialog v-model="showDialog" title="批量导入" width="600">
      <div class="flex h-[180px] justify-center">
        <div class="flex flex-col items-center justify-start flex-1">
          <div class="title-1">1.下载数据模板，填写导入数据</div>
          <el-icon class="mt-[32px] mb-[32px]" size="48" color="#409eff">
            <Tickets />
          </el-icon>
          <DownloadButton
            :url="templatePath"
            plain
            :method="POST_TEMPLATE_LIST.includes(templatePath as any) ? 'post' : 'get'"
          >
            下载模板
          </DownloadButton>
        </div>
        <el-divider direction="vertical" class="h-[70%]" />

        <div class="flex flex-col items-center justify-start flex-1">
          <div class="title-1">2.上传填好的文件</div>
          <el-icon class="mt-[32px] mb-[32px]" size="48" color="#409eff">
            <Document />
          </el-icon>
          <div class="mb-[12px] mt-[-28px] text-[12px]">仅支持xls,xlsx格式文件</div>
          <el-upload :show-file-list="false" accept=".xls,.xlsx" :http-request="uploadFileHandle">
            <el-button icon="Upload" type="primary">上传文件</el-button>
          </el-upload>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="showResult" title="批量导入结果" width="400" @close="resetImport">
      <div class="title-1 mb-[12px]">
        {{ importResult.message }}
      </div>
      <template #footer>
        <DownloadButton
          v-if="!importResult.importSuccess"
          :url="failPath"
          :params="{
            filePath: importResult.failFilePath
          }"
        >
          下载导入失败的记录
        </DownloadButton>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import axios from "axios"
import { ElMessage, type UploadRequestOptions } from "element-plus"

import type { IRes } from "@/api/interceptor"
import DownloadButton from "@/components/DownloadButton/index.vue"
import useResetRef from "@/hooks/useResetRef"

import { EnumImportPathType, EnumTemplatePathType, type ImportResult } from "./hooks"

defineOptions({
  name: "BatchImportDialog"
})

const POST_TEMPLATE_LIST = [
  EnumTemplatePathType.EQUMENT_MODEL,
  EnumTemplatePathType.EQUMENT_MODEL_CONFIG,
  EnumTemplatePathType.EQUMENT_INST,
  EnumTemplatePathType.MRO_MODEL,
  EnumTemplatePathType.VEHICLE
] as const

const showDialog = ref(false)
const showResult = ref(false)
const [importResult, resetImport] = useResetRef<ImportResult>({
  failCount: 0,
  failFilePath: "",
  importSuccess: false,
  message: "",
  successCount: 0,
  totalCount: 0
})

const props = defineProps<{
  templatePath: EnumTemplatePathType // 下载模板的路径
  failPath: string // 下载失败记录的路径
  importPath: EnumImportPathType // 上传文件的路径
}>()

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const uploadFile = async (data: FormData) => {
  const res = await axios.post<IRes<ImportResult>>(props.importPath, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return res.data.data
}

const uploadFileHandle = async (options: UploadRequestOptions) => {
  try {
    const ins = ElMessage.success("导入中，请稍后...")
    const formData = new FormData()
    formData.append("file", options.file)
    const res = await uploadFile(formData)
    ins.close()
    if (res) {
      importResult.value = res
      showResult.value = true
      res.importSuccess && emits("onOk")
    }
  } catch (error) {
    /* empty */
  }
}

defineExpose({
  setShow: (show: boolean) => {
    showDialog.value = show
  }
})
</script>

<style scoped lang="scss">
:deep(.el-divider) {
  top: 50%;
  transform: translateY(-50%);
}
</style>
