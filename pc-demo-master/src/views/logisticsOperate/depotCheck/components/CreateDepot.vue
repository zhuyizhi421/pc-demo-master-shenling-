<!-- 新增/编辑 盘点 -->
<template>
  <div class="content">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!isEdit ? '新建盘点' : `盘点单号：${currentRow?.checkCode}`"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="盘点清单" :is-table-title="false" show-short-bar>
        <div>
          <el-button
            type="primary"
            :disabled="!formData.storageId"
            icon="Plus"
            @click="selectProductVisible = true"
            >选择产品</el-button
          >
        </div>
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="customTableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #operation-default="{ $index }">
          <el-button link type="danger" @click="customTableData.splice($index, 1)"
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

  <!-- 选择产品弹窗 -->
  <SelectProductInventoryDialog
    v-model="selectProductVisible"
    :selected-row-keys="selectedIds"
    :facility-id="formData.storageId"
    multiple
    @success="onSelectProductSuccess"
  />
</template>

<script setup lang="ts" name="">
import { ElMessage } from "element-plus"

import {
  queryWarehouseCheckDetail,
  requestCreateWarehouseCheck,
  requestUpdateWarehouseCheck
} from "@/api/logistics/warehouseCheck"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectFactoryModel from "@/components/SelectFactoryModel/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import SelectProductInventoryDialog from "@/components/SelectProductInventoryDialog/index.vue"
import type {
  IWarehouseCheckDetail,
  IWarehouseCheckPageListItem,
  IWarehouseCheckProductListItem
} from "@/types/logistics/warehouse-check"
import { precisionConversion } from "@/utils/common"

type ITableRow = Partial<
  IWarehouseCheckDetail & IWarehouseCheckProductListItem & { unionId: string }
>

const props = defineProps<{
  currentRow: IWarehouseCheckPageListItem
}>()
const emits = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const isEdit = computed(() => !!props.currentRow?.id)

const formData = ref({
  storageId: "",
  checkStatus: "",
  createTime: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: markRaw(SelectFactoryModel),
    label: "仓库",
    field: "storageId",
    get rules() {
      return isEdit.value ? [] : [{ required: true, message: "请选择仓库", trigger: "change" }]
    },
    props: {
      class: "w-[100%]",
      isEnable: true,
      valueAttr: "entityId",
      get type() {
        return SelectType.WarehouseType
      },
      get disabled() {
        return isEdit.value
      }
    },
    events: {
      onChange: onFactoryModelChange
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "checkStatus",
    get hidden() {
      return !isEdit.value
    },
    props: {
      disabled: true
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
      disabled: true
    }
  }
])

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
      prop: "inventoryQuantity",
      label: "库存总数",
      width: 160,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.inventoryQuantity || row.inventoryQuantity == 0
          ? precisionConversion(row.inventoryQuantity, row?.decimalNumber ?? 2)
          : ""
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
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectedIds = computed(() => customTableData.value.map((item) => item.unionId!))
const selectProductVisible = ref(false)

onMounted(async () => {
  if (props.currentRow?.id) {
    formData.value = {
      storageId: props.currentRow?.facilityId || "",
      checkStatus: ["未发布", "已发布", "已结案"][props.currentRow?.checkStatus] ?? "",
      createTime: props.currentRow?.createTime || ""
    }
    const res = await queryWarehouseCheckDetail(props.currentRow?.id)
    customTableData.value = res
  }
})

function onFactoryModelChange() {
  customTableData.value = []
}

const submitForm = async () => {
  // 创建及编辑操作
  try {
    let params
    if (props.currentRow?.id) {
      params = {
        id: props.currentRow?.id,
        detail: customTableData.value.map((item: any) => {
          return {
            productModelId: item.productModelId,
            id: item.id ?? undefined,
            unitId: item.unitId
          }
        })
      }
      await requestUpdateWarehouseCheck(params)
      ElMessage.success("编辑成功")
    } else {
      const valid = await customFormRef.value?.validateForm()
      if (!valid) return
      params = {
        facilityId: formData.value.storageId,
        detail: customTableData.value.map((item) => {
          return {
            productModelId: item.productModelId!,
            id: item.productModelId!,
            unitId: item.unitId!
          }
        })
      }
      await requestCreateWarehouseCheck(params)
      ElMessage.success("新建成功")
    }
    emits("success")
    emits("close")
  } catch (error) {
    /* empty */
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
      return target
    }
    return {
      ...item,
      id: "",
      unionId: item.id
    }
  })
}
</script>

<style scoped lang="scss">
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
