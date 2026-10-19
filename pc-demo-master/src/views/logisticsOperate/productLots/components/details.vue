<!-- 产品批次详情 -->
<template>
  <CustomDialog v-model="visible" title="批次信息" size="default" @close="closeFunc">
    <CustomTitle title="基础信息" style="margin-top: 0" />
    <CustomDescription
      :data="detailForm"
      :configs="detailConfig"
      :label-width="80"
      :columns="2"
      style="padding: 0"
    >
      <template #batchQuantity-content>
        {{
          detailForm?.batchQuantity || detailForm?.batchQuantity == 0
            ? precisionConversion(detailForm?.batchQuantity, detailForm?.decimalNumber ?? 2)
            : undefined
        }}
      </template>
    </CustomDescription>

    <template v-if="[1, 2, 3, 4].includes(detailForm?.batchType ?? 0)">
      <CustomTitle title="批次详情" />
      <CustomDescription
        :data="lotsForm"
        :configs="lotsConfig"
        :label-width="80"
        :columns="2"
        style="padding: 0"
      >
      </CustomDescription>
    </template>
    <template #footer>
      <el-button @click="visible = false">返回</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryProductBatchDetail } from "@/api/logistics/batch"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { type EnumBatchModelType, EnumBatchModelTypeMap } from "@/constant/enums"
import type { Options } from "@/types/common"
import type {
  BacthProductionInfo,
  BatchPurchaseInfo,
  BatchReturnInfo,
  InventoryCheckInfo,
  IProductBatchDetail
} from "@/types/logistics/batch"
import { precisionConversion } from "@/utils/common"
import { purchaseTypeEnum } from "@/utils/const"

const visible = ref(false)

const detailForm = ref<IProductBatchDetail>({})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "批次号：",
    field: "batchNo"
  },
  {
    label: "批次类型：",
    field: "batchType",
    formatter: ({ data: { batchType } }) => {
      return EnumBatchModelTypeMap[batchType as EnumBatchModelType]
    }
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "产品名称：",
    field: "productModelName"
  },
  {
    label: "产品编号：",
    field: "productModelCode"
  },
  {
    label: "批次总数：",
    field: "batchQuantity",
    slots: {
      content: "batchQuantity-content"
    }
  },
  {
    label: "单位：",
    field: "unitName"
  }
])

const detailMes = ref<
  BatchPurchaseInfo | BacthProductionInfo | BatchReturnInfo | InventoryCheckInfo | undefined
>({})
const lotsDetail = ref<Options[]>([])

const lotsForm = ref<Record<string, any>>({})
const lotsConfig = computed<ICustomDescriptionConfig[]>(() => {
  return lotsDetail.value.map((item) => {
    return {
      label: item.label + "：",
      field: item.label
    }
  })
})

const setVisible = async (value: boolean, data?: any) => {
  visible.value = value
  if (data) {
    const res = await queryProductBatchDetail(data?.id)
    detailForm.value = res
    if (data?.batchType === 1) {
      // 采购批次
      detailMes.value = res?.purchaseInfo
    } else if (data?.batchType === 2) {
      // 生产批次
      detailMes.value = res?.productionInfo
    } else if (data?.batchType === 3) {
      // 退货批次
      detailMes.value = res?.returnInfo
    } else if (data?.batchType === 4) {
      // 盘点批次
      detailMes.value = res?.inventoryCheckInfo
    }
    fetchDetailFunc(data?.batchType)
  }
}

const fetchDetailFunc = (type: number) => {
  if (type === 1) {
    lotsDetail.value = [
      {
        label: "采购类型",
        value: purchaseTypeEnum[(detailMes.value as BatchPurchaseInfo)?.purchaseType as number]
      },
      {
        label: "供应商",
        value: (detailMes.value as BatchPurchaseInfo)?.supplierName as string
      },
      {
        label: "采购单号",
        value: (detailMes.value as BatchPurchaseInfo)?.purchaseCode as string
      },
      {
        label: "收货时间",
        value: (detailMes.value as BatchPurchaseInfo)?.arrivalTime as string
      }
    ]
  } else if (type === 2) {
    lotsDetail.value = [
      {
        label: "工序编号",
        value: (detailMes.value as BacthProductionInfo)?.techVersionNo as string
      },
      {
        label: "生产订单",
        value: (detailMes.value as BacthProductionInfo)?.productionOrderNo as string
      },
      {
        label: "调度任务",
        value: (detailMes.value as BacthProductionInfo)?.executionCode as string
      },
      {
        label: "报工时间",
        value: (detailMes.value as BacthProductionInfo)?.reportTime as string
      }
    ]
  } else if (type === 3) {
    lotsDetail.value = [
      {
        label: "销售订单",
        value: (detailMes.value as BatchReturnInfo)?.saleCode
      },
      {
        label: "客户名称",
        value: (detailMes.value as BatchReturnInfo)?.customerAbbr
      },
      {
        label: "客户编号",
        value: (detailMes.value as BatchReturnInfo)?.customerCode
      },
      {
        label: "退货时间",
        value: (detailMes.value as BatchReturnInfo)?.returnTime
      }
    ]
  } else if (type === 4) {
    lotsDetail.value = [
      {
        label: "盘点单号",
        value: (detailMes.value as InventoryCheckInfo)?.inventoryCheckCode
      },
      {
        label: "盘点时间",
        value: (detailMes.value as InventoryCheckInfo)?.inventoryCheckTime
      }
    ]
  }
  lotsDetail.value.map((item: any) => {
    lotsForm.value[item.label] = item.value
  })
}

const closeFunc = () => {
  lotsDetail.value = []
}

defineOptions({
  name: "ProductLotsDetails"
})

defineExpose({
  setVisible
})
</script>
