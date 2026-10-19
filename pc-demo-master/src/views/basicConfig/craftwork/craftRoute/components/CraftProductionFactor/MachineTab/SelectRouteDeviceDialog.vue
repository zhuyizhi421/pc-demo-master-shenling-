<!-- 工艺路线-选择设备弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择设备" size="large">
    <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    />

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

import { requestDeviceCategoryTree } from "@/api/operation/equipment/equipment-category"
import {
  queryEquipmentPageList,
  requestEquipmentListByIds
} from "@/api/operation/equipment/equipment-info"
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
import type { IOption } from "@/types/common"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"
import type {
  IEquipmentPageItem as ITableRow,
  IEquipmentPageParams
} from "@/types/maintain/equipment-manage/equipment-info"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    selectedRowKeys: string[]
    multiple?: boolean
    rowKey?: string
    enable?: boolean
  }>(),
  {
    multiple: false,
    rowKey: "id",
    enable: false
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: ITableRow[]): void
}>()

const categoryOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  equipmentName: string
  equipmentNo: string
  equipmentCategoryId: string
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
    label: "设备分类",
    key: "equipmentCategoryId",
    value: "",
    placeholder: "请选择设备分类",
    options: categoryOptions,
    filterable: true
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "equipmentName",
      label: "设备名称",
      minWidth: 180
    },
    {
      prop: "equipmentNo",
      label: "设备编号",
      minWidth: 180
    },
    {
      prop: "equipmentModel.equipmentCategoryName",
      label: "设备分类",
      minWidth: 180
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 220
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
  getParams: () => [
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

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const flattenCategoryOptions = (nodes: IDeviceCateHierarchyTreeRes[]): IOption[] => {
  return nodes.flatMap((item) => {
    const current = {
      label: item.categoryName || "",
      value: String(item.id)
    }
    return [current, ...flattenCategoryOptions(item.subDirs || [])]
  })
}

const getCategoryOptions = async () => {
  const res = await requestDeviceCategoryTree()
  categoryOptions.value = flattenCategoryOptions(res?.subDirs || [])
}

const getSelectedEquipmentList = async () => {
  const data = await requestEquipmentListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await getCategoryOptions()
      await nextTick()
      tableRef.value?.requestData()

      if (!props.selectedRowKeys?.length) {
        return
      }
      if (props.multiple) {
        await tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedEquipmentList)
      } else {
        await tableRef.value?.setSelectedRow(props.selectedRowKeys[0], getSelectedEquipmentList)
      }
      return
    }

    resetForm()
    categoryOptions.value = []
    tableData.value = []
    tableRef.value?.clearSelectedRow()
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
