<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="梯度模型列表">
          <el-button v-if="isAuth" type="primary" @click="onCreateGradient()" icon="Plus"
            >新建梯度</el-button
          >
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row }">
            <el-tag v-if="row.status == 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>
          <template #operation-default="{ row }">
            <template v-if="isAuth">
              <el-button link type="primary" size="small" @click="onReviewGradient(row)">
                查看
              </el-button>
              <el-button
                link
                :type="row.status === 1 ? 'danger' : 'primary'"
                size="small"
                @click="onSwitchStatusClick(row)"
              >
                {{ row.status == 1 ? "停用" : "启用" }}
              </el-button>
              <el-button
                v-if="row.status == 0"
                link
                type="danger"
                size="small"
                @click="onDeleteClick(row.id)"
                >删除</el-button
              >
            </template>
            <template v-else>
              <el-button
                v-if="row.status == 1"
                link
                type="primary"
                size="small"
                @click="onReviewGradient(row)"
              >
                查看
              </el-button>
            </template>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="getTableData"
      />
    </div>

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <GradientModelDetail
        v-if="
          [
            EnumPageType.Gradient_model_create,
            EnumPageType.Gradient_model_update,
            EnumPageType.Gradient_model_detail
          ].includes(curPageKey)
        "
        :id="selectedId"
        :is-edit="isEdit"
        @close="curPageKey = EnumPageType.Main"
        @change-status="onNavigateToChildrenPage"
        @success="getTableData"
      ></GradientModelDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  activateModel,
  deactivateModel,
  deleteModel,
  queryGradientModelList
} from "@/api/quality/gradientModel"
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
import type { IPaginationSearch } from "@/types/common"
import type {
  GradientModel as ITableRow,
  GradientSearchedModel
} from "@/types/quality-manage/inspection-task"
import { onPreventReClick } from "@/utils/common"

import GradientModelDetail from "./components/GradientModelDetail.vue"

defineOptions({
  name: "GradientModel"
})

type IOptionItem = {
  label: string
  value: number
}

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Gradient_model_create, // 梯度模型新建页
  Gradient_model_update, // 梯度模型编辑页
  Gradient_model_detail // 梯度模型详情页
}
const curPageKey = ref(EnumPageType.Main) // 当前显示页面种类
const pageTree = computed(() => [
  {
    name: "梯度模型",
    key: EnumPageType.Main,
    children: [
      {
        name: "梯度模型新建",
        key: EnumPageType.Gradient_model_create,
        confirmConfig: {
          enabled: true,
          title: "提示",
          message: "填写的数据将不会被保存,是否继续?"
        }
      },
      {
        name: "梯度模型编辑",
        key: EnumPageType.Gradient_model_update,
        confirmConfig: {
          enabled: true,
          title: "提示",
          message: "填写的数据将不会被保存,是否继续?"
        }
      },
      {
        name: "梯度模型详情",
        key: EnumPageType.Gradient_model_detail
      }
    ]
  }
])

const isAuth = useButtonAuth("DefectManage_update", "DefectManage_query")

// 任务状态
const statusType: Record<string, string> = {
  0: "停用",
  1: "启用"
}
const statusOptions = ref<IOptionItem[]>([])
const selectedId = ref<string | undefined>(undefined)
const isEdit = ref(false)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "modelNo",
    label: "梯度编号",
    value: "",
    placeholder: "请输入梯度编号"
  },
  {
    type: EnumComponentType.Input,
    key: "modelName",
    label: "梯度名称",
    value: "",
    placeholder: "请输入梯度名称"
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: statusOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  modelName: string
  modelNo: string
  status?: 0 | 1
}>(searchFormData.value)

const pagination = reactive({
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
      prop: "modelNo",
      label: "梯度模型编号",
      minWidth: 160
    },
    {
      prop: "modelName",
      label: "梯度名称",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 90,
      align: "center",
      slots: {
        default: "status-default"
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
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<
  [GradientSearchedModel & IPaginationSearch],
  ITableRow,
  true
> = {
  api: queryGradientModelList,
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

const getTableData = async () => {
  await customTableRef.value?.requestData()
}

onMounted(() => {
  buildOptions()
  getTableData()
})

/** 构建下拉选项 */
const buildOptions = () => {
  statusOptions.value = Object.keys(statusType).map((key) => ({
    label: statusType[key],
    value: +key
  }))
}

const handelSubmit = async () => {
  pagination.currentPage = 1
  await getTableData()
}

const onReset = onPreventReClick(async () => {
  resetForm()
  await handelSubmit()
})

const onSubmit = onPreventReClick(handelSubmit)

/** 切换梯度状态 */
const onSwitchStatusClick = async (row: ITableRow) => {
  await ElMessageBox.confirm(`此操作将${row.status == 1 ? "停用" : "启用"}该模型，是否继续?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  row.status == 1 ? await deactivateModel(row.id) : await activateModel(row.id)
  ElMessage.success(row.status == 1 ? "停用成功" : "启用成功")
  getTableData()
}

/** 删除梯度 */
const onDeleteClick = async (Id: string) => {
  await ElMessageBox.confirm(`确定删除该梯度模型?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deleteModel(Id)
  ElMessage.success('"删除成功"')
  getTableData()
}

/** 新建梯度模型操作 */
const onCreateGradient = () => {
  selectedId.value = undefined
  curPageKey.value = EnumPageType.Gradient_model_create
}

/** 查看详情 */
const onReviewGradient = (row: ITableRow) => {
  selectedId.value = row.id
  curPageKey.value = EnumPageType.Gradient_model_detail
}

// 跳转子页面， 1编辑 2查看
const onNavigateToChildrenPage = (data: {
  status: number // 0: 新增 1: 编辑 2: 详情
  isEdit?: boolean // 是否为编辑操作
  id?: string // 新增梯度模型成功后返回的id
}) => {
  curPageKey.value =
    data.status === 1 ? EnumPageType.Gradient_model_update : EnumPageType.Gradient_model_detail
  isEdit.value = !!data?.isEdit
  if (data?.id) {
    selectedId.value = data.id
  }
}
</script>

<style scoped lang="scss"></style>
