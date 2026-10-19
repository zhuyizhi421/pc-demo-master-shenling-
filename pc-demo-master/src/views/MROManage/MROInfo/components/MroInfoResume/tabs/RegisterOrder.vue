<template>
  <div class="register-order">
    <CustomTitle title="登记单" />
    <customDescription :data="mroRegisterOrderDetail || {}" :configs="mroRegisterDescriptionConfig" />
    <CustomTable ref="customTableRef" v-model:table-data="customTableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="onReview(row)">查看</el-button>
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { queryMroRegisterPageList } from "@/api/operation/mro/mro-register"
import customDescription from "@/components/CustomDescription/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumMROIdentityManage,
  EnumMROIdentityManageMap,
  EnumMRORegisterStatus,
  EnumMRORegisterStatusMap
} from "@/constant/enums"
import type {
  IMroRegisterItem as ITableRow,
  IMroRegisterPageListItem
} from "@/types/maintain/mro-manage/mro-register"
import { precisionConversion } from "@/utils/common"

import { formatDateTime } from "../../../status"

const props = withDefaults(
  defineProps<{
    mroModelId: string
    mroRegisterNo: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "review", data: { mroModelName: string; registerId: string }): void
}>()

const mroRegisterOrderDetail = ref<IMroRegisterPageListItem>()
const mroRegisterDescriptionConfig = [
  {
    label: "登记单号：",
    field: "mroRegisterNo"
  },
  {
    label: "仓库名称：",
    field: "warehouseName"
  },
  {
    label: "仓库编号：",
    field: "warehouseNo"
  },
  {
    label: "状态：",
    field: "status",
    formatter: () =>
      EnumMRORegisterStatusMap[mroRegisterOrderDetail.value?.status as EnumMRORegisterStatus]
  },
  {
    label: "创建人：",
    field: "createByName"
  },
  {
    label: "创建日期：",
    field: "createTime",
    formatter: ({ data }: { data: IMroRegisterPageListItem }) => formatDateTime(data.createTime)
  }
]

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroModelName",
      label: "MRO型号",
      minWidth: 160
    },
    {
      prop: "mroModelNo",
      label: "MRO型号编号",
      minWidth: 160
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
      formatter: (row: ITableRow) =>
        EnumMROIdentityManageMap[row.identityManage as EnumMROIdentityManage]
    },
    {
      prop: "registerNums",
      label: "登记数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => precisionConversion(row.registerNums, row.decimalNumber)
    },
    {
      prop: "unitModelName",
      label: "单位",
      width: 160,
      align: "center"
    },
    {
      prop: "warehouseLocationName",
      label: "库位",
      minWidth: 160
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(() => {
  void getMroRegisterPageList()
})

const getMroRegisterPageList = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records } = await queryMroRegisterPageList({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        mroRegisterNo: props.mroRegisterNo,
        mroModelId: props.mroModelId
      }
    })
    mroRegisterOrderDetail.value = records[0]
    customTableData.value = records[0]?.registerItemVos || []
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onReview = (row: ITableRow) => {
  emit("review", { mroModelName: row.mroModelName, registerId: row.mroRegisterId })
}

defineExpose({
  getTableList: () => customTableData.value
})
</script>

<style lang="scss" scoped>
.register-order {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-title {
    margin: 0;
  }

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
