<template>
  <div class="layout-container">
    <div class="layout-header">
      <CustomTitle title="账号信息" style="margin: 0" />
    </div>

    <div class="layout-main-page">
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfig">
        <template #pass-suffix>
          <el-button link type="primary" size="small" @click="dialogVisible = true">修改</el-button>
        </template>
      </CustomForm>
    </div>

    <!-- 修改用户信息弹窗 -->
    <ModifyPassword v-model="dialogVisible" :user-id="id"></ModifyPassword>
  </div>
</template>

<script setup lang="ts">
import { queryUserInfoDetail } from "@/api/user"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useUserStore from "@/store/modules/user"
import type { IUserInfo } from "@/types/personal/account"

import ModifyPassword from "./components/ModifyPassword.vue"

defineOptions({
  name: "AccountManage"
})

const useUser = useUserStore()
const dialogVisible = ref(false)
const id = ref("")
const formData: IUserInfo = reactive({
  name: "",
  id: "",
  pass: "******", // 密码默认显示为******
  role: [],
  relatedName: "",
  relatedId: ""
})

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    field: "name",
    label: "用户名",
    props: {
      placeholder: "请输入用户名",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "id",
    label: "用户账号",
    props: {
      placeholder: "请输入用户账号",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "pass",
    label: "用户密码",
    props: {
      placeholder: "请输入用户密码",
      disabled: true
    },
    slots: {
      suffix: "pass-suffix"
    }
  },
  {
    componentType: "el-input",
    field: "role",
    label: "用户角色",
    props: {
      placeholder: "请输入用户角色",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "relatedName",
    label: "关联员工姓名",
    props: {
      placeholder: "请输入关联员工姓名",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "relatedId",
    label: "关联员工编号",
    props: {
      placeholder: "请输入关联员工编号",
      disabled: true
    }
  }
])

/** 获取当前登录用户信息 */
const getUserInfo = async () => {
  const name = useUser.name
  if (name) {
    const {
      nickname,
      username,
      roleList,
      empName,
      empNo,
      id: userId
    } = await queryUserInfoDetail({ username: name })
    formData.name = nickname
    formData.id = username
    formData.role = roleList.map((item) => item.roleName)
    formData.relatedName = empName || ""
    formData.relatedId = empNo || ""
    id.value = userId
  }
}
getUserInfo()
</script>

<style scoped lang="scss">
.layout-header {
  padding: 20px 30px;
  border-bottom: 2px solid #e2e2e2;
}

.layout-main-page {
  flex: 1;
  overflow: hidden;
  align-items: center;
  padding-top: 60px;

  :deep(.el-form-item__content) {
    width: 400px;
  }
}
</style>
