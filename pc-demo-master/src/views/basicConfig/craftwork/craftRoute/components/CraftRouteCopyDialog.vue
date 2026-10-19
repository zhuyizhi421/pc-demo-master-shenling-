<!-- 工艺路线-复制弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" title="新建版本" @close="emit('close')">
    <CustomTitle v-if="!isReworkTemplate" title="目标制造产品"></CustomTitle>
    <CustomForm ref="customFormRef" v-model="formData" :label-width="100" :configs="formConfigs">
    </CustomForm>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">新建</el-button>
    </template>

    <!-- 产品选择弹窗 -->
    <SelectProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="[formData.productionModelId]"
      @success="onSelectProductSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { copyCraftRouteItem, getTechProcessInfo } from "@/api/craft"
import { getUnitList, type IProductModelListItem } from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"

const props = withDefaults(
  defineProps<{
    id: string // 工艺路线ID
    routePurpose?: "standard" | "rework-template"
  }>(),
  {
    routePurpose: "standard"
  }
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const dialogVisible = ref(true)
const isReworkTemplate = computed(() => props.routePurpose === "rework-template")
const formData = reactive({
  productionModelId: "",
  productionModelName: "",
  productionModelNo: "",
  no: "",
  unitId: "",
  unitName: "",
  remarks: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "产品名称",
    field: "productionModelId",
    hidden: isReworkTemplate.value,
    rules: [
      {
        required: true,
        message: "请选择产品",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择产品",
      readonly: true,
      clearable: false,
      get customChildren() {
        return productOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    events: {
      visibleChange: () => {
        selectProductVisible.value = true
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productionModelNo",
    get hidden() {
      return isReworkTemplate.value || !formData.productionModelId
    },
    props: {
      type: "text",
      placeholder: "请选择产品",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "工艺路线版本",
    field: "no",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      maxlength: 50
    }
  },
  {
    componentType: "el-select",
    label: "单位",
    field: "unitId",
    hidden: isReworkTemplate.value,
    rules: [
      {
        required: true,
        message: "请选择单位",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择单位",
      filterable: true,
      get customChildren() {
        return unitOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
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

const productOptions = ref<{ label: string; value: unknown }[]>([])
const unitOptions = ref<{ label: string; value: unknown }[]>([])
const selectProductVisible = ref(false)

onMounted(() => {
  if (props.id) {
    getCraftRouteDetail(props.id)
  }
})

/** 获取工艺路线详情 */
const getCraftRouteDetail = async (id: string) => {
  const data = await getTechProcessInfo(id)
  formData.productionModelId = data.productModel?.id || ""
  formData.productionModelName = data.productModel?.name || ""
  formData.productionModelNo = data.productModel?.code || ""
  formData.unitId = data.unitItem?.id || ""
  formData.unitName = data.unitItem?.unitName || ""
  formData.remarks = data.remarks

  if (data.productModel?.id) {
    productOptions.value = [
      {
        label: data.productModel?.name,
        value: data.productModel?.id
      }
    ]
    const unitList = await getUnitList(data.productModel?.id)
    unitOptions.value = unitList.map((item) => ({ label: item.unitName, value: item.unitId }))
  } else {
    productOptions.value = []
    unitOptions.value = []
  }

  // //   结合产出物，获取产品列表
  // const res = await getProduceBasicOutput(data.techVersion?.id)
  // res?.forEach((item) => {
  //   if (item.productModel?.id && item.productModel?.id !== data.productModel?.id) {
  //     productOptions.value.push({ label: item.productModel.name, value: item.productModel.id })
  //   }
  // })
}

/** 选择产品弹窗成功回调 */
const onSelectProductSuccess = async (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }

  let product = data[0]
  formData.productionModelId = product.id
  formData.productionModelName = product.name
  formData.productionModelNo = product.code
  formData.unitId = String(product.productModelUnitList?.[0]?.unitId || "")
  formData.unitName = product.productModelUnitList?.[0]?.unitName || ""

  productOptions.value = [
    {
      label: product.name,
      value: product.id
    }
  ]
  unitOptions.value =
    product.productModelUnitList?.map((item) => ({ label: item.unitName, value: item.unitId })) ||
    []

  await nextTick()
  await customFormRef.value?.validateField(["productionModelId", "unitId"])
}

/** 提交操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let params = {
    techProcId: props.id,
    ...(isReworkTemplate.value ? {} : { productModelId: formData.productionModelId }),
    no: formData.no,
    ...(isReworkTemplate.value ? {} : { unitId: formData.unitId }),
    remarks: formData.remarks,
    routePurpose: props.routePurpose
  }
  await copyCraftRouteItem(params)
  ElMessage.success("新建成功")
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
:deep(.custom-title) {
  margin-top: 0 !important;
}

.form-style {
  .el-form-item {
    width: calc(100% - 32px);
  }
}
</style>
