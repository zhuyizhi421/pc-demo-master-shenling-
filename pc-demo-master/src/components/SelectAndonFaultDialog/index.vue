<!-- 选择Andon故障弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择Andon故障" size="large">
    <CustomSearchForm
      :form-list="searchList"
      :label-width="120"
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
      <template #isEnabled-default="{ row: { isEnabled } }">
        <el-tag :type="isEnabled ? 'success' : 'danger'">{{ isEnabled ? "启用" : "停用" }}</el-tag>
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
  querySystemFaultPageList,
  requestSystemFaultListByIds
} from "@/api/baseInfo/system-fault/system-fault"
import { requestAllSystemFaultCategory } from "@/api/baseInfo/system-fault/system-fault-category"
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
  ISystemFaultInfo as ITableRow,
  ISystemFaultPageParams
} from "@/types/base-info/system-fault"
import type { IOption } from "@/types/common"

import type { IAndonFaultDialogEmits, IAndonFaultDialogProps } from "./type"

defineOptions({
  name: "SelectAndonFaultDialog"
})

const props = withDefaults(defineProps<IAndonFaultDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emits = defineEmits<IAndonFaultDialogEmits>()

const faultCateOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  faultName: string
  faultCategoryId: string
}>([
  {
    type: EnumComponentType.Input,
    label: "Andon故障名称",
    key: "faultName",
    value: "",
    placeholder: "请输入Andon故障名称"
  },
  {
    type: EnumComponentType.Select,
    label: "Andon故障类型",
    key: "faultCategoryId",
    value: "",
    placeholder: "请选择Andon故障类型",
    options: faultCateOptions,
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
      prop: "faultNo",
      label: "Andon故障编号",
      minWidth: 160
    },
    {
      prop: "faultName",
      label: "Andon故障名称",
      minWidth: 160
    },
    {
      prop: "faultCategoryName",
      label: "Andon故障类型",
      minWidth: 160
    },
    {
      prop: "isEnabled",
      label: "状态",
      minWidth: 120,
      align: "center",
      slots: {
        default: "isEnabled-default"
      }
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
const queryConfig: ITableRequestConfig<[ISystemFaultPageParams], ITableRow, true> = {
  api: querySystemFaultPageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        faultType: EnumSystemFaultType.Andon,
        isEnabled: true
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
      getFaultCateOptions()
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllAndonFaultData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getAllAndonFaultData)
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

/** 获取andon故障列表所有数据 */
const getAllAndonFaultData = async () => {
  const data = await requestSystemFaultListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 获取andon故障类型 */
const getFaultCateOptions = async () => {
  const data = await requestAllSystemFaultCategory({
    faultType: EnumSystemFaultType.Andon
  })
  faultCateOptions.value = data.map((item) => ({
    label: item.categoryName,
    value: item.id
  }))
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择Andon故障")
    }
    emits("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择Andon故障")
    }
    emits("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
