<!-- 同步工单工艺为工艺路线弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" title="同步为工艺路线" @close="emit('close')" size="mini">
    <CustomForm ref="customFormRef" v-model="formData" :label-width="100" :configs="formConfigs">
      <template #title-default>
        <div class="top-title">工艺路线信息</div>
      </template>

      <template #productionModelName-default>
        {{ formData.productionModelName }}
      </template>

      <template #productionModelNo-default>
        {{ formData.productionModelNo }}
      </template>

      <template #unitName-default>
        {{ formData.unitName }}
      </template>

      <template #sourceType-default>
        {{ EnumProductionOrderSourceMap[formData.sourceType as EnumProductionOrderSource] }}
      </template>
    </CustomForm>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onCreateClick()">创建</el-button>
      <el-button type="primary" @click="onCreateClick('publish')">创建并前往发布</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"

import { getTechProcessInfo } from "@/api/craft"
import { requestSyncOrderProcessToCraftRoute } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumProductionOrderSource, EnumProductionOrderSourceMap } from "@/constant/enums"
import useCraftWorkStore from "@/store/modules/craftwort"

const props = withDefaults(
  defineProps<{
    id: string // 工单工艺ID
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const router = useRouter()
const useCraftWork = useCraftWorkStore()

const dialogVisible = ref(true)
const formData = reactive({
  productionModelName: "",
  productionModelNo: "",
  version: "",
  unitName: "",
  sourceType: 0,
  remarks: ""
})

const productModelId = ref("") // 产品ID，用于版本重复检查

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    special: true,
    field: "title",
    slots: {
      default: "title-default"
    }
  },
  {
    componentType: "div",
    label: "产品名称",
    field: "productionModelName",
    slots: {
      default: "productionModelName-default"
    }
  },
  {
    componentType: "div",
    label: "产品编号",
    field: "productionModelNo",
    slots: {
      default: "productionModelNo-default"
    }
  },
  {
    componentType: "el-input",
    label: "工艺路线版本",
    field: "version",
    props: {
      type: "text",
      placeholder: "请输入版本号，如V1.0",
      maxlength: 50,
      onBlur: () => checkVersionRepeat()
    }
  },
  {
    componentType: "div",
    label: "单位",
    field: "unitName",
    slots: {
      default: "unitName-default"
    }
  },
  {
    componentType: "div",
    label: "来源",
    field: "sourceType",
    slots: {
      default: "sourceType-default"
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

onMounted(() => {
  if (props.id) {
    getCraftRouteDetail(props.id)
  }
})

/** 获取工单工艺详情 */
const getCraftRouteDetail = async (id: string) => {
  const data = await getTechProcessInfo(id)
  formData.productionModelName = data.productModel.name
  formData.productionModelNo = data.productModel.code
  formData.unitName = data.unitItem.unitName
  formData.sourceType = data.sourceType
  formData.remarks = data.remarks
  productModelId.value = data.productModel.id
}

/** 检查工艺路线版本是否重复 */
const checkVersionRepeat = async () => {
  if (!formData.version || !productModelId.value) {
    return
  }

  // 调用API检查版本是否重复
  const data = await queryCraftRoutePageList({
    pageQuery: { pageNum: 1, pageSize: 100 },
    queryParam: {
      exactProductNo: formData.productionModelNo,
      version: formData.version
    }
  })

  if (data && data.records && data.records.length > 0) {
    ElMessage.warning(`该产品已存在版本为"${formData.version}"的工艺路线，请重新输入`)
    formData.version = ""
  }
}

/** 提交操作 */
const onCreateClick = async (type?: string) => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  let params = {
    processId: props.id,
    version: formData.version,
    remarks: formData.remarks
  }
  const data = await requestSyncOrderProcessToCraftRoute(params)
  emit("close")
  emit("success")
  ElMessage.success("同步工艺路线成功")

  // 创建并发布，则跳转至工艺路线编辑子页面
  if (type === "publish") {
    router.push({
      name: "CraftRoute"
    })
    useCraftWork.setCraftRouteInfo(data)
  }
}
</script>

<style lang="scss" scoped>
.top-title {
  margin: 0 0 20px;
  font-size: 16px;
  color: var(--g-color);
}

.form-style {
  .el-form-item {
    width: 100%;
    margin-right: 0;
  }
}
</style>
