<template>
  <router-view />
</template>

<script setup lang="ts">
import { querySystemStyleGlobalConfigDetail } from "@/api/globalConfig"
import usePermissionStore from "@/store/modules/permission"
import useSystemStore from "@/store/modules/system"
import useUserStore from "@/store/modules/user"
import { formatImgUrlPreview } from "@/utils/common"

const systemStore = useSystemStore()
const permissionStore = usePermissionStore()
const route = useRoute()

/** 更新favicon */
const updateFavicon = (path: string) => {
  const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
  if (link) {
    link.href = path
  } else {
    const newLink = document.createElement("link")
    newLink.rel = "icon"
    newLink.href = path
    document.head.appendChild(newLink)
  }
}

/** 获取系统样式配置信息 */
const getSystemStyleConfigInfo = async () => {
  const data = await querySystemStyleGlobalConfigDetail()
  if (data) {
    systemStore.setSystemInfo(data)
    document.title = systemStore.systemInfo!.systemShortName
    const logoFileList = Array.isArray(data.logoFileList) ? data.logoFileList : []
    const logo = formatImgUrlPreview(
      logoFileList.find((item) => item.isSelected)?.imageUrl || ""
    )
    logo && updateFavicon(logo)
  }
}

const useUser = useUserStore()

onMounted(async () => {
  // 刷新的时候重新获取用户信息，防止刷新后用户信息不更新(比如权限变化后)
  if (useUser.token) {
    await useUser.getUserInfo()
    if (!permissionStore.routes.length) {
      await permissionStore.generateRoutes(route.path)
    }
  }

  // 获取用户组织信息
  await useUser.getTenantList()

  getSystemStyleConfigInfo()
})
</script>
