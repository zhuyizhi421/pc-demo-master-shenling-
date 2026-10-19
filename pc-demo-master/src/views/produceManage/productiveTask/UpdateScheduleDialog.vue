<template>
  <CustomDialog draggable :title="title" size="mini" v-model="updateScheduleShow" :modal="false">
    <!-- 新增/调整排产 -->
    <CustomForm
      ref="updateScheduleFormRef"
      v-model="currentArrangingInfo"
      :configs="formConfig"
      :label-width="100"
      :model="currentArrangingInfo"
    >
      <template #time-suffix>分钟</template>
    </CustomForm>

    <template #footer>
      <el-button @click="updateScheduleShow = false"> 取 消 </el-button>
      <el-button type="primary" @click="updateArrangeOk">确 定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage } from "element-plus"

import { queryImplementConfigProductionDetail } from "@/api/implementConfig"
import { queryTechInfoInProductionOrderPlan } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectFactoryModel from "@/components/SelectFactoryModel/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import useResetRef from "@/hooks/useResetRef"
import type { IProductionOrderTechInfo } from "@/types/production-manage/production-order-plan"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    productBaseAmount?: number // 产出基数
    techVersionId?: string
    currentInfo?: any
    outputName?: string
  }>(),
  {
    outputName: "产出",
    techVersionId: "",
    title: "排产",
    productBaseAmount: 1
  }
)

const selectFactoryModelRef = ref<InstanceType<typeof SelectFactoryModel>>()

const [currentArrangingInfo, resetCurrentArrangingInfo] = useResetRef({
  entityId: "",
  beginTime: "",
  endTime: "",
  mainProductQuantity: ""
})
// 是否按天排产, true: 按天排产, false: 按时分秒排产
const isScheduleByDay = ref(false)

const techInfos = ref<IProductionOrderTechInfo[]>([])

const emits = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "onOk", data: any, selectedData?: any): void
}>()

