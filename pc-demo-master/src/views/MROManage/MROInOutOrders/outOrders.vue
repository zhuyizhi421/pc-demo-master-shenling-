<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="MRO出库记录"></CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
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
  </div>
</template>

<script setup lang="ts">
import { queryMroOutRecordPageList } from "@/api/operation/mro/mro-in-out"
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
import { SelectType } from "@/components/SelectFactoryModel/types"
import { TIME_RANGE } from "@/constant/time"
import type {
  IMroOutRecordPageListItem as ITableRow,
  IMroOutRecordPageListParams
} from "@/types/maintain/mro-manage/mro-in-out"
import { precisionConversion } from "@/utils/common"

defineOptions({
  name: "MROOutOrders"
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroNo",
    label: "MRO编号",
    value: "",
    placeholder: "请输入MRO编号"
  },
  {
    type: EnumComponentType.Input,
    key: "barcode",
    label: "标签码",
    value: "",
    placeholder: "请输入标签码"
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelName",
    label: "MRO型号",
    value: "",
    placeholder: "请输入MRO型号"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "出库时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["outboundTimeStart", "outboundTimeEnd"]
  },
  {
    type: EnumComponentType.Area,
    key: "facilityId",
    label: "仓库",
    value: "",
    placeholder: "请选择仓库",
    props: {
      areaType: SelectType.WarehouseType,
      isEnable: true
    }
  },
  {
    type: EnumComponentType.Area,
    key: "locationId",
    label: "库位",
    value: "",
    placeholder: "请选择库位",
    props: {
      areaType: SelectType.LocationType,
      isEnable: true
    }
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  mroNo: string
  barcode: string
  mroModelName: string
  outboundTimeStart?: string
  outboundTimeEnd?: string
  status?: number
  curLocation?: number
  facilityId?: string
  locationId?: string
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
      prop: "outboundDetailCode",
      label: "编号",
      minWidth: 160
    },
    {
      prop: "mroNo",
      label: "MRO编号",
      minWidth: 160
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160
    },
    {
      prop: "mroModelName",
      label: "MRO型号",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity === 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      width: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
      width: 160
    },
    {
      prop: "operatorName",
      label: "操作人",
      width: 120,
      align: "center"
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      width: 160
    },
    {
      prop: "reason",
      label: "出库原因",
      width: 160
    }
  ]
})
const queryConfig: ITableRequestConfig<[IMroOutRecordPageListParams], ITableRow, true> = {
  api: queryMroOutRecordPageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

onMounted(() => {
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
</script>

<style scoped lang="scss"></style>
