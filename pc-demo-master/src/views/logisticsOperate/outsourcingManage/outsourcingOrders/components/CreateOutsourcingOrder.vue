<template>
  <div class="ceContainer">
    <div class="create-container">
      <div>
        <el-button icon="ArrowLeft" @click="emit('cancel')">返回</el-button>
      </div>
      <CustomTitle :title="title" :is-table-title="false" show-short-bar />
      <CustomForm ref="customFormRef" v-model="formInline" :configs="formConfigs">
        <template #upload-default>
          <el-button icon="Upload">上传附件</el-button>
        </template>
        <template #upload-tip>
          <div class="el-upload__tip tips">请选择10M以内，.rar .zip 格式文件</div>
        </template>
      </CustomForm>

      <el-radio-group v-model="activeTab" class="radio-tab">
        <el-radio-button :value="EnumTab.Material">物料清单</el-radio-button>
        <el-radio-button :value="EnumTab.Product">产品清单</el-radio-button>
      </el-radio-group>
      <div class="table-box">
        <CustomTable
          v-show="activeTab === EnumTab.Material"
          ref="tableMaterialRef"
          v-model:table-data="tableDataMaterials"
          :config="tableConfigMaterials"
        />
        <CustomTable
          v-show="activeTab === EnumTab.Product"
          ref="tableProductRef"
          v-model:table-data="tableDataOutputs"
          :config="tableConfigOutputs"
        />
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="onSave">{{ props.selectId ? "保存" : "创建" }}</el-button>
    </div>
  </div>

  <!-- 产品选择 -->
  <CustomSelectDialog
    :type="EnumDialogType.Product"
    :props="productDialogProps"
    :events="{
      'update:modelValue': (val: boolean) => (selectProductVisible = val),
      success: (data: IProductModelListItem[]) => selectProductOk(data)
    }"
  />

  <!-- 工艺路线选择 -->
  <CustomSelectDialog
    :type="EnumDialogType.CraftRoute"
    :props="craftRouteDialogProps"
    :events="{
      'update:modelValue': (val: boolean) => (selectCraftRouteVisible = val),
      success: (data: ICraftRouteItem[]) => selectCraftRouteOk(data)
    }"
  />

  <!-- 生产订单选择 -->
  <SelectProductOrder v-model="selectProductOrderVisible" @on-ok="selectProductOrderOk" />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getProductionOrderById,
  inferOrderMaterials,
  inferOrderOutputs,
  inferSerialMaterials,
  inferSerialOutputs,
  saveDelegateOrder,
  updateDelegateOrder
} from "@/api/logistics/delegate"
import type { IProductModelListItem } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomSelectDialog from "@/components/CustomSelectDialog/index.vue"
import { EnumDialogType } from "@/components/CustomSelectDialog/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectSupplier from "@/components/SelectSupplier/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import type { ICraftRouteItem } from "@/types/base-info/craftRoute"
import type { IFile } from "@/types/base-info/implement-config"
import type {
  DelegateOrderAddInter,
  IOutOrderProductItem,
  TsesDelegateOrderMaterialVo
} from "@/types/logistics/delegate"
import type { IProductionOrderPageItem } from "@/types/production-manage/product-order"
import { precisionConversion, sleep } from "@/utils/common"

import type { IPlanAbleList } from "./SelectProductOrder.vue"
import SelectProductOrder from "./SelectProductOrder.vue"

/** tab枚举 */
enum EnumTab {
  Product = "product",
  Material = "material"
}

/** 委外类型枚举 */
enum EnumDelegateType {
  Order = 3, // 订单委外
  Process = 4 // 工序委外
}

const props = withDefaults(
  defineProps<{
    selectId?: string
  }>(),
  {}
)
const emit = defineEmits(["cancel"])

const title = computed(() => {
  if (props.selectId) {
    return "编辑委外订单"
  } else return "新建委外订单"
})

const selectProductVisible = ref(false)
const selectProductOrderVisible = ref(false)
const selectCraftRouteVisible = ref(false)
const activeTab = ref(EnumTab.Material)
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const tableMaterialRef = ref<ComponentExposed<typeof CustomTable>>()
const tableProductRef = ref<ComponentExposed<typeof CustomTable>>()
const tableDataMaterials = ref<TsesDelegateOrderMaterialVo[]>([])
const tableDataOutputs = ref<IOutOrderProductItem[]>([])
const selectedCraftRouteData = ref<any>({}) //选择的工艺路线
const isDeal = ref(false)

