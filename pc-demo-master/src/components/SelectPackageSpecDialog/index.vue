<!-- 选择包装规范弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择包装规范" size="large">
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
      <template #thumbnailAddress-default="{ row: { templateDto } }">
        <el-image
          v-if="templateDto?.thumbnailAddress"
          :src="formatImgUrlPreview(templateDto?.thumbnailAddress)"
          :preview-src-list="[formatImgUrlPreview(templateDto?.thumbnailAddress)]"
          preview-teleported
          style="height: 24px"
        />
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
  queryPackageSpecDetails,
  queryPackageSpecPageList
} from "@/api/baseInfo/package-manage/packageSpec"
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
  IPackageSpecPageListItem as ITableRow,
  IPackageSpecPageListParams
} from "@/types/base-info/package-spec"
import { formatImgUrlPreview } from "@/utils/common"

import type { IPackageSpecDialogEmits, IPackageSpecDialogProps } from "./type"

defineOptions({
  name: "SelectDocumentDialog"
})

const props = withDefaults(defineProps<IPackageSpecDialogProps>(), {
  rowKey: "id",
  multiple: false,
  enable: true
})

const emit = defineEmits<IPackageSpecDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  specName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "包装规范名称",
    key: "specName",
    value: "",
    placeholder: "请输入包装规范名称"
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
      prop: "specName",
      label: "包装规范名称",
      minWidth: 160
    },
    {
      prop: "containerTypeName",
      label: "包装容器类型",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "transportType",
      label: "运输方式",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "thumbnailAddress",
      label: "打印标识模板",
      minWidth: 160,
      align: "center",
      slots: {
        default: "thumbnailAddress-default"
      }
    },
    {
      prop: "remark",
      label: "备注说明",
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
const queryConfig: ITableRequestConfig<[IPackageSpecPageListParams], ITableRow, true> = {
  api: queryPackageSpecPageList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          status: props.enable ? "enable" : undefined
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
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getPackageSpecDetails)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getPackageSpecDetails)
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

/** 获取指定id的信息 */
const getPackageSpecDetails = async () => {
  const data = await queryPackageSpecDetails(props.selectedRowKeys)
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择包装规范")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择包装规范")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
