<!-- 基础配置-系统设置-实施配置 -->
<template>
  <div class="implement-config">
    <el-tabs v-model="tabValue" tab-position="left" type="border-card">
      <el-tab-pane v-for="tab in tabList" :key="tab.value" :label="tab.label" :name="tab.value">
        <div class="module-title">{{ tab.label }}</div>

        <!-- 物流运营配置 -->

        <MaterialFlowConfig
          v-if="tabValue === EnumTabs.MATERIAL_FLOW && tab.value === EnumTabs.MATERIAL_FLOW"
        />

        <ProductionConfig
          v-if="tabValue === EnumTabs.PRODUCTION && tab.value === EnumTabs.PRODUCTION"
        />

        <!-- 质量运营配置 -->
        <QualityConfig v-if="tabValue === EnumTabs.QUALITY && tab.value === EnumTabs.QUALITY" />

        <!-- 维护运营配置 -->
        <!-- <MaintenanceConfig
          v-if="tabValue === EnumTabs.MAINTENANCE && tab.value === EnumTabs.MAINTENANCE"
        /> -->

        <!-- 基础配置 -->
        <BaseConfig v-if="tabValue === EnumTabs.BASE && tab.value === EnumTabs.BASE" />

        <!-- 其他配置 -->
        <div v-if="tabValue === EnumTabs.OTHER" class="other-config">
          <div class="custom">
            <div>自定义字段：</div>
            <el-button type="primary" icon="Plus" @click="onAddRowClick()">新增</el-button>
          </div>
          <OtherConfig
            ref="otherConfigRef"
            :data="otherForm"
            @on-success="getOtherConfig()"
          ></OtherConfig>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { queryAllFormTypeCustomFields } from "@/api/implementConfig"
import { EnumCustomFormComponentType, EnumCustomFormType } from "@/constant/enums"
import { useImplementConfig } from "@/hooks/useImplementConfig"
import type { ICustomConfigRow } from "@/types/base-info/implement-config"

import BaseConfig from "./components/BaseConfig.vue"
import MaintenanceConfig from "./components/MaintenanceConfig.vue"
import MaterialFlowConfig from "./components/MaterialFlowConfig.vue"
import OtherConfig from "./components/OtherConfig.vue"
import ProductionConfig from "./components/ProductionConfig.vue"
import QualityConfig from "./components/QualityConfig.vue"
enum EnumTabs {
  MATERIAL_FLOW = 1,
  PRODUCTION = 2,
  QUALITY = 3,
  MAINTENANCE = 4,
  BASE = 5,
  OTHER = 6
}

defineOptions({
  name: "ImplementConfig"
})

const { configToPreviewData } = useImplementConfig()

const tabValue = ref(EnumTabs.MATERIAL_FLOW)
const tabList = ref([
  {
    label: "物流运营配置",
    value: EnumTabs.MATERIAL_FLOW
  },
  {
    label: "生产运营配置",
    value: EnumTabs.PRODUCTION
  },
  {
    label: "质量运营配置",
    value: EnumTabs.QUALITY
  },
  // {
  //   label: "维护运营配置",
  //   value: EnumTabs.MAINTENANCE
  // },
  {
    label: "基础配置",
    value: EnumTabs.BASE
  }
  // {
  //   label: "其他配置",
  //   value: EnumTabs.OTHER
  // }
])

/** 其他配置form */
const otherForm = ref<ICustomConfigRow[]>([])
const otherConfigRef = ref<(InstanceType<typeof OtherConfig> | null)[]>([])

onBeforeMount(() => {
  getOtherConfig()
})

/** 自定义字段新增行 */
const onAddRowClick = () => {
  otherForm.value.push({
    formType: EnumCustomFormType.PRODUCT_INFO,
    fieldName: "",
    fieldType: EnumCustomFormComponentType.INPUT,
    isRequired: true,
    isActive: true
  })
}

/** 表单提交操作 */
const onSaveClick = async () => {
  const fnMap = {
    [EnumTabs.MAINTENANCE]: null,

    [EnumTabs.OTHER]: null
  }
  // await fnMap[tabValue.value]?.()
}

/** 获取其他配置 */
const getOtherConfig = async () => {
  const data: any = await queryAllFormTypeCustomFields()

  if (!data) {
    return
  }

  // 对接口返回数据进行特殊化处理
  otherForm.value = configToPreviewData(data)
}
</script>

<style lang="scss" scoped>
.implement-config {
  height: 100%;

  &:deep(.el-tabs) {
    height: 100%;

    .el-tabs__content,
    .el-tab-pane {
      height: 100%;
    }

    .el-tab-pane {
      display: flex;
      flex-direction: column;
    }

    .el-tabs__nav {
      width: 160px;
    }

    .el-tabs__item {
      height: 52px;
      font-size: 16px;
    }
  }

  &:deep(.el-form) {
    flex: 1;
    overflow-y: auto;
  }

  .form {
    &:deep(.el-input) {
      width: 300px;
    }
  }

  .module-title {
    font-size: 18px;
    margin-bottom: 30px;
  }

  .label-wrapper {
    display: flex;
    align-items: center;
  }

  .custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .other-config {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin: 10px;
  }
}
</style>
