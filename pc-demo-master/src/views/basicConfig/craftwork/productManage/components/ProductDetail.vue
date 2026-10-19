<template>
  <div class="layout-child-page-container">
    <!-- 基础信息 -->
    <div class="base-content">
      <CustomTitle
        :title="isEdit ? (id ? '编辑产品' : '新建产品') : '查看产品'"
        :is-table-title="false"
        show-short-bar
      >
        <div>
          <template v-if="isEdit">
            <el-button @click="onCancel">取消</el-button>
            <el-button @click="onSave" type="primary" :loading="isSaving">保存</el-button>
          </template>
          <template v-else>
            <el-button @click="onBack">返回</el-button>
            <el-button @click="onChangeEdit" type="primary" v-if="!isReadonly" :loading="isLoading">编辑</el-button>
          </template>
        </div>
      </CustomTitle>

      <el-loading v-if="isLoading" text="加载中..." fullscreen />

      <template v-if="isEdit">
        <CustomForm
          ref="customFormRef"
          v-model="formData"
          :configs="formConfigs"
          :label-width="130"
        >
          <template #divide-default>
            <div class="dashed-divide"></div>
          </template>

          <template #period-label>
            <div class="custom-label">
              <el-tooltip
                effect="dark"
                content="在库产品到达保质期后，自动创建在库检任务(需开启配置)"
                placement="top-start"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              <span>保质期</span>
            </div>
          </template>
          <template #period-default>
            <el-input-number
              v-model="formData.period"
              :min="1"
              step-strictly
              controls-position="right"
              placeholder="请输入保质期"
            >
              <template #suffix>天</template>
            </el-input-number>
          </template>
        </CustomForm>
      </template>
      <template v-else>
        <CustomDescription
          :data="formData"
          :configs="detailConfig"
          :label-width="130"
          style="padding: 0"
        ></CustomDescription>
        <div class="detail-dashed-divide"></div>
        <CustomDescription
          :data="formData"
          :configs="detailOtherConfig"
          :label-width="130"
          style="padding: 0 0 10px 0"
        >
          <template #period-label>
            <div class="custom-label">
              <el-tooltip
                effect="dark"
                content="在库产品到达保质期后，自动创建在库检任务(需开启配置)"
                placement="top-start"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              <span>保质期：</span>
            </div>
          </template>
        </CustomDescription>
      </template>
    </div>

    <!-- 更多信息 -->
    <div class="other-content" v-if="!isEdit && id && !isReadonly">
      <div class="other-organ">
        <div class="organ-box" @click="onToggleMore">
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
      <template v-if="isShowMore">
        <CustomTitle
          title="更多配置"
          :is-table-title="false"
          show-short-bar
          style="margin-top: 0"
        ></CustomTitle>
        <div class="table-container">
          <el-radio-group :model-value="activeTab" @change="onChangeMoreTab">
            <el-radio-button :value="EnumTab.InspectReq">产品检验配置</el-radio-button>
            <el-radio-button :value="EnumTab.Unit">产品单位配置</el-radio-button>
            <el-radio-button :value="EnumTab.Document">产品文档配置</el-radio-button>
          </el-radio-group>

          <template v-if="activeTab === EnumTab.InspectReq">
            <ProductInspectTab ref="productInspectTabRef" :id="id" :isReadonly="!isEdit && isReadonly" />
          </template>
          <template v-if="activeTab === EnumTab.Unit">
            <ProductUnitTab
              :id="id"
              :isReadonly="!isEdit && isReadonly"
              :unitList="unitList"
              :currentDefaultUnitId="formData.defaultUnitId"
              @refreshDetailData="onRefreshDetailData"
            />
          </template>
          <template v-if="activeTab === EnumTab.Document">
            <ProductDocumentTab :id="id" :isReadonly="!isEdit && isReadonly" />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElLoading,ElMessage, ElMessageBox } from "element-plus"
import { computed, onMounted,ref, watch } from "vue"

import { queryFactoryModelList } from "@/api/fm"
import {
  createProductModel,
  createProductModelUnit,
  getProductModelById,
  getUnitList,
  type IProductModelPagedRes,
  requestProductCategoryList,
  updateProductModel} from "@/api/product"
import { getUnit } from "@/api/units"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { ComponentExposed } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useProductStore from "@/store/modules/product"
import type { IOption } from "@/types/common"

import ProductDocumentTab from "./ProductDocumentTab.vue"
import ProductInspectTab from "./ProductInspectTab.vue"
import ProductUnitTab from "./ProductUnitTab.vue"

type ProductModelData = IProductModelPagedRes["records"][number] | null

defineOptions({
  name: "ProductDetail"
})

const productStore = useProductStore()

enum EnumTab {
  InspectReq, // 产品检验配置
  Unit, // 产品单位配置
  Document // 产品文档配置
}

