<template>
  <div class="layout-container">
    <!-- 主页面 -->
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="BOM列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" class="ml-[12px]" @click="handleCreate('create')"
              >新建BOM</el-button
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
          <template #source-default="{ row }">
            <el-tag :type="row.source === 'ERP' ? 'info' : 'success'">{{ row.source }}</el-tag>
          </template>

          <template #status-default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <!-- ERP来源只有查看 -->
              <template v-if="row.source === 'ERP'">
                <el-button link type="primary" size="small" @click="handleView(row)"
                  >查看</el-button
                >
              </template>

              <!-- 系统来源 -->
              <template v-else>
                <!-- 未发布状态：编辑/发布/删除 -->
                <template v-if="row.status === 'unpublished'">
                  <el-button link type="primary" size="small" @click="handleCreate('edit', row)"
                    >编辑</el-button
                  >
                  <el-button link type="success" size="small" @click="handlePublish(row)"
                    >发布</el-button
                  >
                  <el-button link type="danger" size="small" @click="handleDelete(row)"
                    >删除</el-button
                  >
                </template>

                <!-- 已发布状态：查看/升级/停用 -->
                <template v-else-if="row.status === 'published'">
                  <el-button link type="primary" size="small" @click="handleView(row)"
                    >查看</el-button
                  >
                  <el-button link type="warning" size="small" @click="handleUpgrade(row)"
                    >升级</el-button
                  >
                  <el-button link type="danger" size="small" @click="handleDisable(row)"
                    >停用</el-button
                  >
                </template>

                <!-- 停用状态：查看 -->
                <template v-else-if="row.status === 'disabled'">
                  <el-button link type="primary" size="small" @click="handleView(row)"
                    >查看</el-button
                  >
                </template>
              </template>
            </div>
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

    <!-- BOM详情子页面 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" @change="onCrumbsChange" />

      <!-- BOM详情 -->
      <BomDetail
        v-if="curPageKey === EnumPageType.Bom_Detail"
        :id="currentId"
        :isReadonly="!isAuth"
        @back="onDetailBack"
        @refresh="handleSuccess"
      />
    </div>
    <!-- BOM编辑/新建 -->
      <BomCreateDialog
        v-model="createVisible"
        :type="createType"
        :data="currentRow"
        @success="handleSuccess"
      />  
    <!-- 升级弹窗 -->
    <BomUpgradeDialog
      v-model="upgradeVisible"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"

import {
  deleteBom,
  disableBom,
  publishBom,
  queryBomPageList
} from "@/api/bom"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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

import BomCreateDialog from "./components/BomCreateDialog.vue"
import BomDetail from "./components/BomDetail.vue"
import BomUpgradeDialog from "./components/BomUpgradeDialog.vue"
import type { IBomItem, IBomParams } from "./types"

defineOptions({
  name: "BomManage"
})

const isAuth = useButtonAuth("BomManage_update", "BomManage_query")

// 页面类型枚举
enum EnumPageType {
  Main = "main",
  Bom_Detail = "detail",
}

const curPageKey = ref(EnumPageType.Main)
const currentId = ref("")
const currentRow = ref<IBomItem | null>(null)

// 面包屑数据
const pageTree = ref([
  {
    name: "BOM管理",
    key: EnumPageType.Main,
    children: [
      {
        name: "查看BOM",
        key: EnumPageType.Bom_Detail
      },
    ]
  }
])

// 升级弹窗
const upgradeVisible = ref(false)
// 新建弹窗
const createVisible = ref(false)
const createType = ref<"create" | "edit">("create")
// 搜索表单
const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "productCode",
    label: "父件产品编号",
    value: "",
    placeholder: "请输入父件产品编号"
  },
  {
    type: EnumComponentType.Input,
    key: "productName",
    label: "父件产品名称",
    value: "",
    placeholder: "请输入父件产品名称"
  },
  {
    type: EnumComponentType.Select,
    key: "source",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: [
      { label: "ERP", value: "ERP" },
      { label: "系统", value: "系统" }
    ]
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      { label: "未发布", value: "unpublished" },
      { label: "已发布", value: "published" },
      { label: "停用", value: "disabled" }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productCode: string
  productName: string
  source: string
  status: string
}>(searchFormData.value)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IBomItem[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productCode",
      label: "父件产品编号",
      minWidth: 160
    },
    {
      prop: "productName",
      label: "父件产品名称",
      minWidth: 200
    },
    {
      prop: "source",
      label: "来源",
      width: 100,
      align: "center",
      slots: {
        default: "source-default"
      }
    },
    {
      prop: "version",
      label: "版本",
      width: 100,
      align: "center"
    },
    {
      prop: "status",
      label: "状态",
      width: 100,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "effectiveTime",
      label: "生效时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IBomParams], IBomItem, true> = {
  api: queryBomPageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...getFormData()
      }
    ]
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    unpublished: "info",
    published: "success",
    disabled: "danger"
  }
  return typeMap[status] || "info"
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    unpublished: "未发布",
    published: "已发布",
    disabled: "停用"
  }
  return textMap[status] || status
}

onMounted(() => {
  customTableRef.value?.requestData()
})

const onSubmit = async () => {
  pagination.currentPage = 1
  await customTableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}
// 新建/编辑BOM

const handleCreate = (type: "create" | "edit", row?: IBomItem) => {
  createType.value = type
  currentRow.value = row || null
  createVisible.value = true
}

// 查看BOM
const handleView = (row: IBomItem) => {
  currentId.value = row.id
  currentRow.value = row
  curPageKey.value = EnumPageType.Bom_Detail
}

// 删除BOM
const handleDelete = async (row: IBomItem) => {
  try {
    await ElMessageBox.confirm("确定要删除该BOM吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await deleteBom(row.id)
    ElMessage.success("删除成功")
    customTableRef.value?.requestData()
  } catch {
    // 取消删除
  }
}

// 发布BOM
const handlePublish = async (row: IBomItem) => {
  try {
    await ElMessageBox.confirm("确定要发布该BOM吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await publishBom(row.id)
    ElMessage.success("发布成功")
    customTableRef.value?.requestData()
  } catch {
    // 取消发布
  }
}

// 停用BOM
const handleDisable = async (row: IBomItem) => {
  try {
    await ElMessageBox.confirm("确定要停用该BOM吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    await disableBom(row.id)
    ElMessage.success("停用成功")
    customTableRef.value?.requestData()
  } catch {
    // 取消停用
  }
}

// 升级BOM
const handleUpgrade = async (row: IBomItem) => {
  currentRow.value = row
  upgradeVisible.value = true
}

// 操作成功回调
const handleSuccess = () => {
  customTableRef.value?.requestData()
}

// 面包屑切换
const onCrumbsChange = (value: string | number) => {
  if (value === EnumPageType.Main) {
    customTableRef.value?.requestData()
  }
}

// 详情页返回
const onDetailBack = () => {
  curPageKey.value = EnumPageType.Main
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .layout-main-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .layout-child-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .custom-table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    .custom-table {
      flex: 1;
      overflow: auto;
      margin-top: 16px;
    }
  }
}
</style>
