<!-- 基础配置-编码管理 -->

<template>
  <div class="encodedManage">
    <el-tabs
      v-if="tabList.length"
      v-model="tabsValue"
      @tab-change="getEncodeModeOfModule"
      type="border-card"
      tab-position="left"
      style="height: 100%"
      stretch
      class="encodedManage-tabs"
    >
      <el-tab-pane
        v-for="item in tabList"
        :key="item.id"
        :label="item.moduleName"
        :name="item.moduleName"
      />
      <div class="tab-container">
        <CustomForm
          class="form-box"
          ref="customFormRef"
          v-model="formData"
          :configs="formConfigs"
          :label-width="160"
        ></CustomForm>
        <div class="footer">
          <el-button type="primary" :disabled="!isAuth" @click="onSaveEncodeModel()"
            >保存</el-button
          >
        </div>
      </div>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  bindCodeModel,
  getAll,
  getAllCodeModule,
  getCodeTypeByModule,
  type ICodeModule,
  type ICodeType
} from "@/api/code"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth from "@/hooks/useButtonAuth"

defineOptions({
  name: "SystemConfigEncode"
})

const isAuth = useButtonAuth("SystemConfigEncode_update", "SystemConfigEncode_query")

const tabsValue = ref<string>("")
const tabList = ref<ICodeModule[]>([])
const tabItemData = ref<ICodeType[]>([])

const formData = ref<Record<string, string | undefined>>({})
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([])

const modelOptions = ref<
  {
    id: string
    modelCode: string
    modelName: string
  }[]
>([])

onBeforeMount(async () => {
  getAllModel()
  await getAllModule()
  getEncodeModeOfModule(tabsValue.value)
})

/** 获取所有编码模型信息 */
const getAllModel = async () => {
  const data = await getAll()
  modelOptions.value = data.map((item) => {
    return {
      id: item.id,
      modelCode: item.modelCode,
      modelName: item.modelName
    }
  })
}

/** 获取所有模块 */
const getAllModule = async () => {
  const codeRes = await getAllCodeModule()
  tabList.value = codeRes
  tabsValue.value = codeRes[0]?.moduleName
}

/** 获取指定模块下的编码类型 */
const getEncodeModeOfModule = async (moduleName: string) => {
  const data = await getCodeTypeByModule(moduleName)
  data.forEach((item) => {
    formData.value![item.typeCode] = item.modelCode
  })
  tabItemData.value = data
  formConfigs.value = data.map((item) => {
    return {
      componentType: "el-select",
      label: item.typeName,
      field: item.typeCode,
      props: {
        placeholder: "请选择",
        get disabled() {
          return !isAuth.value
        },
        get customChildren() {
          return modelOptions.value.map((item) => {
            return {
              componentType: "el-option",
              props: { label: item.modelName, value: item.modelCode }
            }
          })
        }
      }
    }
  })
}

/** 保存编码模型 */
const onSaveEncodeModel = async () => {
  const params = tabItemData.value.map((item) => {
    return {
      id: item.id,
      modelCode: formData.value[item.typeCode],
      typeName: item.typeName,
      typeCode: item.typeCode,
      moduleName: item.moduleName
    }
  })
  await bindCodeModel(params)
  ElMessage.success("保存成功")
}
</script>

<style scoped lang="scss">
.encodedManage {
  height: 100%;

  &:deep(.el-tabs) {
    .el-tabs__nav {
      width: 140px;
    }

    .el-tabs__content {
      height: 100%;
    }
    .el-tabs__item {
      height: 52px;
      font-size: 16px;
    }
  }

  .tab-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    :deep(.form-box) {
      flex: 1;
      overflow-y: auto;

      .el-form {
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)) !important;
      }
    }
    .footer {
      height: 48px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>
