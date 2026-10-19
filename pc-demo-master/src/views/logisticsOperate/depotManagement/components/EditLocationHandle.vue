<!-- 编辑库位信息 -->
<template>
  <CustomDialog
    v-model="visible"
    :title="
      operationType === 'create' ? '新建库位' : operationType === 'update' ? '编辑库位' : '库位详情'
    "
    align-center
    @close="closeFunc"
  >
    <CustomForm ref="ruleFormRef" :configs="formConfig" v-model="form" :label-width="160" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel()">取消</el-button>
        <el-button v-if="Authed" type="primary" @click="submitForm()">保存</el-button>
      </span>
    </template>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="form.allowProductIdList"
      multiple
      @success="onSelectProductSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestFactoryModelChildAuth } from "@/api/fm"
import {
  createLogwarehouseLocationItem,
  editLogwarehouseLocationItem,
  getLogWarehouseLocationItem
} from "@/api/logistics/location"
import { queryMroModelPageList } from "@/api/operation/mro/mro-model"
import {
  type ICateSelectOption,
  type IProductModelListItem,
  requestProductCategoryList
} from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IFactoryUnderClasses } from "@/types/base-info/factory-model"

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const Authed = useButtonAuth("DepotManage_update", "DepotManage_query")
const visible = ref(false)
const ruleFormRef = ref<InstanceType<typeof CustomForm>>()
const productCateOptions = ref<ICateSelectOption[]>([])

const isBindBarcode = ref(false) // 是否绑定标签码
const operationType = ref("create") // 操作类型
const mroModelOptions = ref<any[]>([])
const selectProductVisible = ref(false)

const [form, resetForm] = useResetRef({
  locationName: "",
  id: "",
  allowMro: false,
  allowProduct: false,
  allowMroList: [] as any[],
  allowProductCategoryList: [] as any[],
  allowProductIdList: [] as any[],
  allowProductList: [] as any[],
  barcode: "",
  autoGenerateCode: false,
  locationCode: "",
  modelId: ""
})

const locationTypeList = ref<IFactoryUnderClasses[]>([])

const warehouseId = ref("") // 生产区域所在父级仓库id，用于新增

const productOptions = ref<{ label: string; value: unknown }[]>([])

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "库位名称",
    field: "locationName",
    rules: [
      {
        required: true,
        message: "请输入库位名称",
        trigger: "blur"
      }
    ],
    props: {
      disabled: operationType.value === "view"
    }
  },
  {
    componentType: "el-input",
    label: "库位编号",
    field: "locationCode",
    props: {
      disabled: operationType.value !== "create",
      placeholder: "不填则自动生成"
    }
  },
  {
    componentType: "div",
    label: "库位标签码",
    field: "",
    props: {
      class: isBindBarcode.value ? "bind" : "",
      customChildren: [
        {
          componentType: "el-input",
          props: {
            modelValue: form.value.barcode,
            placeholder: "",
            disabled:
              isBindBarcode.value || form.value.autoGenerateCode || operationType.value === "view"
          },
          events: {
            "update:modelValue": (value: string) => {
              form.value.barcode = value
            }
          }
        },
        {
          componentType: "el-checkbox",
          hidden: isBindBarcode.value,
          props: {
            modelValue: form.value.autoGenerateCode,
            label: "自动生成",
            style: "margin-left: 10px"
          },
          events: {
            change: onAutoGenerateCodeChange,
            "update:modelValue": (value: boolean) => {
              form.value.autoGenerateCode = value
            }
          }
        }
      ]
    }
  },
  {
    componentType: "el-select",
    label: "类型",
    hidden: !(locationTypeList.value.length && locationTypeList.value.length > 1),
    field: "modelId",
    rules: [
      {
        required: true,
        message: "请选择类型",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      clearable: true,
      disabled: operationType.value === "view",
      customChildren: locationTypeList.value.map((item) => {
        return {
          componentType: "el-option",
          props: {
            label: item.tagName,
            value: item.id
          }
        }
      })
    },
    events: {
      "update:modelValue": (value: string) => {
        form.value.modelId = value
      }
    }
  },
  {
    componentType: "div",
    label: "允许存放",
    field: "",
    rules: [
      {
        required: true
      }
    ],
    props: {
      customChildren: [
        {
          componentType: "el-checkbox",
          props: {
            modelValue: form.value.allowProduct,
            label: "产品",
            size: "large"
          },
          events: {
            "update:modelValue": (value: boolean) => {
              form.value.allowProduct = value
            }
          }
        },
        {
          componentType: "el-checkbox",
          props: {
            modelValue: form.value.allowMro,
            label: "MRO",
            size: "large"
          },
          events: {
            "update:modelValue": (value: boolean) => {
              form.value.allowMro = value
            }
          }
        }
      ]
    }
  },
  {
    componentType: "el-select",
    label: "允许存放的产品类别",
    hidden: !form.value.allowProduct,
    field: "allowProductCategoryList",
    props: {
      placeholder: "请选择",
      clearable: true,
      disabled: operationType.value === "view",
      filterable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: productCateOptions.value.map((item) => {
        return {
          componentType: "el-option",
          props: {
            label: item.name,
            value: item.id
          }
        }
      })
    }
  },
  {
    componentType: "el-select",
    label: "允许存放的产品",
    hidden: !form.value.allowProduct,
    field: "allowProductIdList",
    events: {
      visibleChange: () => {
        selectProductVisible.value = true
      }
    },
    props: {
      placeholder: "请选择产品",
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
      },
      readonly: true,
      clearable: true,
      multiple: true,
      disabled: operationType.value === "view"
    }
  },
  {
    componentType: "el-select",
    label: "允许存放的MRO型号",
    hidden: !form.value.allowMro,
    field: "allowMroList",
    props: {
      placeholder: "请选择",
      clearable: true,
      disabled: operationType.value === "view",
      filterable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: mroModelOptions.value.map((item) => {
        return {
          componentType: "el-option",
          props: {
            label: item.name,
            value: item.id
          }
        }
      })
    }
  }
])

