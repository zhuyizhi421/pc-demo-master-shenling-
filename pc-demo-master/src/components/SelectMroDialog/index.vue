<!-- 选择MRO弹窗 -->
<template>
  <CustomDialog v-model="visible" :title="props.title || '选择MRO'" size="large">
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

import { queryMroCategoryList } from "@/api/operation/mro/mro-category"
import { queryMroInfoListByMroIdList, queryMroInfoPageList } from "@/api/operation/mro/mro-info"
import { queryMroModelPageList } from "@/api/operation/mro/mro-model"
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
import type {
  IMroInfoPageListItem as ITableRow,
  IMroInfoPageListParams
} from "@/types/maintain/mro-manage/mro-info"
import { formatPercent, precisionConversion } from "@/utils/common"

import type { IMroDialogEmits, IMroDialogProps } from "./type"

defineOptions({
  name: "SelectMroDialog"
})

const props = withDefaults(defineProps<IMroDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emit = defineEmits<IMroDialogEmits>()

const mroTypeOptions = ref<IOption[]>([])
const mroModelOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroNo: string
  barcode: string
  mroCategoryNo: string
  mroModelId: string
}>([
  {
    type: EnumComponentType.Input,
    label: "MRO序列号",
    key: "mroNo",
    value: "",
    placeholder: "请输入MRO序列号"
  },
  {
    type: EnumComponentType.Select,
    label: "MRO类型",
    key: "mroCategoryNo",
    value: "",
    placeholder: "请选择MRO类型",
    options: mroTypeOptions,
    get disabled() {
      return !!props.fixedMroCate
    }
  },
  {
    type: EnumComponentType.Select,
    label: "MRO型号",
    key: "mroModelId",
    value: "",
    placeholder: "请选择MRO型号",
    options: mroModelOptions,
    filterable: true
  },
  {
    type: EnumComponentType.Input,
    label: "标签码",
    key: "barcode",
    value: "",
    placeholder: "请输入标签码"
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
      prop: "mroNo",
      label: "MRO序列号",
      minWidth: 160
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "mroModelVo.mroModelName",
      label: "MRO型号",
      minWidth: 160
    },
    {
      prop: "mroModelVo.mroCategoryName",
      label: "MRO类型",
      minWidth: 100,
      align: "center"
    },
    {
      prop: "lifeSpan",
      label: "寿命",
      minWidth: 100,
      formatter: ({ lifeSpan }) => formatPercent(lifeSpan)
    },
    {
      prop: "warehouseLocationName",
      label: "当前位置",
      minWidth: 100
    },
    {
      prop: "stocks",
      label: "数量",
      minWidth: 100,
      align: "right",
      formatter: ({ stocks, decimalNumber }) => precisionConversion(stocks, decimalNumber)
    },
    {
      prop: "mroModelVo.unitModelName",
      label: "单位",
      minWidth: 90,
      align: "center"
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
const queryConfig: ITableRequestConfig<[IMroInfoPageListParams], ITableRow, true> = {
  api: queryMroInfoPageList,
  getParams: () => {
    const { mroCategoryNo, ...rest } = getFormData()
    const mroCategoryName = mroTypeOptions.value.find((item) => item.value === mroCategoryNo)?.label
    return [
      {
        pageQuery: { pageNum: pagination.currentPage, pageSize: pagination.pageSize },
        queryParam: {
          ...rest,
          mroCategoryName,
          identityManage: props.identityManage ? 1 : undefined,
          ledgerStatus: props.ledgerStatus
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
  async (val) => {
    if (val) {
      getMroCategory()
      await getMroModelOptions()
      initSearchList()
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedMroList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedMroList)
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
  initSearchList()
  onSubmit()
}

/** 查询项初始化 */
const initSearchList = () => {
  if (props.fixedMroCate) {
    const target = mroTypeOptions.value.find((item) => item.label === props.fixedMroCate)
    searchList.value.find((item) => item.key === "mroCategoryNo")!.value = target?.value || ""
  }
}

/** 获取指定mroId列表对应的mro数据 */
const getSelectedMroList = async () => {
  const data = await queryMroInfoListByMroIdList({
    idList: props.selectedRowKeys
  })
  return data
}

/**
 * 获取mro类型列表
 */
const getMroCategory = async () => {
  const res = await queryMroCategoryList()
  mroTypeOptions.value = res.map((item) => ({
    label: item.categoryName,
    value: item.categoryNo
  }))
}

/** 获取MRO型号列表 */
const getMroModelOptions = async () => {
  const { records } = await queryMroModelPageList({ pageQuery: { pageNum: 1, pageSize: 1000 } })
  mroModelOptions.value = records.map((item) => {
    return {
      label: item.mroModelName,
      value: item.id
    }
  })
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择MRO")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择MRO")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
