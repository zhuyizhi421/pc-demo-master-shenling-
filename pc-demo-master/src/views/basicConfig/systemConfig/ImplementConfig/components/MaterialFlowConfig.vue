<!-- 物流运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="materialFlowForm"
      :configs="formConfigs"
      label-position="right"
      :label-width="250"
      :columns="2"
    >
      <template #incomingReceiptType-default>
        <el-radio
          v-for="(value, key) in EnumIncomingMaterialsReceiveModeMap"
          :key="key"
          :value="+key"
          >{{ value }}</el-radio
        >
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
  queryImplementConfigMaterialFlowDetail,
  requestUpdateImplementConfigMaterialFlow
} from "@/api/implementConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import {
  EnumIncomingMaterialsReceiveMode,
  EnumIncomingMaterialsReceiveModeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IImplementConfigMaterialFlowParams } from "@/types/base-info/implement-config"

defineOptions({
  name: "MaterialFlowConfig"
})

const buttonAuth = useButtonAuth("ImplementConfig_update", "ImplementConfig_query")
/** 物料运营配置form */
const materialFlowForm = reactive<IImplementConfigMaterialFlowParams>({
  incomingReceiptType: EnumIncomingMaterialsReceiveMode.PRINT
  // productionReceiptType: EnumProductionMaterialsSign.LINE_IN_STORE
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-radio-group",
    label: "委外退料收货方式：",
    field: "incomingReceiptType",
    colspan: 2,
    slots: {
      default: "incomingReceiptType-default"
    }
  }
])

onMounted(() => {
  getMaterialFlowConfig()
})

/** 获取物流运营配置 */
const getMaterialFlowConfig = async () => {
  const data = await queryImplementConfigMaterialFlowDetail()
  if (data) {
    for (let key in materialFlowForm) {
      materialFlowForm[key] = data[key]
    }
  }
}

/** 保存物流运营配置 */
const saveMaterialFlowConfig = async () => {
  const params = {
    ...materialFlowForm
  }
  await requestUpdateImplementConfigMaterialFlow(params)
  ElMessage.success("保存成功")
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  saveMaterialFlowConfig()
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
