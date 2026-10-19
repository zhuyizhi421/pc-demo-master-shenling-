<template>
  <CustomDialog size="large" v-model="visible" title="Andon信息">
    <CustomDescription :data="andonDetail" :configs="descriptionConfig">
      <template #isEnabled-content>
        <el-tag v-if="andonDetail.isEnabled" type="success">启用</el-tag>
        <el-tag v-else type="danger">停用</el-tag>
      </template>
      <template #needFeedback-content>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="Andon确认解决后，要求处理人在PC端填写维修反馈"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          {{ andonDetail.needFeedback ? "开启" : "关闭" }}
        </div>
      </template>
      <template #isAutoConfirm-content>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="处理对象关闭Andon后，系统自动确认问题已解决"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          {{ andonDetail.isAutoConfirm ? "开启" : "关闭" }}
        </div>
      </template>
      <template #needAlarmModel-content>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="员工触发Andon后，若处理对象未及时到场处理，则会触发告警通知"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          {{ andonDetail.needAlarmModel ? "开启" : "关闭" }}
        </div>
      </template>
    </CustomDescription>

    <CustomTitle title="关联故障" :is-table-title="false" />
    <CustomTable :table-data="tableData" :config="tableConfig" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">返回</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"

import { getAlarmModelList } from "@/api/alarm"
import { getAndonCategoryAll } from "@/api/operation/andon/andonCategory"
import { queryAndonModelDetail } from "@/api/operation/andon/andonModel"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumSelectUserTypes } from "@/constant/enums"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const EnumSelectType: Record<string, string> = {
  1: "按故障类型",
  2: "按故障"
}

const andonDetail = ref<any>({})
const tableData = ref<any[]>([])

const descriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "Andon名称：",
    field: "andonName"
  },
  {
    label: "Andon编号：",
    field: "andonNo"
  },
  {
    label: "Andon类型：",
    field: "categoryName"
  },
  {
    label: "状态：",
    field: "isEnabled",
    slots: {
      content: "isEnabled-content"
    }
  },
  {
    label: "维修反馈：",
    field: "needFeedback",
    slots: {
      content: "needFeedback-content"
    }
  },
  {
    label: "自动确认：",
    field: "isAutoConfirm",
    slots: {
      content: "isAutoConfirm-content"
    }
  },
  {
    label: "超时未处理告警：",
    field: "needAlarmModel",
    slots: {
      content: "needAlarmModel-content"
    }
  },
  {
    label: "告警模型：",
    field: "alarmModelName",
    hidden: !andonDetail.value.needAlarmModel
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "处理对象：",
    field: "handlerTypeName"
  },
  {
    label: "备注：",
    field: "remarks"
  }
])

const tableConfig = computed<ITableConfig>(() => ({
  height: 300,
  stripe: true,
  columns: [
    {
      prop: "selectType",
      label: "选择方式",
      minWidth: 80
    },
    {
      prop: "faultCategoryName",
      label: "Andon故障类型",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "faultName",
      label: "Andon故障名称",
      minWidth: 160
    },
    {
      prop: "faultNo",
      label: "Andon故障编号",
      minWidth: 160
    }
  ]
}))

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      const warehouseType: any = await getAndonCategoryAll()
      const alarmModelList: any = await getAlarmModelList({})
      andonDetail.value = await queryAndonModelDetail(props.id)
      andonDetail.value.categoryName = warehouseType.find(
        (item: any) => item.id === andonDetail.value.categoryId
      )?.categoryName
      andonDetail.value.alarmModelName = alarmModelList.find(
        (item: any) => item.id === andonDetail.value.alarmModelId
      )?.modelName
      andonDetail.value.handlerTypeName = EnumSelectUserTypes.find(
        (i) => i.type === andonDetail.value.handlerType
      )?.value
      andonDetail.value.handlerName = andonDetail.value.handlerList?.map((item: any) => item.name)

      tableData.value =
        andonDetail.value?.bindFaultList?.map((item: any) => ({
          ...item,
          selectType: EnumSelectType[item.bindType]
        })) ?? []
    }
  }
)
</script>

<style scoped lang="scss"></style>
