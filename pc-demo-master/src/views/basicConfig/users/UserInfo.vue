<template>
  <CustomDialog v-model="visible" title="用户信息" @close="onCloseCallback">
    <CustomForm ref="customFormRef" v-model="form" :configs="formConfigs">
      <template #password-suffix>
        <el-button link type="primary" size="small" @click="dialogVisible = true">修改</el-button>
      </template>
    </CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">保存</el-button>
      </span>
    </template>

    <!-- 修改密码弹窗 -->
    <ModifyPassword v-model="dialogVisible" :user-id="userId" />

    <!-- 关联员工弹窗 -->
    <RelateEmployee ref="relateRef" @select-name="onSelectUser" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryRoleList } from "@/api/role"
import { requestUpdateUser } from "@/api/user"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"
import type { IUserInfoCreateForm, IUserInfoListItem, IUserRoleInfo } from "@/types/base-info/user"
import ModifyPassword from "@/views/personal/components/ModifyPassword.vue"

import RelateEmployee from "./components/RelateEmployee.vue"

const [form, resetFormContent] = useResetRef<IUserInfoCreateForm>({
  nickname: "",
  username: "",
  password: "",
  role: [],
  relatedEmId: "",
  relatedEmName: "",
  relatedEmNo: ""
})

const emits = defineEmits<{
  (e: "on-submit"): void
}>()

const relateRef = ref<InstanceType<typeof RelateEmployee>>()

const visible = ref(false)
const dialogVisible = ref(false)
const userId = ref("")
const roleList = ref<IUserRoleInfo[]>([])
const isExistRelative = ref(false) // 是否已经过关联人员

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "用户名",
    field: "nickname",
    rules: [
      {
        required: true,
        message: "请输入用户名",
        trigger: "blur"
      },
      {
        min: 2,
        max: 10,
        message: "长度在2到10个字符之间",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入用户名"
    }
  },
  {
    componentType: "el-input",
    label: "用户账号",
    field: "username",
    props: {
      type: "text",
      placeholder: "请输入用户账号",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "用户密码",
    field: "password",
    props: {
      type: "text",
      placeholder: "******",
      disabled: true
    },
    slots: {
      suffix: "password-suffix"
    }
  },
  {
    componentType: "el-select",
    label: "用户角色",
    field: "role",
    rules: [
      {
        required: true,
        message: "请至少选择一个角色",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择用户角色",
      multiple: true,
      customChildren: roleList.value.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.roleName, value: item.roleCode }
        }
      })
    }
  },
  {
    componentType: "el-input",
    label: "关联员工姓名",
    field: "relatedEmName",
    props: {
      type: "text",
      placeholder: !form.value.relatedEmId ? "未关联, 点击选择" : "",
      readonly: true,
      get disabled() {
        return form.value.relatedEmId && isExistRelative.value
      }
    },
    events: {
      click: () => {
        relateRef.value?.setVisible(true)
      }
    }
  },
  {
    componentType: "el-input",
    label: "关联员工编号",
    field: "relatedEmNo",
    props: {
      type: "text",
      placeholder: !form.value.relatedEmId ? "未关联, 点击选择" : "",
      readonly: true,
      get disabled() {
        return form.value.relatedEmId && isExistRelative.value
      }
    },
    events: {
      click: () => {
        relateRef.value?.setVisible(true)
      }
    }
  }
])

/** 弹窗显示设置 */
const setVisible = async (value: boolean, selectedData: IUserInfoListItem) => {
  visible.value = value
  form.value.nickname = selectedData.nickname
  form.value.username = selectedData.username
  form.value.role = selectedData.roleId
  form.value.relatedEmId = selectedData.empId
  form.value.relatedEmNo = selectedData.empNo
  form.value.relatedEmName = selectedData.empName
  userId.value = selectedData.id
  isExistRelative.value = !!form.value.relatedEmId

  if (value) {
    const data = await queryRoleList()
    roleList.value = data
  }
}

/** 选择员工关联名称回调 */
const onSelectUser = (name: string, no: string, id: string) => {
  form.value.relatedEmName = name
  form.value.relatedEmNo = no
  form.value.relatedEmId = id
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  await requestUpdateUser({
    id: userId.value,
    nickname: form.value.nickname,
    username: form.value.username,
    roleCodeList: form.value.role,
    empId: form.value.relatedEmId || undefined
  })
  ElMessage({
    message: "编辑成功",
    type: "success"
  })
  emits("on-submit")
  visible.value = false
}

/** 关闭弹窗回调 */
const onCloseCallback = () => {
  customFormRef.value?.resetForm()
  resetFormContent()
}

/** 弹窗取消操作 */
const onCancelClick = () => {
  onCloseCallback()
  visible.value = false
}

defineExpose({
  setVisible
})
</script>
