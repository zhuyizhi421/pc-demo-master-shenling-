<!-- 质量运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="qualityForm"
      :configs="qualityFormConfigs"
      label-position="right"
      :label-width="220"
      :columns="2"
    >
      <template #periodType-default>
        <div class="flex items-center flex-nowrap">
          <el-select
            v-model="qualityForm.periodType"
            placeholder="请选择"
            clearable
            style="margin-right: 8px"
          >
            <el-option
              v-for="(value, key) in EnumRemainingPeriodTypeMap"
              :key="key"
              :label="value"
              :value="+key"
            />
          </el-select>
          <el-input
            v-if="qualityForm.periodType === EnumRemainingPeriodType.CUSTOM"
            v-model.number="qualityForm.periodAfterInspection"
            type="number"
            placeholder="请输入"
            maxlength="50"
            clearable
            style="width: 150px"
          >
            <template #append>天</template>
          </el-input>
        </div>
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
  queryQualityGlobalConfigDetail,
  requestUpdateQualityGlobalConfig
} from "@/api/globalConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumRemainingPeriodType, EnumRemainingPeriodTypeMap } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption, IQualityForm } from "@/types/base-info/global-config"

defineOptions({
  name: "QualityConfig"
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

/** 质量运营配置form */
const qualityForm: IQualityForm = reactive({
  periodType: undefined, // 剩余质保期类型
  periodAfterInspection: undefined, // 剩余质保期天数
  materialInspectionAlarmId: undefined, //
  purchaseInspectionOvertimeAlarmId: undefined, //
  outsourceInspectionOvertimeAlarmId: undefined, //
  inboundInspectionOvertimeAlarmId: undefined, //
  deliverInspectionOvertimeAlarmId: undefined, //
  salesReturnInspectionOvertimeAlarmId: undefined, //
  inStockInspectionOvertimeAlarmId: undefined, //
  firstInspectionOvertimeAlarmId: undefined, //
  firstSpecialInspectionOvertimeAlarmId: undefined, //
  routineInspectionOvertimeAlarmId: undefined, //
  routineSpecialInspectionOvertimeAlarmId: undefined, //
  lastInspectionOvertimeAlarmId: undefined, //
  lastSpecialInspectionOvertimeAlarmId: undefined //
})

const qualityFormConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "div",
    label: "在库检合格后剩余质保期：",
    field: "periodType",
    colspan: 2,
    slots: {
      default: "periodType-default"
    }
  },
  {
    componentType: "el-select",
    label: "来料检验提醒",
    field: "materialInspectionAlarmId",
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
    label: "采购入库检 超时提醒：",
    field: "purchaseInspectionOvertimeAlarmId",
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
    label: "委外入库检 超时提醒：",
    field: "outsourceInspectionOvertimeAlarmId",
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
    label: "生产入库检 超时提醒：",
    field: "inboundInspectionOvertimeAlarmId",
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
    label: "发货出库检 超时提醒：",
    field: "deliverInspectionOvertimeAlarmId",
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
    label: "退货入库检 超时提醒：",
    field: "salesReturnInspectionOvertimeAlarmId",
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
    label: "在库检 超时提醒：",
    field: "inStockInspectionOvertimeAlarmId",
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
    label: "首检自检 超时提醒：",
    field: "firstInspectionOvertimeAlarmId",
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
    label: "首检专检 超时提醒：",
    field: "firstSpecialInspectionOvertimeAlarmId",
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
    label: "巡检自检 超时提醒：",
    field: "routineInspectionOvertimeAlarmId",
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
    label: "巡检专检 超时提醒：",
    field: "routineSpecialInspectionOvertimeAlarmId",
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
    label: "末检自检 超时提醒：",
    field: "lastInspectionOvertimeAlarmId",
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
    label: "末检专检 超时提醒：",
    field: "lastSpecialInspectionOvertimeAlarmId",
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
  getQualityConfigInfo()
})

