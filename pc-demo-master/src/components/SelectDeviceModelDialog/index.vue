<!-- 选择设备型号弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择设备型号" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
      <template #modelStatus-default="{ row: { modelStatus } }">
        <el-tag :type="modelStatus === 1 ? 'success' : 'danger'">{{
          modelStatus === 1 ? "启用" : "停用"
        }}</el-tag>
      </template>
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="tableRef?.requestData()"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryEquipmentModelPageList } from "@/api/operation/equipment/equipment-model"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  IEquipmentModelPageItem as ITableRow,
  IEquipmentModelPageListParams
} from "@/types/maintain/equipment-manage/equipment-model"

import type { IDeviceModelDialogEmits, IDeviceModelDialogProps } from "./type"

defineOptions({
  name: "SelectDeviceModelDialog"
})

const props = withDefaults(defineProps<IDeviceModelDialogProps>(), {
  rowKey: "id",
  multiple: false
})
const emit = defineEmits<IDeviceModelDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  modelName: string
  modelNo: string
  deviceModel: string
}>([
  {
    type: EnumComponentType.Input,
    label: "类型名称",
    key: "modelName",
    value: "",
    placeholder: "请输入类型名称"
  },
  {
    type: EnumComponentType.Input,
    label: "类型编号",
    key: "modelNo",
    value: "",
    placeholder: "请输入类型编号"
  },
  {
    type: EnumComponentType.Input,
    label: "设备型号",
    key: "deviceModel",
    value: "",
    placeholder: "请输入设备型号"
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "modelName",
      label: "类型名称",
      minWidth: 160
    },
    {
      prop: "modelNo",
      label: "类型编号",
      minWidth: 160
    },
    {
      prop: "deviceModel",
      label: "设备型号",
      minWidth: 160
    },
    {
      prop: "equipmentCategoryName",
      label: "设备分类",
      minWidth: 160
    },
    {
      prop: "modelStatus",
      label: "设备状态",
      minWidth: 160,
      align: "center",
      slots: {
        default: "modelStatus-default"
      }
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      get multiple() {
        return props.multiple
      },
      fixed: "right",
      selectable: (row) => {
        return props.multiple ? !props.selectedRowKeys?.includes(row[props.rowKey]) : true
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IEquipmentModelPageListParams], ITableRow, true> = {
  api: queryEquipmentModelPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData()
        }
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple && props.selectedRowKeys
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllEquipmentModelData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getAllEquipmentModelData)
      })
    } else {
      resetForm()
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取所有设备型号数据 */
const getAllEquipmentModelData = async () => {
  const { records } = await queryEquipmentModelPageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 100000
    }
  })
  return records
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择设备型号")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择设备型号")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
