<!-- 包装工序-更多配置 -->
<template>
  <div class="production-factor">
    <el-tabs
      type="border-card"
      class="production-factor-tabs"
      v-model="tabValue"
      :before-leave="onTabBeforeLeave"
    >
      <!-- 包装规范 -->
      <el-tab-pane label="产品与包装规范" :name="EnumTab.PACK">
        <PackTab
          v-if="tabValue === EnumTab.PACK"
          ref="packTabRef"
          :tech-version-id="props.techVersionId"
        />
      </el-tab-pane>

      <!-- 人 -->
      <el-tab-pane label="人" :name="EnumTab.PERSON">
        <PersonTab
          v-if="tabValue === EnumTab.PERSON"
          ref="personTabRef"
          :tech-version-id="props.techVersionId"
        />
      </el-tab-pane>

      <!-- 机 -->
      <el-tab-pane label="机" :name="EnumTab.MACHINE">
        <MachineTab
          v-if="tabValue === EnumTab.MACHINE"
          ref="machineTabRef"
          :tech-version-id="props.techVersionId"
          :status="props.status"
        />
      </el-tab-pane>

      <!-- 法 -->
      <el-tab-pane label="法" :name="EnumTab.LAW">
        <LawTab
          v-if="tabValue === EnumTab.LAW"
          ref="lawTabRef"
          :tech-version-id="props.techVersionId"
        />
      </el-tab-pane>

      <!-- MRO -->
      <el-tab-pane label="MRO" :name="EnumTab.MRO">
        <MROTab
          v-if="tabValue === EnumTab.MRO"
          ref="mroTabRef"
          :tech-version-id="props.techVersionId"
        />
      </el-tab-pane>

      <!-- 位置信息 -->
      <el-tab-pane label="生产区域" :name="EnumTab.PRODUCTION_UNIT">
        <ProductUnitTab
          v-if="tabValue === EnumTab.PRODUCTION_UNIT"
          ref="productUnitTabRef"
          :tech-version-id="props.techVersionId"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import LawTab from "./LawTab/index.vue"
import MachineTab from "./MachineTab/index.vue"
import MROTab from "./MROTab/index.vue"
import PackTab from "./PackTab/index.vue"
import PersonTab from "./PersonTab/index.vue"
import ProductUnitTab from "./ProductUnitTab/index.vue"

defineOptions({
  name: "PackageProcessConfig"
})

enum EnumTab {
  PACK, // 包装规范
  PERSON, // 人
  MACHINE, // 机
  LAW, // 法
  MRO, // MRO
  PRODUCTION_UNIT // 生产区域
}

const props = withDefaults(
  defineProps<{
    techVersionId: string
    status: number
  }>(),
  {}
)

console.log("props", props)

const personTabRef = ref<InstanceType<typeof PersonTab>>()
const machineTabRef = ref<InstanceType<typeof MachineTab>>()
const lawTabRef = ref<InstanceType<typeof LawTab>>()
const mroTabRef = ref<InstanceType<typeof MROTab>>()
const productUnitTabRef = ref<InstanceType<typeof ProductUnitTab>>()
const packTabRef = ref<InstanceType<typeof PackTab>>()

const tabValue = ref(EnumTab.PACK)

/** tab切换 */
const onTabBeforeLeave = (newVal: EnumTab, oldVal: EnumTab) => {
  const tabRefs: Record<EnumTab, Ref<InstanceType<any>>> = {
    [EnumTab.PERSON]: personTabRef,
    [EnumTab.MACHINE]: machineTabRef,
    [EnumTab.LAW]: lawTabRef,
    [EnumTab.MRO]: mroTabRef,
    [EnumTab.PRODUCTION_UNIT]: productUnitTabRef,
    [EnumTab.PACK]: ref(null)
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
  &:deep(.el-radio-group) {
    .el-radio-button__inner {
      width: 120px;
    }
  }

  &:deep(.production-factor-tabs) {
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
