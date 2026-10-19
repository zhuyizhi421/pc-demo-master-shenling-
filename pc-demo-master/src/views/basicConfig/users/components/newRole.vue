<template>
  <CustomDialog v-model="visible" title="新建角色" @close="onClose()">
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
        <el-button type="danger" link size="small" @click="onRemoveRow($index)">删除</el-button>
      </template>
    </CustomTable>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">确定</el-button>
      </span>
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

import { requestCreateRole } from "@/api/role"
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

const [formData, resetFormData] = useResetRef({ name: "", desc: "" })

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "角色名称",
    field: "name",
    rules: [
      { required: true, message: "请输入角色名称", trigger: "blur" },
      { min: 3, max: 20, message: "长度应该在3-20个字符", trigger: "blur" }
    ],
    props: {
      type: "text",
      placeholder: "请输入角色名称"
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "desc",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const emits = defineEmits<{
  (e: "on-success"): void
}>()

const visible = ref(false)

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

/** 弹窗显示设置 */
const setVisible = async (value: boolean) => {
  visible.value = value
}

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

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  let params = {
    name: formData.value.name,
    remark: formData.value.desc,
    userIds: selectedUserIds.value
  }
  await requestCreateRole(params)
  ElMessage({
    message: "创建成功",
    type: "success"
  })
  emits("on-success")
  visible.value = false
}

/** 取消操作 */
const onCancelClick = () => {
  customFormRef.value?.resetForm()
  resetFormData()
  visible.value = false
}

/** 弹窗关闭回调 */
const onClose = () => {
  customFormRef.value?.resetForm()
  resetFormData()
}

defineExpose({
  setVisible
})
</script>

<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
