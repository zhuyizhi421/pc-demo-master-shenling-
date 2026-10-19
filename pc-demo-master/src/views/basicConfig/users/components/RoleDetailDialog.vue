<template>
  <CustomDialog v-model="dialogVisible" title="详情" width="600" draggable>
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

    <CustomTitle title="关联用户" style="margin-top: 0">
      <div>
        <el-button type="primary" @click="selectUserVisible = true">选择用户</el-button>
      </div>
    </CustomTitle>
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ $index }">
        <el-button
          type="danger"
          link
          size="small"
          @click="onRemoveRow($index)"
          :disabled="isAdmin && customTableData.length === 1"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm()">保存</el-button>
      </div>
    </template>

    <!-- 选择用户弹窗 -->
    <SelectUserDialog
      v-model="selectUserVisible"
      :selected-row-keys="selectedUserIds"
      multiple
      @success="onSelectUserSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryRoleDetail, requestUpdateRoleInfo } from "@/api/role"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectUserDialog from "@/components/SelectUserDialog/index.vue"
import useResetRef from "@/hooks/useResetRef"
import type { IUserInfo } from "@/types/base-info/user"

interface ITableRow {
  id: string
  nickname: string
  username: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    isAdmin: boolean // 编辑详情信息是否是管理员
    id: string
  }>(),
  {
    isAdmin: false
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", visible: boolean): void
  (e: "success"): void
}>()

const [formData, resetFormData] = useResetRef<{
  roleName: string
  remark: string
}>({ roleName: "", remark: "" })

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "角色名称",
    field: "roleName",
    rules: [
      { required: true, message: "请输入角色名称", trigger: "blur" },
      { min: 3, max: 20, message: "长度应该在3-20个字符", trigger: "blur" }
    ],
    props: {
      type: "text",
      placeholder: "请输入角色名称",
      get disabled() {
        return props.isAdmin
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true,
      get disabled() {
        return props.isAdmin
      }
    }
  }
])

const selectUserVisible = ref(false)
const selectedUserIds = computed(() => customTableData.value.map((item) => item.id))

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "300px",
  reserveSelection: true,
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 65,
      align: "center",
      type: "index"
    },
    { prop: "nickname", label: "用户名称", minWidth: 160 },
    { prop: "username", label: "用户账号", minWidth: 160 },
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

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit("update:modelValue", value)
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      getRoleDetail()
    } else {
      resetFormData()
      customFormRef.value?.resetForm()
    }
  }
)

/** 删除行操作 */
const onRemoveRow = (rowIndex: number) => {
  customTableData.value.splice(rowIndex, 1)
}

/** 选择用户成功回调 */
const onSelectUserSuccess = (data: IUserInfo[]) => {
  customTableData.value = data.map((item) => ({
    id: item.id,
    nickname: item.nickname,
    username: item.username
  }))
}

/**
 * 获取角色详情
 */
const getRoleDetail = async () => {
  const data = await queryRoleDetail(props.id)
  if (!data) {
    return
  }

  formData.value.roleName = data.roleName
  formData.value.remark = data.remark
  customTableData.value = data.userList
}

/**
 * 确认保存
 */
const onConfirm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let params = {
    id: props.id,
    name: formData.value.roleName,
    remark: formData.value.remark,
    userIds: selectedUserIds.value
  }
  await requestUpdateRoleInfo(params)
  ElMessage.success("保存成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
