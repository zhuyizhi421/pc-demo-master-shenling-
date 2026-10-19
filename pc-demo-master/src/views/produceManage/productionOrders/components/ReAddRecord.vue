<template>
  <div class="re-add-record">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="custom-table-container">
      <CustomTitle title="订单追加记录" />

      <CustomTable
        ref="customTableRef"
        v-model:table-data="customTableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
        class="custom-table"
      >
        <template #source-slot="{ row }">
          {{ EnumProductionOrderSourceMap[row.source as EnumProductionOrderSource] }}
        </template>
        <template #status-slot="{ row }">
          {{ row.status === 1 ? "已复核" : "未复核" }}
        </template>
        <template #deliveryDate-slot="{ row }">
          {{ row.deliveryDate || "/" }}
        </template>
        <template #action-slot="{ row }">
          <el-button
            v-if="row.status === 0 && !!buttonAuth"
            type="primary"
            link
            size="small"
            @click="onRecheckClick(row)"
          >
            复核
          </el-button>
          <el-button
            v-if="row.status === 0 && !!buttonAuth"
            type="primary"
            link
            size="small"
            @click="onRecallClick(row)"
          >
            撤回
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
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryProductionOrderReAddPageList,
  requestCallBackProductionOrderReAdd,
  requestReviewProductionOrderReAdd
} from "@/api/scheduling"
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
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap
  // EnumProductionOrderStatusTagMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IRequestPageParams } from "@/types/common"
import type {
  IReAddRecordListItem as ITableRow,
  IReAddRecordPageListReq
} from "@/types/production-manage/product-order"

defineOptions({
  name: "PreparationMaterialPlanDetail"
})

const props = defineProps<{
  defaultOrderNo?: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const buttonAuth = useButtonAuth("ProductionOrders_update", "ProductionOrders_query")

const queryConfig: ITableRequestConfig<
  [IRequestPageParams<Partial<IReAddRecordPageListReq>>],
  ITableRow,
  true
> = {
  api: queryProductionOrderReAddPageList,
  getParams: () => {
    const formData = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: formData
      }
    ]
  }
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  stripe: true,
  columns: [
    {
      prop: "orderNo",
      label: "订单编号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "source",
      label: "来源",
      width: 90,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "source-slot"
      }
    },
    {
      prop: "status",
      label: "追加记录状态",
      width: 120,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "status-slot"
      }
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "orderAmount",
      label: "订单数量",
      width: 100,
      align: "right",
      showOverflowTooltip: true
    },
    {
      prop: "addAmount",
      label: "追加数量",
      width: 100,
      align: "right",
      showOverflowTooltip: true
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "deliveryDate",
      label: "交货日期",
      width: 100,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "deliveryDate-slot"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "remark",
      label: "备注",
      width: 200,
      showOverflowTooltip: true
    },
    {
      prop: "action",
      label: "操作",
      width: 160,
      align: "center",
      fixed: "right",
      showOverflowTooltip: true,
      slots: {
        default: "action-slot"
      }
    }
  ]
})

const sourceOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "orderNo",
    label: "订单号",
    value: "",
    placeholder: "请输入订单号"
  },
  {
    type: EnumComponentType.Select,
    key: "source",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: sourceOptions
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "追加记录状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "已复核",
        value: 1
      },
      {
        label: "未复核",
        value: 0
      }
    ]
  },
  {
    type: EnumComponentType.Input,
    key: "productModelCode",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
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
    keyword: ["startDate", "endDate"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  orderNo: string
  productModelCode: string
  source?: number
  status?: number
  startDate?: string
  endDate?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 10
})

onMounted(() => {
  buildOptions()
  if (props.defaultOrderNo) {
    searchList.value.find((item) => item.key === "orderNo")!.value = props.defaultOrderNo
  }
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

/** 构建下拉选项 */
const buildOptions = () => {
  sourceOptions.value = Object.keys(EnumProductionOrderSourceMap).map((key) => ({
    label: EnumProductionOrderSourceMap[key as unknown as EnumProductionOrderSource],
    value: +key
  }))

  // 去除已结案
  const statusMap = { ...EnumProductionOrderStatusMap } as Record<EnumProductionOrderStatus, string>

  Reflect.deleteProperty(statusMap, EnumProductionOrderStatus.SETTLE)
}

/**
 * 复核
 */
const onRecheckClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定复核该订单追加记录吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestReviewProductionOrderReAdd(row.recordId)
  ElMessage.success("复核成功")
  await customTableRef.value?.requestData()
  emit("success")
}

/**
 * 撤回
 */
const onRecallClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定撤回该订单追加记录吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })

  await requestCallBackProductionOrderReAdd({ id: row.recordId })
  ElMessage.success("撤回成功")
  await customTableRef.value?.requestData()
  emit("success")
}
</script>

<style lang="scss" scoped>
.re-add-record {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: var(--g-color);

  // flex: 1;
  // display: flex;
  // flex-direction: column;
  // padding: 20px;
  // overflow-y: auto;
  // color: #303133;
}

.top-back {
  margin: 12px 20px;
}
</style>
