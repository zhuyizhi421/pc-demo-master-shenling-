<template>
  <CustomDialog v-model="visible" title="新建用户" @close="onClose()">
    <CustomForm ref="customFormRef" v-model="form" :configs="formConfigs"></CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">保存</el-button>
      </span>
    </template>

    <!-- 员工关联弹窗 -->
    <RelateEmployee ref="relateRef" @select-name="onSelectUser"></RelateEmployee>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryRoleList } from "@/api/role"
import { requestCreateUser } from "@/api/user"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"
import type { IUserInfoCreateForm, IUserRoleInfo } from "@/types/base-info/user"
import { validatePassword } from "@/utils/validate"

import RelateEmployee from "./RelateEmployee.vue"

const relateRef = ref<InstanceType<typeof RelateEmployee>>()

const visible = ref(false)
const roleList = ref<IUserRoleInfo[]>([])

const emits = defineEmits<{
  (e: "on-submit"): void
}>()

const [form, resetFormContent] = useResetRef<IUserInfoCreateForm>({
  nickname: "",
  username: "",
  password: "",
  role: [],
  relatedEmId: "",
  relatedEmName: "",
  relatedEmNo: ""
})

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
    rules: [
      {
        required: true,
        message: "请输入用户账号",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入用户账号"
    }
  },
  {
    componentType: "el-input",
    label: "用户密码",
    field: "password",
    rules: [
      {
        required: true,
        validator: (_, value, callback) => {
          if (!value) {
            callback(new Error("请输入密码"))
          }
          if (!validatePassword(value)) {
            callback(new Error("6~15位数字、大小写字母、特殊字符 -_./!"))
          }
          callback()
        },
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入用户密码"
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
      placeholder: "未关联, 点击选择",
      readonly: true
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
      placeholder: "未关联, 点击选择",
      readonly: true
    },
    events: {
      click: () => {
        relateRef.value?.setVisible(true)
      }
    }
  }
])

/** 显示弹窗 */
const setVisible = async (value: boolean) => {
  visible.value = value
  value && getRoleList()
}

/** 获取角色列表 */
const getRoleList = async () => {
  const data = await queryRoleList()
  roleList.value = data
}

/** 选择员工关联名称回调 */
const onSelectUser = (name: string, no: string, id: string) => {
  form.value.relatedEmName = name
  form.value.relatedEmNo = no
  form.value.relatedEmId = id
}

/** 关闭弹窗回调 */
const onClose = () => {
  customFormRef.value?.resetForm()
  resetFormContent()
}

/** 弹窗取消操作 */
const onCancelClick = () => {
  onClose()
  visible.value = false
}

/** 提交表单 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  await requestCreateUser({
    nickname: form.value.nickname,
    username: form.value.username,
    password: form.value.password,
    roleCodeList: form.value.role,
    empId: form.value.relatedEmId || undefined
  })
  visible.value = false
  ElMessage({
    message: "创建成功",
    type: "success"
  })
  emits("on-submit")
}

defineExpose({
  setVisible
})
</script>

<style scoped lang="scss"></style>
