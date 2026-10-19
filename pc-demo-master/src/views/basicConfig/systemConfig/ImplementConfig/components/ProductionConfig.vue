<!-- 生产运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="productionForm"
      :configs="formConfigs"
      label-position="right"
      :label-width="250"
      :columns="2"
    >
      <template #allowTech-default>
        <el-checkbox :model-value="true" label="单工艺" disabled />
        <el-checkbox v-model="productionForm.allowTechGroup" label="工艺组" />
        <el-checkbox v-model="productionForm.allowParallelTech" label="且工艺" disabled />
      </template>
    </CustomForm>
  </div>
  <div class="footer">
    <el-button v-if="!!buttonAuth" type="primary" @click="onSaveClick()">保存</el-button>
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryImplementConfigProductionDetail,
  requestUpdateImplementConfigProduction
} from "@/api/implementConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumProductionScheduleMode } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IImplementConfigProductionParams } from "@/types/base-info/implement-config"

defineOptions({
  name: "ProductionConfig"
})

const buttonAuth = useButtonAuth("ImplementConfig_update", "ImplementConfig_query")

/** 生产运营配置form */
const productionForm = reactive<IImplementConfigProductionParams>({
  executeMethod: EnumProductionScheduleMode.PRODUCTION_UNIT,
  autoExecute: true,
  allowProductionIfEquipmentException: false,
  allowTechGroup: false,
  allowParallelTech: false,
  enableAreaPlan: false,
  allowMultipleEmployee: false,
  scheduleTimeDimension: 2
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "div",
    label: "启用的工艺模型：",
    field: "allowTech",
    colspan: 2,
    slots: {
      default: "allowTech-default"
    }
  },
  {
    componentType: "el-radio-group",
    label: "允许员工同时在多生产区域上岗：",
    field: "allowMultipleEmployee",
    colspan: 2,
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: {
            label: "是",
            value: true
          }
        },
        {
          componentType: "el-radio",
          props: {
            label: "否",
            value: false
          }
        }
      ]
    }
  },
  {
    componentType: "el-radio-group",
    label: "排产时间维度：",
    field: "scheduleTimeDimension",
    colspan: 2,
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: {
            label: "时分秒",
            value: 2
          }
        },
        {
          componentType: "el-radio",
          props: {
            label: "天",
            value: 1
          }
        }
      ]
    }
  }
])

onMounted(() => {
  getProductionConfig()
})

/** 获取生产运营配置 */
const getProductionConfig = async () => {
  const data = await queryImplementConfigProductionDetail()
  if (data) {
    for (let key in productionForm) {
      productionForm[key] = data[key]
    }
  }
}

/** 保存生产运营配置 */
const saveProductionConfig = async () => {
  console.log("productionForm", productionForm)

  const params = {
    ...productionForm
  }
  await requestUpdateImplementConfigProduction(params)
  ElMessage.success("保存成功")
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  saveProductionConfig()
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
