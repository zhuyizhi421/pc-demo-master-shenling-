<!-- 系统样式配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      ref="systemFormRef"
      v-model="systemStyleForm"
      :configs="systemStyleFormConfigs"
      label-position="right"
      :label-width="220"
      :columns="2"
    >
    </CustomForm>
  </div>
  <div class="footer">
    <el-button v-if="!!buttonAuth" type="primary" @click="onSaveClick()">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  querySystemStyleGlobalConfigDetail,
  requestUpdateSystemStyleGlobalConfig
} from "@/api/globalConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import UploadImage from "@/components/UploadImage/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useSystemStore from "@/store/modules/system"
import type { IOption, ISystemForm } from "@/types/base-info/global-config"
import { formatImgUrlPreview, formatImgUrlSubmit } from "@/utils/common"

const buttonAuth = useButtonAuth("GlobalConfig_update", "GlobalConfig_query")
enum EnumTab {
  Quality = 1,
  Production = 2,
  MaterialFlow = 3,
  SystemStyle = 4
}

const systemStore = useSystemStore()

const props = withDefaults(
  defineProps<{
    inspectionReminderList: IOption[]
    tabValue: EnumTab
  }>(),
  {
    inspectionReminderList: () => []
  }
)

/** 系统样式form */
const systemStyleForm: ISystemForm = reactive({
  companyName: "公司名称",
  logoFileList: [],
  systemName: "数字化工厂系统",
  systemShortName: "",
  loginBackgroundList: []
})

const systemStyleFormConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "公司名称：",
    field: "companyName",
    colspan: 2,
    rules: [
      {
        required: true,
        message: "请输入公司名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      clearable: true,
      maxlength: 20
    }
  },
  {
    componentType: markRaw(UploadImage),
    label: "公司logo：",
    field: "logoFileList",
    colspan: 2,
    rules: [
      {
        required: true,
        message: "请上传公司logo",
        trigger: "blur"
      }
    ],
    props: {
      limit: 2,
      "is-select": true
    }
  },
  {
    componentType: "el-input",
    label: "系统名称：",
    field: "systemName",
    colspan: 2,
    props: {
      placeholder: "请输入",
      clearable: true,
      maxlength: 20
    }
  },
  {
    componentType: "el-input",
    label: "系统简称：",
    field: "systemShortName",
    colspan: 2,
    props: {
      placeholder: "请输入",
      clearable: true,
      maxlength: 8
    }
  },
  {
    componentType: markRaw(UploadImage),
    label: "登录页背景图：",
    field: "loginBackgroundList",
    rules: [
      {
        required: true,
        message: "请上传登录页背景图",
        trigger: "blur"
      }
    ],
    colspan: 2,
    props: {
      limit: 2,
      "is-select": true
    }
  }
])

onMounted(() => {
  getSystemStyleConfigInfo()
})

/** 获取系统样式配置信息 */
const getSystemStyleConfigInfo = async () => {
  const data = await querySystemStyleGlobalConfigDetail()
  if (data) {
    const logoFileList = Array.isArray(data.logoFileList) ? data.logoFileList : []
    const loginBackgroundList = Array.isArray(data.loginBackgroundList)
      ? data.loginBackgroundList
      : []
    systemStyleForm.companyName = data.companyName
    systemStyleForm.systemName = data.systemName
    systemStyleForm.systemShortName = data.systemShortName
    systemStyleForm.logoFileList = logoFileList.map((item) => {
      return {
        fileId: item.imageFileId,
        fileUrl: formatImgUrlPreview(item.imageUrl),
        selected: item.isSelected
      }
    })
    systemStyleForm.loginBackgroundList = loginBackgroundList.map((item) => {
      return {
        fileId: item.imageFileId,
        fileUrl: formatImgUrlPreview(item.imageUrl),
        selected: item.isSelected
      }
    })
  }
}

/** 保存系统样式配置信息 */
const saveSystemStyleConfigInfo = async () => {
  let isSelectedLogo = systemStyleForm.logoFileList.some((item) => item.selected)
  if (!isSelectedLogo) {
    ElMessage.warning("请勾选公司logo~")
    return
  }

  let isSelectedBackground = systemStyleForm.loginBackgroundList.some((item) => item.selected)
  if (!isSelectedBackground) {
    ElMessage.warning("请勾选登录页背景图~")
    return
  }

  let params = {
    companyName: systemStyleForm.companyName,
    systemName: systemStyleForm.systemName,
    systemShortName: systemStyleForm.systemShortName,
    logoFileList: systemStyleForm.logoFileList.map((item) => {
      return {
        imageFileId: item.fileId,
        imageUrl: formatImgUrlSubmit(item.fileUrl),
        isSelected: item.selected!
      }
    }),
    loginBackgroundList: systemStyleForm.loginBackgroundList.map((item) => {
      return {
        imageFileId: item.fileId,
        imageUrl: formatImgUrlSubmit(item.fileUrl),
        isSelected: item.selected!
      }
    })
  }
  await requestUpdateSystemStyleGlobalConfig(params)
  ElMessage.success("保存成功")

  // 请求数据设置全局系统样式，用于更新全局样式
  const data = await querySystemStyleGlobalConfigDetail()
  if (data) {
    systemStore.setSystemInfo(data)
    document.title = systemStore.systemInfo!.systemShortName
    const logoFileList = Array.isArray(data.logoFileList) ? data.logoFileList : []
    // 设置favicon
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (link) {
      link.href = formatImgUrlPreview(
        logoFileList.find((item) => item.isSelected)?.imageUrl || ""
      )
    }
  }
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  // 质量运营配置
  saveSystemStyleConfigInfo()
}
</script>
<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
