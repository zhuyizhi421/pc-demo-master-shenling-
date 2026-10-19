<template>
  <div class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <router-link key="collapse" class="sidebar-logo-link" to="/">
        <div v-if="!collapse" class="logo-wrap">
          <img :src="logoImgUrl" class="sidebar-logo" />
          <h1 class="sidebar-title" :style="{ color: variables.logoTitleColor }">
            {{ systemShortName }}
          </h1>
        </div>
        <div v-else class="logo-wrap">
          <img :src="logoImgUrl" class="sidebar-logo-collape" />
        </div>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import variables from "@/assets/styles/variables.module.scss"
import useSystemStore from "@/store/modules/system"
import { formatImgUrlPreview } from "@/utils/common"

defineOptions({
  name: "SidebarLogo"
})

const systemStore = useSystemStore()

const props = defineProps({
  collapse: Boolean
})
const { collapse } = toRefs(props)

const logoImgUrl = computed(() => {
  return formatImgUrlPreview(
    systemStore.systemInfo?.logoFileList?.find((item) => item.isSelected)?.imageUrl || ""
  )
})

const systemShortName = computed(() => {
  return systemStore.systemInfo?.systemShortName
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebar-logo-collape {
  height: 50px;
  margin-top: calc(50% - 25px);
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  //position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  line-height: 80px;
  background: #002a52ff;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    & .sidebar-logo {
      height: 50px;
      vertical-align: middle;
      margin-right: 12px;
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }

    & .sidebar-title {
      margin: 0;
      color: #fff;
      line-height: 20px;
      font-size: 17px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
