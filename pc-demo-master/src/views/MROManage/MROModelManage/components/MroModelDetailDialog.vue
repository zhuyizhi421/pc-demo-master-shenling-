<template>
  <CustomDialog v-model="visible" title="MRO信息详情" :loading="loading">
    <CustomDescription :data="formData || {}" :configs="formConfigs" :label-width="150">
      <template #identityManage-label="{ config: { label } }">
        <div class="tooltip-box">
          <el-tooltip
            effect="dark"
            content="开启后，当前 MRO 信息按单件进行管理，每件都会关联独立的标签码。"
            placement="top-start"
          >
            <el-icon class="icon" size="16"><QuestionFilled /></el-icon>
          </el-tooltip>
          <span>{{ label }}</span>
        </div>
      </template>

      <template #lifeManage-label="{ config: { label } }">
        <div class="tooltip-box">
          <el-tooltip
            effect="dark"
            content="寿命低于报警线后，系统会按配置触发对应预警。"
            placement="top-start"
          >
            <el-icon class="icon" size="16"><QuestionFilled /></el-icon>
          </el-tooltip>
          <span>{{ label }}</span>
        </div>
      </template>

      <template #safeStockManage-label="{ config: { label } }">
        <div class="tooltip-box">
          <el-tooltip
            effect="dark"
            content="当前 MRO 信息库存低于安全库存时，系统按库存管理规则触发预警。"
            placement="top-start"
          >
            <el-icon class="icon" size="16"><QuestionFilled /></el-icon>
          </el-tooltip>
          <span>{{ label }}</span>
        </div>
      </template>
    </CustomDescription>
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"

import { queryMroModelDetail } from "@/api/operation/mro/mro-model"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"

defineOptions({
  name: "MroModelDetailDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    morModelId?: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const loading = ref(false)
const formData = ref<IMroModelPageListItem>()

const formatSwitchStatus = (value?: number) => (value ? "开启" : "关闭")
const formatDepartmentPosition = (departmentName?: string, positionName?: string) => {
  if (departmentName && positionName) {
    return `${departmentName}-${positionName}`
  }
  return positionName || departmentName || ""
}

const formConfigs = computed(() => [
  {
    field: "mroModelNo",
    label: "MRO编号："
  },
  {
    field: "mroModelName",
    label: "MRO名称："
  },
  {
    field: "mroSpec",
    label: "MRO规格："
  },
  {
    field: "mroCategoryName",
    label: "MRO类型："
  },
  {
    field: "mroClassifyName",
    label: "MRO分类："
  },
  {
    field: "identityManage",
    label: "标识管理：",
    formatter: () => formatSwitchStatus(formData.value?.identityManage),
    slots: {
      label: "identityManage-label"
    }
  },
  {
    field: "checkManage",
    label: "校验管理：",
    formatter: () => formatSwitchStatus(formData.value?.checkManage)
  },
  {
    field: "checkExecutePositionName",
    label: "校验执行职位：",
    formatter: () =>
      formatDepartmentPosition(
        formData.value?.checkExecuteDepartmentName,
        formData.value?.checkExecutePositionName
      ) || "-",
    hidden: !formData.value?.identityManage || !formData.value?.checkManage
  },
  {
    field: "maintenanceManage",
    label: "保养管理：",
    formatter: () => formatSwitchStatus(formData.value?.maintenanceManage)
  },
  {
    field: "maintenanceExecutePositionName",
    label: "保养执行职位：",
    formatter: () =>
      formatDepartmentPosition(
        formData.value?.maintenanceExecuteDepartmentName,
        formData.value?.maintenanceExecutePositionName
      ) || "-",
    hidden: !formData.value?.identityManage || !formData.value?.maintenanceManage
  },
  {
    field: "lifeManage",
    label: "寿命管理：",
    formatter: () => formatSwitchStatus(formData.value?.lifeManage),
    slots: {
      label: "lifeManage-label"
    }
  },
  {
    field: "totalLife",
    label: "设计寿命：",
    hidden: !formData.value?.identityManage || !formData.value?.lifeManage
  },
  {
    field: "alarmLine",
    label: "寿命报警线：",
    formatter: () => `${Number(formData.value?.alarmLine || 0)}%`,
    hidden: !formData.value?.identityManage || !formData.value?.lifeManage
  },
  {
    field: "archiveManage",
    label: "封存管理：",
    formatter: () => formatSwitchStatus(formData.value?.archiveManage)
  },
  {
    field: "archivePeriod",
    label: "封存周期(天)：",
    hidden: !formData.value?.identityManage || !formData.value?.archiveManage
  },
  {
    field: "safeStockManage",
    label: "安全库存管理：",
    formatter: () => formatSwitchStatus(formData.value?.safeStockManage),
    slots: {
      label: "safeStockManage-label"
    }
  },
  {
    field: "safeStock",
    label: "安全库存：",
    hidden: !formData.value?.safeStockManage
  },
  {
    field: "remarks",
    label: "备注："
  },
  {
    field: "createTime",
    label: "创建时间："
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  async (val: boolean) => {
    if (val) {
      loading.value = true
      await getMroModelDetail()
      loading.value = false
    }
  }
)

const getMroModelDetail = async () => {
  if (!props.morModelId) {
    return
  }

  const data = await queryMroModelDetail(props.morModelId)
  if (data) {
    formData.value = data
  }
}
</script>

<style lang="scss" scoped>
.tooltip-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .icon {
    margin-right: 5px;
  }
}
</style>
