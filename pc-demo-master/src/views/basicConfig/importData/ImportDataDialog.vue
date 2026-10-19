<template>
  <CustomDialog v-model="dialogVisible" size="medium" title="导入数据">
    <el-steps class="steps" :active="activeStep" align-center>
      <el-step title="选择作业项目" />
      <el-step title="执行导入" />
    </el-steps>

    <div class="project-wrap" v-if="activeStep === 1">
      <el-tabs
        class="project-tab"
        type="border-card"
        v-for="(item, index) in projectList"
        :key="index"
      >
        <el-tab-pane v-for="tab in item" :key="tab.taskType" :label="tab.taskTypeName">
          <div
            class="tab-item"
            v-for="tabItem in tab.importTaskItemTypeConfigList"
            :key="tabItem.taskItem"
            :class="{ checked: tabItem.taskItemName === curCheckInfo.taskItemTypeName }"
            @click="onCheck(tab, tabItem)"
          >
            <el-icon class="select-icon" size="20"><SuccessFilled /></el-icon>
            <el-icon class="file-icon" size="30"><Document /></el-icon>
            <div>{{ tabItem.taskItemName }}</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="import-wrap" v-if="activeStep === 2">
      <div class="rows">
        <div>当前作业项：{{ curCheckInfo.taskItemTypeName }}</div>
        <el-button type="primary" plain icon="download" @click="onDownloadTemplate()"
          >下载导入模板</el-button
        >
      </div>
      <div class="rows operation">
        <div class="label">上传导入文件：</div>
        <UploadFile v-model="uploadFileList" accept=".xls,.xlsx" :show-tip="false" :limit="1">
          <el-button type="primary" plain icon="upload">上传文件</el-button>
        </UploadFile>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-if="activeStep === 2" type="primary" @click="activeStep--">上一步</el-button>
      <el-button
        v-if="activeStep === 1"
        type="primary"
        @click="activeStep++"
        :disabled="!curCheckInfo.taskItemType"
        >下一步</el-button
      >
      <el-button v-if="activeStep === 2" type="primary" v-preventReClick="onConfirm"
        >确认导入</el-button
      >
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  requestCreateImportTask,
  requestDownloadImportTemplate,
  requestImportDataTaskType
} from "@/api/baseInfo/import-data/import-data"
import CustomDialog from "@/components/CustomDialog/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import type { IImportDataTaskTypeItem } from "@/types/base-info/import-data"

type IUploadFile = {
  fileId: string
  fileName: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const activeStep = ref(1)
const projectList = ref<IImportDataTaskTypeItem[][]>([])
const curCheckInfo = ref({
  taskType: "",
  taskTypeName: "",
  taskItemType: "",
  taskItemTypeName: ""
})
const uploadFileList = ref<IUploadFile[]>([]) // 已上传的文件列表

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getProjectList()
    } else {
      activeStep.value = 1
      uploadFileList.value = []
      curCheckInfo.value = {
        taskType: "",
        taskTypeName: "",
        taskItemType: "",
        taskItemTypeName: ""
      }
    }
  }
)

/** 获取项目类型列表 */
const getProjectList = async () => {
  const data = await requestImportDataTaskType()
  if (!data?.length) {
    return
  }

  // 数据处理
  const map: Map<number, IImportDataTaskTypeItem[]> = new Map()

  data.forEach((item) => {
    if (map.has(item.row)) {
      map.get(item.row)!.push(item)
    } else {
      map.set(item.row, [item])
    }
  })
  projectList.value = [...map.entries()].sort((a, b) => a[0] - b[0]).map((item) => item[1])
}

/** 点击项目 */
const onCheck = (
  parentTab: IImportDataTaskTypeItem,
  tabItem: IImportDataTaskTypeItem["importTaskItemTypeConfigList"][number]
) => {
  curCheckInfo.value = {
    taskType: parentTab.taskType,
    taskTypeName: parentTab.taskTypeName,
    taskItemType: tabItem.taskItem,
    taskItemTypeName: tabItem.taskItemName
  }
}

/** 下载导入模板 */
const onDownloadTemplate = async () => {
  const res = await requestDownloadImportTemplate({
    taskType: curCheckInfo.value.taskType,
    taskItem: curCheckInfo.value.taskItemType
  })
  const dispositionHeader = res.headers["content-disposition"]
  const fileNameMatch = dispositionHeader.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*)/i)
  let fileName = fileNameMatch && fileNameMatch[1]
  if (fileName) {
    fileName = decodeURIComponent(fileName)
    const a = document.createElement("a")
    a.href = URL.createObjectURL(res.data)
    a.style.display = "none"
    document.body.appendChild(a)
    a.download = fileName
    a.click()
    document.body.removeChild(a)
  }
}

/** 确认操作 */
const onConfirm = async () => {
  if (!curCheckInfo.value.taskItemType) {
    return ElMessage.warning("请选择作业项目")
  }

  if (uploadFileList.value.length === 0) {
    return ElMessage.warning("请上传导入文件")
  }

  const params = {
    fileId: uploadFileList.value[0].fileId,
    taskType: curCheckInfo.value.taskType,
    taskTypeName: curCheckInfo.value.taskTypeName,
    taskItem: curCheckInfo.value.taskItemType,
    taskItemName: curCheckInfo.value.taskItemTypeName
  }
  await requestCreateImportTask(params)
  ElMessage.success("创建成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped>
.steps {
  margin: 10px 0;

  &:deep(.el-step__icon) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  &:deep(.el-step__line) {
    top: 20px;
  }
}

.project-wrap {
  max-height: 600px;
  overflow-y: auto;

  &:deep(.project-tab) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-tab-pane {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tab-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 208px;
      height: 50px;
      border: 1px solid #ccc;
      padding: 0 20px;
      background-color: #fafafa;
      cursor: pointer;
      position: relative;

      .select-icon {
        position: absolute;
        right: 2px;
        top: 2px;
        z-index: 10;
        display: none;
      }

      .file-icon {
        margin-right: 10px;
      }

      &.checked {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);

        .select-icon {
          display: block;
        }
      }
    }
  }
}

.import-wrap {
  padding: 20px 40px;

  .rows {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    &.operation {
      justify-content: flex-start;
      align-items: flex-start;

      .label {
        margin-top: 5px;
      }
    }
  }
}
</style>
