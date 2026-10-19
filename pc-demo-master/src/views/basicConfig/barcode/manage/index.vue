<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="条码列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="emptyBarcodeVisible = true"
              >新增空白码</el-button
            >
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #operation-default="{ row }">
            <el-button
              v-if="!!isAuth"
              link
              type="primary"
              size="small"
              @click="onPrintBarcodeClick(row)"
            >
              打印标签码
            </el-button>
            <el-button
              v-if="!!isAuth"
              link
              type="primary"
              size="small"
              @click="onOpenRemarkDialogClick(row)"
            >
              备注
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <CustomDialog v-model="showRemark" title="编辑备注" size="mini">
      <CustomForm
        ref="customFormRef"
        v-model="currentRowData"
        :configs="formConfigs"
        :labelWidth="60"
      ></CustomForm>
      <template #footer>
        <el-button @click="showRemark = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitRemarkClick()">保 存</el-button>
      </template>
    </CustomDialog>

    <!-- 新增空白码弹窗 -->
    <CreateEmptyBarcode
      v-if="emptyBarcodeVisible"
      @success="customTableRef?.requestData()"
      @close="emptyBarcodeVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getBarcode, updateBarcodeRemarks } from "@/api/barcode"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumBarcodeType, EnumBarcodeTypeMap } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IBarcodeItem as ITableRow, IBarcodeParams } from "@/types/base-info/barcode"

import CreateEmptyBarcode from "./components/CreateEmptyBarcode.vue"

defineOptions({
  name: "BarcodeManage"
})

const isAuth = useButtonAuth("BarcodeMange_update", "BarcodeMange_query")

const { printBarcode } = useBarcodePrint()

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "barcode",
    label: "标签码",
    value: "",
    placeholder: "请输入标签码"
  },
  {
    type: EnumComponentType.Select,
    key: "entityType",
    label: "绑定对象类型",
    value: "",
    placeholder: "请选择绑定对象类型",
    options: Object.entries(EnumBarcodeTypeMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  },
  {
    type: EnumComponentType.Input,
    key: "entityCode",
    label: "绑定对象编号",
    value: "",
    placeholder: "请输入绑定对象编号"
  },
  {
    type: EnumComponentType.Select,
    key: "isEmpty",
    label: "空条码",
    value: "",
    placeholder: "请选择空条码",
    options: [
      {
        label: "是",
        value: true
      },
      {
        label: "否",
        value: false
      }
    ]
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "createTime",
    label: "创建时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "bindTime",
    label: "绑定时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startBindDate", "endBindDate"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  barcode: string
  entityType?: number
  entityCode: string
  isEmpty?: boolean
  startDate: string
  endDate: string
  startBindDate: string
  endBindDate: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "entityType",
      label: "绑定类型",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumBarcodeTypeMap[row.entityType as EnumBarcodeType]
      }
    },
    {
      prop: "entityCode",
      label: "绑定对象编号",
      minWidth: 160
    },
    {
      prop: "bindTime",
      label: "绑定时间",
      width: 160,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IBarcodeParams], ITableRow, true> = {
  api: getBarcode,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

const currentRowData = ref<any>({
  remark: "",
  id: ""
})
const showRemark = ref(false)

const emptyBarcodeVisible = ref(false) // 新增空白码弹窗标识

onMounted(() => {
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 打印标签码 */
const onPrintBarcodeClick = async (data: any) => {
  printBarcode([data.barcode])
}

/** 打开编辑备注弹窗 */
const onOpenRemarkDialogClick = (data: any) => {
  currentRowData.value = cloneDeep(data)
  showRemark.value = true
}

/** 提交编辑备注 */
const onSubmitRemarkClick = async () => {
  await updateBarcodeRemarks({
    id: currentRowData.value.id,
    remark: currentRowData.value.remark
  })
  ElMessage.success("编辑成功")
  showRemark.value = false
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss"></style>
