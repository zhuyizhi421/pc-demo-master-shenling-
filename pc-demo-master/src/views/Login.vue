<template>
  <div class="login" :style="{ backgroundImage: `url('${systemStyleForm.backgroundImgUrl}')` }">
    <div class="login-left relative flex-1">
      <el-image
        style="height: 48px; left: 6.7%; top: 7.8%"
        :src="systemStyleForm.logoImgUrl"
        fit="fill"
      />
      <div class="login-left-title">
        <div>{{ systemStyleForm.companyName }}</div>
        <div>{{ systemStyleForm.systemName }}</div>
      </div>
      <div class="el-login-footer">
        <a target="_blank" href="https://www.wingoht.com/">copyright© 浙江文谷科技有限公司 出品</a>
      </div>
    </div>
    <div class="flex items-center justify-center login-right">
      <div class="login-right-container">
        <div class="login-right-title">欢迎登录</div>
        <CustomForm
          class="login-form"
          ref="customFormRef"
          v-model="loginForm"
          :label-width="0"
          :configs="formConfigs"
        >
          <template #tenantId-prefix>
            <el-image style="width: 20px; height: 20px" :src="TenantIcon" />
          </template>

          <template #username-prefix>
            <el-image style="width: 20px; height: 20px" :src="UserIcon" />
          </template>

          <template #password-prefix>
            <el-image style="width: 20px; height: 20px" :src="LockIcon" />
          </template>
        </CustomForm>
        <el-checkbox v-model="loginForm.rememberMe" style="margin: -8px 0px 30px 0px">
          <span class="text-[16px] text-[#444] font-bold">记住密码</span>
        </el-checkbox>
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width: 100%; height: 48px; border-radius: 10px; font-size: 16px; font-weight: 500"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"
import Cookies from "js-cookie"

import { querySystemStyleGlobalConfigDetail } from "@/api/globalConfig"
import LockIcon from "@/assets/icon/lock.png"
import TenantIcon from "@/assets/icon/tenant.png"
import UserIcon from "@/assets/icon/user.png"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useSystemStore from "@/store/modules/system"
import useUserStore from "@/store/modules/user"
import type { TenantInfoVO } from "@/types/base-info/user"
import { formatImgUrlPreview } from "@/utils/common"
import { decrypt, encrypt } from "@/utils/jsencrypt"

defineOptions({
  name: "LoginPage"
})

const projectName = import.meta.env.VITE_PRODUCT_NAME
const USER_NAME = projectName + "-username"
const TENANT_ID = projectName + "-tenantId"
const PASSWORD = projectName + "-password"
const REMEMBER_ME = projectName + "-rememberMe"

const systemStore = useSystemStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const loginForm = ref({
  username: "",
  password: "",
  rememberMe: true,
  tenantId: "" // 组织id
})
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "",
    field: "tenantId",
    props: {
      placeholder: "请选择登录组织",
      popperClass: "login-select-popper",
      clearable: false,
      customChildren: tenantList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.id
        }
      }))
    },
    slots: {
      prefix: "tenantId-prefix"
    },
    events: {
      change: ($event: string) => onChangeTenant($event)
    },
    rules: [{ required: true, trigger: "change", message: "请选择组织" }]
  },
  {
    componentType: "el-input",
    label: "",
    field: "username",
    props: {
      placeholder: "请输入账号",
      autoComplete: "off",
      clearable: false
    },
    slots: {
      prefix: "username-prefix"
    },
    rules: [{ required: true, trigger: "blur", message: "请输入您的账号" }]
  },
  {
    componentType: "el-input",
    label: "",
    field: "password",
    props: {
      placeholder: "请输入密码",
      type: "password",
      autoComplete: "off",
      showPassword: true,
      clearable: false
    },
    slots: {
      prefix: "password-prefix"
    },
    events: {
      keyup: (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          handleLogin()
        }
      }
    },
    rules: [{ required: true, trigger: "blur", message: "请输入您的密码" }]
  }
])

const loading = ref(false)
// 注册开关
const redirect = ref("")

const systemStyleForm = reactive({
  companyName: "",
  systemName: "",
  logoImgUrl: "",
  backgroundImgUrl: ""
})

const tenantList = ref<TenantInfoVO[]>([])

onBeforeMount(async () => {
  getCookie()

  /** 获取租户列表 */
  await userStore.getTenantList()
  tenantList.value = userStore.tenantList

  if (!loginForm.value.tenantId) {
    loginForm.value.tenantId = tenantList.value[0].id
  }

  getSystemStyleConfigInfo()
})

watch(
  route,
  (newRoute) => {
    redirect.value = (newRoute.query && newRoute.query.redirect) as string
  },
  { immediate: true }
)

