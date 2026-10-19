<template>
  <section class="app-main">
    <div class="app-main-container">
      <div class="app-main-container-box mes-scrollbar">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="tagsViewStore.cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
    <GlobalFlowDetail @examOnOk="examOnOk" />
  </section>
</template>

<script setup lang="ts">
import useProductStore from "@/store/modules/product"
import useTagsViewStore from "@/store/modules/tagsView"
import mitter from "@/utils/mitt"
import GlobalFlowDetail from "@/views/basicConfig/flow/GlobalFlowDetail.vue"

defineOptions({
  name: "AppMain"
})

const tagsViewStore = useTagsViewStore()
const productStore = useProductStore()

onMounted(() => {
  productStore.initProductTypeList()
})

const examOnOk = () => {
  mitter.emit("examOnOk")
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;

  &-container {
    height: 100%;
    width: 100%;
    border: 16px solid #e2e2e2;
    position: relative;

    &-box {
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow-y: scroll;
    }
  }

  .mes-scrollbar {
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}

// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}
</style>
