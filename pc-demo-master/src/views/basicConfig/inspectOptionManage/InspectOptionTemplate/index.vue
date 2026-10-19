<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="检验项模板列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onCreateInspectTemplate()"
              >新建检验项模板</el-button
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
          <template #status-default="{ row }">
            <el-tag link :type="row.status === 1 ? 'success' : 'danger'">{{
              row.status === 1 ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onEditOrPreview(row)">{{
              isAuth ? "编辑查看" : "查看详情"
            }}</el-button>
            <el-button
              v-if="isAuth"
              link
              :type="row.status === 1 ? 'danger' : 'primary'"
              @click="onSwitchStatus(row)"
              size="small"
              >{{ row.status === 1 ? "停用" : "启用" }}</el-button
            >
            <el-button v-if="isAuth" link type="danger" @click="onDeleteRow(row)" size="small"
              >删除</el-button
            >
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

    <!-- 新建、编辑检验项模板弹窗 -->
    <CreateInspectTemplateDialog
      v-model="createVisible"
      :id="selectedRowId"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryInspectOptionCategoryListAll } from "@/api/baseInfo/inspectOptionCategory"
import {
  queryInspectOptionTemplatePageList,
  requestDeleteInspectOptionTemplate,
  requestDisableInspectOptionTemplate,
  requestEnableInspectOptionTemplate
} from "@/api/baseInfo/inspectOptionTemplate"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IInspectOptionTemplateListItem as ITableRow,
  IInspectOptionTemplatePageListReq
} from "@/types/base-info/inspect-option-template"

import CreateInspectTemplateDialog from "./component/CreateInspectTemplateDialog.vue"

defineOptions({
  name: "InspectOptionTemplate"
})

const isAuth = useButtonAuth("InspectOptionTemplate_update", "InspectOptionTemplate_query")
const inspectCategoryOptions = ref<{ value: string; label: string }[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "itemName",
    label: "检验项名称",
    value: "",
    placeholder: "请输入检验项名称"
  },
  {
    type: EnumComponentType.Input,
    key: "itemCode",
    label: "检验项编号",
    value: "",
    placeholder: "请输入检验项编号"
  },
  {
    type: EnumComponentType.Select,
    key: "categoryId",
    label: "检验项类别",
    value: "",
    placeholder: "请选择检验项类别",
    options: inspectCategoryOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  itemName: string
  itemCode: string
  categoryId: string
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
      prop: "itemName",
      label: "检验项名称",
      minWidth: 160
    },
    {
      prop: "itemCode",
      label: "检验项编号",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "categoryName",
      label: "检验项类别",
      minWidth: 160
    },
    {
      prop: "methodDesc",
      label: "方法要求",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.standardType === 1 ? "数值" : "文本"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IInspectOptionTemplatePageListReq], ITableRow, true> = {
  api: queryInspectOptionTemplatePageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        }
      }
    ]
  }
}

const createVisible = ref(false)
const selectedRowId = ref("")

onMounted(() => {
  getInspectCategoryOptions()
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

/**
 * 获取检验项类别列表
 */
const getInspectCategoryOptions = async () => {
  const data = await queryInspectOptionCategoryListAll()
  if (data) {
    inspectCategoryOptions.value = data.map((item) => {
      return {
        label: item.categoryName,
        value: item.id
      }
    })
  }
}

/**
 * 创建检验项模板
 */
const onCreateInspectTemplate = () => {
  selectedRowId.value = ""
  createVisible.value = true
}

/**
 * 编辑或查看检验项模板
 */
const onEditOrPreview = (row: ITableRow) => {
  selectedRowId.value = row.id
  createVisible.value = true
}

/**
 * 切换检验项模板状态
 */
const onSwitchStatus = async (row: ITableRow) => {
  const operation = row.status === 1 ? "停用" : "启用"
  await ElMessageBox.confirm(`确定${operation}该检验项模板吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  let fn =
    row.status === 1 ? requestDisableInspectOptionTemplate : requestEnableInspectOptionTemplate
  await fn(row.id)
  ElMessage.success(`${operation}成功`)
  customTableRef.value?.requestData()
}

/**
 * 删除检验项模板
 */
const onDeleteRow = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该检验项模板吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestDeleteInspectOptionTemplate(row.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}
</script>

<style lang="scss" scoped></style>
