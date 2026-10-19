<!-- 工艺路线-复制弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" title="发布工艺路线版本" @close="emit('close')">
    <CustomForm ref="customFormRef" v-model="formData" :label-width="80" :configs="formConfigs">
      <template #infoTitle-default>
        <div class="top-title">产品信息</div>
      </template>

      <template #versionTitle-default>
        <div class="top-title">版本信息</div>
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">发布</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getTechProcessInfo, publishCraftRouteItem } from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"

const props = withDefaults(
  defineProps<{
    id: string // 工艺路线ID
    publishRemarks?: string // 发布工艺路线备注
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const dialogVisible = ref(true)
const formData = reactive({
  productionModelName: "",
  productionModelNo: "",
  version: "",
  remarks: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    special: true,
    field: "infoTitle",
    slots: {
      default: "infoTitle-default"
    }
  },
  {
    componentType: "el-input",
    label: "产品名称",
    field: "productionModelName",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productionModelNo",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "div",
    special: true,
    field: "versionTitle",
    slots: {
      default: "versionTitle-default"
    }
  },
  {
    componentType: "el-input",
    label: "版本号",
    field: "version",
    rules: [
      {
        required: true,
        message: "请输入版本",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入不重复的版本号",
      maxlength: 50
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

onMounted(() => {
  if (props.id) {
    getCraftRouteDetail(props.id)
    formData.remarks = props.publishRemarks || ""
  }
})

/** 获取工艺路线详情 */
const getCraftRouteDetail = async (id: string) => {
  const data = await getTechProcessInfo(id)
  formData.productionModelName = data.productModel.name
  formData.productionModelNo = data.productModel.code
}

/** 提交操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let params = {
    techProcId: props.id,
    version: formData.version,
    remarks: formData.remarks
  }
  await publishCraftRouteItem(params)
  ElMessage.success("发布成功")
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.top-title {
  margin: 0 0 20px;
  font-size: 16px;
  color: var(--g-color);
}
</style>
