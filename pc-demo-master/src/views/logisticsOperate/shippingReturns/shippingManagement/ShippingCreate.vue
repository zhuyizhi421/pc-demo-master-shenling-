<template>
  <div class="layout-child-page-container">
    <div class="wrapper" :class="{ flex: !formData.isPack }">
      <div class="layout-child-page-content border-bottom base-info">
        <div class="top-back">
          <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
        </div>

        <CustomTitle
          :title="props.id ? '编辑发货计划' : '新建发货计划'"
          :is-table-title="false"
          show-short-bar
        />
        <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
          <template #upload-default>
            <UploadFile v-model="formData.fileList" :limit="1" :show-tip="false">
              <el-button icon="Upload">上传附件</el-button>
            </UploadFile>
          </template>
        </CustomForm>
      </div>

      <!-- 产品列表 -->
      <div v-if="!formData.isPack" class="layout-child-page-content" style="flex: 1">
        <CustomTitle title="产品列表" :is-table-title="false" show-short-bar>
          <el-button type="primary" @click="selectProductVisible = true" icon="Plus"
            >添加产品</el-button
          >
        </CustomTitle>

        <CustomTable
          ref="productTableRef"
          v-model:table-data="productTableData"
          :config="tableConfig"
          class="custom-table"
        >
          <template #specifiedOutboundWarehouseId-default="{ row }">
            <el-select v-model="row.specifiedOutboundWarehouseId" clearable filterable>
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.entityName"
                :value="item.id"
              ></el-option>
            </el-select>
          </template>

          <template #deliveryQty-default="{ row }">
            <el-input v-model="row.deliveryQty" type="number" :min="0"></el-input>
          </template>

          <template #operation-default="{ $index }">
            <el-button link type="danger" size="small" @click="productTableData.splice($index, 1)"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>

      <!-- 包装工序 -->
      <div v-if="formData.isPack" class="layout-child-page-content">
        <CustomTitle title="包装工序" :is-table-title="false" show-short-bar>
          <el-button type="primary" @click="packageProcessProps.modelValue = true" icon="Plus"
            >复制包装工序</el-button
          >
        </CustomTitle>
        <PackageProcessConfig
          ref="packageProcessRef"
          :tech-version-id="techVersionId"
          :tech-version-status="techVersionStatus"
        />
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onsubmit()">{{ props.id ? "保存" : "创建" }}</el-button>
    </div>

    <!-- 选择销售订单 -->
    <SelectSaleOrdersHandle
      v-model="selectSaleOrdersVisible"
      categoryName="delivery"
      :id="formData.saleId"
      @success="onSelectedOrderSuccess"
    />

    <!-- 添加发货产品弹窗 - 产品选择  -->
    <SelectSaleProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="selectedProductIds"
      :sale-id="formData.saleId"
      :sale-code="formData.saleCode"
      multiple
      @success="onSelectProductSuccess"
    />

    <!-- 引用包装工序弹窗 -->
    <CustomSelectDialog
      :type="EnumDialogType.PackageProcess"
      :props="packageProcessProps"
      :events="{
        'update:modelValue': (val: boolean) => (packageProcessProps.modelValue = val),
        success: onPackageProcessSuccess
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import { queryFactoryModelList } from "@/api/fm"
import {
  queryDeliveryPlanDetail,
  requestDeliveryPlanCopyPackageProcess,
  requestDeliveryPlanCreatePackageProcess,
  requestDeliveryPlanUpdateProductList,
  requestNotPlanSaleOrderProductList,
  requestSaveDeliveryPlan
} from "@/api/logistics/delivery"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomSelectDialog from "@/components/CustomSelectDialog/index.vue"
import { EnumDialogType } from "@/components/CustomSelectDialog/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import useResetRef from "@/hooks/useResetRef"
import type { IFactoryModelListItem } from "@/types/base-info/factory-model"
import type { IFile } from "@/types/base-info/implement-config"
import type { IPackageProcessPageListItem } from "@/types/base-info/package-process"
import type { IOption } from "@/types/common"
import type {
  IDeliveryPlanPackageProductItem,
  ISaleOrderListItemByNotPlanDelivery
} from "@/types/logistics/delivery"
import type { IWarehouseCheckProductListItem } from "@/types/logistics/warehouse-check"
import { isEffectiveValue, precisionConversion } from "@/utils/common"
import SelectSaleOrdersHandle from "@/views/logisticsOperate/components/SelectSaleordersHandle.vue"

