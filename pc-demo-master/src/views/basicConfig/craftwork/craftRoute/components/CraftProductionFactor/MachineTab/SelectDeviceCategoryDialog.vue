<!-- 选择设备分类弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择设备分类" size="large">
    <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig" />

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="refreshTableData"
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
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"

interface IDeviceCategoryRow {
  id: string
  categoryNo: string
  categoryName: string
  parentCategoryName: string
  remarks: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    selectedRowKeys: string[]
    multiple?: boolean
    rowKey?: string
  }>(),
  {
    multiple: false,
    rowKey: "id"
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: IDeviceCategoryRow[]): void
}>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  categoryNo: string
  categoryName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "设备分类编号",
    key: "categoryNo",
    value: "",
    placeholder: "请输入设备分类编号"
  },
  {
    type: EnumComponentType.Input,
    label: "设备分类名称",
    key: "categoryName",
    value: "",
    placeholder: "请输入设备分类名称"
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const allRows = ref<IDeviceCategoryRow[]>([])
const tableData = ref<IDeviceCategoryRow[]>([])
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
      prop: "categoryNo",
      label: "设备分类编号",
      minWidth: 160
    },
    {
      prop: "categoryName",
      label: "设备分类名称",
      minWidth: 180
    },
    {
      prop: "parentCategoryName",
      label: "上级分类",
      minWidth: 180,
      formatter: (row: IDeviceCategoryRow) => row.parentCategoryName || "-"
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

const filteredRows = computed(() => {
  const { categoryNo, categoryName } = getFormData()
  const noKeyword = String(categoryNo || "").trim().toLowerCase()
  const nameKeyword = String(categoryName || "").trim().toLowerCase()

  return allRows.value.filter((item) => {
    const matchNo = !noKeyword || String(item.categoryNo || "").toLowerCase().includes(noKeyword)
    const matchName =
      !nameKeyword || String(item.categoryName || "").toLowerCase().includes(nameKeyword)
    return matchNo && matchName
  })
})

const flattenCategoryRows = (nodes: IDeviceCateHierarchyTreeRes[]): IDeviceCategoryRow[] => {
  return nodes.flatMap((item) => {
    const currentRow = {
      id: String(item.id),
      categoryNo: item.categoryNo || "",
      categoryName: item.categoryName || "",
      parentCategoryName: item.parentCategoryName || "",
      remarks: item.remarks || ""
    }
    return [currentRow, ...flattenCategoryRows(item.subDirs || [])]
  })
}

const refreshTableData = () => {
  pagination.total = filteredRows.value.length
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filteredRows.value.slice(startIndex, startIndex + pagination.pageSize)
}

const getAllCategoryRows = async () => allRows.value

const loadCategoryData = async () => {
  const res = await requestDeviceCategoryTree()
  allRows.value = flattenCategoryRows(res?.subDirs || [])
  refreshTableData()
}

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await loadCategoryData()
      await nextTick()
      if (!props.selectedRowKeys?.length) return
      if (props.multiple) {
        await tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllCategoryRows)
      } else {
        await tableRef.value?.setSelectedRow(props.selectedRowKeys[0], getAllCategoryRows)
      }
      return
    }

    resetForm()
    pagination.currentPage = 1
    tableData.value = []
    allRows.value = []
    tableRef.value?.clearSelectedRow()
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  refreshTableData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as IDeviceCategoryRow
    if (!selectedRow) {
      return ElMessage.warning("请选择设备分类")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as IDeviceCategoryRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择设备分类")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