const updateScheduleFormRef = ref<InstanceType<typeof CustomForm>>()
const resultCtTime = ref("")

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: SelectFactoryModel,
    label: "生产区域",
    field: "entityId",
    rules: [
      {
        required: true,
        message: "请选择生产区域",
        trigger: "blur"
      }
    ],
    props: {
      style: "width: 100%",
      type: SelectType.ProductType,
      valueAttr: "entityId",
      isEnable: true,
      ref: selectFactoryModelRef,
      multiple: true
    },
    events: {
      change: () => {
        resultCtTime.value = computedCtTimeConsuming()
      }
    }
  },
  {
    componentType: "el-input",
    label: "产出名称",
    field: "outputName",
    props: {
      value: props.outputName,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "排产数",
    field: "mainProductQuantity",
    rules: [
      {
        required: true,
        message: "请输入排产数",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      class: "selectInput"
    },
    events: {
      change: () => {
        resultCtTime.value = computedCtTimeConsuming()
      }
    }
  },
  {
    componentType: "el-input",
    label: "预计耗时",
    field: "ctTimeConsuming",
    props: {
      value: resultCtTime.value,
      class: "selectInput",
      disabled: true,
      placeholder: "结合CT计算得出"
    },
    slots: {
      suffix: "time-suffix"
    }
  },
  {
    componentType: "el-date-picker",
    label: "开始时间",
    field: "beginTime",
    rules: [
      {
        required: true,
        message: "请选择开始时间",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择开始时间",
      type: isScheduleByDay.value ? "date" : "datetime",
      valueFormat: isScheduleByDay.value ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss"
    }
  },
  {
    componentType: "el-date-picker",
    label: "结束时间",
    field: "endTime",
    rules: [
      {
        required: true,
        message: "请选择结束时间",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择结束时间",
      type: isScheduleByDay.value ? "date" : "datetime",
      valueFormat: isScheduleByDay.value ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss"
    }
  }
])
const updateScheduleShow = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const computedCtTimeConsuming = () => {
  let str = "结合CT计算得出"
  try {
    if (updateScheduleShow.value) {
      // 新增/编辑排产弹窗打开+
      const entityId = currentArrangingInfo.value.entityId
      if (entityId?.length > 1) {
        str = "--"
      } else {
        const finded = techInfos.value?.find((item: any) => {
          return item.abstractAreaId === entityId[0]
        })

        if (!finded) {
          str = "未配置CT,无法预计"
        } else {
          const calcNum =
            Number(currentArrangingInfo.value.mainProductQuantity) *
            ((Number(finded.ctTime) + Number(finded.lossTime)) / Number(props.productBaseAmount))
          if (isNaN(calcNum) || calcNum == Infinity) {
            str = "请选择生产区域并输入正确排产数"
          } else {
            str = calcNum.toFixed(2)
          }
        }
      }
    }
  } catch (error) {
    console.log("计算出错", error)
    str = "计算出错,请检查数据"
  }
  return str
}

// 新增和编辑排产时，改动开始时间后，自动根据ct时间计算结束时间
watch(
  () => [currentArrangingInfo.value.beginTime, isScheduleByDay.value],
  ([beginTime, isByDay]) => {
    if (beginTime && updateScheduleShow.value && !isNaN(Number(computedCtTimeConsuming()))) {
      // 自动计算出结束时间
      const timeStamp = Number(computedCtTimeConsuming()) * 60 * 1000
      const beginTimeStamp = dayjs(beginTime as string).valueOf()
      currentArrangingInfo.value.endTime = dayjs(beginTimeStamp + timeStamp).format(
        isByDay ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss"
      )
    }
  }
)

watch(
  () => updateScheduleShow.value,
  async (show: boolean) => {
    if (show) {
      if (props.currentInfo) {
        currentArrangingInfo.value = {
          entityId: props.currentInfo.entityId,
          beginTime: props.currentInfo.planBeginTime,
          endTime: props.currentInfo.planEndTime,
          mainProductQuantity: props.currentInfo.taskAmount
        }
      }
      await getImplementConfig()
      const res = await queryTechInfoInProductionOrderPlan(props.techVersionId)
      techInfos.value = res
      currentArrangingInfo.value.entityId = currentArrangingInfo.value.entityId
        ? currentArrangingInfo.value.entityId
        : res[0]?.abstractAreaId || ""
      resultCtTime.value = computedCtTimeConsuming()
    } else {
      resetCurrentArrangingInfo()
      techInfos.value = []
    }
  }
)

const getImplementConfig = async () => {
  try {
    const res = await queryImplementConfigProductionDetail()
    isScheduleByDay.value = res.scheduleTimeDimension === 1
  } catch (error) {
    console.log(error)
  }
}

const updateArrangeOk = async () => {
  const valid = await updateScheduleFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  let begin = dayjs(currentArrangingInfo.value.beginTime)
  let end = dayjs(currentArrangingInfo.value.endTime)
  if (isScheduleByDay.value) {
    end = end.endOf("day")
    begin = begin.startOf("day")
    currentArrangingInfo.value.beginTime = begin.format("YYYY-MM-DD HH:mm:ss")
    currentArrangingInfo.value.endTime = end.format("YYYY-MM-DD HH:mm:ss")
  }

  if (begin.isAfter(end) || begin.isSame(end)) {
    ElMessage.error("开始时间不能大于等于结束时间")
    return
  }
  const taskNum = currentArrangingInfo.value.mainProductQuantity
  if (isNaN(Number(taskNum))) {
    ElMessage.error("请输入正确排产数")
    return
  }
  if (Number(taskNum) <= 0) {
    ElMessage.error("排产数需大于0")
    return
  }
  const selectedNodes = selectFactoryModelRef.value?.cascaderRef?.getCheckedNodes(true)

  emits(
    "onOk",
    {
      ...currentArrangingInfo.value,
      ctTime: isNaN(Number(computedCtTimeConsuming())) ? null : Number(computedCtTimeConsuming())
    },
    selectedNodes
  )
}
</script>

<style lang="scss" scoped>
.form-wrap {
  &:deep(.el-input) {
    width: 100%;
  }
}
</style>
