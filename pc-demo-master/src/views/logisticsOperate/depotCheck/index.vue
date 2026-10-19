<!-- 物流运营管理 - 仓储管理 - 仓库盘点 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="盘点单">
          <el-button type="primary" v-if="isAuth" icon="Plus" @click="onCreateWarehouseCheck()"
            >新增盘点</el-button
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
          <template #checkStatus-default="{ row }">
            <el-tag
              :type="EnumWarehouseCheckStatusTagMap[row.checkStatus as EnumWarehouseCheckStatus]"
              >{{
                EnumWarehouseCheckStatusMap[row.checkStatus as EnumWarehouseCheckStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #operation-default="{ row }">
            <template v-if="row.checkStatus === EnumWarehouseCheckStatus.Un_publish && isAuth">
              <el-button link size="small" type="primary" @click="onUpdateWarehouseCheck(row)"
                >编辑查看</el-button
              >
              <el-button
                v-if="isAuth"
                link
                size="small"
                type="primary"
                @click="onPublishWarehouseCheck(row)"
                >发布</el-button
              >
              <el-button
                v-if="isAuth"
                link
                size="small"
                type="danger"
                @click="onDeleteWarehouseCheck(row)"
                >删除</el-button
              >
            </template>
            <el-button
              v-if="row.checkStatus !== EnumWarehouseCheckStatus.Un_publish || !isAuth"
              type="primary"
              link
              size="small"
              @click="onReviewDetail(row)"
              >查看详情</el-button
            >
            <el-button
              v-if="row.checkStatus === EnumWarehouseCheckStatus.Published && isAuth"
              type="danger"
              link
              size="small"
              @click="onSettleWarehouseCheck(row)"
              >结案</el-button
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

      <!-- 新增/编辑 盘点 -->
      <CreateDepot
        v-if="
          [EnumPageType.Depot_check_create, EnumPageType.Depot_check_update].includes(curPageKey)
        "
        :currentRow="currentRow"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 盘点详情 -->
      <DepotDetail
        v-if="curPageKey === EnumPageType.Depot_check_detail"
        v-model="detailShow"
        :detail-data="currentRow"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
        :justSee="!isAuth"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  requestDeleteWarehouseCheck,
  requestPublishWarehouseCheck
} from "@/api/logistics/warehouseCheck"
import { queryWarehouseCheckPageList } from "@/api/logistics/warehouseCheck"
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
import { SelectType } from "@/components/SelectFactoryModel/types"
import {
  EnumWarehouseCheckStatus,
  EnumWarehouseCheckStatusMap,
  EnumWarehouseCheckStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IWarehouseCheckPageListItem as ITableRow,
  IWarehouseCheckPageListParams
} from "@/types/logistics/warehouse-check"

import CreateDepot from "./components/CreateDepot.vue"
import DepotDetail from "./components/depotDetail.vue"

defineOptions({
  name: "DepotCheck"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Depot_check_create, // 盘点单新增
  Depot_check_update, // 盘点单新增
  Depot_check_detail // 盘点单详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "盘点单列表",
    key: EnumPageType.Main,
    children: [
      {
        name: "盘点单新建",
        key: EnumPageType.Depot_check_create
      },
      {
        name: "盘点单编辑",
        key: EnumPageType.Depot_check_update
      },
      {
        name: "盘点单详情",
        key: EnumPageType.Depot_check_detail
      }
    ]
  }
])

const isAuth = useButtonAuth("DepotCheck_update", "DepotCheck_query")

const { searchList, resetForm, getFormData } = useSearchForm<{
  checkCode: string
  checkStatusList: number[]
  facilityId: string
  productModelName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "盘点单号",
    key: "checkCode",
    value: "",
    placeholder: "请输入盘点单号"
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "checkStatusList",
    value: "",
    placeholder: "请选择状态",
    options: Object.entries(EnumWarehouseCheckStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Area,
    label: "仓库",
    key: "facilityId",
    value: "",
    placeholder: "请选择仓库",
    props: {
      areaType: SelectType.WarehouseType,
      isEnable: true
    }
  },
  {
    type: EnumComponentType.Input,
    label: "盘点产品",
    key: "productModelName",
    value: "",
    placeholder: "请输入盘点产品名称"
  }
])

const updateShow = ref(false)
const detailShow = ref(false)

const currentRow = ref<ITableRow>({} as ITableRow)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "checkCode",
      label: "盘点单号",
      minWidth: 160
    },
    {
      prop: "checkStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "checkStatus-default"
      }
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "facilityCode",
      label: "仓库编号",
      minWidth: 160
    },
    {
      prop: "checkContent",
      label: "盘点内容",
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
      label: "结案时间",
      width: 160,
      align: "center"
    },
    {
      prop: "statementEmpName",
      label: "结案人",
      width: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 180,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IWarehouseCheckPageListParams], ITableRow, true> = {
  api: queryWarehouseCheckPageList,
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

/** 盘点单新建操作 */
const onCreateWarehouseCheck = () => {
  curPageKey.value = EnumPageType.Depot_check_create
  updateShow.value = true
  currentRow.value = {} as ITableRow
}

/** 盘点单编辑操作 */
const onUpdateWarehouseCheck = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Depot_check_update
  updateShow.value = true
  currentRow.value = row
}

/** 盘点单详情操作 */
const onReviewDetail = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Depot_check_detail
  detailShow.value = true
  currentRow.value = row
}

/** 盘点单删除操作 */
const onDeleteWarehouseCheck = async (data: ITableRow) => {
  await ElMessageBox.confirm("此操作将永久删除该盘点单, 是否继续?", "提示", {
    type: "warning"
  })
  await requestDeleteWarehouseCheck(data.id)
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}

/** 盘点单发布操作 */
const onPublishWarehouseCheck = async (data: ITableRow) => {
  await ElMessageBox.confirm(
    "发布后，该仓库的盘点产品无法进行出入库、拆分及合并，直至结案。",
    "提示",
    {
      confirmButtonText: "确认发布",
      type: "warning"
    }
  )
  await requestPublishWarehouseCheck(data.id)
  ElMessage.success("发布成功")
  tableRef.value?.requestData()
}

/** 盘点单结案操作 */
const onSettleWarehouseCheck = async (data: ITableRow) => {
  await ElMessageBox.confirm("请核对盘点结果，确认是否接受并按盘点结果进行处理。", "提示", {
    confirmButtonText: "前往确认",
    type: "warning"
  })
  onReviewDetail(data)
}
</script>

<style scoped lang="scss"></style>
