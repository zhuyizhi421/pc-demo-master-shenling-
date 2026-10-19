<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO信息列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="onMroModelCreateOrUpdate()">
              新建MRO信息
            </el-button>
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
          <template #identityManage-default="{ row }">
            <el-tag :type="row.identityManage === 0 ? 'danger' : 'success'">
              {{ row.identityManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #checkManage-default="{ row }">
            <el-tag :type="row.checkManage === 0 ? 'danger' : 'success'">
              {{ row.checkManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #maintenanceManage-default="{ row }">
            <el-tag :type="row.maintenanceManage === 0 ? 'danger' : 'success'">
              {{ row.maintenanceManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #lifeManage-default="{ row }">
            <el-tag :type="row.lifeManage === 0 ? 'danger' : 'success'">
              {{ row.lifeManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #archiveManage-default="{ row }">
            <el-tag :type="row.archiveManage === 0 ? 'danger' : 'success'">
              {{ row.archiveManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #safeStockManage-default="{ row }">
            <el-tag :type="row.safeStockManage === 0 ? 'danger' : 'success'">
              {{ row.safeStockManage === 0 ? "关闭" : "开启" }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="onMroModelCreateOrUpdate(row.id)">
                {{ canEdit ? "编辑查看" : "查看详情" }}
              </el-button>

              <el-dropdown>
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onMroConfig(row.id)">
                      <el-button type="primary" link>MRO配置</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="canEdit" @click="onDeleteMROModelClick(row.id)">
                      <el-button type="danger" link>删除</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <MroConfig
        v-if="curPageKey === EnumPageType.MroConfig"
        :mro-model-id="selectedMroModelId"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />
    </div>

    <MroModelCreateOrUpdateDialog
      v-model="mroModelCreateOrUpdateVisible"
      :mor-model-id="selectedMroModelId"
      @success="customTableRef?.requestData()"
    />

    <MroModelDetailDialog v-model="mroModelDetailVisible" :mor-model-id="selectedMroModelId" />
  </div>
</template>

<script setup lang="ts">
import { ArrowDown } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import { queryMroClassifyTree } from "@/api/operation/mro/mro-classify"
import { queryMroModelPageList, requestDeleteMroModel } from "@/api/operation/mro/mro-model"
import { queryMroTypePageList } from "@/api/operation/mro/mro-type"
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
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { IMroClassifyTreeItem } from "@/types/maintain/mro-manage/mro-classify"
import type {
  IMroModelPageListItem as ITableRow,
  IMroModelPageListParams
} from "@/types/maintain/mro-manage/mro-model"

import MroConfig from "./components/MroConfig/index.vue"
import MroModelCreateOrUpdateDialog from "./components/MroModelCreateOrUpdateDialog.vue"
import MroModelDetailDialog from "./components/MroModelDetailDialog.vue"

defineOptions({
  name: "MROModel"
})

enum EnumPageType {
  Main,
  MroConfig
}

const authType = useButtonAuth("MROModel_update", "MROModel_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO信息",
    key: EnumPageType.Main,
    children: [
      {
        name: "MRO配置",
        key: EnumPageType.MroConfig
      }
    ]
  }
])

const mroTypeOptions = ref<
  {
    label: string
    value: string
  }[]
>([])

const mroClassifyTree = ref<IMroClassifyTreeItem[]>([])
const mroClassifyTreeOptions = computed(() => {
  const mapTree = (
    rows: IMroClassifyTreeItem[]
  ): Array<{ label: string; value: string; mroTypeId: string; children: any[] }> => {
    return rows.map((item) => ({
      label: item.mroCategoryName,
      value: item.id,
      mroTypeId: item.mroTypeId,
      children: mapTree(item.children || [])
    }))
  }

  const treeRows = Array.isArray(mroClassifyTree.value) ? mroClassifyTree.value : []
  const classifyRows = treeRows.flatMap((item) => (Array.isArray(item?.children) ? item.children : []))
  return mapTree(classifyRows)
})

const mroClassifyNameMap = computed(() => {
  const map = new Map<string, string>()
  const walk = (rows: IMroClassifyTreeItem[] | null | undefined) => {
    if (!Array.isArray(rows)) return
    rows.forEach((item) => {
      map.set(item.id, item.mroCategoryName)
      walk(item.children || [])
    })
  }

  walk(Array.isArray(mroClassifyTree.value) ? mroClassifyTree.value : [])
  return map
})

const formatDepartmentPosition = (departmentName?: string, positionName?: string) => {
  if (departmentName && positionName) {
    return `${departmentName}-${positionName}`
  }
  return positionName || departmentName || ""
}

const searchSelectedMroTypeId = ref("")
const searchMroClassifyOptions = computed(() => {
  const filterTree = (
    rows: Array<{ label: string; value: string; mroTypeId: string; children?: any[] }>
  ): Array<{ label: string; value: string; mroTypeId: string; children: any[] }> => {
    return rows
      .map((item) => ({
        ...item,
        children: filterTree(item.children || [])
      }))
      .filter(
        (item) =>
          !searchSelectedMroTypeId.value ||
          item.mroTypeId === searchSelectedMroTypeId.value ||
          item.children.length
      )
  }

  return filterTree(mroClassifyTreeOptions.value)
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroModelNo",
    label: "MRO编号",
    value: "",
    placeholder: "请输入MRO编号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelName",
    label: "MRO名称",
    value: "",
    placeholder: "请输入MRO名称"
  },
  {
    type: EnumComponentType.Input,
    key: "mroSpec",
    label: "MRO规格",
    value: "",
    placeholder: "请输入MRO规格"
  },
  {
    type: EnumComponentType.Select,
    key: "mroCategoryId",
    label: "MRO类型",
    value: "",
    placeholder: "请选择MRO类型",
    options: mroTypeOptions,
    clearable: true
  },
  {
    type: EnumComponentType.Cascader,
    key: "mroClassifyId",
    label: "MRO分类",
    value: "",
    placeholder: "请选择MRO分类",
    options: searchMroClassifyOptions,
    clearable: true,
    showAllLevels: true,
    props: {
      label: "label",
      value: "value",
      children: "children",
      emitPath: false,
      multiple: false
    }
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroCategoryId?: string
  mroClassifyId?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const selectedMroModelId = ref("")
const mroModelCreateOrUpdateVisible = ref(false)
const mroModelDetailVisible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroModelNo",
      label: "MRO编号",
      minWidth: 150
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 180
    },
    {
      prop: "mroSpec",
      label: "MRO规格",
      minWidth: 180
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 160,
      formatter: (row: ITableRow) =>
        row.mroClassifyName || mroClassifyNameMap.value.get(String(row.mroClassifyId || "")) || ""
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 160
    },
    {
      prop: "identityManage",
      label: "标识管理",
      width: 120,
      align: "center",
      slots: {
        default: "identityManage-default"
      }
    },
    {
      prop: "checkManage",
      label: "校验管理",
      width: 120,
      align: "center",
      slots: {
        default: "checkManage-default"
      }
    },
    {
      prop: "checkExecutePositionName",
      label: "校验执行职位",
      minWidth: 180,
      formatter: (row: ITableRow) =>
        row.identityManage && row.checkManage
          ? formatDepartmentPosition(
              row.checkExecuteDepartmentName,
              row.checkExecutePositionName
            ) || "-"
          : "-"
    },
    {
      prop: "maintenanceManage",
      label: "保养管理",
      width: 120,
      align: "center",
      slots: {
        default: "maintenanceManage-default"
      }
    },
    {
      prop: "maintenanceExecutePositionName",
      label: "保养执行职位",
      minWidth: 180,
      formatter: (row: ITableRow) =>
        row.identityManage && row.maintenanceManage
          ? formatDepartmentPosition(
              row.maintenanceExecuteDepartmentName,
              row.maintenanceExecutePositionName
            ) || "-"
          : "-"
    },
    {
      prop: "lifeManage",
      label: "寿命管理",
      width: 120,
      align: "center",
      slots: {
        default: "lifeManage-default"
      }
    },
    {
      prop: "totalLife",
      label: "设计寿命",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) =>
        row.identityManage && row.lifeManage ? String(Number(row.totalLife || 0)) : "-"
    },
    {
      prop: "alarmLine",
      label: "寿命报警线",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) =>
        row.identityManage && row.lifeManage ? `${Number(row.alarmLine || 0)}%` : "-"
    },
    {
      prop: "archiveManage",
      label: "封存管理",
      width: 120,
      align: "center",
      slots: {
        default: "archiveManage-default"
      }
    },
    {
      prop: "archivePeriod",
      label: "封存周期(天)",
      width: 130,
      align: "right",
      formatter: (row: ITableRow) =>
        row.identityManage && row.archiveManage ? String(Number(row.archivePeriod || 0)) : "-"
    },
    {
      prop: "safeStockManage",
      label: "安全库存管理",
      width: 140,
      align: "center",
      slots: {
        default: "safeStockManage-default"
      }
    },
    {
      prop: "safeStock",
      label: "安全库存",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => (row.safeStockManage ? String(Number(row.safeStock || 0)) : "-")
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 170
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180
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

const queryConfig: ITableRequestConfig<[IMroModelPageListParams], ITableRow, true> = {
  api: queryMroModelPageList,
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

onMounted(() => {
  getMROTypeList()
  getMroClassifyList()
  customTableRef.value?.requestData()
})

watch(
  () => searchList.value.find((item) => item.key === "mroCategoryId")?.value,
  (value) => {
    searchSelectedMroTypeId.value = String(value || "")
    const selectedClassify = String(
      searchList.value.find((item) => item.key === "mroClassifyId")?.value || ""
    )
    if (selectedClassify && !hasClassifyInTree(selectedClassify, searchMroClassifyOptions.value)) {
      const classifyItem = searchList.value.find((item) => item.key === "mroClassifyId")
      if (classifyItem) {
        classifyItem.value = ""
      }
    }
  },
  {
    immediate: true
  }
)

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const getMROTypeList = async () => {
  const data = await queryMroTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })
  mroTypeOptions.value = (data?.records || []).map((item) => ({
    value: item.id,
    label: item.mroTypeName
  }))
}

const getMroClassifyList = async () => {
  mroClassifyTree.value = (await queryMroClassifyTree()) || []
}

const hasClassifyInTree = (
  value: string,
  rows: Array<{ value: string; children?: Array<{ value: string; children?: any[] }> }>
): boolean => {
  return rows.some((item) => {
    if (item.value === value) {
      return true
    }
    return hasClassifyInTree(value, item.children || [])
  })
}

const onDeleteMROModelClick = async (tableId: string) => {
  await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await requestDeleteMroModel({ id: tableId })
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onMroModelCreateOrUpdate = (id?: string) => {
  selectedMroModelId.value = id || ""
  if (canEdit.value) {
    mroModelCreateOrUpdateVisible.value = true
  } else {
    mroModelDetailVisible.value = true
  }
}

const onMroConfig = (id: string) => {
  selectedMroModelId.value = id
  curPageKey.value = EnumPageType.MroConfig
}
</script>

<style scoped lang="scss">
.layout-main-page {
  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }

    &:focus-visible {
      outline: none;
    }
  }
}
</style>
