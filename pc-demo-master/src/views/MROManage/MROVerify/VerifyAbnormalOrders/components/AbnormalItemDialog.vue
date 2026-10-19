<template>
  <CustomDialog v-model="dialogVisible" title="异常项信息" :loading="loading">
    <CustomDescription
      v-if="props.type === EnumVerifyType.CHECK"
      :data="checkData || {}"
      :configs="checkConfigs"
    >
      <template #files-content>
        <el-button
          v-if="currentFiles.length"
          link
          @click="fileDownloadHandle(currentFiles[0]?.id)"
          type="primary"
          >下载</el-button
        >
        <el-button v-else link>无图片</el-button>
      </template>
    </CustomDescription>

    <CustomDescription
      v-else-if="props.type === EnumVerifyType.MAINTENANCE"
      :data="maintenanceData || {}"
      :configs="maintenanceConfigs"
    >
      <template #files-content>
        <el-button
          v-if="currentFiles.length"
          link
          @click="fileDownloadHandle(currentFiles[0]?.id)"
          type="primary"
          >下载</el-button
        >
        <el-button v-else link>无图片</el-button>
      </template>
    </CustomDescription>
  </CustomDialog>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { queryMroMaintenanceTaskItemDetail } from "@/api/operation/mro/mro-maintenance-task"
import { queryMroInspectionTaskItemDetail } from "@/api/operation/mro/mro-verify-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomDialog from "@/components/CustomDialog/index.vue"
import {
  EnumMROInspectionStandardType,
  EnumMROInspectionStandardTypeMap,
  EnumMROInspectionTaskResult,
  EnumMROInspectionTaskResultMap,
  EnumMROMaintenanceStandardType,
  EnumMROMaintenanceStandardTypeMap,
  EnumMROMaintenanceTaskResult,
  EnumMROMaintenanceTaskResultMap
} from "@/constant/enums"
import type { IFileInfo } from "@/types/base-info/file"
import type { IMroMaintenanceTaskItem } from "@/types/maintain/mro-manage/mro-maintenance-task"
import type { IMroInspectionTaskItem } from "@/types/maintain/mro-manage/mro-verify-task"
import { typeNumberHandle } from "@/utils/inspectStandard"

enum EnumVerifyType {
  CHECK = 1,
  MAINTENANCE = 2
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    type: number // 1: 检验 2: 保养
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const loading = ref(false)
const checkData = ref<IMroInspectionTaskItem>()
const checkConfigs = ref([
  {
    label: "校验项名称：",
    field: "inspectionName"
  },
  {
    label: "校验项编号：",
    field: "inspectionNo"
  },
  {
    label: "校验项结果：",
    field: "inspectionResult",
    formatter: () =>
      EnumMROInspectionTaskResultMap[
        checkData.value?.inspectionResult as EnumMROInspectionTaskResult
      ]
  },
  {
    label: "探测方式：",
    field: "inspectionMethod"
  },
  {
    label: "检验标准类型：",
    field: "standardType",
    formatter: () =>
      EnumMROInspectionStandardTypeMap[
        checkData.value?.inspectionStandard?.standardType as EnumMROInspectionStandardType
      ]
  },
  {
    label: "检验标准：",
    field: "standardDesc",
    formatter: () => typeNumberHandle(checkData.value?.inspectionStandard as any)
  },
  {
    label: "实测值：",
    field: "practicalValue"
  },
  {
    label: "单位：",
    field: "unitName",
    formatter: () => checkData.value?.inspectionStandard?.unitName || "--"
  },
  {
    label: "校验人：",
    field: "inspectionUsers",
    formatter: () => checkData.value?.inspectionUsers?.map((item) => item.name)?.join(",")
  },
  {
    label: "校验时间：",
    field: "inspectionTime"
  },
  {
    label: "上传图片：",
    field: "remarkFiles",
    slots: {
      content: "files-content"
    }
  }
])

const maintenanceData = ref<IMroMaintenanceTaskItem>()
const maintenanceConfigs = ref([
  {
    label: "保养项名称：",
    field: "maintenanceName"
  },
  {
    label: "保养项编号：",
    field: "maintenanceNo"
  },
  {
    label: "保养项结果：",
    field: "maintenanceResult",
    formatter: () =>
      EnumMROMaintenanceTaskResultMap[
        maintenanceData.value?.maintenanceResult as EnumMROMaintenanceTaskResult
      ]
  },
  {
    label: "方法要求：",
    field: "maintenanceMethod"
  },
  {
    label: "检验标准类型：",
    field: "",
    formatter: () =>
      EnumMROMaintenanceStandardTypeMap[
        maintenanceData.value?.maintenanceStandard?.standardType as EnumMROMaintenanceStandardType
      ]
  },
  {
    label: "检验标准：",
    field: "standardDesc",
    formatter: () => typeNumberHandle(maintenanceData.value?.maintenanceStandard as any)
  },
  {
    label: "实测值：",
    field: "practicalValue"
  },
  {
    label: "NG处理部门：",
    field: "ngDepartments",
    formatter: () => maintenanceData.value?.ngDepartments?.map((item) => item.depName).join(",")
  },
  {
    label: "图片说明：",
    field: "files",
    slots: {
      content: "files-content"
    }
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const currentFiles = computed<IFileInfo[]>(() => {
  if (props.type === EnumVerifyType.CHECK) return checkData.value?.remarkFiles || []
  return maintenanceData.value?.files || []
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      props.type === EnumVerifyType.CHECK
        ? getMroCheckItemDetail(props.id)
        : getMroMaintenanceItemDetail(props.id)
    }
  }
)

/** 获取MRO保养任务单下保养项详情 */
const getMroMaintenanceItemDetail = async (id: string) => {
  loading.value = true
  const res = await queryMroMaintenanceTaskItemDetail(id)
  maintenanceData.value = res || {}
  loading.value = false
}

/** 获取MRO校验任务单下校验项详情 */
const getMroCheckItemDetail = async (id: string) => {
  loading.value = true
  const res = await queryMroInspectionTaskItemDetail(id)
  checkData.value = res || {}
  loading.value = false
}
</script>

<style lang="scss" scoped></style>
