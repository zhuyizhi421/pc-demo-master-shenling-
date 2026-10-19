<template>
  <div class="top-tag-container">
    <div class="view-container">
      <TagsView class="tags-view" />
    </div>
    <div class="organization">
      <SvgIcon icon-class="workshop" size="28" />
      <span>{{ userStore.tenantInfo?.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from "@/components/SvgIcon/Index.vue"
import TagsView from "@/layout/components/TagsView/Index.vue"
import useUserStore from "@/store/modules/user"

defineOptions({
  name: "TopMenu"
})

const userStore = useUserStore()
</script>

<style lang="scss">
.top-tag-container {
  display: flex;
  align-items: center;
  height: 100%;

  .view-container {
    width: calc(100% - 220px);
    height: 100%;
  }

  .organization {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 200px;
    margin-left: 20px;
    font-size: 16px;
    color: #303133;

    .svg-icon {
      width: 17px !important;
      height: 17px !important;
      margin: 0 !important;
    }

    span {
      margin: 0 16px;
      line-height: 20px;
    }
  }
}
</style>