const initFormLine = {
  delegateType: EnumDelegateType.Process, //委外类型
  supplierId: "", //供应商
  no: "", //委外单号
  supplierNo: "", //供应商编号
  productName: "", //产品名称
  productionModelNo: "", //产品编号
  productModelId: "", //产品id
  originalOrderId: "", //委外订单的原生产订单ID，工序委外需要
  originalOrderNo: "",
  processId: "", //工艺路线id
  techProcessNo: "",
  techProcessName: "",
  fileList: [] as IFile[], //附件Id
  orderAmount: undefined, //委外数量
  expectedDate: "", //预计收货时间
  remark: "", //备注
  routeItems: [] as { id: string; orderAmount: number }[]
}
const formInline = reactive({ ...initFormLine })

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "委外类型",
    field: "delegateType",
    rules: [
      {
        required: true,
        message: "请选择委外类型",
        trigger: "blur"
      }
    ],
    props: {
      customChildren: [
        {
          componentType: "el-option",
          props: {
            label: "订单委外",
            value: 3
          }
        },
        {
          componentType: "el-option",
          props: {
            label: "工序委外",
            value: 4
          }
        }
      ],
      clearable: false,
      get disabled() {
        return !!props.selectId
      }
    },
    events: {
      change: () => onChangeDelegateType()
    }
  },
  {
    componentType: markRaw(SelectSupplier),
    label: "供应商名称",
    field: "supplierId",
    rules: [{ required: true, message: "请选择供应商", trigger: "change" }],
    events: {
      "origin-data-change": (data: any) => selectSupplierChange(data),
      change: () => onSupplierChange()
    }
  },
  {
    componentType: "el-input",
    label: "供应商编号",
    field: "supplierNo",
    props: {
      type: "text",
      placeholder: "",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "委外单号",
    field: "no",
    props: {
      type: "text",
      placeholder: "无输入时系统自动创建",
      get disabled() {
        return !!props.selectId
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品名称",
    field: "productName",
    rules: [
      {
        required: true,
        message: "请选择产品",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请选择产品",
      clearable: false,
      get disabled() {
        return formInline.delegateType === EnumDelegateType.Process
      }
    },
    events: {
      click: () => {
        selectProductVisible.value = true
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productionModelNo",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划收货日期",
    field: "expectedDate",
    rules: [
      {
        required: true,
        message: "请选择计划收货日期",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择日期",
      valueFormat: "YYYY-MM-DD",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "生产订单",
    field: "originalOrderNo",
    get hidden() {
      return formInline.delegateType !== EnumDelegateType.Process
    },
    rules: [
      {
        required: true,
        message: "请选择生产订单",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请选择生产订单",
      readonly: true
    },
    events: {
      click: () => {
        selectProductOrderVisible.value = true
      }
    }
  },
  {
    componentType: "el-input",
    label: "工艺路线",
    field: "techProcessNo",
    get hidden() {
      return formInline.delegateType !== EnumDelegateType.Order
    },
    rules: [
      {
        required: true,
        message: "请选择工艺路线",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请选择工艺路线",
      readonly: true,
      get disabled() {
        return !formInline.productName
      }
    },
    events: {
      click: () => {
        selectCraftRouteVisible.value = true
      }
    }
  },
  {
    componentType: "el-input",
    label: "委外数量",
    field: "orderAmount",
    get hidden() {
      return formInline.delegateType !== EnumDelegateType.Order
    },
    rules: [
      {
        required: true,
        message: "请输入委外数量",
        trigger: "blur"
      }
    ],
    props: {
      type: "number",
      placeholder: "请输入"
    },
    events: {
      blur: async () => handleOrderAmount()
    }
  },
  {
    componentType: markRaw(UploadFile),
    label: "附件",
    field: "fileList",
    colspan: 2,
    props: {
      accept: ".rar,.zip"
    },
    slots: {
      default: "upload-default",
      tip: "upload-tip"
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
      rows: 2,
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const tableConfigMaterials = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "需求数量",
      minWidth: 160,
      align: "center",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 160,
      align: "center"
    }
  ]
})

const tableConfigOutputs = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "产出数量",
      minWidth: 160,
      align: "center",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 160,
      align: "center"
    }
  ]
})

/** 选择产品弹窗props */
const productDialogProps = computed(() => {
  return {
    modelValue: selectProductVisible.value,
    selectedRowKeys: [formInline.productModelId]
  }
})

/** 选择工艺路线弹窗props */
const craftRouteDialogProps = computed(() => {
  return {
    modelValue: selectCraftRouteVisible.value,
    publishStatus: 2,
    queryProductNo: formInline.productionModelNo,
    selectedRowKeys: selectedCraftRouteData.value.id ? [selectedCraftRouteData.value.id] : [],
    disabledNo: true,
    disabledStatus: true
  }
})

onMounted(async () => {
  init()
})

watch(
  () => activeTab.value,
  () => {
    getTabList()
  }
)

const init = async () => {
  if (props.selectId) {
    getDetail()
  } else {
    Object.assign(formInline, initFormLine)
  }
}

/** 切换委外类型 */
const onChangeDelegateType = () => {
  tableDataMaterials.value = []
  tableDataOutputs.value = []
  formInline.productName = ""
  formInline.productionModelNo = ""
  formInline.productModelId = ""
  formInline.originalOrderId = ""
  formInline.originalOrderNo = ""
  formInline.processId = ""
  formInline.techProcessNo = ""
}

/** 供应商选择 */
const selectSupplierChange = (data: any) => {
  formInline.supplierNo = data?.supplierCode ?? ""
}

/** 供应商切换 */
const onSupplierChange = () => {
  if (!formInline.supplierId) {
    formInline.supplierNo = ""
  }
}

/** 产品选择 */
const selectProductOk = (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }

  const product = cloneDeep(data)[0]
  formInline.productName = product.name
  formInline.productionModelNo = product.code
  formInline.productModelId = product.id
  formInline.techProcessNo = ""
  formInline.processId = ""
  selectedCraftRouteData.value = {}
  tableDataOutputs.value = []
  tableDataMaterials.value = []
}

/** 工艺路线选择回调 */
const selectCraftRouteOk = async (data: ICraftRouteItem[]) => {
  if (data.length) {
    selectedCraftRouteData.value = cloneDeep(data)[0]
    formInline.processId = selectedCraftRouteData.value.id
    formInline.techProcessNo = selectedCraftRouteData.value.no
    if (!formInline.orderAmount) return
    queryInferOrderOutputs()
    queryInferOrderMaterials()
  }
}

/** 生产订单选择 */
const selectProductOrderOk = (data: IProductionOrderPageItem[], routeData: IPlanAbleList[]) => {
  if (!data.length) {
    return
  }

  const order = cloneDeep(data)[0]
  formInline.originalOrderId = order.id
  formInline.originalOrderNo = order.no
  formInline.routeItems = routeData.map((item) => {
    return {
      id: item.techFlowNodeId,
      orderAmount: Number(item.amount)
    }
  })
  formInline.productName = order.productModel.name
  formInline.productionModelNo = order.productModel.code
  formInline.productModelId = order.productModel.id
  queryInferSerialOutputs()
  queryInferSerialMaterials()
}

/** 查询物料清单，工序委外用 */
const queryInferSerialMaterials = async () => {
  if (!formInline.originalOrderId || !formInline.routeItems) return
  tableMaterialRef.value?.setLoading(true)
  const res = await inferSerialMaterials({
    delegateOrderId: formInline.originalOrderId,
    items: formInline.routeItems
  })
  tableDataMaterials.value = res
  tableMaterialRef.value?.setLoading(false)
}

/** 查询产出清单，工序委外用 */
const queryInferSerialOutputs = async () => {
  if (!formInline.originalOrderId || !formInline.routeItems) return
  tableProductRef.value?.setLoading(true)
  const res = await inferSerialOutputs({
    delegateOrderId: formInline.originalOrderId,
    items: formInline.routeItems
  })
  tableDataOutputs.value = res || []
  tableProductRef.value?.setLoading(false)
}

/** 查询物料清单，订单委外用 */
const queryInferOrderMaterials = async () => {
  if (!formInline.processId || !formInline.orderAmount) return
  tableMaterialRef.value?.setLoading(true)
  const res = await inferOrderMaterials({
    orderProcessId: formInline.processId,
    quantity: formInline.orderAmount
  })
  tableDataMaterials.value = res || []
  tableMaterialRef.value?.setLoading(false)
}

/** 查询产出清单，订单委外用 */
const queryInferOrderOutputs = async () => {
  if (!formInline.processId || !formInline.orderAmount) return
  tableProductRef.value?.setLoading(true)
  const res = await inferOrderOutputs({
    orderProcessId: formInline.processId,
    quantity: formInline.orderAmount
  })
  tableDataOutputs.value = res || []
  tableProductRef.value?.setLoading(false)
}

/** 获取tab清单 */
const getTabList = async () => {
  if (formInline.delegateType == EnumDelegateType.Process && formInline.routeItems.length) {
    if (activeTab.value === EnumTab.Material) {
      queryInferSerialMaterials()
    } else {
      queryInferSerialOutputs()
    }
  } else if (formInline.delegateType == EnumDelegateType.Order) {
    if (activeTab.value === EnumTab.Product) {
      queryInferOrderMaterials()
    } else {
      queryInferOrderOutputs()
    }
  }
}

/** 修改订单数量 */
const handleOrderAmount = async () => {
  try {
    if (!formInline.processId) return
    isDeal.value = true
    await queryInferOrderMaterials()
    await queryInferOrderOutputs()
    isDeal.value = false
  } catch {
    isDeal.value = false
  }
}

/** 获取详情 */
const getDetail = async () => {
  const res = await getProductionOrderById({ id: props.selectId! })

  Object.assign(formInline, {
    delegateType: res.delegateType, //委外类型
    supplierId: res.supplierId, //供应商
    no: res.no, //委外单号
    supplierNo: res.supplierCode, //供应商编号
    productName: res.productModelName, //产品名称
    productionModelNo: res.productModelCode, //产品编号
    productModelId: res.productModelId, //产品id
    originalOrderId: res.originalOrderId, //委外订单的原生产订单ID，工序委外需要
    originalOrderNo: res.originalOrderNo, // 委外订单的原生订单编号
    processId: res.processId || "", //工艺路线id
    techProcessNo: res.techProcessNo || "", // 工艺路线编号
    techProcessName: res.techProcessName, // 工艺路线名称
    fileList: (res.attachFile || []).map((item) => ({
      fileId: item.fileId!,
      fileName: item.fileName!
    })),
    orderAmount: res.amount, //委外数量
    expectedDate: res.expectedReceiveTime, //预计收货时间
    remark: res.remark //备注
  })

  tableDataMaterials.value = res.materialVos || []
  tableDataOutputs.value = res.outputVos || []
}

/** 保存、创建 */
const onSave = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const waitDeal = async () => {
    await sleep(100)
    if (isDeal.value) {
      await waitDeal()
    }
  }
  if (isDeal.value) {
    await waitDeal()
  }
  const params: DelegateOrderAddInter = {
    delegateType: formInline.delegateType,
    expectedReceiveTime: formInline.expectedDate,
    id: "",
    materialItems: [],
    no: formInline.no,
    orderAmount: formInline.orderAmount,
    originalOrderId: formInline.originalOrderId,
    outputItems: [],
    processId: formInline.processId,
    productModelId: formInline.productModelId,
    fileIds: formInline.fileList.map((item) => item.fileId),
    remark: formInline.remark,
    serialItems: formInline.routeItems,
    source: 1,
    supplierId: formInline.supplierId
  }
  params.materialItems = tableDataMaterials.value.map((item) => {
    return {
      orderAmount: item.amount,
      productModelId: item.productModelId,
      unitId: item.unitId
    }
  })
  params.outputItems = tableDataOutputs.value.map((item) => {
    return {
      orderAmount: item.amount,
      productModelId: item.productModelId,
      unitId: item.unitId
    }
  })

  if (props.selectId) {
    params.id = props.selectId
    await updateDelegateOrder(params)
    ElMessage.success("编辑成功")
  } else {
    await saveDelegateOrder(params)
    ElMessage.success("新建成功")
  }
  emit("cancel")
}
</script>

<style lang="scss" scoped>
.ceContainer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .create-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 12px 20px 16px;
  }

  .radio-tab {
    margin: 16px 0 12px;
  }

  .table-box {
    flex: 1;
    overflow: hidden;

    &:deep(.custom-table) {
      height: 100%;
    }
  }

  .tips {
    margin-left: 8px;
    color: var(--g-shadow-color);
  }
}
</style>
