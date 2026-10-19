<!-- 工艺建模-产品分类 -->
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
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle :title="currentCateInfo?.name || ''">
          <div v-if="isAuth">
            <el-button class="ml-[12px]" type="primary" icon="Plus" @click="tableHandle('edit')"
              >新建产品类别</el-button
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
            <el-button link type="primary" size="small" @click="tableHandle('edit', row)">{{
              isAuth ? "编辑查看" : "查看详情"
            }}</el-button>
            <el-button
              v-if="isAuth"
              link
              :type="row.status === 1 ? 'danger' : 'primary'"
              @click="tableHandle('use', row)"
              size="small"
              >{{ row.status === 1 ? "停用" : "启用" }}</el-button
            >
            <el-button
              v-if="isAuth"
              link
              type="danger"
              @click="tableHandle('delete', row)"
              size="small"
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

    <!-- 新增、编辑、查看产品类别弹窗 -->
    <CreateProductCategory
      v-model="dialogVisible"
      :is-auth="!!isAuth"
      :root-id="ROOT_ID"
      :default-form-data="handleForm"
      :current-cateInfo="currentCateInfo"
      @success="getTreeAndList()"
    ></CreateProductCategory>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import type { ProductCategoryTreeRes } from "@/api/product"
import {
  ableProductCate,
  deleteProductCate,
  getCategoryTree,
  getProductCatePaged
} from "@/api/product"
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
import type { IProductCateItem as ITableRow, IProductCateParams } from "@/types/base-info/product"
import { uuidv4 } from "@/utils"

import CreateProductCategory from "./components/CreateProductCategory.vue"

defineOptions({
  name: "ProductCategory"
})

const ROOT_ID = ref(uuidv4())
const isAuth = useButtonAuth("ProductCategory_update", "ProductCategory_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "名称",
    value: "",
    placeholder: "请输入名称"
  },
  {
    type: EnumComponentType.Input,
    key: "code",
    label: "编号",
    value: "",
    placeholder: "请输入编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  code: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "类别名称",
      minWidth: 160
    },
    {
      prop: "code",
      label: "类别编号",
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
      label: "上级类别名称",
      minWidth: 160
    },
    {
      prop: "parentCode",
      label: "上级类别编号",
      minWidth: 160
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160
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
const queryConfig: ITableRequestConfig<[IProductCateParams], ITableRow, true> = {
  api: getProductCatePaged,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        parentId:
          currentCateInfo.value?.id === ROOT_ID.value ? "" : currentCateInfo.value?.id || "",
        ...getFormData()
      }
    ]
  }
}

const treeList = ref<ProductCategoryTreeRes[]>([])

const dialogVisible = ref(false)
const handleForm = ref({
  name: "",
  code: "",
  parentCode: "",
  parentName: "",
  remark: "",
  id: ""
})

const currentCateInfo = ref<ProductCategoryTreeRes>()

onMounted(() => {
  getTreeAndList()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const treeNodeClick = (data: any) => {
  currentCateInfo.value = data
  onReset()
}

const tableHandle = async (type: "edit" | "use" | "delete", data?: any) => {
  if (type !== "edit") {
    await ElMessageBox.confirm(
      `此操作将${type === "delete" ? "删除" : data.status === 1 ? "停用" : "启用"}该条数据, 是否继续?`,
      "提示"
    )

    type === "use" &&
      (await ableProductCate({
        productCategoryld: data.id,
        newStatus: data.status === 1 ? 0 : 1
      }))
    type === "delete" && (await deleteProductCate(data.id))
    ElMessage.success(`${type === "delete" ? "删除" : data.status === 1 ? "停用" : "启用"}成功`)
    await getTreeAndList()
  } else {
    if (!data) {
      handleForm.value = {
        name: "",
        parentCode: currentCateInfo.value?.code || "",
        parentName: currentCateInfo.value?.name || "",
        remark: "",
        id: "",
        code: ""
      }
    } else {
      handleForm.value = {
        name: data.name,
        parentCode: data.parentCode,
        parentName: data.parentName,
        remark: data.remark,
        id: data.id,
        code: data.code
      }
    }
    dialogVisible.value = true
  }
}

const getTreeAndList = async () => {
  const tree = await getCategoryTree()

  if (tree.length) {
    treeList.value = [
      {
        id: ROOT_ID.value,
        name: "所有产品类别",
        children: tree
      } as ProductCategoryTreeRes
    ]
    if (!currentCateInfo.value?.id) {
      currentCateInfo.value = treeList.value[0]
    }
    setTimeout(() => {
      treeMenuRef.value?.setCurrentKey(currentCateInfo.value?.id as string)
    }, 50)

    customTableRef.value?.requestData()
  }
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