const handleLogin = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  loading.value = true
  Cookies.set(USER_NAME, loginForm.value.username, { expires: 30 })
  Cookies.set(TENANT_ID, loginForm.value.tenantId, {
    expires: 30
  })

  // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
  if (loginForm.value.rememberMe) {
    Cookies.set(PASSWORD, encrypt(loginForm.value.password) || "", { expires: 30 })
    Cookies.set(REMEMBER_ME, String(loginForm.value.rememberMe), { expires: 30 })
  } else {
    // 否则移除
    Cookies.remove(USER_NAME)
    Cookies.remove(PASSWORD)
    Cookies.remove(REMEMBER_ME)
  }
  // 调用action的登录方法
  userStore
    .login(loginForm.value)
    .then(() => {
      ElMessage.success("登录成功")
      router.push({ path: redirect.value || "/" })
    })
    .catch(() => {
      loading.value = false
    })
}

const getCookie = () => {
  const username = Cookies.get(USER_NAME)
  const password = Cookies.get(PASSWORD)
  const rememberMe = Cookies.get(REMEMBER_ME)
  const tenantId = Cookies.get(TENANT_ID)
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password) || "",
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    tenantId: tenantId === undefined ? loginForm.value.tenantId : tenantId
  }
}

/** 获取系统样式配置信息 */
const getSystemStyleConfigInfo = async () => {
  const data = systemStore.systemInfo

  if (data) {
    const loginBackgroundList = Array.isArray(data.loginBackgroundList)
      ? data.loginBackgroundList
      : []
    const logoFileList = Array.isArray(data.logoFileList) ? data.logoFileList : []
    systemStyleForm.companyName = data.companyName
    systemStyleForm.systemName = data.systemName
    systemStyleForm.backgroundImgUrl = formatImgUrlPreview(
      loginBackgroundList.find((item) => item.isSelected)?.imageUrl || ""
    )
    systemStyleForm.logoImgUrl = formatImgUrlPreview(
      logoFileList.find((item) => item.isSelected)?.imageUrl || ""
    )
  }
}

/**
 * 切换用户组织
 */
const onChangeTenant = async (val: string) => {
  userStore.tenantInfo = userStore.tenantList.find((item) => item.id === val)

  const data = await querySystemStyleGlobalConfigDetail()
  if (data) {
    await systemStore.setSystemInfo(data)
    getSystemStyleConfigInfo()
  }
}
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: row;
  height: 100%;
  background-size: cover;

  &-left {
    &-title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      font-family:
        Microsoft YaHei UI-Regular,
        Microsoft YaHei UI;

      & > div:first-child {
        font-size: 24px;
        font-weight: 400;
        color: #ffffff;
        line-height: 36px;
      }

      & > div:nth-child(2) {
        font-size: 44px;
        font-weight: 400;
        color: #ffffff;
        line-height: 48px;
      }
    }
  }

  &-right {
    width: 31.25vw;
    min-width: 240px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  position: absolute;
  bottom: 48px;
  width: 100%;
  font-weight: 500;
  opacity: 0.6;
  text-align: center;
  color: #e0effe;
  font-family: Arial;
  font-size: 14px;
  font-family:
    PingFang SC-Medium,
    PingFang SC;
  letter-spacing: 1px;
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}
.login-right-container {
  width: 80%;
  max-width: 420px;
  border-radius: 40px;
  padding: 30px 35px 45px;
  background: linear-gradient(109deg, #c4c4c455 1.57%, #c4c4c422);
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);

  .login-right-title {
    font-size: 28px;
    font-family: Poppins-Bold, Poppins;
    font-weight: bold;
    color: #444;
    line-height: 48px;
    margin-bottom: 20px;
  }
  .login-form {
    width: 100%;

    &:deep(.el-form) {
      grid-template-columns: 1fr !important;
    }
    &:deep(.el-form-item__label) {
      padding: 0;
    }
    &:deep(.el-form-item__error) {
      left: 16px;
    }
    &:deep(.el-form-item.is-required) {
      .el-form-item__label:before {
        display: none;
      }
    }

    &:deep(.el-input) {
      .el-input__wrapper {
        border-radius: 10px;
        height: 56px;
        font-size: 14px;
        background-color: #ffffffaa;
        backdrop-filter: blur(30px);
        box-shadow: none;

        .el-input__password {
          color: #a8abb2;
        }
      }

      input {
        &::placeholder {
          color: #666;
        }
      }
    }

    &:deep(.el-input .el-input__password) {
      font-size: 20px;
    }

    &:deep(.el-select) {
      &::placeholder {
        color: #666;
      }
      .el-select__prefix {
        width: 24px;
      }
      .el-select__wrapper {
        height: 56px;
        border-radius: 10px;
        // background: linear-gradient(109deg, #c9c9c9aa 1.57%, #c4c4c411);
        // -webkit-backdrop-filter: blur(30px);
        background-color: #ffffffaa;
        backdrop-filter: blur(30px);
        box-shadow: none;

        .el-select__placeholder {
          color: #303133;
        }
        .el-select__caret {
          color: #a8abb2;
        }
      }
    }

    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 0px;
    }
  }
}
</style>

<style lang="scss">
.login-select-popper {
  .el-select-dropdown {
    // background: linear-gradient(109deg, #c9c9c9aa 1.57%, #c4c4c411);
    // -webkit-backdrop-filter: blur(30px);
    background-color: #ffffffaa;
    backdrop-filter: blur(30px);
  }
}
</style>
