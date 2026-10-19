<template>
  <CustomDialog
    v-model="dialogVisible"
    :title="isCreate ? '新建下级文档类型' : '编辑文档类型'"
    @close="emit('close')"
  >
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :label-width="140"
      :configs="formConfigs"
    />

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onSubmitCreateDirClick">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryFileDirectoryDetail, updateFileDirectory } from "@/api/directory"
import { requestFlowDefinitionList } from "@/api/flowable"
import { queryRoleList } from "@/api/role"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { IUserRoleInfo } from "@/types/base-info/user"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"

const props = withDefaults(
  defineProps<{
    id: string
    directoryName: string
    type: number
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

type DirectoryFormData = {
  id: string
  directoryName: string
  parentId: string
  parentDirectoryName: string
  processDefineId: string
  remarks: string
  cancellationProcessDefineId: string
  reviseProcessDefineId: string
  uploadPermissionRoleCodes: string[]
  revisePermissionRoleCodes: string[]
  cancelPermissionRoleCodes: string[]
}

const createDefaultFormData = (): DirectoryFormData => ({
  id: "",
  directoryName: "",
  parentId: "",
  parentDirectoryName: props.type === 1 ? props.directoryName : "",
  processDefineId: "",
  remarks: "",
  cancellationProcessDefineId: "",
  reviseProcessDefineId: "",
  uploadPermissionRoleCodes: [],
  revisePermissionRoleCodes: [],
  cancelPermissionRoleCodes: []
})

const dialogVisible = ref(true)
const formData = reactive<DirectoryFormData>(createDefaultFormData())
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const flowList = ref<IFlowableDefinitionItem[]>([])
const roleList = ref<IUserRoleInfo[]>([])

const isCreate = computed(() => props.type === 1)

const roleOptions = computed(() =>
  roleList.value.map((item) => ({
    componentType: "el-option",
    props: { label: item.roleName, value: item.roleCode }
  }))
)

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "上级文档类型名称",
    field: "parentDirectoryName",
    rules: [
      {
        required: true,
        message: "请输入上级文档类型名称",
        trigger: "blur"
      }
    ],
    get hidden() {
      return !isCreate.value
    },
    props: {
      type: "text",
      placeholder: "请输入上级文档类型名称",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    get label() {
      return isCreate.value ? "新建文档类型名称" : "文档类型名称"
    },
    field: "directoryName",
    rules: [
      {
        required: true,
        message: "请输入文档类型名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入文档类型名称"
    }
  },
  {
    componentType: "el-select",
    label: "文档上传流程",
    field: "processDefineId",
    props: {
      placeholder: "请选择文档上传流程",
      clearable: true,
      get customChildren() {
        return flowList.value.map((item) => ({
          componentType: "el-option",
          props: { label: item.name, value: item.flowKey }
        }))
      }
    }
  },
  {
    componentType: "el-select",
    label: "上传权限",
    field: "uploadPermissionRoleCodes",
    props: {
      placeholder: "请选择可上传该类型文档的角色，留空则默认所有角色可上传",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      clearable: true,
      filterable: true,
      style: {
        width: "100%"
      },
      get customChildren() {
        return roleOptions.value
      }
    }
  },
  {
    componentType: "el-select",
    label: "修订权限",
    field: "revisePermissionRoleCodes",
    props: {
      placeholder: "请选择可修订该类型文档的角色，留空则默认所有角色可修订",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      clearable: true,
      filterable: true,
      style: {
        width: "100%"
      },
      get customChildren() {
        return roleOptions.value
      }
    }
  },
  {
    componentType: "el-select",
    label: "作废权限",
    field: "cancelPermissionRoleCodes",
    props: {
      placeholder: "请选择可作废该类型文档的角色，留空则默认所有角色可作废",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      clearable: true,
      filterable: true,
      style: {
        width: "100%"
      },
      get customChildren() {
        return roleOptions.value
      }
    }
  },
  {
    componentType: "el-select",
    label: "文档修订流程",
    field: "reviseProcessDefineId",
    props: {
      placeholder: "请选择文档修订流程",
      clearable: true,
      get customChildren() {
        return flowList.value.map((item) => ({
          componentType: "el-option",
          props: { label: item.name, value: item.flowKey }
        }))
      }
    }
  },
  {
    componentType: "el-select",
    label: "文档作废流程",
    field: "cancellationProcessDefineId",
    props: {
      placeholder: "请选择文档作废流程",
      clearable: true,
      get customChildren() {
        return flowList.value.map((item) => ({
          componentType: "el-option",
          props: { label: item.name, value: item.flowKey }
        }))
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

onBeforeMount(() => {
  getRoleOptions()
  getFlowDefineOptions()
  if (!isCreate.value) {
    getDocumentTypeDetail()
  }
})

const getRoleOptions = async () => {
  roleList.value = await queryRoleList()
}

const getFlowDefineOptions = async () => {
  flowList.value = await requestFlowDefinitionList()
}

const getDocumentTypeDetail = async () => {
  const data = await queryFileDirectoryDetail({ id: props.id })
  if (!data) return

  formData.id = String(data.id || "")
  formData.directoryName = data.directoryName || ""
  formData.parentId = String(data.parentId || "")
  formData.parentDirectoryName = data.parentDirectoryName || ""
  formData.processDefineId = data.processDefineId || ""
  formData.remarks = data.remarks || ""
  formData.cancellationProcessDefineId = data.cancellationProcessDefineId || ""
  formData.reviseProcessDefineId = data.reviseProcessDefineId || ""
  formData.uploadPermissionRoleCodes = Array.isArray(data.uploadPermissionRoleCodes)
    ? data.uploadPermissionRoleCodes
    : []
  formData.revisePermissionRoleCodes = Array.isArray(data.revisePermissionRoleCodes)
    ? data.revisePermissionRoleCodes
    : []
  formData.cancelPermissionRoleCodes = Array.isArray(data.cancelPermissionRoleCodes)
    ? data.cancelPermissionRoleCodes
    : []
}

const onSubmitCreateDirClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const idField = isCreate.value ? "parentId" : "id"
  await updateFileDirectory({
    [idField]: isCreate.value ? props.id : formData.id,
    directoryName: formData.directoryName,
    remarks: formData.remarks,
    processDefineId: formData.processDefineId,
    parentDirectoryName: formData.parentDirectoryName,
    cancellationProcessDefineId: formData.cancellationProcessDefineId,
    reviseProcessDefineId: formData.reviseProcessDefineId,
    uploadPermissionRoleCodes: formData.uploadPermissionRoleCodes,
    revisePermissionRoleCodes: formData.revisePermissionRoleCodes,
    cancelPermissionRoleCodes: formData.cancelPermissionRoleCodes
  })
  ElMessage.success(isCreate.value ? "新建成功" : "编辑成功")
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped></style>
