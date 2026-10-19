<template>
  <CustomDialog v-model="dialogVisible" title="包装规范详情">
    <CustomDescription :data="packageSpecDetail || {}" :configs="configs">
      <template #thumbnailAddress-content>
        <el-image
          v-if="packageSpecDetail?.templateDto?.thumbnailAddress"
          :src="formatImgUrlPreview(packageSpecDetail?.templateDto?.thumbnailAddress || '')"
          :preview-src-list="[
            formatImgUrlPreview(packageSpecDetail?.templateDto?.thumbnailAddress || '')
          ]"
          preview-teleported
          style="height: 24px"
        />
        <span v-else>不打印</span>
      </template>
    </CustomDescription>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryPackageSpecDetails } from "@/api/baseInfo/package-manage/packageSpec"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IPackageSpecPageListItem } from "@/types/base-info/package-spec"
import { formatImgUrlPreview } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const packageSpecDetail = ref<IPackageSpecPageListItem>()
const configs = ref([
  {
    label: "包装规范名称：",
    field: "specName"
  },
  {
    label: "包装容器类型：",
    field: "containerTypeName"
  },
  {
    label: "运输方式：",
    field: "transportType"
  },
  {
    label: "备注说明：",
    field: "remark",
    colspan: -1
  },
  {
    label: "打印标识模板：",
    field: "thumbnailAddress",
    slots: {
      content: "thumbnailAddress-content"
    }
  }
])

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getPackageSpecDetail()
    }
  }
)

/** 获取包装规范详情 */
const getPackageSpecDetail = async () => {
  if (!props.id) {
    return
  }
  const data = await queryPackageSpecDetails([props.id])
  packageSpecDetail.value = data[0]
}
</script>

<style lang="scss" scoped></style>
