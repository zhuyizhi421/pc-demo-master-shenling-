<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle
        :title="!props.selectId ? `新建采购订单` : `编辑采购订单`"
        :is-table-title="false"
        show-short-bar
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs">
        <template #upload-default>
          <UploadFile v-model="fileList" :limit="1" :show-tip="false">
            <el-button icon="Upload">上传附件</el-button>
          </UploadFile>
        </template>
      </CustomForm>
    </div>

    <div class="layout-child-page-content bottom-content">
      <CustomTitle title="采购清单" :is-table-title="false" show-short-bar style="margin-top: 0">
        <div>
          <el-button type="primary" @click="selectProductVisible = true" icon="Plus"
            >添加</el-button
          >
        </div>
      </CustomTitle>
      <CustomTable
        class="custom-table"
        ref="customTableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
      >
        <template #quantity-default="{ row }">
          <el-input v-model="row.quantity" clearable @input="handleInput(row)" />
        </template>
        <template #eta-default="{ row }">
          <el-date-picker
            style="width: 100%"
            v-model="row.eta"
            type="date"
            placeholder="请选择预计收货日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD"
          />
        </template>
        <template #unitId-default="{ row }">
          <el-select v-model="row.unitId" filterable placeholder="请选择" clearable>
            <el-option
              v-for="item in row.unitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="onRemoveRow($index)">删除</el-button>
        </template>
      </CustomTable>
    </div>
    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick">
        {{ isEdit ? "保存" : "新建" }}
      </el-button>
    </div>
  </div>

  <!-- 新增产品弹窗 -->
  <SelectProductDialog
    v-model="selectProductVisible"
    :selected-row-keys="selectedProductIds"
    multiple
    @success="onSelectProductSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getLogPurchaseItemDetail,
  queryPurchaseOrderDetail,
  requestCreatePurchaseOrder,
  requestUpdatePurchaseOrder
} from "@/api/logistics/purchase"
import { getUnitList, type IProductModelListItem } from "@/api/product"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import SelectSupplier from "@/components/SelectSupplier/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import { EnumPurchaseOrderStatus, EnumPurchaseOrderStatusMap } from "@/constant/enums"
import type { IFile } from "@/types/base-info/implement-config"
import type { IPurchaseOrderCreateParams, IPurchaseOrderDetail } from "@/types/logistics/purchase"
import { validateInput } from "@/utils/common"

type IFormData = Omit<IPurchaseOrderDetail, "purchaseStatus"> & { purchaseStatus?: string }

interface ITableRow {
  id?: string
  productModelId: string
  productModelName: string
  productModelCode: string
  quantity?: number
  unitId: string
  unitOptions: {
    label: string
    value: string
  }[]
  eta: string
}

const props = withDefaults(
  defineProps<{
    selectId?: string
  }>(),
  {
    selectId: undefined
  }
)

const emit = defineEmits<{
  (e: "success"): void
  (e: "close"): void
}>()