import PackageProcessConfig from "./components/PackageProcessConfig/index.vue"
import SelectSaleProductDialog from "./components/SelectSaleProductDialog/index.vue"

const props = withDefaults(defineProps<{ id: string }>(), {})
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const selectSaleOrdersVisible = ref(false)
const saleCodeOptions = ref<IOption[]>([])

const [formData] = useResetRef<{
  deliveryCode: string
  customerId: string
  customerCode: string
  deliveryTime: string
  saleCode: string
  saleId: string
  isPack: boolean
  remarks: string
  fileList: IFile[]
}>({
  deliveryCode: "",
  customerId: "",
  customerCode: "",
  deliveryTime: "",
  saleCode: "",
  saleId: "",
  isPack: false,
  remarks: "",
  fileList: []
})

provide(
  "saleOrderInfo",
  computed(() => ({
    saleId: formData.value.saleId,
    saleCode: formData.value.saleCode
  }))
)

const packageProcessRef = ref<InstanceType<typeof PackageProcessConfig>>()
const customerOptions = ref<(IOption & { code: string })[]>([])
const warehouseList = ref<IFactoryModelListItem[]>([])
const techVersionId = ref("")
const techVersionStatus = ref(0)

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "发货计划单号",
    field: "deliveryCode",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      disabled: !!props.id
    }
  },
  {
    componentType: "el-select",
    label: "销售订单",
    field: "saleCode",
    props: {
      placeholder: "请选择",
      clearable: true,
      customChildren: saleCodeOptions.value.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.label, value: item.value }
        }
      })
    },
    events: {
      "visible-change": () => (selectSaleOrdersVisible.value = true),
      change: (val: string) => {
        if (!val) {
          formData.value.saleId = ""
          formData.value.saleCode = ""
        }
      }
    }
  },
  {
    componentType: "el-select",
    label: "客户名称",
    field: "customerId",
    props: {
      placeholder: "请选择客户名称",
      get disabled() {
        return !!formData.value.saleId
      },
      customChildren: customerOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    rules: [
      {
        required: true,
        message: "客户名称不能为空",
        trigger: "change"
      }
    ],
    events: {
      change: (val: string) => {
        const target = customerOptions.value.find((it) => it.value === val)
        formData.value.customerCode = target?.code || ""
      }
    }
  },
  {
    componentType: "el-input",
    label: "客户编号",
    field: "customerCode",
    props: {
      placeholder: "",
      disabled: true
    },
    rules: [
      {
        required: true,
        message: "客户编号不能为空",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-date-picker",
    label: "预计发货日期",
    field: "deliveryTime",
    rules: [
      {
        required: true,
        message: "请选择预计发货日期",
        trigger: "change"
      }
    ],
    props: {
      type: "date",
      placeholder: "请选择",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD",
      get disabledDate() {
        return disabledDate
      }
    }
  },
  {
    componentType: "div",
    label: "附件",
    field: "fileList",
    slots: {
      default: "upload-default"
    }
  },
  {
    componentType: "el-switch",
    label: "包装",
    field: "isPack",
    events: {
      change: async (val: boolean) => {
        if (val && formData.value.saleId) {
          await getProductList(formData.value.saleId)
          await packageProcessRef.value?.saveProduct(productTableData.value, true)
        }
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      placeholder: "请输入备注",
      type: "textarea",
      rows: 2,
      maxlength: 200,
      showWordLimit: true
    },
    colspan: -1
  }
])
const selectProductVisible = ref(false)
const selectedProductIds = computed(() => productTableData.value.map((item) => item.productModelId))
let productListCopy: IDeliveryPlanPackageProductItem[] = []
const productTableRef = ref<ComponentExposed<typeof CustomTable>>()
const productTableData = ref<IDeliveryPlanPackageProductItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "saleQty",
      label: "销售订单数量",
      minWidth: 160,
      align: "right",
      formatter: ({ saleQty, decimalNumber }) =>
        formData.value.saleId
          ? isEffectiveValue(saleQty)
            ? precisionConversion(saleQty, decimalNumber)
            : ""
          : "—"
    },
    {
      prop: "specifiedOutboundWarehouseId",
      label: "指定发货仓库",
      minWidth: 160,
      align: "center",
      slots: {
        default: "specifiedOutboundWarehouseId-default"
      }
    },
    {
      prop: "plannedDeliveryQty",
      label: "已计划发货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ plannedDeliveryQty, decimalNumber }) =>
        formData.value.saleId
          ? isEffectiveValue(plannedDeliveryQty)
            ? precisionConversion(plannedDeliveryQty, decimalNumber)
            : ""
          : "—"
    },
    {
      prop: "inventoryQty",
      label: "库存总数",
      minWidth: 160,
      align: "right",
      formatter: ({ inventoryQty, decimalNumber }) =>
        isEffectiveValue(inventoryQty) ? precisionConversion(inventoryQty, decimalNumber) : ""
    },
    {
      prop: "deliveryQty",
      label: "本次计划发货数量",
      minWidth: 160,
      align: "right",
      slots: {
        default: "deliveryQty-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const packageProcessProps = reactive({
  modelValue: false,
  selectedRowKeys: []
})

onMounted(async () => {
  getCustomerOptions()
  getWarehouseList()

  // 新建发货计划时，默认自动创建一个包装工序，若后续进行复制包装工序时，则进行替换
  await autoCreatePackageProcess()

  if (props.id) {
    getDeliveryPlanDetail(props.id)
  }
})

// 获取仓库列表
const getWarehouseList = async () => {
  const res = await queryFactoryModelList({
    isStorage: true,
    isEnable: true
  })
  warehouseList.value = res
}

/** 获取客户下拉 */
const getCustomerOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customerOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id,
    code: item.customerCode
  }))
}

