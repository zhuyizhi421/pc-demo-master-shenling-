<template>
  <div class="update-production-order" v-loading="isLoading">
    <div class="production-order-content">
      <div class="top-back">
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle
        :isTableTitle="false"
        class="pl-[20px]"
        showShortBar
        :title="isCreate ? '新建生产订单' : '编辑生产订单'"
      />

      <CustomForm
        class="pr-[20px]"
        ref="customFormRef"
        v-model="formData"
        :configs="formConfigs"
        :labelWidth="120"
      >
        <template #originalOrderNo-default>
          <div class="original-order">
            <el-input
              placeholder="请选择"
              v-model="formData.originalOrderNo"
              readonly
              @click="selectProductionBatchVisible = true"
            >
              <template #suffix>
                <el-icon @click.stop="onClearOriginalOrderClick()"><CircleClose /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" link size="small" @click="onReviewOrderChangeClick">{{
              formData.type === EnumProductionOrderType.REPAIR ? "订单返工情况" : "订单改制情况"
            }}</el-button>
          </div>
        </template>

        <template #fileList-default>
          <UploadFile v-model="fileList" :limit="3" :show-tip="false" multiple>
            <el-button type="primary" icon="Upload" plain>上传附件</el-button>
          </UploadFile>
        </template>
      </CustomForm>

      <!-- 工艺流程 -->
      <div class="craft-flow">
        <CustomTitle :isTableTitle="false" title="工艺流程">
          <el-button
            type="primary"
            icon="Edit"
            plain
            @click="onEditCraftFlowClick()"
            :disabled="!formData.techProcessId"
            style="margin-right: 8px"
            >编辑订单工艺</el-button
          >
          <el-dropdown>
            <el-button>
              选择工艺流程<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onCopyCraftRouteClick()"
                  >复制已有的工艺路线</el-dropdown-item
                >
                <el-dropdown-item @click="onCreateCraftRouteClick()"
                  >创建新的订单工艺</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </CustomTitle>
        <CustomDescription
          :data="descData"
          :configs="descConfigs"
          :labelWidth="120"
          style="padding: 0"
        ></CustomDescription>
      </div>

      <!-- 生产用料 -->
      <div class="production-material">
        <CustomTitle :isTableTitle="false" class="!mb-[12px]" title="生产用料" />

        <CustomTable v-model:table-data="materialTableData" :config="tableConfig">
          <template #serials-default="{ row: { processSerials } }">
            {{ processSerials?.join(";") }}
          </template>
        </CustomTable>
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button
        type="primary"
        :disabled="!formData.productModelId || !formData.techProcessId"
        @click="onSaveClick()"
        >{{ isCreate ? "创建" : "保存" }}</el-button
      >
    </div>
  </div>

  <!-- 生产批次选择弹窗 -->
  <SelectProductionBatchDialog
    v-model="selectProductionBatchVisible"
    :selected-row-keys="[formData.productBatchId || formData.orderId]"
    @success="selectProductionBatchSuccess"
  />

  <!-- 产品选择弹窗 -->
  <SelectProductDialog
    v-model="selectProductVisible"
    :selected-row-keys="[formData.productModelId]"
    @success="selectProductOk"
  />

  <!-- 选择销售订单弹窗 -->
  <SelectSaleOrderDialog
    v-model="selectSaleVisible"
    :selected-row-keys="selectedSaleOrderIds"
    :product-id="formData.productModelId"
    multiple
    @success="selectSaleOrderSuccess"
  />

  <!-- 选择工艺路线弹窗 -->
  <SelectCraftRouteDialog
    v-model="selectCraftVisible"
    :selected-row-keys="[selectedCraftId]"
    :query-product-no="formData.productModelNo"
    :disabled-no="true"
    :disabled-status="formData.type == 1"
    :publishStatus="formData.type == 1 ? 2 : undefined"
    @success="selectCraftRouteOk"
  />

  <!-- 查看订单返工/改制情况弹窗 -->
  <OrderReturnOrChangeDialog
    v-if="reviewOrderChangeVisible"
    :id="formData.orderId"
    :type="formData.type"
    :process-id="formData.techProcessId"
    @close="reviewOrderChangeVisible = false"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryFactoryModelList } from "@/api/fm"
