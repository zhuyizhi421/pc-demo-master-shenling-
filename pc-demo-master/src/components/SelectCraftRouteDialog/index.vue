<!-- 选择工艺路线弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择工艺路线" size="large">
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
      <template #publishStatus-default="{ row: { publishStatus } }">
        <el-tag :type="formatStatusTag(publishStatus)">
          {{ EnumCraftStatusMap[publishStatus as EnumCraftStatus] }}</el-tag
        >
      </template>

      <template #operation-default="{ row }">
        <el-button type="primary" link size="small" @click="onReviewDetail(row)"
          >查看详情</el-button
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

  <CraftProcessDialog v-model="processDialogVisible" :id="selectedRowId" />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryCraftRoutePageList, requestCraftRouteListByIds } from "@/api/craft"
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
import {
  EnumCraftStatus,
  EnumCraftStatusMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import type { ICraftRouteItem as ITableRow, ICraftRouteParams } from "@/types/base-info/craftRoute"

import CraftProcessDialog from "./CraftProcessDialog.vue"
import type { ICraftRouteDialogEmits, ICraftRouteDialogProps } from "./type"

defineOptions({
  name: "SelectCraftRouteDialog"
})

const props = withDefaults(defineProps<ICraftRouteDialogProps>(), {
  rowKey: "id",
  multiple: false,
  disabledNo: false,
  disabledStatus: false
})
const emits = defineEmits<ICraftRouteDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  exactProductNo: string
  publishStatus: number
  sourceType: number
  version: string
}>([
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "exactProductNo",
    value: "",
    placeholder: "请输入产品编号",
    get disabled() {
      return !!props.disabledNo
    }
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "publishStatus",
    value: "",
    options: [
      { label: "设计中", value: 1 },
      { label: "已发布", value: 2 },
      { label: "已作废", value: 3 }
    ],
    placeholder: "请选择状态",
    get disabled() {
      return !!props.disabledStatus
    }
  },
  {
    type: EnumComponentType.Select,
    label: "来源",
    key: "sourceType",
    value: "",
    options: [
      { label: "MES", value: 1 },
      { label: "ERP", value: 2 }
    ],
    placeholder: "请选择来源"
  },
  {
    type: EnumComponentType.Input,
    label: "版本",
    key: "version",
    value: "",
    placeholder: "请输入版本"
  }
])

const processDialogVisible = ref(false)
const selectedRowId = ref("")
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "name",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModel.code",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "no",
      label: "工艺路线编号",
      minWidth: 160
    },
    {
      prop: "version",
      label: "路线版本",
      minWidth: 120
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 90,
      align: "center",
      formatter: ({ sourceType }) =>
        EnumProductionOrderSourceMap[sourceType as EnumProductionOrderSource]
    },
    {
      prop: "publishStatus",
      label: "状态",
      width: 100,
      align: "center",
      slots: {
        default: "publishStatus-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
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
const queryConfig: ITableRequestConfig<[ICraftRouteParams], ITableRow, true> = {
  api: queryCraftRoutePageList,
  getParams: () => {
    return [
      {
        pageQuery: { pageNum: pagination.currentPage, pageSize: pagination.pageSize },
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
  set: (val) => emits("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initSearchForm()
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedCraftRouteData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedCraftRouteData)
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
  initSearchForm()
  onSubmit()
}

/** 初始化查询项 */
const initSearchForm = () => {
  searchList.value.find((item) => item.key === "exactProductNo")!.value =
    props.queryProductNo as string
  searchList.value.find((item) => item.key === "publishStatus")!.value =
    props.publishStatus as number
}

/** 格式化状态tag */
const formatStatusTag = (status: number) => {
  const tagMap: Record<number, string> = {
    [EnumCraftStatus.DESIGN]: "primary",
    [EnumCraftStatus.PUBLISHED]: "success",
    [EnumCraftStatus.INVALID]: "danger"
  }
  return tagMap[status]
}

/** 获取已选中工艺路线id列表对应的数据 */
const getSelectedCraftRouteData = async () => {
  const data = await requestCraftRouteListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 查看详情 */
const onReviewDetail = async (data: ITableRow) => {
  if (data.id) {
    processDialogVisible.value = true
    selectedRowId.value = data.id
  }
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择工艺路线")
    }
    emits("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择工艺路线")
    }
    emits("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
