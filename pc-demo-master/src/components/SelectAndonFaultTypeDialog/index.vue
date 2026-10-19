<!-- 选择Andon故障类型弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择Andon故障类型" size="large">
    <CustomSearchForm
      :form-list="searchList"
      :label-width="140"
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
  requestSystemFaultCategoryByIds,
  requestSystemFaultCategoryPageList
} from "@/api/baseInfo/system-fault/system-fault-category"
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
import { EnumSystemFaultType } from "@/constant/enums"
import type {
  ISystemFaultCategoryInfo as ITableRow,
  ISystemFaultTypePageListParams
} from "@/types/base-info/system-fault-category"

import type { IAndonFaultTypeDialogEmits, IAndonFaultTypeDialogProps } from "./type"

defineOptions({
  name: "SelectAndonFaultTypeDialog"
})

const props = withDefaults(defineProps<IAndonFaultTypeDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emits = defineEmits<IAndonFaultTypeDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  categoryName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "Andon故障类型名称",
    key: "categoryName",
    value: "",
    placeholder: "请输入Andon故障类型名称"
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
      prop: "categoryNo",
      label: "Andon故障类型编号",
      minWidth: 160
    },
    {
      prop: "categoryName",
      label: "Andon故障类型名称",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
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
const queryConfig: ITableRequestConfig<[ISystemFaultTypePageListParams], ITableRow, true> = {
  api: requestSystemFaultCategoryPageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        faultType: EnumSystemFaultType.Andon
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
  set: (val) => emits("update:modelValue", val)
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
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedAndonFaultTypeData)
          : tableRef.value?.setSelectedRow(
              props.selectedRowKeys?.[0],
              getSelectedAndonFaultTypeData
            )
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

/** 获取andon故障列表已选中数据 */
const getSelectedAndonFaultTypeData = async () => {
  const data = await requestSystemFaultCategoryByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择Andon故障类型")
    }
    emits("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择Andon故障类型")
    }
    emits("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
