<template>
  <div class="layout-child-page-container">
    <div class="wrap">
      <div class="layout-child-page-content border-bottom" style="flex: none">
        <CustomTitle title="基础信息" :is-table-title="false" show-short-bar>
          <div>
            <el-button @click="emit('close')">返回</el-button>
            <el-button v-if="isAuth" type="primary" @click="emit('success', props.id)"
              >编辑</el-button
            >
          </div>
        </CustomTitle>
        <CustomDescription :data="formData || {}" :configs="formList"></CustomDescription>
      </div>
      <div class="other-organ">
        <div class="organ-box" @click="isShowMore = !isShowMore">
          <template v-if="!isShowMore">
            <el-icon><DArrowRight /></el-icon>
            <span>更多配置</span>
          </template>
          <template v-else>
            <el-icon><DArrowLeft /></el-icon>
            <span>收起</span>
          </template>
        </div>
      </div>
      <div class="layout-child-page-content more-config" v-if="isShowMore" style="flex: none">
        <CustomTitle
          title="更多配置"
          :is-table-title="false"
          show-short-bar
          style="margin-top: 0"
        ></CustomTitle>

        <PackageProcessConfig
          :tech-version-id="formData?.techVersionId || ''"
          :status="formData?.versionStatus || 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryPackageProcessDetail } from "@/api/baseInfo/package-manage/packageProcess"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumProductionType, EnumProductionTypeMap } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IPackageProcessPageListItem } from "@/types/base-info/package-process"

import PackageProcessConfig from "./PackageProcessConfig/index.vue"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", id: string): void
}>()

const isAuth = useButtonAuth("PackageProcess_update", "PackageProcess_query")

provide("isOnlyView", ref(!isAuth.value))

const formData = ref<IPackageProcessPageListItem>()
const formList = ref([
  {
    field: "name",
    label: "工序名称："
  },
  {
    field: "techName",
    label: "工艺名称："
  },
  {
    field: "bizTypeName",
    label: "业务类型："
  },
  {
    field: "nature",
    label: "性质：",
    formatter: () => EnumProductionTypeMap[formData.value?.nature as EnumProductionType]
  },
  {
    field: "remark",
    label: "备注：",
    colspan: -1
  }
])
const isShowMore = ref(false)

onMounted(() => {
  getPackageProcessDetail(props.id)
})

/** 获取包装工序详情 */
const getPackageProcessDetail = async (id: string) => {
  formData.value = await queryPackageProcessDetail(id)
}
</script>

<style lang="scss" scoped>
.other-organ {
  display: flex;
  align-items: center;
  justify-content: center;

  .organ-box {
    height: 24px;
    width: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 0 4px 4px;
    background-color: #f0f0f0;
    cursor: pointer;

    .el-icon {
      font-size: 14px;
      color: #606266;
      transform: rotate(90deg);
    }
    span {
      color: #606266;
      font-size: 14px;
      margin-left: 4px;
      line-height: 24px;
    }
  }
}

.wrap {
  flex: 1;
  overflow-y: auto;
}
</style>
