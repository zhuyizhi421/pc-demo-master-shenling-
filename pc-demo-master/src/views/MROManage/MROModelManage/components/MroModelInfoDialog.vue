<template>
  <CustomDialog v-model="visible" title="MRO信息" size="medium" :loading="loading">
    <CustomDescription :data="mroModelInfo || {}" :configs="configs" :label-width="130" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryMroModelDetail } from "@/api/operation/mro/mro-model"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomDialog from "@/components/CustomDialog/index.vue"
import { EnumMROIdentityManageMap } from "@/constant/enums"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mroModelId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const loading = ref(false)
const mroModelInfo = ref<IMroModelPageListItem>()
const configs = computed(() => [
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
    formatter: () =>
      typeof mroModelInfo.value?.identityManage === "number"
        ? EnumMROIdentityManageMap[mroModelInfo.value.identityManage]
        : ""
  },
  {
    field: "checkManage",
    label: "校验管理：",
    formatter: () =>
      typeof mroModelInfo.value?.checkManage === "number"
        ? EnumMROIdentityManageMap[mroModelInfo.value.checkManage]
        : ""
  },
  {
    field: "maintenanceManage",
    label: "保养管理：",
    formatter: () =>
      typeof mroModelInfo.value?.maintenanceManage === "number"
        ? EnumMROIdentityManageMap[mroModelInfo.value.maintenanceManage]
        : ""
  },
  {
    field: "lifeManage",
    label: "寿命管理：",
    formatter: () =>
      typeof mroModelInfo.value?.lifeManage === "number"
        ? EnumMROIdentityManageMap[mroModelInfo.value.lifeManage]
        : ""
  },
  {
    field: "totalLife",
    label: "设计寿命：",
    hidden: !mroModelInfo.value?.identityManage || !mroModelInfo.value?.lifeManage
  },
  {
    field: "alarmLine",
    label: "寿命报警线：",
    hidden: !mroModelInfo.value?.identityManage || !mroModelInfo.value?.lifeManage
  },
  {
    field: "safeStockManage",
    label: "安全库存管理：",
    formatter: () =>
      typeof mroModelInfo.value?.safeStockManage === "number"
        ? EnumMROIdentityManageMap[mroModelInfo.value.safeStockManage]
        : ""
  },
  {
    field: "safeStock",
    label: "安全库存：",
    hidden: !mroModelInfo.value?.safeStockManage
  },
  {
    field: "remarks",
    label: "备注："
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getMroModelInfo(props.mroModelId)
    }
  }
)

const getMroModelInfo = async (id: string) => {
  loading.value = true
  const data = await queryMroModelDetail(id)
  mroModelInfo.value = data
  loading.value = false
}
</script>
