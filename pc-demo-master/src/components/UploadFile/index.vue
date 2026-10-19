<!-- 文件上传组件 -->
<template>
  <el-upload
    class="upload-file"
    v-model:file-list="uploadFileList"
    :http-request="onCustomUpload"
    :accept="formatAccept"
    :action="formatAction"
    :before-upload="onBeforeUpload"
    :on-exceed="onExceed"
    :before-remove="onBeforeRemove"
    :limit="props.limit"
    :multiple="props.multiple"
    :show-file-list="props.showFileList"
  >
    <slot name="default">
      <el-button icon="Upload">上传文件</el-button>
    </slot>
    <template #tip>
      <slot name="tip">
        <div v-if="props.showTip" class="el-upload__tip">
          支持格式： {{ props.accept
          }}<span v-if="props.limit">，最多上传{{ props.limit }}个文件</span
          ><span v-if="props.size">，单个文件不超过 {{ props.size }}{{ props.unit }}</span
          >。
        </div>
      </slot>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ElMessage, type UploadRequestOptions, type UploadUserFile } from "element-plus"

import { uploadFile } from "@/api/fileResource"
import { EnumFileMIMETypeMap, EnumFileSize, EnumFileSizeMap } from "@/constant/enums"
import type { IFile } from "@/types/base-info/implement-config"

defineOptions({
  name: "UploadFile"
})

interface IProps {
  modelValue: IFile[] // 上传的文件列表
  accept?: string // 文件类型
  action?: string // 上传地址
  limit?: number // 文件数量
  size?: number // 单个文件允许的大小
  unit?: EnumFileSize // 文件大小的单位
  multiple?: boolean // 是否支持多文件上传
  showTip?: boolean // 是否显示提示信息
  showFileList?: boolean // 是否显示文件列表
}

const props = withDefaults(defineProps<IProps>(), {
  action: "/fileResource/upload",
  limit: 1, // 默认限制上传1个文件
  unit: EnumFileSize.MB,
  multiple: false,
  showTip: true,
  showFileList: true
})

const emit = defineEmits<{
  (event: "update:modelValue", value: IFile[]): void
  (e: "success", value: IFile[], fileId: string): void
}>()

const uploadFileList = ref<UploadUserFile[]>([]) // 上传的文件列表
const modelFileList = ref<IFile[]>([]) // 上传成功后的文件列表，传递给外部

/** 格式化accept，若accept不传，则默认可上传任意文件 */
const formatAccept = computed(() => {
  if (props.accept) {
    const accept = props.accept?.split(",")
    return accept?.map((item) => EnumFileMIMETypeMap[item])?.join(",")
  }
  return ""
})

/** 格式化后的action */
const formatAction = computed(() => {
  const envPreUrl = import.meta.env.VITE_API_BASE_URL
  return envPreUrl + props.action
})

watchEffect(() => {
  if (props.modelValue) {
    modelFileList.value = cloneDeep(props.modelValue)
    uploadFileList.value = props.modelValue?.map((item) => {
      return {
        name: item.fileName,
        uid: +item.fileId
      }
    })
  }
})

/** 文件上传前的钩子函数 */
const onBeforeUpload = (file: File) => {
  const fileType = file.type

  // 校验文件类型
  if (formatAccept.value && !formatAccept.value.includes(fileType)) {
    const target = Object.entries(EnumFileMIMETypeMap).find((item) => item[1] === fileType)
    ElMessage.warning(`不支持上传${target?.[0]}格式的文件`)
    return false
  }

  // 限制文件上传大小
  if (props.size) {
    let fileSize = 0
    if (props.unit === EnumFileSize.KB) {
      fileSize = file.size / EnumFileSizeMap[EnumFileSize.KB]
    } else if (props.unit === EnumFileSize.MB) {
      fileSize = file.size / EnumFileSizeMap[EnumFileSize.MB]
    } else if (props.unit === EnumFileSize.GB) {
      fileSize = file.size / EnumFileSizeMap[EnumFileSize.GB]
    } else if (props.unit === EnumFileSize.TB) {
      fileSize = file.size / EnumFileSizeMap[EnumFileSize.TB]
    }
    if (fileSize > props.size) {
      ElMessage.warning(`单个文件不超过${props.size}${props.unit}`)
      return false
    }
  }
}

/** 文件超出限制的钩子函数 */
const onExceed = (files: File[], uploadFiles: UploadUserFile[]) => {
  if (files.length + uploadFiles.length > props.limit) {
    ElMessage.warning(`最多只能上传${props.limit}个文件`)
  }
}

/** 文件移除前的钩子函数 */
const onBeforeRemove = (uploadFile: UploadUserFile, uploadFiles: UploadUserFile[]) => {
  let index = uploadFiles.findIndex((item) => item === uploadFile)
  modelFileList.value.splice(index, 1)
  // 延迟更新modelValue后，组件更新，与上传组件内部的remove方法冲突，先执行remove操作，再更新modelValue
  nextTick(() => {
    emit("update:modelValue", modelFileList.value)
  })
}

/** 自定义文件上传 */
const onCustomUpload = async (options: UploadRequestOptions) => {
  const formData = new FormData()
  formData.append("files", options.file)
  const res = await uploadFile(formData)
  modelFileList.value.push({
    fileId: res[0],
    fileName: options.file.name,
    size: options.file.size
  })
  emit("update:modelValue", modelFileList.value)
  emit("success", modelFileList.value, res[0])
}
</script>

<style lang="scss" scoped>
.upload-file {
  display: flex;
  flex-wrap: wrap;

  .el-upload__tip {
    font-size: 13px;
    color: var(--g-shadow-color);
    margin: 0 0 0 8px;
  }

  &:deep(.el-upload-list) {
    width: 100%;
  }
}
</style>
