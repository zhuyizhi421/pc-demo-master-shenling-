<template>
  <CustomDialog v-model="visible" :title="isDetail ? '岗位信息' : isEdit ? '编辑查看' : '新建岗位'">
    <template v-if="isDetail">
      <CustomDescription
        :data="formData"
        :configs="detailConfig"
        style="padding: 0"
      ></CustomDescription>
    </template>
    <template v-else>
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>
    </template>
    <template #footer v-if="!isDetail">
      <span class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button type="primary" @click="onSubmitForm()">保存</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestFlowDefinitionList } from "@/api/flowable"
import { getCreateJobs, getUpdateJobs, queryJobDetail } from "@/api/job"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"

interface applyProcess {
  procDefName?: string
  procInsId?: string
  taskId?: string
  taskName?: string
}

const emit = defineEmits<{
  (e: "success"): void
}>()

const visible = ref(false)
const isEdit = ref(false)
const isDetail = ref(false)

const formData = reactive({
  id: "",
  name: "",
  applyProcess: "",
  unfrozenProcess: ""
})

// 流程定义列表
const flowOptions = ref<applyProcess[]>([])

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "name",
    label: "岗位名称："
  },
  {
    field: "applyProcess",
    label: "上岗证申请流程：",
    formatter: ({ data: { applyProcess } }) => {
      return flowOptions.value.find((item) => item.procInsId === applyProcess)?.procDefName
    }
  },
  {
    field: "unfrozenProcess",
    label: "上岗证解冻流程：",
    formatter: ({ data: { unfrozenProcess } }) => {
      return flowOptions.value.find((item) => item.procInsId === unfrozenProcess)?.procDefName
    }
  }
])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "岗位名称",
    field: "name",
    rules: [
      {
        required: true,
        message: "岗位名称不能为空",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入岗位名称"
    }
  },
  {
    componentType: "el-select",
    label: "上岗证申请流程",
    field: "applyProcess",
    rules: [
      {
        required: true,
        message: "上岗证申请流程不能为空",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择上岗证申请流程",
      filterable: true,
      get customChildren() {
        return flowOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.procDefName, value: item.procInsId }
          }
        })
      }
    }
  },
  {
    componentType: "el-select",
    label: "上岗证解冻流程",
    field: "unfrozenProcess",
    rules: [
      {
        required: true,
        message: "上岗证解冻流程不能为空",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择上岗证解冻流程",
      filterable: true,
      get customChildren() {
        return flowOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.procDefName, value: item.procInsId }
          }
        })
      }
    }
  }
])

/** 设置弹窗状态 */
const setVisible = async (
  value: boolean,
  editStatus: boolean,
  id: string,
  detailStatus?: boolean
) => {
  // 获取流程定义列表
  if (value) {
    const data = await requestFlowDefinitionList()
    flowOptions.value = data.map((item) => ({
      procDefName: item.name,
      procInsId: item.flowKey
    }))
  }

  visible.value = value
  isEdit.value = editStatus
  detailStatus ? (isDetail.value = detailStatus) : false

  // 获取岗位详情信息
  if (id) {
    const {
      id: jobId,
      jobName,
      licenseApplyProcessId,
      licenseUnfreezeProcessId
    } = await queryJobDetail({
      id
    })
    formData.id = jobId
    formData.name = jobName
    formData.applyProcess = licenseApplyProcessId
    formData.unfrozenProcess = licenseUnfreezeProcessId
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.id = ""
  formData.name = ""
  formData.applyProcess = ""
  formData.unfrozenProcess = ""
  customFormRef.value?.resetForm()
}

/** 提交操作 */
const onSubmitForm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let fn = isEdit.value ? getUpdateJobs : getCreateJobs
  let params = {
    id: isEdit.value ? formData.id : "",
    jobName: formData.name,
    licenseApplyProcessId: formData.applyProcess,
    licenseUnfreezeProcessId: formData.unfrozenProcess
  }
  await fn(params)
  ElMessage.success(isEdit.value ? "编辑成功" : "新建成功")
  visible.value = false
  resetForm()
  emit("success")
}

/** 取消操作 */
const onCancel = () => {
  resetForm()
  visible.value = false
}

defineExpose({
  setVisible
})
</script>
