<!-- 上传图片组件，支持自定义选中图片、删除 -->

<template>
  <el-upload
    class="upload-image-select"
    :class="{ 'hidden-upload': fileList.length >= props.limit, 'overflow-hidden': !props.isSelect }"
    v-model:file-list="fileList"
    accept=".jpeg,.png,.jpg,.bmp,.gif"
    list-type="picture-card"
    :http-request="onCustomUpload"
    :before-remove="onBeforeRemove"
    :on-exceed="onExceed"
    :on-preview="onPreview"
    :action="formatAction"
    :limit="props.limit"
    :multiple="props.multiple"
  >
    <el-icon class="avatar-uploader-icon"><Plus /></el-icon>

    <template #file="{ file }" v-if="props.isSelect">
      <div class="content">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
        <el-checkbox
          class="checkbox"
          v-model="file.selected"
          :value="file.url"
          @change="onCheckChange($event, file)"
          size="large"
        />
        <div class="delete-area">
          <span v-if="isFirstPhoto(file)">默认</span>
          <el-button v-else type="danger" icon="Delete" link @click="onDeleteClick(file)"
            >删除</el-button
          >
        </div>
      </div>
    </template>
  </el-upload>

  <el-image-viewer
    v-if="showImageViewer"
    :initial-index="previewIndex"
    :url-list="imageViewerUrlList"
    @close="showImageViewer = false"
  />
</template>

<script setup lang="ts">
import type { UploadFile, UploadRequestOptions, UploadUserFile } from "element-plus"
import { ElMessage } from "element-plus"

import { queryFileResourceDetail, uploadFile } from "@/api/fileResource"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import { formatImgUrlPreview } from "@/utils/common"
import { isModuleMockEnabled } from "@/utils/moduleMockEnv"

defineOptions({
  name: "UploadImage"
})

interface IProps {
  modelValue: IUploadPhoto[]
  action?: string // 上传地址
  limit?: number // 图片数量
  multiple?: boolean // 是否支持多图片上传
  isSelect?: boolean // 图片是否支持选中效果
}

interface IUploadUserFile extends UploadUserFile {
  selected?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  action: "/fileResource/upload",
  limit: 1, // 默认限制上传1个图片
  multiple: false,
  isSelect: false
})

const emit = defineEmits<{
  (e: "update:modelValue", value: IUploadPhoto[]): void
  (e: "success"): void
}>()

const modelFileList = ref<IUploadPhoto[]>([]) // 存储上传成功后的图片信息
const fileList = ref<IUploadUserFile[]>([]) // 上传组件展示的图片列表

const showImageViewer = ref(false)
const previewIndex = ref(-1)
const imageViewerUrlList = computed(() => {
  return fileList.value.map((item) => item.url)
})

/** 格式化后的action */
const formatAction = computed(() => {
  const envPreUrl = import.meta.env.VITE_API_BASE_URL
  return envPreUrl + props.action
})

watchEffect(() => {
  if (props.modelValue) {
    modelFileList.value = cloneDeep(props.modelValue)

    fileList.value = props.modelValue.map((item) => {
      return {
        name: item.fileName || "",
        url: item.fileUrl,
        selected: item.selected
      }
    })
  }
})

/** 判断是否为第一张图片 */
const isFirstPhoto = (file: IUploadUserFile) => {
  return fileList.value.findIndex((item) => item === file) === 0
}

/** 切换选中状态 */
const onCheckChange = (isChecked: boolean, file: IUploadUserFile) => {
  const targetIndex = fileList.value.findIndex((item) => item === file)

  // 默认最多选中一张图片
  fileList.value.forEach((item, index) => {
    if (targetIndex === index) {
      item.selected = isChecked
      modelFileList.value[index].selected = isChecked
    } else {
      item.selected = false
      modelFileList.value[index].selected = false
    }
  })
  emit("update:modelValue", cloneDeep(modelFileList.value))
}

/** 点击预览图片 */
const onPreview = (val: UploadFile) => {
  const index = fileList.value.findIndex((item) => item.uid === val.uid)
  previewIndex.value = index
  showImageViewer.value = true
}

/** 删除图片 */
const onDeleteClick = (file: IUploadUserFile) => {
  const index = fileList.value.findIndex((item) => item === file)
  fileList.value.splice(index, 1)
  modelFileList.value.splice(index, 1)
  emit("update:modelValue", cloneDeep(modelFileList.value))
}

/** 自定义上传 */
const onCustomUpload = async (options: UploadRequestOptions) => {
  const formData = new FormData()
  formData.append("files", options.file)
  const res = await uploadFile(formData)

  let fileUrl = ""
  if (isModuleMockEnabled()) {
    fileUrl = URL.createObjectURL(options.file)
  } else {
    // 通过文件上传之后返回的id获取文件资源信息
    const fileInfo = await queryFileResourceDetail(res[0])
    fileUrl = formatImgUrlPreview(fileInfo.path)
  }

  modelFileList.value.push({
    fileId: res[0],
    fileName: options.file.name,
    fileUrl,
    selected: modelFileList.value.length === 0 // 默认选中第一张图片
  })
  emit("update:modelValue", cloneDeep(modelFileList.value))
  emit("success")
}

/** 点击移除图片的钩子函数 */
const onBeforeRemove = (uploadFile: UploadFile) => {
  const index = fileList.value.findIndex((item) => item.uid === uploadFile.uid)
  modelFileList.value.splice(index, 1)
  emit("update:modelValue", cloneDeep(modelFileList.value))
  return false
}

/** 文件超出限制的钩子函数 */
const onExceed = (files: File[], uploadFiles: UploadUserFile[]) => {
  if (files.length + uploadFiles.length > props.limit) {
    ElMessage.warning(`最多只能上传${props.limit}个文件`)
  }
}

/** 获取选中图片的序号 */
const getSelectedIndex = () => {
  return modelFileList.value.findIndex((item) => item.selected)
}

defineExpose({
  getSelectedIndex
})
</script>

<style lang="scss" scoped>
.upload-image-select {
  &:deep(.el-upload-list__item) {
    overflow: visible;
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
  }

  &:deep(.el-upload) {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
  }

  &.overflow-hidden {
    &:deep(.el-upload-list__item) {
      overflow: hidden;
    }
  }
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
}

.checkbox {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;

  &:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;

    &::after {
      width: 5px;
      height: 12px;
      left: 5px;
      top: 0px;
    }
  }
}

.hidden-upload {
  &:deep(.el-upload) {
    display: none;
  }
}

.delete-area {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  height: 20px;
}
</style>
