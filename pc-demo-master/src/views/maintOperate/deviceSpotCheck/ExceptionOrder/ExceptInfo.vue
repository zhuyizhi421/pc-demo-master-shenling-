<template>
  <CustomDialog v-model="show" @close="emits('update:modelValue', false)" title="异常项信息">
    <CustomDescription
      :data="expectData"
      :configs="descriptionConfig"
      :columns="1"
      :labelWidth="100"
    >
      <template #inspectionName-content>
        {{ expectData?.inspectionName || expectData?.maintenanceName || "-" }}
      </template>
      <template #inspectionNo-content>
        {{ expectData?.inspectionNo || expectData?.maintenanceNo || "-" }}
      </template>
      <template #inspectionResult-content>
        {{
          ["NG", "OK", "未出结果"][expectData?.maintenanceResult] ||
          ["NG", "OK", "未出结果"][expectData?.inspectionResult] ||
          "-"
        }}
      </template>
      <template #inspectionMethod-content>
        {{ expectData?.inspectionMethod || expectData?.maintenanceMethod }}
      </template>
      <template #standardType-content>
        {{
          (expectData.maintenanceStandard?.standardType ??
            expectData.inspectionStandard?.standardType) === 1
            ? "数值"
            : "文本"
        }}
      </template>
      <template #inspectionStandard-content>
        {{ getStandardString(expectData.inspectionStandard || expectData.maintenanceStandard) }}
      </template>
      <template #ngDepartments-content>
        {{ expectData?.ngDepartments?.map((item: any) => item?.depName).join(",") || "-" }}
      </template>
      <template #files-content>
        <template v-if="expectData?.files?.length">
          <el-image
            v-for="item in expectData?.files || []"
            :key="item.id"
            :src="formatImgUrlPreview(item.path)"
            :preview-teleported="true"
            :zoom-rate="1"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            class="w-[50px] h-[50px]"
            fit="contain"
          />
        </template>
      </template>
    </CustomDescription>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryEquipmentMaintenanceItemDetail } from "@/api/operation/equipment/equipment-maintenance-item"
import { queryEquipmentPatrolItemDetail } from "@/api/operation/equipment/equipment-patrol-item"
import { queryEquipmentSpotItemDetail } from "@/api/operation/equipment/equipment-spot-item"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import { EnumEquipmentExceptionSourceType } from "@/constant/enums"
import { getStandardString } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

defineOptions({
  name: "ExceptInfo"
})

const props = defineProps<{
  modelValue: boolean
  id: string
  type: EnumEquipmentExceptionSourceType
}>()

const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const isCheck = computed(() =>
  [EnumEquipmentExceptionSourceType.SpotCheck, EnumEquipmentExceptionSourceType.Patrol].includes(
    props.type
  )
)

const typeToFnMap = {
  [EnumEquipmentExceptionSourceType.SpotCheck]: queryEquipmentSpotItemDetail,
  [EnumEquipmentExceptionSourceType.Patrol]: queryEquipmentPatrolItemDetail,
  [EnumEquipmentExceptionSourceType.Maintain]: queryEquipmentMaintenanceItemDetail
}

const expectData = ref<any>({
  files: []
})
const show = ref<boolean>(false)
const descriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    get label() {
      return `${isCheck.value ? "检验" : "保养"}项名称：`
    },
    field: "inspectionName",
    slots: {
      content: "inspectionName-content"
    }
  },
  {
    get label() {
      return `${isCheck.value ? "检验" : "保养"}项编号：`
    },
    field: "inspectionNo",
    slots: {
      content: "inspectionNo-content"
    }
  },
  {
    get label() {
      return `${isCheck.value ? "检验" : "保养"}项结果：`
    },
    field: "inspectionResult",
    slots: {
      content: "inspectionResult-content"
    }
  },
  {
    label: "方法要求：",
    field: "inspectionMethod",
    slots: {
      content: "inspectionMethod-content"
    }
  },
  {
    label: "检验标准类型：",
    field: "standardType",
    slots: {
      content: "standardType-content"
    }
  },
  {
    label: "检验标准：",
    field: "inspectionStandard",
    slots: {
      content: "inspectionStandard-content"
    }
  },
  {
    label: "实测值：",
    field: "practicalValue"
  },
  {
    label: "NG处理部门：",
    field: "ngDepartments",
    slots: {
      content: "ngDepartments-content"
    }
  },
  {
    label: "图片说明：",
    field: "filesList",
    slots: {
      content: "files-content"
    }
  }
])
watch(
  () => props.modelValue,
  async (val) => {
    show.value = val
    if (val) {
      if (props.id && typeToFnMap[props.type]) {
        let res = await typeToFnMap[props.type](props?.id)
        expectData.value = res
      }
    }
  }
)
</script>

<style scoped lang="scss"></style>
