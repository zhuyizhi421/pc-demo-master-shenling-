<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle
        :title="!props.selectId ? `新建委外退料` : `退料单号：${formData.purchaseCode}`"
        :is-table-title="false"
        show-short-bar
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>
    </div>
    <div class="layout-child-page-content bottom-content">
      <CustomTitle
        title="委外退料清单"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      >
        <div>
          <el-button
            type="primary"
            icon="Plus"
            @click="onAddOrder"
            :disabled="!formData.supplierId"
          >
            按委外订单选择
          </el-button>
        </div>
      </CustomTitle>
      <CustomTable
        class="custom-table"
        ref="customTableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
      >
        <template #returnAmount-default="{ row }">
          <el-input
            v-model="row.returnAmount"
            placeholder="请输入"
            clearable
            @input="handleInput(row)"
          />
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="onDeleteIndex($index)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>
    </div>
  </div>
  <div class="footer-operation">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" @click="onSave">{{ formData.id ? "保存" : "新建" }}</el-button>
  </div>

  <!-- 选择委外订单 -->
  <SelectOrder
    v-model="showDelegateOrder"
    :supplierId="formData.supplierId"
    @success="onSelectOrderSuccess"
  ></SelectOrder>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getOutsourcingReturnOrderById, outsourcingReturnSave } from "@/api/logistics/delegate"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectSupplier from "@/components/SelectSupplier/index.vue"
import {
  EnumOutsourcingReturnOrderStatus,
  EnumOutsourcingReturnOrderStatusMap
} from "@/constant/enums"
import type {
  IDelegateMaterialReturnAddItem as ITableRow,
  IDelegateReturnMaterialVo
} from "@/types/logistics/delegate"
import { validateInput } from "@/utils/common"

import SelectOrder from "./SelectOrder.vue"

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

interface IFormData {
  supplierId: string
  supplierCode: string
  planReturnTime: string
  createTime?: string
  purchaseCode: string
  dataSource: string
  taskStatus: string
  id?: string
}

const formData = ref<IFormData>({
  supplierId: "",
  supplierCode: "",
  planReturnTime: "",
  createTime: "",
  purchaseCode: "",
  dataSource: "",
  taskStatus: "",
  id: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "委外退料单号",
    field: "purchaseCode",
    get hidden() {
      return !!formData.value.id
    },
    props: {
      placeholder: "无输入时系统自动创建"
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
    componentType: "el-date-picker",
    label: "计划退料日期",
    field: "planReturnTime",
    rules: [{ required: true, message: "请选择计划退料日期", trigger: "change" }],
    get hidden() {
      return !!formData.value.id
    },
    props: {
      placeholder: "请选择",
      type: "date",
      valueFormat: "YYYY-MM-DD",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "dataSource",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "taskStatus",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划退料日期",
    field: "planReturnTime",
    rules: [{ required: true, message: "请选择计划退料日期", trigger: "change" }],
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请选择",
      type: "date",
      valueFormat: "YYYY-MM-DD",
      format: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-date-picker",
    label: "创建时间",
    field: "createTime",
    get hidden() {
      return !formData.value.id
    },
    props: {
      placeholder: "请选择",
      type: "datetime",
      valueFormat: "YYYY-MM-DD HH:mm",
      format: "YYYY-MM-DD HH:mm",
      disabled: true
    }
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
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
      prop: "returnAmount",
      label: "退料数量",
      minWidth: 160,
      align: "center",
      slots: {
        default: "returnAmount-default"
      }
    },
    {
      prop: "couldReturnAmount",
      label: "可退料数量",
      minWidth: 160,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "delegateOrderNo",
      label: "关联委外订单",
      minWidth: 160
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

const showDelegateOrder = ref(false)

onBeforeMount(() => {
  if (props.selectId) {
    getOutsourcingReturnOrderDetail()
  }
})

const handleInput = async (row: ITableRow) => {
  row.returnAmount = validateInput(row.returnAmount || 0, 10, 6)
}

// 按委外订单选择
const onAddOrder = () => {
  showDelegateOrder.value = true
}

// 删除本行
const onDeleteIndex = (index: number) => {
  tableData.value.splice(index, 1)
}

/** 供应商选择切换 */
function onSupplierChange(data: any) {
  formData.value.supplierCode = data?.supplierCode || ""
  tableData.value = []
}

// 委外订单选择对应的物料清单后，添加到委外退料清单表格中
const onSelectOrderSuccess = (
  list: (IDelegateReturnMaterialVo & {
    delegateOrderNo: string
    delegateOrderId: string
    delegateOrderMaterialId: string
  })[]
) => {
  showDelegateOrder.value = false
  list.forEach((item) => {
    const target = tableData.value.find(
      (i) => i.productModelId === item.productModelId && i.delegateOrderId === item.delegateOrderId
    )
    if (target) {
      //已经存在该物料了
      return
    } else {
      tableData.value.push({
        ...item,
        returnAmount: undefined,
        returnId: ""
      } as any as ITableRow)
    }
  })
}

/** 获取委外退料单详情 */
const getOutsourcingReturnOrderDetail = async () => {
  const res = await getOutsourcingReturnOrderById({ id: props.selectId })
  const { supplierId, supplierCode, returnDate, source, status, id, no, createTime } = res
  formData.value = {
    supplierId,
    supplierCode,
    planReturnTime: returnDate,
    createTime: createTime,
    purchaseCode: no,
    id,
    dataSource: source == 1 ? "MES" : "ERP",
    taskStatus: EnumOutsourcingReturnOrderStatusMap[status as EnumOutsourcingReturnOrderStatus]
  }

  tableData.value = res.detailVoList
}

// 保存或创建
const onSave = async () => {
  const valid = await customFormRef.value!.validateForm()
  if (!valid) return

  if (!tableData.value.length) {
    ElMessage.warning("采购退货清单不能为空")
    return
  }

  // 委外退料清单表格“退料数量”必填
  const hasEmpty = tableData.value.some((item) => !item.returnAmount)
  if (hasEmpty) {
    ElMessage.warning("退料数量不能为空")
    return
  }

  const details = tableData.value
  if (formData.value.id) {
    // 编辑
    await outsourcingReturnSave({
      id: props.selectId,
      no: formData.value.purchaseCode, //委外退料单号	string
      detailVoList: details,
      returnDate: formData.value.planReturnTime,
      supplierId: formData.value.supplierId
    })
    ElMessage.success("编辑成功")
  } else {
    // 新增
    await outsourcingReturnSave({
      no: formData.value.purchaseCode, //委外退料单号	string
      detailVoList: details,
      returnDate: formData.value.planReturnTime,
      supplierId: formData.value.supplierId
    })
    ElMessage.success("新建建成功")
  }

  emit("close")
  emit("success")
}
</script>

<style scoped lang="scss">
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
