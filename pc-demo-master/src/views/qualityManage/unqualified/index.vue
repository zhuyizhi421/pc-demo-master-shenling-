<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="不合格品评审" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #reviewStatus-default="{ row }">
            <el-tag v-if="row.reviewStatus === -1" type="danger">待执行</el-tag>
            <el-tag v-if="row.reviewStatus === 0" type="warning">进行中</el-tag>
            <el-tag v-if="row.reviewStatus === 1" type="success">已完成</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewClick(row)"
              >查看详情</el-button
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

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <UnqualifiedDetail
        v-model="showDetail"
        :data="currentRowData"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IDefectReviewTaskItem as ITableRow } from "@/api/quality/defectReviewTask"
import { getDefectReviewTaskPaged } from "@/api/quality/defectReviewTask"
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
import {
  EnumResultNameMap,
  EnumUnqualifiedOriginType,
  EnumUnqualifiedOriginTypeMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import type { IDefectReviewTaskSearch } from "@/types/quality-manage/unqualified"
import { precisionConversion } from "@/utils/common"

import UnqualifiedDetail from "./components/unqualifiedDetail.vue"

defineOptions({
  name: "UnqualifiedReview"
})

type IOptionItem = {
  label: string
  value: number
}

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Unqualified_detail // 不合格品评审详情
}
const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "不合格品评审",
    key: EnumPageType.Main,
    children: [
      {
        name: "不合格品评审详情",
        key: EnumPageType.Unqualified_detail
      }
    ]
  }
])

const originTypeOptions = ref<IOptionItem[]>([])
const reviewResultOptions = ref<IOptionItem[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "reviewTaskNo",
    label: "评审单号",
    value: "",
    placeholder: "请输入评审单号"
  },
  {
    type: EnumComponentType.Select,
    key: "originType",
    label: "来源",
    value: "",
    placeholder: "请选择检验类型",
    options: originTypeOptions
  },
  {
    type: EnumComponentType.Select,
    key: "reviewStatus",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "待执行",
        value: -1
      },
      {
        label: "进行中",
        value: 0
      },
      {
        label: "已完成",
        value: 1
      }
    ]
  },
  {
    type: EnumComponentType.Input,
    key: "productModelName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Select,
    key: "reviewResultList",
    label: "处理结果",
    value: "",
    placeholder: "请选择处理结果",
    options: reviewResultOptions,
    multiple: true
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "创建时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  },
  {
    type: EnumComponentType.Input,
    linkProps: {
      linkKey: "originType",
      showByLinkKeyCondition: EnumUnqualifiedOriginType.Defective_registration
    },
    key: "inspectTaskNo",
    label: "关联检验单号",
    value: "",
    placeholder: "请输入关联检验单号"
  },
  {
    type: EnumComponentType.Input,
    linkProps: {
      linkKey: "originType",
      conditionSign: true,
      showByLinkKeyCondition: EnumUnqualifiedOriginType.Defective_registration
    },
    key: "dispatcherTaskCode",
    label: "关联任务",
    value: "",
    placeholder: "请输入关联调度任务编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  createTimeEnd: string
  createTimeStart: string
  productModelName: string
  dispatcherTaskCode: string
  inspectTaskNo: string
  originType: number
  reviewResultList: number[]
  reviewStatus: number
  reviewTaskNo: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const showDetail = ref(false)
const currentRowData = ref({})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "reviewTaskNo",
      label: "不合格品处理单号",
      width: 160
    },
    {
      prop: "reviewStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "reviewStatus-default"
      }
    },
    {
      prop: "originType",
      label: "来源",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumUnqualifiedOriginTypeMap[row.originType as EnumUnqualifiedOriginType]
      }
    },
    {
      prop: "reviewResults",
      label: "处理结果",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.reviewResults?.map((item) => EnumResultNameMap[item]).join(",") ?? "-"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      width: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "inspectTaskNo",
      label: "关联检验单号",
      width: 160
    },
    {
      prop: "productionTaskNo",
      label: "生产任务编号",
      width: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      width: 160
    },
    {
      prop: "reviewCompleteTime",
      label: "完成时间",
      width: 160,
      align: "center"
    },
    {
      prop: "completeByName",
      label: "执行人",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDefectReviewTaskSearch], ITableRow, true> = {
  api: getDefectReviewTaskPaged,
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

onMounted(async () => {
  buildOptions()
  await customTableRef.value?.requestData()
})

/** 构建下拉选项 */
const buildOptions = () => {
  originTypeOptions.value = Object.entries(EnumUnqualifiedOriginTypeMap).map(([key, label]) => ({
    label,
    value: Number(key) as EnumUnqualifiedOriginType
  }))

  reviewResultOptions.value = Object.entries(EnumResultNameMap).map(([value, label]) => ({
    label,
    value: Number(value)
  }))
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 查看详情 */
const onViewClick = (row: any) => {
  currentRowData.value = row
  curPageKey.value = EnumPageType.Unqualified_detail
}
</script>

<style scoped lang="scss"></style>