/** 获取MRO型号列表 */
const getMroModelOptions = async () => {
  const res = await queryMroModelPageList({ pageQuery: { pageNum: 1, pageSize: 1000 } })
  mroModelOptions.value = res.records.map((item: any) => {
    return {
      id: item.id,
      name: item.mroModelName
    }
  })
}

/** 根据仓库id获取库位类型列表 */
const getLocationTypes = async () => {
  const res = await requestFactoryModelChildAuth(warehouseId.value)
  locationTypeList.value = res
}

/** 获取产品类别下拉 */
const getProductCateOptions = async () => {
  const res = await requestProductCategoryList()
  productCateOptions.value = res
}

/** 切换自动生成标签码操作 */
const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    form.value.barcode = ""
  }
}

const setVisible = async (
  value: boolean,
  selectedData: any,
  type: "create" | "update" | "view"
) => {
  operationType.value = type
  visible.value = value
  getProductCateOptions()
  getMroModelOptions()

  if (type === "create") {
    warehouseId.value = selectedData
    isBindBarcode.value = false
    form.value.autoGenerateCode = false
    getLocationTypes()
  } else {
    const res: any = await getLogWarehouseLocationItem(selectedData?.id)
    form.value = res
    form.value.allowMro = !!res.allowMro
    form.value.allowProduct = !!res.allowProduct
    isBindBarcode.value = !!res.barcode
    form.value.autoGenerateCode = false
    form.value.allowProductIdList = res.allowProductList.map((i: any) => i.id)
    productOptions.value = res.allowProductList.map((i: any) => {
      return {
        label: i.name,
        value: i.id
      }
    })
    form.value.allowProductCategoryList = res.allowProductCategoryList.map((i: any) => i.id)
    form.value.allowMroList = res.allowMroList.map((i: any) => i.id)
  }
}

/** 选择产品弹窗回调 */
const onSelectProductSuccess = (productList: IProductModelListItem[]) => {
  if (!productList.length) {
    return
  }

  productOptions.value = productList.map((item) => {
    return {
      label: item.name,
      value: item.id
    }
  })

  form.value.allowProductIdList = productList.map((item) => item.id)
  form.value.allowProductList = productOptions.value
}

const submitForm = async () => {
  await ruleFormRef.value?.validateForm()
  if (!form.value.allowProduct && !form.value.allowMro) {
    ElMessage({
      message: "至少选择一种允许存放类型",
      type: "warning"
    })
    return
  }

  if (operationType.value === "create") {
    // 新建
    await createLogwarehouseLocationItem({
      facilityId: warehouseId.value,
      locationName: form.value.locationName,
      locationCode: form.value.locationCode,
      barcode: form.value.barcode,
      autoGenerateCode: form.value.autoGenerateCode,
      allowMro: form.value.allowMro,
      allowProduct: form.value.allowProduct,
      allowMroList: form.value.allowMroList,
      allowProductCategoryList: form.value.allowProductCategoryList,
      allowProductList: form.value.allowProductIdList,
      modelId:
        locationTypeList.value.length === 1 ? locationTypeList.value[0].id : form.value.modelId
    })
    ElMessage({
      message: "新建成功",
      type: "success"
    })
    emits("onOk")
    visible.value = false
  } else {
    // 编辑
    await editLogwarehouseLocationItem({
      id: form.value.id,
      barcode: form.value.barcode,
      autoGenerateCode: form.value.autoGenerateCode,
      allowMro: form.value.allowMro,
      allowProduct: form.value.allowProduct,
      allowMroList: form.value.allowMroList,
      allowProductCategoryList: form.value.allowProductCategoryList,
      allowProductList: form.value.allowProductIdList,
      locationName: form.value.locationName
    })
    ElMessage({
      message: "编辑成功",
      type: "success"
    })
    emits("onOk")
    visible.value = false
  }
}

const handleCancel = () => {
  ruleFormRef.value?.resetForm()
  resetForm()
  visible.value = false
}

const closeFunc = () => {
  ruleFormRef.value?.resetForm()
  resetForm()
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped>
.el-form-item__content {
  div {
    // width: 230px !important;
    max-width: 230px !important;
  }
}

.barcode-item {
  &:deep(.el-form-item__content) {
    display: flex;

    .el-input {
      flex: 1;
    }
  }

  &.bind .el-input {
    flex: none;
  }
}
</style>