const props = defineProps<{
  isReadonly: boolean
  productInfo?: ProductModelData
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "changeCrumbs", label: string): void
}>()

/** 基础信息配置 */
// 是否编辑，只读时不会为true
const isEdit = ref(false)
// 加载状态
const isLoading = ref(false)
// 保存状态
const isSaving = ref(false)

// 产品类型下拉
const productTypeOptions = computed(() => {
  return productStore.productTypeList
})
// 单位下拉
const unitList = ref<(IOption & { unitCode: string })[]>([])
const unitListReq = ref<IOption[]>([])
const unitOptions = computed(() => {
  let options: IOption[] = []
  // 无论编辑还是新建，都先从全部单位列表里选
  options = unitList.value.map((item) => ({
    label: item.label,
    value: item.value
  }))
  // 如果是编辑模式且有配置单位，优先使用配置的单位
  if (id.value && unitListReq.value.length > 0) {
    options = unitListReq.value
  }
  return options
})
// 产品类别下拉
const productCateOptions = ref<(IOption & { code: string })[]>([])

const normalizeUnitId = (value?: string | number | null) => {
  return value === undefined || value === null || value === "" ? "" : String(value)
}


const id = ref<string>("")
const formData = ref<{
  name: string
  code: string
  productCategoryId: string
  productCategoryCode: string
  productType?: number
  remark: string
  defaultUnitId: string
  defaultUnitName?: string
  period?: number
  customizeFields: any[]
  drawingNumber: string
  specification: string
  minStock: number | null
  safeStock: number | null
}>({
  name: "",
  code: "",
  productCategoryId: "",
  productCategoryCode: "",
  productType: undefined,
  remark: "",
  defaultUnitId: "",
  defaultUnitName: "",
  period: undefined,
  customizeFields: [],
  drawingNumber: "",
  specification: "",
  minStock: null,
  safeStock: null
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "name",
    label: "产品名称："
  },
  {
    field: "code",
    label: "产品编号："
  },
  {
    field: "drawingNumber",
    label: "产品图号："
  },
  {
    field: "specification",
    label: "产品规格："
  },
  {
    field: "productType",
    label: "产品类型：",
    formatter: ({ data: { productType } }) => {
      return productTypeOptions.value.find((item) => item.value === productType)?.label
    }
  },
  {    field: "defaultUnitId",
    label: "默认单位：",
    formatter: ({ data: { defaultUnitId, defaultUnitName } }) => {
      const unitId = normalizeUnitId(defaultUnitId)
      if (!unitId) return "-"
      // 先使用 defaultUnitName（如果存在），再从 unitListReq 中查找（编辑模式），再从 unitList 中查找（新建模式），最后如果都找不到且默认单位ID为"1"，返回"件"
      return defaultUnitName || 
             unitListReq.value.find((item) => normalizeUnitId(item.value) === unitId)?.label || 
             unitList.value.find((item) => normalizeUnitId(item.value) === unitId)?.label || 
             (unitId === "1" ? "件" : "-")
    }
  },
  {
    field: "productCategoryId",
    label: "产品类别名称：",
    formatter: ({ data: { productCategoryId } }) => {
      return productCateOptions.value.find((item) => item.value === productCategoryId)?.label
    }
  },
  {
    field: "productCategoryCode",
    label: "产品类别编号："
  },
  {
    field: "remark",
    label: "备注：",
    colspan: -1
  }
])
const detailOtherConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "minStock",
    label: "最低库存：",
    formatter: ({ data: { minStock } }) => {
      return minStock !== null && minStock !== undefined ? minStock.toFixed(2) : "-"
    }
  },
  {
    field: "safeStock",
    label: "安全库存：",
    formatter: ({ data: { safeStock } }) => {
      return safeStock !== null && safeStock !== undefined ? safeStock.toFixed(2) : "-"
    }
  },
  {
    field: "period",
    label: "保质期：",
    formatter: ({ data: { period } }) => {
      return period ? `${period}天` : ""
    },
    slots: {
      label: "period-label"
    }
  }
])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "产品名称",
    field: "name",
    rules: [
      {
        required: true,
        message: "请输入产品名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入产品名称",
      maxlength: 50
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "code",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return !!id.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品图号",
    field: "drawingNumber",
    props: {
      type: "text",
      placeholder: "请输入产品图号"
    }
  },
  {
    componentType: "el-input",
    label: "产品规格",
    field: "specification",
    props: {
      type: "text",
      placeholder: "请输入产品规格"
    }
  },
  {
    componentType: "el-select",
    label: "产品类型",
    field: "productType",
    rules: [
      {
        required: true,
        message: "请选择产品类型",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择产品类型",
      get customChildren() {
        return productTypeOptions.value.map((item) => {
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
    componentType: "el-select",
    label: "默认单位",
    field: "defaultUnitId",
    rules: [
      {
        required: true,
        message: "请选择默认单位",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择默认单位",
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
    componentType: "el-select",
    label: "产品类别名称",
    field: "productCategoryId",
    rules: [
      {
        required: true,
        message: "请选择产品类别名称",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择产品类别名称",
      filterable: true,
      get customChildren() {
        return productCateOptions.value.map((item) => {
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
      change: onChangeProductCategory
    }
  },
  {
    componentType: "el-input",
    label: "产品类别编号",
    field: "productCategoryCode",
    props: {
      type: "text",
      placeholder: "选择产品类别后显示",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "div",
    special: true,
    colspan: -1,
    slots: {
      default: "divide-default"
    }
  },
  {
    componentType: "el-input-number",
    label: "最低库存",
    field: "minStock",
    props: {
      placeholder: "请输入最低库存",
      min: 0,
      max: 999999999,
      step: 0.01,
      precision: 2,
      class: "w-[100%]"
    }
  },
  {
    componentType: "el-input-number",
    label: "安全库存",
    field: "safeStock",
    props: {
      placeholder: "请输入安全库存",
      min: 0,
      max: 999999999,
      step: 0.01,
      precision: 2,
      class: "w-[100%]"
    }
  },
  {
    componentType: "div",
    label: "保质期",
    field: "period",
    props: {
      class: "w-[100%]"
    },
    labelSlots: "period-label",
    slots: {
      default: "period-default"
    }
  }
])

/** 更多信息配置 */
const activeTab = ref(EnumTab.InspectReq)
// 是否显示更多配置
const isShowMore = ref(false)
const productInspectTabRef = ref<ComponentExposed<typeof ProductInspectTab>>()

const confirmInspectLeave = async () => {
  if (!isShowMore.value || activeTab.value !== EnumTab.InspectReq) return true
  return (await productInspectTabRef.value?.confirmBeforeLeave?.()) ?? true
}

const onBack = async () => {
  const canLeave = await confirmInspectLeave()
  if (!canLeave) return
  emit("close")
}

const onToggleMore = async () => {
  if (!isShowMore.value) {
    isShowMore.value = true
    return
  }

  const canLeave = await confirmInspectLeave()
  if (!canLeave) return
  isShowMore.value = false
}

const onChangeMoreTab = async (tab: EnumTab) => {
  if (tab === activeTab.value) return

  const canLeave = await confirmInspectLeave()
  if (!canLeave) return
  activeTab.value = tab
}

const applyProductInfo = (productInfo?: ProductModelData) => {
  if (!productInfo) return

  formData.value = {
    code: productInfo.code,
    name: productInfo.name,
    productCategoryId: productInfo.productCategoryId,
    productCategoryCode: productInfo.productCategoryCode,
    productType: productInfo.productType,
    remark: productInfo.remark,
    defaultUnitId: normalizeUnitId(productInfo.defaultUnitId),
    defaultUnitName: productInfo.defaultUnitName ?? "",
    period: productInfo.period as any,
    customizeFields: productInfo.customizedFields || [],
    drawingNumber: productInfo.drawingNumber,
    specification: productInfo.specification,
    minStock: productInfo.minStock ?? null,
    safeStock: productInfo.safeStock ?? null
  }
}

const loadProductDetail = async () => {
  if (!id.value) return

  try {
    isLoading.value = true
    const res = await getProductModelById(id.value)
    applyProductInfo(res)
    await getUnitListReq()
  } catch (error) {
    console.error('加载产品详情失败:', error)
    ElMessage.error('加载产品详情失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

/** 取消 */
const onCancel = async () => {
  const confirm = await ElMessageBox.confirm("填写的数据将不会被保存,是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  if (confirm === "confirm") {
    if (id.value) {
      activeTab.value = EnumTab.InspectReq
      await loadProductDetail()
      isEdit.value = false
      emit("changeCrumbs", "detail")
    } else {
      emit("close")
    }
  }
}

/** 保存 */
const onSave = async () => {
  try {
    const valid = await customFormRef.value?.validateForm()
    if (!valid) return

    isSaving.value = true
    const { defaultUnitName, ...payload } = formData.value
    void defaultUnitName
    const params = {
      ...payload,
      minStock: payload.minStock ?? undefined,
      safeStock: payload.safeStock ?? undefined
    }
    if (id.value) {
      await updateProductModel({
        ...params,
        id: String(id.value)
      } as Parameters<typeof updateProductModel>[0])
      await loadProductDetail()
      ElMessage.success("编辑成功")
    } else {
      const res = await createProductModel(params as Parameters<typeof createProductModel>[0])
      id.value = res.id
      formData.value.code = res.code
      
      // 保存默认单位到产品单位配置
      if (formData.value.defaultUnitId) {
        try {
          await createProductModelUnit({
            productModelId: res.id,
            unitId: formData.value.defaultUnitId,
            isDefaultUnit: 1
          })
        } catch (error) {
          console.error('保存默认单位到产品单位配置失败:', error)
          // 这里不抛出错误，因为主要的产品创建已经成功
        }
      }
      
      await getUnitListReq()
      formData.value.defaultUnitId = normalizeUnitId(res.defaultUnitId)
      await loadProductDetail()
      ElMessage.success("新建成功")
    }
    emit("changeCrumbs", "detail")
    activeTab.value = EnumTab.InspectReq
    isEdit.value = false
  } catch (error) {
    console.error('保存产品失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

/** 刷新详情数据 */
const onRefreshDetailData = async () => {
  try {
    await loadProductDetail()
  } catch (error) {
    console.error('刷新详情数据失败:', error)
    ElMessage.error('刷新数据失败，请稍后重试')
  }
}

/** 切换编辑状态 */
const onChangeEdit = async () => {
  try {
    const canLeave = await confirmInspectLeave()
    if (!canLeave) return

    isLoading.value = true
    if (id.value) {
      await getUnitListReq()
    }
    emit("changeCrumbs", "update")
    isEdit.value = true
  } catch (error) {
    console.error('进入编辑模式失败:', error)
    ElMessage.error('进入编辑模式失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

/** 获取当前配置单位列表 */
const getUnitListReq = async () => {
  if (!id.value) return
  
  try {
    const res = await getUnitList(id.value)
    unitListReq.value = res.map((item) => {
      return {
        value: normalizeUnitId(item.unitId),
        label: item.unitName
      }
    })
  } catch (error) {
    console.error('获取单位列表失败:', error)
    ElMessage.error('获取单位列表失败，请稍后重试')
  }
}

/** 获取单位下拉 */
const getUnitOptions = async () => {
  try {
    const res = await getUnit()
    unitList.value = res.map((item) => {
      return {
        value: normalizeUnitId(item.id),
        label: item.unitName,
        unitCode: item.unitCode
      }
    })
  } catch (error) {
    console.error('获取单位选项失败:', error)
    ElMessage.error('获取单位选项失败，请稍后重试')
  }
}

/** 获取产品类别下拉 */
const getProductCateOptions = async () => {
  try {
    const res = await requestProductCategoryList()
    productCateOptions.value = res.map((item) => {
      return {
        value: item.id,
        label: item.name,
        code: item.code
      }
    })
  } catch (error) {
    console.error('获取产品类别失败:', error)
    ElMessage.error('获取产品类别失败，请稍后重试')
  }
}

/** 切换产品类别 */
const onChangeProductCategory = (val: string) => {
  const target = productCateOptions.value.find((item) => item.value === val)
  formData.value.productCategoryCode = target?.code ?? ""
}



// 监听 id 变化，获取单位列表
watch(() => id.value, async (newId) => {
  if (newId) {
    await getUnitListReq()
  }
})

onMounted(async () => {
  id.value = props.productInfo?.id ?? ""
  // 非只读且没有id时，为编辑状态（新建）
  if (!props.isReadonly && !id.value) {
    isEdit.value = true
  }
  
  try {
    isLoading.value = true
    // 并行加载数据
    await Promise.all([
      getUnitOptions(),
      getProductCateOptions()
    ])
    
    if (id.value) {
      await loadProductDetail()
    }

    // 保留原回显逻辑
    if (!id.value && props.productInfo) {
      formData.value = {
        code: props.productInfo.code,
        name: props.productInfo.name,
        productCategoryId: props.productInfo.productCategoryId,
        productCategoryCode: props.productInfo.productCategoryCode,
        productType: props.productInfo.productType,
        remark: props.productInfo.remark,
        defaultUnitId: normalizeUnitId(props.productInfo.defaultUnitId),
        period: props.productInfo.period as any,
        customizeFields: props.productInfo.customizedFields || [],
        drawingNumber: props.productInfo.drawingNumber,
        specification: props.productInfo.specification,
        minStock: props.productInfo.minStock ?? null,
        safeStock: props.productInfo.safeStock ?? null
      }
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.base-content {
  padding: 12px 16px;

  .dashed-divide {
    width: 100%;
    border-top: 1px dashed #e4e7ed;
    margin: 12px 0 30px;
  }
  .detail-dashed-divide {
    width: 100%;
    border-top: 1px dashed #e4e7ed;
    margin: 20px 0;
  }
  .custom-label {
    display: flex;
    align-items: center;

    span {
      margin-left: 4px;
    }
  }
  .el-input-number {
    width: 100%;
  }
  :deep(.custom-description) {
    .custom-label {
      justify-content: flex-end;
    }
  }
}
.other-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 16px 12px;
  border-top: 1px solid #e4e7ed;

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
  .table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    .el-radio-group {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
</style>