/** 获取质量运营配置信息 */
const getQualityConfigInfo = async () => {
  const data = await queryQualityGlobalConfigDetail()
  if (data) {
    qualityForm.periodType = data.periodType
    qualityForm.periodAfterInspection = data.periodAfterInspection
    qualityForm.materialInspectionAlarmId = data.materialInspectionAlarmId
    qualityForm.purchaseInspectionOvertimeAlarmId = data.purchaseInspectionOvertimeAlarmId
    qualityForm.outsourceInspectionOvertimeAlarmId = data.outsourceInspectionOvertimeAlarmId
    qualityForm.inboundInspectionOvertimeAlarmId = data.inboundInspectionOvertimeAlarmId
    qualityForm.deliverInspectionOvertimeAlarmId = data.deliverInspectionOvertimeAlarmId
    qualityForm.salesReturnInspectionOvertimeAlarmId = data.salesReturnInspectionOvertimeAlarmId
    qualityForm.inStockInspectionOvertimeAlarmId = data.inStockInspectionOvertimeAlarmId
    qualityForm.firstInspectionOvertimeAlarmId = data.firstInspectionOvertimeAlarmId
    qualityForm.firstSpecialInspectionOvertimeAlarmId = data.firstSpecialInspectionOvertimeAlarmId
    qualityForm.routineInspectionOvertimeAlarmId = data.routineInspectionOvertimeAlarmId
    qualityForm.routineSpecialInspectionOvertimeAlarmId =
      data.routineSpecialInspectionOvertimeAlarmId
    qualityForm.lastInspectionOvertimeAlarmId = data.lastInspectionOvertimeAlarmId
    qualityForm.lastSpecialInspectionOvertimeAlarmId = data.lastSpecialInspectionOvertimeAlarmId
  }
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  // 质量运营配置
  saveQualityConfigInfo()
}

/** 保存质量运营配置信息 */
const saveQualityConfigInfo = async () => {
  const dayCount = qualityForm.periodAfterInspection
  if (
    qualityForm.periodType === EnumRemainingPeriodType.CUSTOM &&
    dayCount &&
    (dayCount < 0 || dayCount % 1 !== 0)
  ) {
    ElMessage.warning("在库检合格后剩余质保期天数必须为正整数")
    return
  }

  let params = {
    periodType: qualityForm.periodType,
    periodAfterInspection:
      qualityForm.periodType === EnumRemainingPeriodType.CUSTOM
        ? qualityForm.periodAfterInspection
        : undefined,
    materialInspectionAlarmId: qualityForm.materialInspectionAlarmId,
    purchaseInspectionOvertimeAlarmId: qualityForm.purchaseInspectionOvertimeAlarmId,
    outsourceInspectionOvertimeAlarmId: qualityForm.outsourceInspectionOvertimeAlarmId,
    inboundInspectionOvertimeAlarmId: qualityForm.inboundInspectionOvertimeAlarmId,
    deliverInspectionOvertimeAlarmId: qualityForm.deliverInspectionOvertimeAlarmId,
    salesReturnInspectionOvertimeAlarmId: qualityForm.salesReturnInspectionOvertimeAlarmId,
    inStockInspectionOvertimeAlarmId: qualityForm.inStockInspectionOvertimeAlarmId,
    firstInspectionOvertimeAlarmId: qualityForm.firstInspectionOvertimeAlarmId,
    firstSpecialInspectionOvertimeAlarmId: qualityForm.firstSpecialInspectionOvertimeAlarmId,
    routineInspectionOvertimeAlarmId: qualityForm.routineInspectionOvertimeAlarmId,
    routineSpecialInspectionOvertimeAlarmId: qualityForm.routineSpecialInspectionOvertimeAlarmId,
    lastInspectionOvertimeAlarmId: qualityForm.lastInspectionOvertimeAlarmId,
    lastSpecialInspectionOvertimeAlarmId: qualityForm.lastSpecialInspectionOvertimeAlarmId
  }

  await requestUpdateQualityGlobalConfig(params)
  ElMessage.success("保存成功")
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
</style>
