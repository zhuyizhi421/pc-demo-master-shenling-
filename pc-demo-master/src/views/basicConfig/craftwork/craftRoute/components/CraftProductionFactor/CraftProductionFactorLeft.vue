<!-- 左侧工序-生产要素 -->
<template>
  <div ref="productionFactorRef" class="production-factor">
    <el-tabs
      type="border-card"
      class="production-factor-tabs"
      v-model="tabValue"
      :before-leave="onTabBeforeLeave"
    >
      <!-- 包装规范 -->
      <el-tab-pane label="产品与包装规范" :name="EnumTab.PACK" v-if="isPack">
        <PackTab
          v-if="tabValue === EnumTab.PACK"
          ref="packTabRef"
          :tech-version-id="props.techVersionInfo.techVersionId"
        />
      </el-tab-pane>

      <!-- 人 -->
      <el-tab-pane label="人" :name="EnumTab.PERSON">
        <PersonTab
          v-if="tabValue === EnumTab.PERSON"
          ref="personTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>

      <!-- 机 -->
      <el-tab-pane label="机" :name="EnumTab.MACHINE">
        <MachineTab
          v-if="tabValue === EnumTab.MACHINE"
          ref="machineTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>

      <!-- 工艺参数 -->
      <el-tab-pane label="工艺参数" :name="EnumTab.CRAFT_PARAMS">
        <CraftParamsTab
          v-if="tabValue === EnumTab.CRAFT_PARAMS"
          ref="craftParamsTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>

      <!-- 料 -->
      <el-tab-pane label="料" v-if="!isPack" :name="EnumTab.MATERIAL">
        <MaterialTab
          v-if="tabValue === EnumTab.MATERIAL"
          ref="materialTabRef"
          :tech-version-info="props.techVersionInfo"
          :craft-type="props.craftType"
          :is-summary="props.isSummary"
          :product-model-id="props.productModelId"
          :product-model-name="props.productModelName"
        />
      </el-tab-pane>

      <!-- 法 -->
      <el-tab-pane label="法" :name="EnumTab.LAW">
        <LawTab
          v-if="tabValue === EnumTab.LAW"
          ref="lawTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>

      <!-- MRO -->
      <el-tab-pane label="MRO" :name="EnumTab.MRO">
        <MROTab
          v-if="tabValue === EnumTab.MRO"
          ref="mroTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>

      <!-- 产出 -->
      <el-tab-pane label="产出" :name="EnumTab.OUTPUT">
        <OutputTab
          v-if="tabValue === EnumTab.OUTPUT"
          ref="outputTabRef"
          :tech-version-info="props.techVersionInfo"
          :craft-type="props.craftType"
          :process-id="props.techVersionInfo.processId"
          @switch-tab="onSwitchToProcessCheckTab"
          :is-summary="props.isSummary"
          :is-pack="isPack"
        />
      </el-tab-pane>

      <!-- 过程检 -->
      <!-- <el-tab-pane label="过程检" v-if="!isPack" :name="EnumTab.PROCESS_CHECK">
        <ProcessCheckTab
          v-if="tabValue === EnumTab.PROCESS_CHECK"
          :tech-version-info="props.techVersionInfo"
          :product-id="selectProductModelId"
        />
      </el-tab-pane> -->

      <!-- 位置信息 -->
      <el-tab-pane label="生产区域" :name="EnumTab.PRODUCTION_UNIT">
        <ProductUnitTab
          v-if="tabValue === EnumTab.PRODUCTION_UNIT"
          ref="productUnitTabRef"
          :tech-version-info="props.techVersionInfo"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { EnumParentCraftType } from "@/constant/enums"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"