import type { IProductModelListItem } from "@/api/product"
import {
  queryProductionOrderDetail,
  requestAutoCopyCraftRouteToTechProcess,
  requestCopyCraftRouteToTechProcess,
  requestCreateOrderProcess,
  requestMaterialListByProductionOrder,
  updateProductionOrderItem
} from "@/api/scheduling"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectCraftRouteDialog from "@/components/SelectCraftRouteDialog/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import SelectSaleOrderDialog from "@/components/SelectSaleOrderDialog/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap
} from "@/constant/enums"
import type { ICraftConfigInfo, ICraftRouteItem } from "@/types/base-info/craftRoute"
import type { IFile } from "@/types/base-info/implement-config"
import type {
  IProductionOrderItem,
  IProductionOrderMaterialItem as ITableRow,
  ISaleOrderItem
} from "@/types/production-manage/product-order"
import type { IProductBatchPageListItem } from "@/types/logistics/batch"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import OrderReturnOrChangeDialog from "./OrderReturnOrChangeDialog.vue"
import SelectProductionBatchDialog from "./SelectProductionBatchDialog.vue"

const props = withDefaults(
  defineProps<{
    id: string
    autoCraftConfig?: boolean
  }>(),
  {
    autoCraftConfig: false
  }
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
  (
    e: "order-craft-config",
    data: ICraftConfigInfo,
    orderType: EnumProductionOrderType,
    orderInfo?: IProductionOrderItem
  ): void
}>()

const customFormRef = ref<InstanceType<typeof CustomForm>>()

const selectProductVisible = ref(false) // 选择产品弹窗可见标识
const selectCraftVisible = ref(false) // 选择工艺路线弹窗可见标识
const selectProductionBatchVisible = ref(false) // 选择生产批次弹窗可见标识
const selectSaleVisible = ref(false) // 选择销售订单弹窗可见标识
const reviewOrderChangeVisible = ref(false) // 查看订单返工/改制情况弹窗显示标识
const selectedCraftId = ref("") // 复制的工艺路线id

const productionOrderInfo = ref<IProductionOrderItem | undefined>(undefined) // 生产订单详情信息
const wareHouseList = ref<any[]>([]) // 仓库列表下拉
const materialTableData = ref<ITableRow[]>([]) // 物料清单-列表
const fileList = ref<IFile[]>([]) // 附件信息
const curOrderCraftData = ref<any>({}) // 当前订单工艺信息
const isOrderCraftBack = ref(false) // 是否从工单工艺编辑页返回

const formData = ref<{
  id: string
  deliveryDate: string
  no: string
  orderAmount: number | undefined
  productModelId: string
  productModelName: string
  source: number
  techProcessId: string // 工单工艺的id
  type: number
  unitId: string
  unitName: string
  specifiedInboundWarehouseId?: string
  productionMethod: number
  productModelNo: string
  orderId: string
  originalOrderNo: string
  productBatchId: string
  productBatchNo: string
  remark: string
  saleList: {
    label: string
    value: string
  }[]
}>({
  id: "", // 生产订单id
  deliveryDate: "",
  no: "",
  orderAmount: undefined,
  productModelId: "",
  productModelName: "",
  source: 1,
  productionMethod: 1, // 生产方式 1自制 2委外，目前只能为自制
  type: 1, // 类型，默认为1，即“量产”
  techProcessId: "",
  unitId: "",
  unitName: "",
  specifiedInboundWarehouseId: undefined,
  productModelNo: "",
  orderId: "",
  originalOrderNo: "",
  productBatchId: "",
  productBatchNo: "",
  remark: "",
  saleList: []
})

const productModelOptions = ref<
  {
    label: string
    value: string
  }[]
>([])