const disabledDate = (time: Date) => {
  const today = new Date()
  return time.getTime() < today.getTime() - 24 * 60 * 60 * 1000
}

/** 选择销售订单成功回调 */
const onSelectedOrderSuccess = async (row: ISaleOrderListItemByNotPlanDelivery) => {
  if (formData.value.customerId && !formData.value.saleId) {
    await ElMessageBox.confirm("将清空已选择的产品列表信息,是否继续", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      closeOnClickModal: false,
      closeOnPressEscape: false,
      autofocus: false,
      type: "warning"
    })
  }

  formData.value.saleCode = row.saleCode
  formData.value.saleId = row.id
  formData.value.customerId = row.customerId
  formData.value.customerCode = row.customerCode

  await getProductList(formData.value.saleId)

  if (formData.value.isPack) {
    console.log("??")
    await packageProcessRef.value?.saveProduct(productTableData.value, true)
  }
}

/** 选择产品成功回调 */
const onSelectProductSuccess = (data: IWarehouseCheckProductListItem[]) => {
  if (!data.length) {
    return
  }

  data.forEach(async (item) => {
    const target = selectedProductIds.value.find((it) => it === item.productModelId)
    if (target) {
      return
    } else {
      const product = productListCopy.find((it) => it.productModelId === item.productModelId)
      if (product) {
        productTableData.value.push({
          ...cloneDeep({
            ...product,
            inventoryQty: item?.inventoryQuantity,
            specifiedOutboundWarehouseId: ""
          })
        })
      } else {
        productTableData.value.push({
          ...cloneDeep({
            ...item,
            inventoryQty: item.inventoryQuantity,
            specifiedOutboundWarehouseId: ""
          })
        })
      }
    }
  })
}

