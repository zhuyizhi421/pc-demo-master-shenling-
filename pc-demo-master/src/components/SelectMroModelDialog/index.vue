<template>
  <CustomDialog v-model="visible" title="选择 MRO 信息" size="large">
    <CustomSearchForm
      :form-list="searchList"
      :label-width="120"
      @search="onSubmit"
      @reset="onReset"
    />

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

import { queryMroCategoryList } from "@/api/operation/mro/mro-category"
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
import { EnumMROIdentityManageMap } from "@/constant/enums"
import type { IOption } from "@/types/common"
import type {
  IMroModelPageListItem as ITableRow,
  IMroModelPageListParams
} from "@/types/maintain/mro-manage/mro-model"

import type { IMroModelDialogEmits, IMroModelDialogProps } from "./type"

defineOptions({
  name: "SelectMroModelDialog"
})

const props = withDefaults(defineProps<IMroModelDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emit = defineEmits<IMroModelDialogEmits>()

const mroTypeOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroCategoryId: string
}>([
  {
    type: EnumComponentType.Input,
    label: "MRO 名称",
    key: "mroModelName",
    value: "",
    placeholder: "请输入 MRO 名称"
  },
  {
    type: EnumComponentType.Input,
    label: "MRO 编号",
    key: "mroModelNo",
    value: "",
    placeholder: "请输入 MRO 编号"
  },
  {
    type: EnumComponentType.Input,
    label: "规格",
    key: "mroSpec",
    value: "",
    placeholder: "请输入规格"
  },
  {
    type: EnumComponentType.Select,
    label: "MRO 类型",
    key: "mroCategoryId",
    value: "",
    placeholder: "请选择 MRO 类型",
    options: mroTypeOptions
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
      prop: "mroModelNo",
      label: "MRO 编号",
      minWidth: 150
    },
    {
      prop: "mroModelName",
      label: "MRO 名称",
      minWidth: 180
    },
    {
      prop: "mroSpec",
      label: "规格",
      minWidth: 160
    },
    {
      prop: "mroClassifyName",
      label: "MRO 分类",
      minWidth: 160
    },
    {
      prop: "mroCategoryName",
      label: "MRO 类型",
      minWidth: 160
    },
    {
      prop: "identityManage",
      label: "标识管理",
      width: 120,
      align: "center",
      formatter: ({ identityManage }) => EnumMROIdentityManageMap[identityManage]
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

const queryConfig: ITableRequestConfig<[IMroModelPageListParams], ITableRow, true> = {
  api: queryMroModelPageList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          identityManage: props.identityManage
        },
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
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
      getMroTypeOptions()
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllMroModelList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getAllMroModelList)
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

const getAllMroModelList = async () => {
  const { records } = await queryMroModelPageList({
    pageQuery: {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    },
    queryParam: {
      identityManage: props.identityManage
    }
  })
  return records
}

const getMroTypeOptions = async () => {
  const data = await queryMroCategoryList()
  mroTypeOptions.value = data.map((item) => ({
    label: item.categoryName,
    value: item.id
  }))
}

const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择 MRO 信息")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择 MRO 信息")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
