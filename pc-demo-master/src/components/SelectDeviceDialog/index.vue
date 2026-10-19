<!-- 选择设备弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择设备" size="large">
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
      <template #status-default="{ row: { equipmentStatus } }">
        <el-tag
          :type="equipmentStatus === EnumDeviceUseStatusType.Stopping ? 'danger' : 'success'"
          >{{ equipmentStatus === EnumDeviceUseStatusType.Stopping ? "停用" : "启用" }}</el-tag
        >
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

import {
  queryEquipmentPageList,
  requestEquipmentListByIds
} from "@/api/operation/equipment/equipment-info"
import { requestAllEquipmentModel } from "@/api/operation/equipment/equipment-model"
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
import { EnumDeviceUseStatusType } from "@/constant/enums"
import type { IOption } from "@/types/common"
import type {
  IEquipmentPageItem as ITableRow,
  IEquipmentPageParams
} from "@/types/maintain/equipment-manage/equipment-info"

import type { IDeviceDialogEmits, IDeviceDialogProps } from "./type"

defineOptions({
  name: "SelectDeviceDialog"
})

const props = withDefaults(defineProps<IDeviceDialogProps>(), {
  rowKey: "id",
  multiple: false,
  enable: false
})

const emit = defineEmits<IDeviceDialogEmits>()

const equipmentModelOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  equipmentName: string
  equipmentNo: string
  equipmentModelId: string
}>([
  {
    type: EnumComponentType.Input,
    label: "设备名称",
    key: "equipmentName",
    value: "",
    placeholder: "请输入设备名称"
  },
  {
    type: EnumComponentType.Input,
    label: "设备编号",
    key: "equipmentNo",
    value: "",
    placeholder: "请输入设备编号"
  },
  {
    type: EnumComponentType.Select,
    label: "设备型号",
    key: "equipmentModelId",
    value: "",
    placeholder: "",
    options: equipmentModelOptions,
    filterable: true
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
      prop: "equipmentName",
      label: "设备名称",
      minWidth: 160
    },
    {
      prop: "equipmentNo",
      label: "设备编号",
      minWidth: 160
    },
    {
      prop: "equipmentModel.modelName",
      label: "设备型号",
      minWidth: 160
    },
    {
      prop: "equipmentModel.equipmentCategoryName",
      label: "设备分类",
      minWidth: 160
    },
    {
      prop: "status",
      label: "设备状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "handlerStatus",
      label: "维护状态",
      width: 120,
      align: "center"
    },
    {
      prop: "createTime",
      label: "设备添加时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
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
const queryConfig: ITableRequestConfig<[IEquipmentPageParams], ITableRow, true> = {
  api: queryEquipmentPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData(),
          equipmentStatus: props.enable ? 1 : undefined
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
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
      getEquipmentModelOptions()

      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedEquipmentList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedEquipmentList)
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

/** 获取设备型号列表 */
const getEquipmentModelOptions = async () => {
  const res = await requestAllEquipmentModel()
  equipmentModelOptions.value = res.map((item) => ({
    label: item.modelName,
    value: item.id
  }))
}

/** 获取所有设备列表数据 */
const getSelectedEquipmentList = async () => {
  const data = await requestEquipmentListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择设备")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择设备")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
