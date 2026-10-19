<!-- 新建/编辑调拨 -->
<template>
  <div class="content">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!isEdit ? '新建调拨' : `调拨单号：${formInline.allocateCode}`"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formInline" :configs="formConfigs" :columns="3">
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="调拨清单" :is-table-title="false" show-short-bar>
        <div>
          <el-button type="primary" @click="onOpenProductDialog">选择产品</el-button>
        </div>
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #allocateQty-default="{ row }">
          <NoNegativeInput v-model="row.allocateQty" :max="row.inventoryQty"></NoNegativeInput>
        </template>

        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="customTableData.splice($index, 1)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>
    </div>
  </div>
  <div class="layout-footer">
    <el-button @click="emits('close')">取消</el-button>
    <el-button type="primary" @click="submitForm">{{ isEdit ? "保存" : "创建" }}</el-button>
  </div>

  <!-- 选择库存产品弹窗 -->
  <SelectProductInventoryDialog
    v-model="selectProductVisible"
    :selected-row-keys="selectedIds"
    :facility-id="formInline.outWarehouseId"
    :inventory="1"
    multiple
    @success="onSelectProductSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getLogAllocateCreate,
  getLogAllocateDetail,
  getLogAllocateUpdate
} from "@/api/logistics/allocate"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import NoNegativeInput from "@/components/NoNegativeInput/index.vue"
import SelectFacility from "@/components/SelectFacility/index.vue"
import SelectProductInventoryDialog from "@/components/SelectProductInventoryDialog/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumWarehouseAllotStatus,
  EnumWarehouseAllotStatusMap
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type {
  LogisticsAllocateDetail as ITableRow,
  LogisticsAllocateRecord
} from "@/types/logistics/allocate"
import type { IWarehouseCheckProductListItem } from "@/types/logistics/warehouse-check"
import { precisionConversion } from "@/utils/common"

const props = defineProps<{
  isEdit: boolean
  currentRow: LogisticsAllocateRecord
}>()

const emits = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const customTableData = ref<ITableRow[]>([])
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
      prop: "inventoryQty",
      label: "库存数量",
      width: 160,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.inventoryQty || row.inventoryQty == 0
          ? precisionConversion(row.inventoryQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "allocateQty",
      label: "调拨数量",
      width: 160,
      align: "right",
      slots: {
        default: "allocateQty-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectProductVisible = ref(false)
const selectedIds = computed(() => customTableData.value.map((item) => item.unionId!))

const [formInline] = useResetRef({
  allocateCode: "",
  inWarehouseId: "",
  dataSource: "",
  outWarehouseId: "",
  createTime: "",
  id: "",
  allocateStatus: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: markRaw(SelectFacility),
    label: "拨出仓库",
    field: "outWarehouseId",
    props: {
      isEnable: true
    },
    events: {
      onchange: outWarehouseChange
    }
  },
  {
    componentType: markRaw(SelectFacility),
    label: "拨入仓库",
    field: "inWarehouseId",
    props: {
      isEnable: true
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "dataSource",
    get hidden() {
      return !props.isEdit
    },
    props: {
      placeholder: "请输入来源",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "allocateStatus",
    get hidden() {
      return !props.isEdit
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    get hidden() {
      return !props.isEdit
    },
    props: {
      placeholder: "请选择",
      disabled: true
    }
  }
])

onMounted(() => {
  formInline.value.dataSource = EnumProductionOrderSourceMap[EnumProductionOrderSource.MES]
  if (props.isEdit) {
    formInline.value.allocateCode = props.currentRow.allocateCode || ""
    formInline.value.inWarehouseId = props.currentRow.inWarehouseId?.toString() || ""
    formInline.value.outWarehouseId = props.currentRow.outWarehouseId?.toString() || ""
    formInline.value.createTime = props.currentRow.createTime || ""
    formInline.value.id = props.currentRow.id?.toString() || ""
    formInline.value.allocateStatus =
      EnumWarehouseAllotStatusMap[props.currentRow.allocateStatus! as EnumWarehouseAllotStatus]
    getLogAllocateDetailRequest()
  }
})

const getLogAllocateDetailRequest = async () => {
  try {
    const res = await getLogAllocateDetail(formInline.value.id)
    customTableData.value = res
  } catch (err) {
    console.log(err)
  }
}

/** 选择产品弹窗成功回调 */
const onSelectProductSuccess = (data: IWarehouseCheckProductListItem[]) => {
  if (!data.length) {
    return
  }

  customTableData.value = data.map((item) => {
    const target = customTableData.value.find((row) => row.unionId === item.id)
    if (target) {
      return {
        ...target,
        inventoryQty: item.inventoryQuantity,
        allocateQty: target.allocateQty
      }
    }

    return {
      ...item,
      id: "",
      unionId: item.id,
      inventoryQty: item.inventoryQuantity,
      allocateQty: ""
    }
  })
}

const submitForm = async () => {
  try {
    // 输入校验防御
    let registerNumsNullIndex = customTableData.value.find(
      (item) => item?.allocateQty == "" || item?.allocateQty == undefined
    )
      ? 1
      : -1
    let warehouseLocationIdNullIndex = customTableData.value.find(
      (item) => item?.unitName == "" || item?.unitName == undefined
    )
      ? 1
      : -1
    if (registerNumsNullIndex > -1) {
      if (warehouseLocationIdNullIndex > -1) {
        ElMessage({
          message: "请确保输入每一行的调拨数量及单位",
          type: "warning"
        })
        return
      }
      ElMessage({
        message: "请确保输入每一行的调拨数量",
        type: "warning"
      })
      return
    } else if (warehouseLocationIdNullIndex > -1) {
      ElMessage({
        message: "请选择输入每一行的单位",
        type: "warning"
      })
      return
    }

    const validData = customTableData.value.filter(
      (item) => Number(item.allocateQty) > item.inventoryQty
    )
    if (validData.length > 0) {
      ElMessage({
        message: `调拨数量不能大于库存数量`,
        type: "warning"
      })
      return
    }

    // 新建、保存
    let temptable = customTableData.value.map((item) => ({
      id: item.id,
      productModelId: item.productModelId,
      allocateQty: precisionConversion(item.allocateQty, item?.decimalNumber ?? 2),
      unitId: item.unitId
    }))
    if (!props.isEdit) {
      await getLogAllocateCreate({
        inWarehouseId:
          formInline.value.inWarehouseId == "" ? undefined : formInline.value.inWarehouseId,
        outWarehouseId:
          formInline.value.outWarehouseId == "" ? undefined : formInline.value.outWarehouseId,
        details: temptable
      })
      ElMessage.success("新建成功")
    } else {
      // 保存
      await getLogAllocateUpdate(formInline.value.id, {
        inWarehouseId:
          formInline.value.inWarehouseId == "" ? undefined : formInline.value.inWarehouseId,
        outWarehouseId:
          formInline.value.outWarehouseId == "" ? undefined : formInline.value.outWarehouseId,
        details: temptable
      })
      ElMessage.success("编辑成功")
    }

    emits("close")
    emits("success")
  } catch (error) {
    console.log(error)
  }
}

const onOpenProductDialog = () => {
  if (!formInline.value.outWarehouseId) {
    return ElMessage({
      message: "请选择拨出仓库",
      type: "warning"
    })
  }

  selectProductVisible.value = true
}

function outWarehouseChange() {
  customTableData.value = []
}
</script>

<style lang="scss" scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-back {
  margin: 12px 20px;
}

.top-content {
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  overflow: hidden;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