// 选择包装工序弹窗成功回调
const onPackageProcessSuccess = async (data: IPackageProcessPageListItem[]) => {
  if (!data?.length) {
    return
  }

  const params = {
    saleId: formData.value.saleId,
    techVersionId: data[0].techVersionId,
    oldTechVersionId: techVersionId.value
  }
  const res = await requestDeliveryPlanCopyPackageProcess(params)
  techVersionId.value = res.id
  techVersionStatus.value = res.status

  if (res.tips) {
    ElMessage.warning("所选工序产品不一致，请自行编辑产品列表信息")
  }

  packageProcessRef.value?.refresh()
}

/** 创建包装工序 */
const autoCreatePackageProcess = async () => {
  const data = await requestDeliveryPlanCreatePackageProcess()
  techVersionId.value = data.id
  techVersionStatus.value = data.status
}

/** 获取产品列表信息 */
const getProductList = async (saleId: string) => {
  if (!saleId) {
    return
  }

  productTableRef.value?.setLoading(true)
  const data = await requestNotPlanSaleOrderProductList(saleId)
  productTableData.value = data
  productListCopy = cloneDeep(data)
  productTableRef.value?.setLoading(false)
}

/** 获取发货计划详情 */
const getDeliveryPlanDetail = async (id: string) => {
  const data = await queryDeliveryPlanDetail(id)
  if (!data) {
    return
  }
  formData.value = {
    deliveryCode: data.deliveryCode,
    customerId: data.customerId,
    customerCode: data.customerCode,
    deliveryTime: data.deliveryTime,
    saleCode: data.saleCode,
    saleId: data.saleId,
    isPack: data.isPack,
    remarks: data.remarks,
    fileList: data.attachmentFileId
      ? [
          {
            fileId: data.attachmentFileId,
            fileName: data.attachmentFileName
          }
        ]
      : []
  }
  techVersionId.value = data.techVersionId || techVersionId.value

  if (!data.isPack) {
    const list = await requestDeliveryPlanUpdateProductList(props.id)
    productTableData.value = list
  }
}

/** 提交 */
const onsubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  if (!formData.value.isPack) {
    if (!productTableData.value.length) {
      return ElMessage.warning("请选择产品")
    }

    const isEmpty = productTableData.value.some((item) => !Number(item.deliveryQty))
    if (isEmpty) {
      return ElMessage.warning("发货数量需大于0")
    }
  }

  let params = {
    id: props.id,
    deliveryCode: props.id ? undefined : formData.value.deliveryCode,
    saleId: formData.value.saleId,
    customerId: formData.value.customerId,
    deliveryTime: formData.value.deliveryTime,
    remarks: formData.value.remarks,
    isPack: formData.value.isPack,
    attachmentFileId: formData.value.fileList[0]?.fileId,
    productList: formData.value.isPack
      ? []
      : productTableData.value.map((item) => ({
          productModelId: item.productModelId,
          deliveryQty: item.deliveryQty,
          saleDetailId: item.saleDetailId,
          unitId: item.unitId,
          specifiedOutboundWarehouseId: item.specifiedOutboundWarehouseId
        })),
    techVersionId: formData.value.isPack ? techVersionId.value : ""
  }

  await requestSaveDeliveryPlan(params)
  ElMessage.success(props.id ? "编辑成功" : "新建成功")
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.wrapper {
  flex: 1;
  overflow-y: auto;

  &.flex {
    display: flex;
    flex-direction: column;
  }
}

.base-info {
  flex-shrink: 0;
}

.custom-table {
  flex: 1;
}
</style>
