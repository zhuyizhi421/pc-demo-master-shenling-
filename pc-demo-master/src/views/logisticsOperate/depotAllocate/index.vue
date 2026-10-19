<!-- 物流运营管理 - 仓储管理 - 仓库调拨 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="调拨单">
          <el-button v-if="Authed" type="primary" @click="onCreateClick('create')" icon="Plus"
            >新建调拨</el-button
          >
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 状态 -->
          <template #allocateStatus-default="{ row }">
            <el-tag
              :type="EnumWarehouseAllotStatusTagMap[row.allocateStatus as EnumWarehouseAllotStatus]"
              >{{
                EnumWarehouseAllotStatusMap[row.allocateStatus as EnumWarehouseAllotStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="
                row.dataSource === EnumProductionOrderSource.MES &&
                row.allocateStatus === EnumWarehouseAllotStatus.Un_start &&
                Authed
              "
              link
              type="primary"
              size="small"
              @click="onCreateClick('edit', row)"
              >编辑查看
            </el-button>
            <span v-else>
              <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
                >查看详情
              </el-button>
              <el-button
                v-if="row.allocateStatus !== EnumWarehouseAllotStatus.Finished && Authed"
                link
                type="primary"
                size="small"
                @click="completeFunc(row.id)"
                >结案
              </el-button>
            </span>
            <el-button
              v-if="
                row.dataSource === EnumProductionOrderSource.MES &&
                row.allocateStatus === EnumWarehouseAllotStatus.Un_start &&
                Authed
              "
              link
              type="danger"
              size="small"
              @click="handleDelete(row.id)"
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
        @change="tableRef?.requestData()"
      />
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 调拨新建、编辑 -->
      <CreateAllocate
        v-if="
          [EnumPageType.Depot_allocate_create, EnumPageType.Depot_allocate_update].includes(
            curPageKey
          )
        "
        :is-edit="isEdit"
        :currentRow="currentRow"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 调拨详情 -->
      <AllocateDetail
        v-if="curPageKey === EnumPageType.Depot_allocate_detail"
        :currentRow="currentRow"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryFactoryModelList } from "@/api/fm"
import {
  deleteLogAllocateOrder,
  getLogAllocateComplete,
  queryWarehouseAllotPageList
} from "@/api/logistics/allocate"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumWarehouseAllotStatus,
  EnumWarehouseAllotStatusMap,
  EnumWarehouseAllotStatusTagMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IWarehouseAllotPageListParams,
  LogisticsAllocateRecord as ITableRow
} from "@/types/logistics/allocate"

import AllocateDetail from "./components/AllocateDetail.vue"
import CreateAllocate from "./components/CreateAllocate.vue"

defineOptions({
  name: "DepotAllocate"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Depot_allocate_create, // 仓库调拨新增
  Depot_allocate_update, // 仓库调拨编辑
  Depot_allocate_detail // 仓库调拨详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "仓库调拨",
    key: EnumPageType.Main,
    children: [
      {
        name: "仓库调拨新建",
        key: EnumPageType.Depot_allocate_create
      },
      {
        name: "仓库调拨编辑",
        key: EnumPageType.Depot_allocate_update
      },
      {
        name: "仓库调拨详情",
        key: EnumPageType.Depot_allocate_detail
      }
    ]
  }
])

const storeOptions = ref<IOption[]>([])
const Authed = useButtonAuth("DepotAllocate_update", "DepotAllocate_query")

const { searchList, resetForm, getFormData } = useSearchForm<{}>([
  {
    type: EnumComponentType.Input,
    label: "调拨单号",
    key: "allocateCode",
    value: "",
    placeholder: "请输入调拨单号"
  },
  {
    type: EnumComponentType.Select,
    label: "拨出仓库",
    key: "outWarehouseId",
    value: "",
    placeholder: "请选择拨出仓库",
    options: storeOptions,
    filterable: true
  },
  {
    type: EnumComponentType.Select,
    label: "拨入仓库",
    key: "inWarehouseId",
    value: "",
    placeholder: "请选择拨入仓库",
    options: storeOptions,
    filterable: true
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "allocateStatusList",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "未开始",
        value: 0
      },
      {
        label: "进行中",
        value: 1
      },
      {
        label: "已结案",
        value: 2
      }
    ],
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "创建时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  }
])

const currentRow = ref<ITableRow>({})
const isEdit = ref(false)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "allocateCode",
      label: "调拨单号",
      minWidth: 160
    },
    {
      prop: "dataSource",
      label: "来源",
      width: 120,
      align: "center",
      formatter: ({ dataSource }) =>
        EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    },
    {
      prop: "allocateStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "allocateStatus-default"
      }
    },
    {
      prop: "outWarehouseName",
      label: "拨出仓库",
      minWidth: 160
    },
    {
      prop: "inWarehouseName",
      label: "拨入仓库",
      minWidth: 160
    },
    {
      prop: "allocateContent",
      label: "调拨内容",
      minWidth: 200
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "statementTime",
      label: "结单时间",
      width: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IWarehouseAllotPageListParams], ITableRow, true> = {
  api: queryWarehouseAllotPageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getStoreList()
  tableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取仓库列表 */
const getStoreList = async () => {
  const data = await queryFactoryModelList({
    isStorage: true,
    isEnable: true
  })
  storeOptions.value = data.map((item) => ({
    label: item.entityName,
    value: item.id
  }))
}

/** 新建/编辑操作 */
const onCreateClick = (type: "create" | "edit", row?: ITableRow) => {
  curPageKey.value = row ? EnumPageType.Depot_allocate_update : EnumPageType.Depot_allocate_create
  isEdit.value = type === "edit"
  currentRow.value = row || {}
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Depot_allocate_detail
  currentRow.value = row || {}
}

// 调拨单结案
const completeFunc = async (id: string) => {
  await ElMessageBox.confirm("该调拨单还未完成，是否直接结案？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await getLogAllocateComplete({ id })
  ElMessage.success("结案成功")
  tableRef.value?.requestData()
}

// 删除调拨
const handleDelete = async (id: string) => {
  await ElMessageBox.confirm("确认删除吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deleteLogAllocateOrder(id)
  ElMessage({
    message: "删除成功",
    type: "success"
  })
  tableRef.value?.requestData()
}
</script>

<style scoped lang="scss"></style>
