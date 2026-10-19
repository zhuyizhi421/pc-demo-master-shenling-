<!-- 工艺路线-新建弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" :title="dialogTitle" @close="emit('close')">
    <CustomForm ref="customFormRef" v-model="formData" :label-width="100" :configs="formConfigs">
    </CustomForm>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">保存</el-button>
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

import { updateCraftRouteItem } from "@/api/craft"
import { getProductModelById, type IProductModelListItem } from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import { EnumProductionOrderSource, EnumProductionOrderSourceMap } from "@/constant/enums"
import type { ICraftRouteItem } from "@/types/base-info/craftRoute"

const props = withDefaults(
  defineProps<{
    productId: string
    routePurpose?: "standard" | "rework-template"
  }>(),
  {
    routePurpose: "standard"
  }
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: ICraftRouteItem): void
}>()

const dialogVisible = ref(true)
const isReworkTemplate = computed(() => props.routePurpose === "rework-template")
const dialogTitle = computed(() => (isReworkTemplate.value ? "新建返工工艺模板" : "新建工艺路线"))
const formData = reactive({
  productionModelId: "",
  productionModelName: "",
  productionModelNo: "",
  no: "",
  unitId: "",
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
    label: "工艺版本",
    field: "no",
    rules: [
      {
        required: true,
        message: "请输入工艺版本",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入工艺版本",
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
  if (!isReworkTemplate.value && props.productId) {
    // 从产品id存在时，创建工艺路线时，默认选择该产品
    getProductInfo(props.productId)
  }
})

/** 获取指定产品id的产品信息 */
const getProductInfo = async (productId: string) => {
  const data = await getProductModelById(productId)
  await onSelectProductSuccess([data])
}

/** 选择产品弹窗成功回调 */
const onSelectProductSuccess = async (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }

  let product = data[0]
  formData.productionModelId = String(product.id)
  formData.productionModelName = product.name
  formData.productionModelNo = product.code
  formData.unitId = String(product.productModelUnitList?.[0]?.unitId || "")
  productOptions.value = [
    {
      label: product.name,
      value: String(product.id)
    }
  ]
  unitOptions.value =
    product.productModelUnitList?.map((item) => ({
      label: item.unitName,
      value: String(item.unitId)
    })) ||
    []

  await nextTick()
  await customFormRef.value?.validateField(["productionModelId", "unitId"])
}

/** 提交操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  let params = {
    no: formData.no,
    remarks: formData.remarks,
    routePurpose: props.routePurpose,
    ...(!isReworkTemplate.value
      ? {
          productionModelId: formData.productionModelId,
          unitId: formData.unitId
        }
      : {})
  }
  const data = await updateCraftRouteItem(params)
  ElMessage.success("新建成功")
  emit("close")
  emit("success", data)
}
</script>

<style lang="scss" scoped>
.form-style {
  .el-form-item {
    width: 100%;
    margin-right: 0;
  }
}
</style>