import CraftParamsTab from "./CraftParamsTab/index.vue"
import LawTab from "./LawTab/index.vue"
import MachineTab from "./MachineTab/index.vue"
import MaterialTab from "./MaterialTab/index.vue"
import MROTab from "./MROTab/index.vue"
import OutputTab from "./OutputTab/index.vue"
import PackTab from "./PackTab/index.vue"
import PersonTab from "./PersonTab/index.vue"
import ProcessCheckTab from "./ProcessCheckTab/index.vue"
import ProductUnitTab from "./ProductUnitTab/index.vue"

enum EnumTab {
  PERSON, // 人
  MACHINE, // 机
  CRAFT_PARAMS, // 工艺参数
  MATERIAL, // 料
  LAW, // 法
  MRO, // MRO
  OUTPUT, // 产出
  PROCESS_CHECK, // 过程检
  PRODUCTION_UNIT, // 生产位置
  PACK // 包装规范
}

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
    craftType: EnumParentCraftType // 工艺类型
    isSummary?: boolean // 是否为工艺汇总
    isPack?: boolean
    productModelId?: string // 产品ID
    productModelName?: string // 产品名称
  }>(),
  {
    isSummary: false,
    isPack: false
  }
)

const personTabRef = ref<InstanceType<typeof PersonTab>>()
const machineTabRef = ref<InstanceType<typeof MachineTab>>()
const craftParamsTabRef = ref<InstanceType<typeof CraftParamsTab>>()
const materialTabRef = ref<InstanceType<typeof MaterialTab>>()
const lawTabRef = ref<InstanceType<typeof LawTab>>()
const mroTabRef = ref<InstanceType<typeof MROTab>>()
const outputTabRef = ref<InstanceType<typeof OutputTab>>()
const productUnitTabRef = ref<InstanceType<typeof ProductUnitTab>>()
const packTabRef = ref<InstanceType<typeof PackTab>>()
const productionFactorRef = ref<HTMLDivElement>()

const tabValue = ref(props.isPack ? EnumTab.PACK : EnumTab.PERSON)
const selectProductModelId = ref("") // 过程检时选中的产品型号ID

const scrollToCurrentAreaTop = () => {
  nextTick(() => {
    productionFactorRef.value?.scrollIntoView({
      block: "start",
      behavior: "smooth"
    })
  })
}

/** tab切换 */
const onTabBeforeLeave = async (newVal: EnumTab, oldVal: EnumTab) => {
  const tabRefs: Record<EnumTab, Ref<InstanceType<any>>> = {
    [EnumTab.PERSON]: personTabRef,
    [EnumTab.MACHINE]: machineTabRef,
    [EnumTab.CRAFT_PARAMS]: craftParamsTabRef,
    [EnumTab.MATERIAL]: materialTabRef,
    [EnumTab.LAW]: lawTabRef,
    [EnumTab.MRO]: mroTabRef,
    [EnumTab.OUTPUT]: outputTabRef,
    [EnumTab.PROCESS_CHECK]: ref(null), // 过程检tab不存储ref
    [EnumTab.PRODUCTION_UNIT]: productUnitTabRef,
    [EnumTab.PACK]: ref(null)
  }

  // 切换tab前，若旧tab有更新，则更新其数据
  const tabRef = tabRefs[oldVal].value
  await tabRef?.updateTableData?.()
}

/** 切换值过程检，并选中指定产品 */
const onSwitchToProcessCheckTab = (productModelId: string) => {
  tabValue.value = EnumTab.PROCESS_CHECK
  selectProductModelId.value = productModelId
  scrollToCurrentAreaTop()
}

watch(
  () => tabValue.value,
  () => {
    scrollToCurrentAreaTop()
  }
)
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
    &.el-tabs--top {
      flex-direction: column;
    }

    > .el-tabs__header {
      position: sticky;
      top: 0;
      z-index: 10;
      margin-bottom: 12px;
      background: #fff;
    }

    .el-tab-pane {
      min-height: 500px;
    }
    .el-tabs__item {
      width: 120px;
    }

    > .el-tabs__content {
      padding-top: 0;
    }
  }
}
</style>