const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
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
      prop: "quantity",
      label: "采购数量",
      minWidth: 160,
      align: "center",
      slots: {
        default: "quantity-default"
      }
    },
    {
      prop: "eta",
      label: "预期收货日期",
      minWidth: 120,
      align: "center",
      slots: {
        default: "eta-default"
      }
    },
    {
      prop: "unitId",
      label: "单位",
      minWidth: 160,
      align: "center",
      slots: {
        default: "unitId-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const fileList = ref<IFile[]>([])
const selectProductVisible = ref(false)
const selectedProductIds = ref<string[]>([])

const formData = ref<IFormData>({
  supplierId: undefined, //供应商id
  supplierCode: undefined, // 供应商编号
  eta: "", //预计收货时间
  purchaseCode: undefined, //采购单号
  remarks: undefined, //备注
  attachmentFileId: undefined, //附件id
  purchaseStatus: undefined, //状态
  dataSource: undefined,
  productionOrderId: undefined, //生产订单ID ?
  productionOrderNo: undefined,
  techFlowNodeId: undefined,
  processSerial: undefined,
  createTime: undefined
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "采购单号",
    field: "purchaseCode",
    props: {
      placeholder: "无输入时系统自动创建",
      get disabled() {
        return isEdit.value
      }
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    get hidden() {
      return !isEdit.value
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "purchaseStatus",
    get hidden() {
      return !isEdit.value
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "预计收货日期",
    field: "eta",
    rules: [{ required: true, message: "请选择预计收货日期", trigger: "change" }],
    props: {
      placeholder: "请选择预计收货日期",
      type: "date",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: markRaw(SelectSupplier),
    label: "供应商名称",
    field: "supplierId",
    rules: [{ required: true, message: "请选择供应商", trigger: "change" }],
    events: {
      "origin-data-change": onSupplierChange
    }
  },
  {
    componentType: "el-input",
    label: "供应商编号",
    field: "supplierCode",
    props: {
      placeholder: "请选择供应商",
      disabled: true
    }
  },
  {
    componentType: "div",
    label: "上传附件",
    field: "fileList",
    slots: {
      default: "upload-default"
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
      maxlength: 200
    },
    colspan: -1
  }
])

const isEdit = computed(() => !!props.selectId)

onMounted(() => {
  if (props.selectId) {
    getOrderDetail()
    getPurchaseList()
  }
})

const handleInput = async (row: ITableRow) => {
  row.quantity = validateInput(row.quantity || 0, 10, 6)
}

/** 获取产品单位 */
const getProductUnit = async (productModelId: string) => {
  const res = await getUnitList(productModelId)
  return res.map((item) => {
    return {
      value: item.unitId,
      label: item.unitName
    }
  })
}

/** 删除行 */
const onRemoveRow = (index: number) => {
  tableData.value.splice(index, 1)
  selectedProductIds.value.splice(index, 1)
}

/** 供应商选择切换 */
function onSupplierChange(data: any) {
  formData.value.supplierCode = data?.supplierCode || ""
}

/** 获取订单详情 */
const getOrderDetail = async () => {
  const data = await queryPurchaseOrderDetail({ id: props.selectId! }) // 获取订单详情
  formData.value = {
    ...data,
    purchaseStatus:
      EnumPurchaseOrderStatusMap[data.purchaseStatus as EnumPurchaseOrderStatus] ??
      data.purchaseStatus
  }

  fileList.value = data.attachmentFileId
    ? [{ fileId: data.attachmentFileId, fileName: data.attachmentFileResource!.sourceName }]
    : []
}

/** 获取采购清单信息 */
const getPurchaseList = async () => {
  const res = await getLogPurchaseItemDetail({ purchaseId: props.selectId! }) //获取采购清单
  tableData.value = []
  for (let item of res) {
    let unitOptions = await getProductUnit(item.productModelId)
    tableData.value.push({
      id: item.id || "",
      productModelId: item.productModelId,
      productModelName: item.productModelName,
      productModelCode: item.productModelCode,
      quantity: item.quantity,
      unitId: item.unitId,
      unitOptions,
      eta: item.eta
    })
  }
  selectedProductIds.value = tableData.value.map((item) => item.productModelId)
}

/** 选择产品回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  selectedProductIds.value = data.map((item) => item.id)
  const list: ITableRow[] = []
  data.forEach(async (item) => {
    const target = tableData.value.find((i) => i.productModelId === item.id)
    if (target) {
      list.push(target)
    } else {
      let unitOptions = await getProductUnit(item.id)
      tableData.value.push({
        id: "",
        productModelId: item.id,
        productModelName: item.name,
        productModelCode: item.code,
        quantity: undefined,
        unitId: String(item.defaultUnitId),
        unitOptions,
        eta: ""
      })
    }
  })
  tableData.value = list
}

// 保存
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const isEmpty = tableData.value.some((item) => !item.quantity || !item.unitId)
  if (isEmpty) {
    ElMessage({
      message: "请选择采购清单中采购数量及单位",
      type: "warning"
    })
    return
  }

  const isQualityRange = tableData.value.some(
    (item) => Number(item.quantity) < 0 || Number(item.quantity) > 99999
  )

  if (isQualityRange) {
    ElMessage({
      message: "采购数量必须在0到99999之间",
      type: "warning"
    })
    return
  }

  if (!isEdit.value) {
    // 新建
    const params: IPurchaseOrderCreateParams = {
      attachmentFileId: fileList.value?.[0]?.fileId,
      remarks: formData.value.remarks,
      purchaseCode: formData.value.purchaseCode,
      supplierId: formData.value.supplierId,
      purchaseType: 1, //1普通采购 3订单委外 4工序委外
      eta: formData.value.eta,
      details: tableData.value
    }
    await requestCreatePurchaseOrder(params)
    ElMessage.success("新建成功")
    emit("close")
    emit("success")
  } else {
    // 保存
    const params = {
      attachmentFileId: fileList.value?.[0]?.fileId,
      remarks: formData.value.remarks,
      supplierId: formData.value.supplierId,
      purchaseType: 1, //1普通采购 3订单委外 4工序委外
      eta: formData.value.eta,
      details: tableData.value
    }
    await requestUpdatePurchaseOrder(props.selectId as string, params)
    ElMessage.success("编辑成功")
    emit("close")
    emit("success")
  }
}
</script>

<style lang="scss" scoped>
.bottom-content {
  flex: 1;
  overflow: hidden;
}

.custom-table {
  flex: 1;
  overflow: hidden;
}

.footer-operation {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
