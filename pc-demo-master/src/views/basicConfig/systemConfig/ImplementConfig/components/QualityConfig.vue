<!-- 质量运营配置 -->
<template>
  <div style="flex: 1; overflow-y: auto">
    <CustomForm
      v-model="qualityForm"
      :configs="formConfigs"
      label-position="right"
      :label-width="250"
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
  queryImplementConfigQualityDetail,
  requestUpdateImplementConfigQuality
} from "@/api/implementConfig"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IImplementConfigQualityParams } from "@/types/base-info/implement-config"

defineOptions({
  name: "QualityConfig"
})

const buttonAuth = useButtonAuth("ImplementConfig_update", "ImplementConfig_query")

/** 质量运营配置form */
const qualityForm = reactive<IImplementConfigQualityParams>({
  unqualifiedReviewAfterRegister: false,
  scrapDistinguishProductionOrMaterial: false
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-radio-group",
    label: "缺陷登记后才能不合格品评审：",
    field: "unqualifiedReviewAfterRegister",
    colspan: 2,
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: {
            label: "是",
            value: true
          }
        },
        {
          componentType: "el-radio",
          props: {
            label: "否",
            value: false
          }
        }
      ]
    }
  },
  {
    componentType: "el-radio-group",
    label: "报废是否分工废/料废：",
    field: "scrapDistinguishProductionOrMaterial",
    colspan: 2,
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: {
            label: "区分",
            value: true
          }
        },
        {
          componentType: "el-radio",
          props: {
            label: "不区分",
            value: false
          }
        }
      ]
    }
  }
])

onMounted(() => {
  getQualityConfig()
})

/** 获取质量运营配置 */
const getQualityConfig = async () => {
  const data = await queryImplementConfigQualityDetail()
  if (data) {
    for (let key in qualityForm) {
      qualityForm[key] = data[key]
    }
  }
}

/** 保存质量运营配置 */
const saveQualityConfig = async () => {
  const params = {
    ...qualityForm
  }
  await requestUpdateImplementConfigQuality(params)
  ElMessage.success("保存成功")
}

/** 保存按钮点击事件 */
const onSaveClick = async () => {
  saveQualityConfig()
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  margin: 10px;
}
.label-wrapper {
  display: flex;
  align-items: center;
}
</style>
