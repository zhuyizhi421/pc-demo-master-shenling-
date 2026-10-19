<!-- 右侧料产出-生产要素 -->
<template>
  <div class="production-factor">
    <el-tabs
      type="border-card"
      tab-position="top"
      class="production-factor-tabs"
      v-model="tabValue"
      :before-leave="onTabBeforeLeave"
    >
      <!-- 料 -->
      <el-tab-pane label="料" :name="EnumTab.MATERIAL">
        <MaterialTab
          v-if="tabValue === EnumTab.MATERIAL"
          ref="materialTabRef"
          :tech-version-info="props.techVersionInfo"
          :craft-type="props.craftType"
          :is-summary="props.isSummary"
        />
      </el-tab-pane>

      <!-- 产出 -->
      <el-tab-pane label="产出" :name="EnumTab.OUTPUT">
        <OutputTab
          v-if="tabValue === EnumTab.OUTPUT"
          ref="outputTabRef"
          :tech-version-info="props.techVersionInfo"
          :craft-type="props.craftType"
          :is-summary="props.isSummary"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { EnumParentCraftType } from "@/constant/enums"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"

import MaterialTab from "./MaterialTab/index.vue"
import OutputTab from "./OutputTab/index.vue"

enum EnumTab {
  MATERIAL, // 料
  OUTPUT // 产出
}

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
    craftType: EnumParentCraftType // 工艺类型
    isSummary?: boolean // 是否为工艺汇总
  }>(),
  {
    isSummary: false
  }
)

console.log("右侧料物料-tabs", props)

const materialTabRef = ref<InstanceType<typeof MaterialTab>>()
const outputTabRef = ref<InstanceType<typeof OutputTab>>()

const tabValue = ref(EnumTab.MATERIAL)

/** tab切换 */
const onTabBeforeLeave = (newVal: EnumTab, oldVal: EnumTab) => {
  const tabRefs: Record<EnumTab, Ref<InstanceType<any>>> = {
    [EnumTab.MATERIAL]: materialTabRef,
    [EnumTab.OUTPUT]: outputTabRef
  }

  // 切换tab前，若旧tab有更新，则更新其数据
  const tabRef = tabRefs[oldVal].value
  if (tabRef) {
    tabRef.updateTableData()
  }
}
</script>

<style lang="scss" scoped>
.production-factor {
  margin-top: 20px;

  &:deep(.el-radio-group) {
    .el-radio-button__inner {
      width: 120px;
    }
  }

  &:deep(.production-factor-tabs) {
    .el-tabs__item {
      width: 120px;
    }

    > .el-tabs__content {
      padding-top: 0;
    }
  }
}
</style>
