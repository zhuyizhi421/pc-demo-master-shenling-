<!-- 物流运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="LogisticsForm"
      :configs="materialFlowFormConfigs"
      label-position="right"
      :label-width="220"
      :columns="2"
    >
    </CustomForm>
  </div>
  <div class="footer">
    <el-button v-if="!!buttonAuth" type="primary" @click="onSaveClick()">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryLogisticsGlobalConfigDetail,
  requestUpdateLogisticsGlobalConfig
} from "@/api/globalConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { ILogisticsForm, IOption } from "@/types/base-info/global-config"

defineOptions({
  name: "LogisticsConfig"
})

const buttonAuth = useButtonAuth("GlobalConfig_update", "GlobalConfig_query")
enum EnumTab {
  Quality = 1,
  Production = 2,
  MaterialFlow = 3,
  SystemStyle = 4
}

const props = withDefaults(
  defineProps<{
    inspectionReminderList: IOption[]
    tabValue: EnumTab
  }>(),
  {
    inspectionReminderList: () => []
  }
)

const LogisticsForm: ILogisticsForm = reactive({
  //
  materialAfterInboundAlarmId: undefined, //
  materialArriveOvertimeAlarmId: undefined, //
  materialInboundOvertimeAlarmId: undefined //
})

const materialFlowFormConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "来料入库 完成提醒：",
    field: "materialAfterInboundAlarmId",
    colspan: 2,
    props: {
      placeholder: "请选择",
      clearable: true,
      get customChildren() {
        return props.inspectionReminderList.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: "el-select",
    label: "来料入库 超时提醒：",
    field: "materialInboundOvertimeAlarmId",
    colspan: 2,
    props: {
      placeholder: "请选择",
      clearable: true,
      get customChildren() {
        return props.inspectionReminderList.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: "el-select",
    label: "来料收货 超时提醒：",
    field: "materialArriveOvertimeAlarmId",
    colspan: 2,
    props: {
      placeholder: "请选择",
      clearable: true,
      get customChildren() {
        return props.inspectionReminderList.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  }
])

onMounted(() => {
  getLogisticsInfo()
})

/** 获取质量运营配置信息 */
const getLogisticsInfo = async () => {
  const data = await queryLogisticsGlobalConfigDetail()
  if (data) {
    LogisticsForm.materialAfterInboundAlarmId = data.materialAfterInboundAlarmId
    LogisticsForm.materialArriveOvertimeAlarmId = data.materialArriveOvertimeAlarmId
    LogisticsForm.materialInboundOvertimeAlarmId = data.materialInboundOvertimeAlarmId
  }
}

/** 保存质量运营配置信息 */
const saveLogisticsInfo = async () => {
  let params = {
    materialAfterInboundAlarmId: LogisticsForm.materialAfterInboundAlarmId,
    materialArriveOvertimeAlarmId: LogisticsForm.materialArriveOvertimeAlarmId,
    materialInboundOvertimeAlarmId: LogisticsForm.materialInboundOvertimeAlarmId
  }

  await requestUpdateLogisticsGlobalConfig(params)
  ElMessage.success("保存成功")
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  // 质量运营配置
  saveLogisticsInfo()
}
</script>
<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