/**
 * 表单配置
 */
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "订单类型",
    colspan: 1,
    field: "type",
    rules: [
      {
        required: true,
        message: "请选择订单类型",
        trigger: "change"
      }
    ],
    props: {
      customChildren: Object.entries(EnumProductionOrderTypeMap).map(([value, key]) => {
        return {
          componentType: "el-option",
          props: {
            label: key,
            value: +value
          }
        }
      })
    },
    events: {
      change: () => onOrderTypeChange()
    }
  },
  {
    componentType: "div",
    label: "生产批次",
    field: "originalOrderNo",
    slots: {
      default: "originalOrderNo-default"
    },
    hidden: ![EnumProductionOrderType.REPAIR, EnumProductionOrderType.REMODEL].includes(
      formData.value.type
    )
  },
  {
    componentType: "el-select",
    label: "产品名称",
    field: "productModelName",
    props: {
      placeholder: "请选择",
      customChildren: productModelOptions.value.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.label, value: item.value }
        }
      })
    },
    rules: [
      {
        required: true,
        message: "请选择产品",
        trigger: "change"
      }
    ],
    events: {
      "visible-change": onVisibleChangeProductModel
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productModelNo",
    props: {
      placeholder: "请选择产品",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "订单号",
    field: "no",
    props: {
      placeholder: "不填则自动生成",
      disabled: !isCreate.value
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "",
    hidden: isCreate.value,
    props: {
      value:
        EnumProductionOrderStatusMap[
          productionOrderInfo.value?.status as EnumProductionOrderStatus
        ],
      placeholder: "",
      disabled: true,
      maxlength: 50
    }
  },
  {
    componentType: "el-input",
    label: "数量",
    field: "orderAmount",
    rules: [
      {
        required: true,
        message: "请输入数量",
        trigger: "blur"
      },
      {
        pattern: /^[1-9]\d*$/,
        message: "请输入正整数",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入"
    },
    events: {
      change: () => {
        getMaterialTableData()
      }
    }
  },
  {
    componentType: "el-select",
    label: "指定入库仓库",
    field: "specifiedInboundWarehouseId",
    props: {
      clearable: true,
      filterable: true,
      customChildren: wareHouseList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.entityName,
          value: item.id
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "单位",
    field: "unitName",
    rules: [
      {
        required: true,
        message: "单位不能为空",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "交货日期",
    field: "deliveryDate",
    props: {
      type: "date",
      placeholder: "请选择交货日期",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "",
    hidden: isCreate.value,
    props: {
      value: EnumProductionOrderSourceMap[formData.value?.source as EnumProductionOrderSource],
      placeholder: "",
      maxlength: 50,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "",
    hidden: isCreate.value,
    props: {
      value: productionOrderInfo.value?.createTime,
      placeholder: "",
      maxlength: 50,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建人",
    field: "",
    hidden: isCreate.value,
    props: {
      value: productionOrderInfo.value?.createByName,
      placeholder: "",
      maxlength: 50,
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "销售订单",
    field: "saleList",
    props: {
      placeholder: "请选择销售订单",
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: formData.value.saleList.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      "visible-change": () => {
        selectSaleVisible.value = true
      },
      clear: () => onClearSaleOrderClick()
    }
  },
  {
    componentType: "custom-component",
    label: "附件",
    field: "fileList",
    slots: {
      default: "fileList-default"
    }
  },
  {
    componentType: "el-input",
    label: "订单备注",
    field: "remark",
    colspan: -1, // 占据整行
    props: {
      type: "textarea",
      placeholder: "",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

/**
 * 工艺流程信息描述项
 */
const descData = computed(() => {
  return {
    type:
      curOrderCraftData.value.orderProcessType === 1
        ? "复制工艺路线"
        : curOrderCraftData.value.orderProcessType === 2
          ? "订单工艺"
          : "",
    no: curOrderCraftData.value.no,
    originVersion: curOrderCraftData.value.sourceVersion,
    originNo: curOrderCraftData.value.sourceNo
  }
})
const descConfigs = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "type",
    label: "工艺流程类型："
  },
  {
    field: "originVersion",
    label: "原工艺路线版本：",
    hidden: curOrderCraftData.value.orderProcessType !== 1
  },
  {
    field: "originNo",
    label: "原工艺流程编号：",
    hidden: curOrderCraftData.value.orderProcessType !== 1
  }
])

/**
 * 表格配置
 */
const tableConfig = ref<ITableConfig>({
  height: 300,
  stripe: true,
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelCode",
      label: "编号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "processSerials",
      label: "投料工序",
      minWidth: 160,
      showOverflowTooltip: true,
      slots: {
        default: "serials-default"
      }
    },
    {
      prop: "totalAmount",
      label: "投料数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      formatter: ({ decimalNumber, totalAmount }) =>
        isEffectiveValue(totalAmount) ? precisionConversion(totalAmount, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    }
  ]
})
const selectedSaleOrderIds = computed(() => formData.value.saleList.map((item) => item.value))
const isCreate = computed(() => !props.id)
const isLoading = ref(false)

onBeforeMount(async () => {
  getWarehouseOptions()
  if (props.id) {
    await getProductionOrderDetail()
    getMaterialTableData()
    // 如果带有自动打开工艺配置标记，则自动触发编辑订单工艺
    if (props.autoCraftConfig && curOrderCraftData.value?.id) {
      nextTick(() => {
        setTimeout(() => {
          onEditCraftFlowClick()
        }, 100)
      })
    }
  }
})

onActivated(() => {
  // 从订单工艺编辑页面返回时，需要刷新工艺流程部分信息
  if (isOrderCraftBack.value) {
    isOrderCraftBack.value = false
    getMaterialTableData()
  }
})

/**
 * 产品名称下拉框出现时调用
 */
const onVisibleChangeProductModel = (val: boolean) => {
  val && (selectProductVisible.value = true)
}

/** 查看订单返工/改制情况 */
const onReviewOrderChangeClick = () => {
  if (!formData.value.type) {
    ElMessage.warning("请先选择订单类型")
    return
  }

  if (!formData.value.orderId) {
    ElMessage.warning("请先选择生产批次")
    return
  }

  if (!formData.value.techProcessId) {
    ElMessage.warning("请先选择工艺流程")
    return
  }

  reviewOrderChangeVisible.value = true
}

/** 编辑工艺流程信息 */
const onEditCraftFlowClick = () => {
  isOrderCraftBack.value = true
  emit(
    "order-craft-config",
    curOrderCraftData.value,
    formData.value.type,
    productionOrderInfo.value
  )
}

/** 清除生产批次 */
const onClearOriginalOrderClick = () => {
  formData.value.orderId = ""
  formData.value.originalOrderNo = ""
  formData.value.productBatchId = ""
  formData.value.productBatchNo = ""
}

/** 生产批次选择成功回调 */
const selectProductionBatchSuccess = (batches: IProductBatchPageListItem[]) => {
  const batchInfo = batches?.[0]
  if (batchInfo) {
    const batchId = String(batchInfo.id || "")
    const productModelId = String(batchInfo.productModelId || "")
    const unitId = String(batchInfo.unitId || "")

    formData.value.orderId = batchId
    formData.value.originalOrderNo = batchInfo.batchNo || ""
    formData.value.productBatchId = batchId
    formData.value.productBatchNo = batchInfo.batchNo || ""

    // 回显生产批次产品信息
    formData.value.productModelId = productModelId
    formData.value.productModelName = batchInfo.productModelName || ""
    formData.value.productModelNo = batchInfo.productModelCode || ""
    formData.value.unitName = batchInfo.unitName || ""
    formData.value.unitId = unitId
    formData.value.orderAmount = Number(batchInfo.batchQuantity || 0) || formData.value.orderAmount
    curOrderCraftData.value = {}
    materialTableData.value = []
    productModelOptions.value = [
      {
        label: batchInfo.productModelName || "",
        value: productModelId
      }
    ]
    onAutoCopyCraftRoute()
  }
}

const onOrderTypeChange = () => {
  onClearOriginalOrderClick()
  onAutoCopyCraftRoute()
}

// 产品选择回调
const selectProductOk = (data: IProductModelListItem[]) => {
  if (data.length) {
    let target = cloneDeep(data)[0]
    const id = formData.value.id
    formData.value = {
      ...formData.value,
      id,
      productModelName: target.name,
      productModelId: target.id,
      productModelNo: target.code,
      unitName: target.defaultUnitName,
      unitId: target.defaultUnitId
    }
    curOrderCraftData.value = {}
    materialTableData.value = []
    productModelOptions.value = [
      {
        label: target.name,
        value: target.id
      }
    ]
  }
  onAutoCopyCraftRoute()
}

/** 销售订单选择回调 */
const selectSaleOrderSuccess = (data: ISaleOrderItem[]) => {
  if (data.length) {
    formData.value.saleList = data.map((item) => {
      return {
        label: item.saleCode,
        value: item.id
      }
    })
  }
}

/** 销售订单clearable回调 */
const onClearSaleOrderClick = () => {
  formData.value.saleList = []
}

// 工艺路线选择回调
const selectCraftRouteOk = async (data: ICraftRouteItem[]) => {
  try {
    isLoading.value = true
    if (data.length) {
      // 选择工艺路线之后，复制工艺路线信息为工单工艺
      const res = await requestCopyCraftRouteToTechProcess({
        processId: data[0].id,
        allReverse: formData.value.type === EnumProductionOrderType.TEST
      })
      curOrderCraftData.value = cloneDeep(res)
      formData.value.techProcessId = curOrderCraftData.value.id
      selectedCraftId.value = data[0].id

      await getMaterialTableData()
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

// 获取物料清单
const getMaterialTableData = async () => {
  const data = await requestMaterialListByProductionOrder({
    techProcessId: curOrderCraftData.value.id,
    orderAmount: formData.value.orderAmount!
  })
  materialTableData.value = data
}

/** 复制已有工艺路线 */
const onCopyCraftRouteClick = async () => {
  if (!formData.value.type || !formData.value.productModelId) {
    ElMessage.warning("请先选择订单类型和产品名称")
    return
  }
  selectCraftVisible.value = true
}

/** 创建新的工艺路线 */
const onCreateCraftRouteClick = async () => {
  if (!formData.value.type || !formData.value.productModelId) {
    ElMessage.warning("请先选择订单类型和产品名称")
    return
  }

  const res = await requestCreateOrderProcess({
    productModelId: formData.value.productModelId,
    orderId: formData.value.id || undefined,
    allReverse: formData.value.type === EnumProductionOrderType.TEST
  })
  if (res) {
    curOrderCraftData.value = res
    formData.value.techProcessId = res.id
    getMaterialTableData()
  }
}

/** 自动复制最新发布的工艺路线 */
const onAutoCopyCraftRoute = async () => {
  // 若订单类型为“量产/返工/改制”，且生产订单产品不为空，则自动复制最新发布的工艺路线
  if (
    !formData.value.productModelId ||
    ![
      EnumProductionOrderType.QUANTITY,
      EnumProductionOrderType.REPAIR,
      EnumProductionOrderType.REMODEL
    ].includes(formData.value.type)
  ) {
    return
  }

  let params = {
    id: formData.value.productModelId
  }
  const res = await requestAutoCopyCraftRouteToTechProcess(params)
  if (res) {
    curOrderCraftData.value = res
    formData.value.techProcessId = res.id
    getMaterialTableData()
  }
}

/** 获取仓库列表 */
const getWarehouseOptions = async () => {
  const res = await queryFactoryModelList({ isEnable: true, isStorage: true })
  wareHouseList.value = res.map((item) => ({
    id: item.id,
    entityName: item.entityName
  }))
}

/** 获取生产订单详情 */
const getProductionOrderDetail = async () => {
  const data = await queryProductionOrderDetail(props.id)
  if (data) {
    productionOrderInfo.value = cloneDeep(data)
    formData.value = {
      no: data.no,
      deliveryDate: data.deliveryDate,
      id: data.id,
      orderAmount: data.orderAmount,
      productModelId: data.productModel?.id,
      productModelName: data.productModel?.name,
      source: data.source,
      techProcessId: data.techProcess?.id,
      type: data.type,
      unitId: data.unitItem?.id,
      unitName: data.unitItem?.unitName,
      specifiedInboundWarehouseId: data.specifiedInboundWarehouseId,
      productionMethod: data.productionMethod,
      productModelNo: data.productModel?.code,
      orderId: data.orderId,
      originalOrderNo: data.originalOrderNo,
      productBatchId: (data as any).productBatchId || "",
      productBatchNo: (data as any).productBatchNo || "",
      remark: data.remark,
      saleList:
        data.saleVOList?.map((item) => ({
          label: item.saleCode,
          value: item.id
        })) || []
    }

    productModelOptions.value = [
      {
        label: data.productModel?.name,
        value: data.productModel?.id
      }
    ]

    fileList.value =
      data.files?.map((item) => {
        return {
          fileId: item.fileId,
          fileName: item.fileName
        }
      }) || []

    curOrderCraftData.value = data.techProcess ?? {}
    selectedCraftId.value = data.techProcess?.sourceProcessId
  }
}

/** 保存操作 */
const onSaveClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const params = {
    ...formData.value,
    saleIds: selectedSaleOrderIds.value,
    specifiedInboundWarehouseId: formData.value.specifiedInboundWarehouseId,
    fileIds: fileList.value.map((item) => item.fileId)
  }
  await updateProductionOrderItem(params as any)
  ElMessage.success(isCreate.value ? "新建成功" : "编辑成功")
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.update-production-order {
  height: 100%;
  color: #303133;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .production-order-content {
    overflow-y: auto;
    width: 100%;
    flex: 1;
  }
}

.original-order {
  display: flex;
  align-items: center;

  &:deep(.el-button) {
    margin-left: 6px;
  }
}

.top-back {
  margin: 12px 20px;
}

.order-no {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.craft-flow {
  position: relative;
  padding: 6px 20px 0;
}

.production-material {
  padding: 0 20px 16px;
}
</style>
