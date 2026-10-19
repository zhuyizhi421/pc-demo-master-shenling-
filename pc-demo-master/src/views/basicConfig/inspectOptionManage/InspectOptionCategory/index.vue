<!-- 检验项管理-检验性类别 -->
<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        :menuItems="treeList"
        label-attr="name"
        @node-click="treeNodeClick"
        :showCustomIcon="false"
        virtualize
      />
    </div>

    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        :label-width="120"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="检验项类别列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onCreateInspectCategory()"
              >新建检验项类别</el-button
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

    <!-- 新建、编辑检验项类别弹窗 -->
    <CreateInspectCategoryDialog
      v-model="createVisible"
      :id="selectedRowId"
      :parent-id="currentCateInfo?.id"
      @success="getTreeData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryInspectOptionCategoryPageList,
  requeryInspectOptionCategoryTree,
  requestDeleteInspectOptionCategory,
  requestDisableInspectOptionCategory,
  requestEnableInspectOptionCategory
} from "@/api/baseInfo/inspectOptionCategory"
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
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IInspectOptionCategoryListItem as ITableRow,
  IInspectOptionCategoryPageListReq,
  IInspectOptionCategoryTree
} from "@/types/base-info/inspect-option-category"

import CreateInspectCategoryDialog from "./component/CreateInspectCategoryDialog.vue"

defineOptions({
  name: "InspectOptionCategory"
})

const isAuth = useButtonAuth("InspectOptionCategory_update", "InspectOptionCategory_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "categoryName",
    label: "检验项类别名称",
    value: "",
    placeholder: "请输入检验项类别名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  categoryName: string
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
      prop: "categoryName",
      label: "检验项类别名称",
      minWidth: 160
    },
    {
      prop: "categoryCode",
      label: "检验项类别编号",
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
      prop: "parentName",
      label: "上级检验项类别名称",
      minWidth: 160
    },
    {
      prop: "parentCode",
      label: "上级检验项类别编号",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
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
const queryConfig: ITableRequestConfig<[IInspectOptionCategoryPageListReq], ITableRow, true> = {
  api: queryInspectOptionCategoryPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          parentId: currentCateInfo.value?.id || "",
          ...getFormData()
        }
      }
    ]
  }
}
const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu>>()
const treeList = ref<IInspectOptionCategoryTree[]>([])
const currentCateInfo = ref<IInspectOptionCategoryTree>()
const createVisible = ref(false)
const selectedRowId = ref("")

onMounted(() => {
  getTreeData()
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
 * 点击树节点
 * @param data 树节点数据
 */
const treeNodeClick = (data: IInspectOptionCategoryTree) => {
  currentCateInfo.value = data
  onReset()
}

/**
 * 获取检验项类别树数据
 */
const getTreeData = async () => {
  const tree = await requeryInspectOptionCategoryTree()

  if (tree.length) {
    treeList.value = [
      {
        id: "",
        name: "检验项类别",
        code: "",
        parentId: "",
        status: 1,
        children: tree
      }
    ]

    if (!currentCateInfo.value?.id) {
      currentCateInfo.value = treeList.value[0]
    }

    setTimeout(() => {
      treeMenuRef.value?.setCurrentKey(currentCateInfo.value?.id as string)
      customTableRef.value?.requestData()
    }, 50)
  } else {
    treeList.value = []
    currentCateInfo.value = undefined
    customTableData.value = []
    pagination.value.total = 0
  }
}

/**
 * 创建检验项类别
 */
const onCreateInspectCategory = () => {
  selectedRowId.value = ""
  createVisible.value = true
}

/**
 * 编辑或查看检验项类别
 */
const onEditOrPreview = (row: ITableRow) => {
  selectedRowId.value = row.id
  createVisible.value = true
}

/**
 * 切换检验项类别状态
 */
const onSwitchStatus = async (row: ITableRow) => {
  const operation = row.status === 1 ? "停用" : "启用"
  await ElMessageBox.confirm(`确定${operation}该检验项类别吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  let fn =
    row.status === 1 ? requestDisableInspectOptionCategory : requestEnableInspectOptionCategory
  await fn(row.id)
  ElMessage.success(`${operation}成功`)
  getTreeData()
}

/**
 * 删除检验项类别
 */
const onDeleteRow = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该检验项类别吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestDeleteInspectOptionCategory(row.id)
  ElMessage.success("删除成功")
  getTreeData()
}
</script>

<style lang="scss" scoped>
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 1px solid #e8e8e8;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}
</style>
