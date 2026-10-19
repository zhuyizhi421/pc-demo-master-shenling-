<template>
  <div class="layout-container">
    <div class="layout-main-page" v-if="curPageKey == EnumPageType.Main">
      <SchedulePreview v-if="curPageKey == EnumPageType.Main">
        <el-button
          type="primary"
          :disabled="!buttonAuthed"
          @click="curPageKey = EnumPageType.Schedule"
        >
          进入排产
        </el-button>
      </SchedulePreview>
    </div>
    <div class="layout-child-page" v-else>
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />
      <PackageSchedule
        v-if="curPageKey == EnumPageType.Schedule"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"

import PackageSchedule from "./components/PackageSchedule.vue"
import SchedulePreview from "./components/SchedulePreview.vue"

defineOptions({
  name: "PackageSchedule"
})

const buttonAuthed = useButtonAuth("PackageSchedule_update", "PackageSchedule_query")

/** 页面显示类型枚举 */
const EnumPageType = {
  Main: 1,
  Schedule: 2
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "包装排产",
    key: EnumPageType.Main,
    children: [
      {
        name: "排产",
        key: EnumPageType.Schedule
      }
    ]
  }
])
</script>

<style scoped lang="scss"></style>
