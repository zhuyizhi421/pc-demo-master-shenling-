<template>
  <div class="production-order-detail">
    <div class="production-order-content" v-loading="loading">
      <div class="top-back">
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle
        class="pl-[20px] !mb-[8px]"
        show-short-bar
        :isTableTitle="false"
        title="基础信息"
      />
      <div class="order">
        <span>订单编号：{{ formData?.no }}</span>
        <span class="status">{{
          EnumProductionOrderStatusMap[formData?.status as EnumProductionOrderStatus]
        }}</span>
      </div>
      <CustomDescription
        style="padding: 0"
        :data="formData ? formData : {}"
        :configs="orderDescConfigs"
        :label-width="110"
      >
        <template #files-content>
          <el-button
            v-if="formData?.files?.length"
            type="primary"
            link
            @click="onDownloadClick(formData!.files)"
            >下载</el-button
          >
        </template>
      </CustomDescription>
      <div class="material-list">
        <CustomTitle title="工艺流程" :isTableTitle="false">
          <el-button type="primary" @click="onEditProcessClick()">{{
            formData?.status === EnumProductionOrderStatus.REVIEW ||
            formData?.status === EnumProductionOrderStatus.SETTLE
              ? "查看订单工艺"
              : "配置订单工艺"
          }}</el-button>
        </CustomTitle>

        <CustomDescription
          style="padding: 0; margin-bottom: 12px"
          :data="formData ? formData : {}"
          :configs="craftFlowDescConfigs"
          :label-width="120"
        >
        </CustomDescription>

        <el-radio-group class="tab-group" v-model="tabValue">
          <el-radio-button :value="1">工序</el-radio-button>
          <el-radio-button :value="2">用料</el-radio-button>
        </el-radio-group>

        <!-- 工序表格 -->
        <CustomTable
          v-if="tabValue === 1"
          :table-data="craftTableData"
          :config="craftTableConfigs"
          height="200"
        >
          <template #nature-slot="{ row: { nature } }">
            {{ EnumProductionTypeMap[nature as EnumProductionType] }}
          </template>
          <template #totalAmount-slot="{ row: { totalAmount, bizType } }">
            <template v-if="bizType !== 2">
              <div class="progress-wrap">
                <div class="progress-text">{{ (Number(totalAmount) * 100).toFixed(2) + "%" }}</div>
                <div class="progress">
                  <div
                    class="progress-slid"
                    :style="{ width: (totalAmount || 0) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </template>
          </template>
        </CustomTable>

        <!-- 用料表格 -->
        <CustomTable
          v-if="tabValue === 2"
          :table-data="materialTableData"
          :config="materialTableConfigs"
          height="200"
        >
          <template #processSerials-slot="{ row: { processSerials } }">
            {{ processSerials?.join(";") }}
          </template>
        </CustomTable>
      </div>
      <div class="readd-record">
        <el-radio-group v-model="activeTab" style="margin-bottom: 16px">
          <el-radio-button :value="EnumTab.Re_add">订单追加记录</el-radio-button>
          <el-radio-button :value="EnumTab.Prepare_out">领料出库记录</el-radio-button>
          <el-radio-button v-if="formData?.hasPackProcess" :value="EnumTab.Package"
            >包装记录</el-radio-button
          >
        </el-radio-group>
        <div class="table-container">
          <OrderReAdd v-if="activeTab === EnumTab.Re_add" :id="props.id" />
          <PrepareOut v-if="activeTab === EnumTab.Prepare_out" :id="props.id" />
          <Package v-if="activeTab === EnumTab.Package" :id="props.id" />
        </div>
      </div>
    </div>
    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { queryProductionOrderDetail, requestMaterialListByProductionOrder } from "@/api/scheduling"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap,
  EnumProductionType,
  EnumProductionTypeMap
} from "@/constant/enums"
import type { ICraftConfigInfo } from "@/types/base-info/craftRoute"
import type {
  IProductionOrderItem,
  IProductionOrderMaterialItem
} from "@/types/production-manage/product-order"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import OrderReAdd from "./tabs/OrderReAdd.vue"
import Package from "./tabs/Package.vue"
import PrepareOut from "./tabs/PrepareOut.vue"

defineOptions({
  name: "PreparationMaterialPlanDetail"
})

enum EnumTab {
  Re_add,
  Prepare_out,
  Package
}

type ITableRow =
  | IProductionOrderItem["materials"][number]
  | IProductionOrderItem["serialInfos"][number]

interface IFile {
  fileId: string
  fileName: string
  fileURL: string
}

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (
    e: "order-craft-config",
    data: ICraftConfigInfo,
    orderType: EnumProductionOrderType,
    orderInfo: IProductionOrderItem
  ): void
}>()

const loading = ref(false)
const activeTab = ref(EnumTab.Re_add)

const formData = ref<IProductionOrderItem>()
const tabValue = ref(1) // 当前工序/用料tab选中值

const materialTableData = ref<IProductionOrderMaterialItem[]>([])

/** 订单基础信息描述配置 */
const orderDescConfigs = computed<ICustomDescriptionConfig[]>(() => {
  return [
    {
      field: "type",
      label: "订单类型：",
      formatter: (params) => {
        return EnumProductionOrderTypeMap[params?.data?.type as EnumProductionOrderType]
      }
    },
    {
      field: "originalOrderNo",
      label: "生产批次：",
      hidden: !(
        formData?.value?.type &&
        [EnumProductionOrderType.REPAIR, EnumProductionOrderType.REMODEL].includes(
          formData.value.type
        )
      )
    },
    {
      field: "productModel",
      label: "产品名称：",
      formatter: (params) => {
        return params?.data?.productModel?.name
      }
    },
    {
      field: "productModelCode",
      label: "产品编号："
    },
    {
      field: "orderAmount",
      label: "数量："
    },
    {
      field: "unitItem",
      label: "产品单位：",
      formatter: (params) => {
        return params?.data?.unitItem?.unitName
      }
    },
    {
      field: "specifiedInboundWarehouseName",
      label: "指定入库仓库："
    },
    {
      field: "deliveryDate",
      label: "交货日期："
    },
    {
      field: "source",
      label: "来源：",
      formatter: (params) => {
        return EnumProductionOrderSourceMap[params?.data?.source as EnumProductionOrderSource]
      }
    },
    {
      field: "createTime",
      label: "创建时间："
    },
    {
      field: "createByName",
      label: "创建人："
    },
    {
      field: "saleContent",
      label: "销售订单："
    },
    {
      field: "files",
      label: "附件：",
      slots: {
        content: "files-content"
      }
    },
    {
      field: "remark",
      label: "备注："
    }
  ]
})

/** 工艺流程描述配置 */
const craftFlowDescConfigs = computed<ICustomDescriptionConfig[]>(() => {
  return [
    {
      field: "techProcess",
      label: "工艺流程类型：",
      formatter: (params) => {
        return params?.data?.techProcess?.orderProcessType === 1
          ? "复制工艺路线"
          : params?.data?.techProcess?.orderProcessType === 2
            ? "订单工艺"
            : ""
      }
    },
    {
      field: "techProcess",
      label: "原工艺路线版本：",
      hidden: formData?.value?.techProcess?.orderProcessType !== 1,
      formatter: (params) => {
        return params?.data?.techProcess?.sourceVersion
      }
    },
    {
      field: "techProcess",
      label: "原工艺流程编号：",
      hidden: formData?.value?.techProcess?.orderProcessType !== 1,
      formatter: (params) => {
        return params?.data?.techProcess?.sourceNo
      }
    }
  ]
})

// 工艺流程-工序/用料表格数据
const craftTableData = computed<ITableRow[]>(() => {
  return (tabValue.value === 1 ? formData.value?.serialInfos : formData.value?.materials) || []
})

/** 工艺流程-工序/用料表格配置 */
const craftTableConfigs = ref<ITableConfig>({
  height: 200,
  stripe: true,
  columns: [
    {
      type: "index",
      prop: "",
      label: "序号",
      width: 65,
      align: "center",
      fixed: "left"
    },
    {
      prop: "serial",
      label: "工序",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "nature",
      label: "加工性质",
      width: 120,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "nature-slot"
      }
    },
    {
      prop: "totalAmount",
      label: "生产进度",
      minWidth: 200,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "totalAmount-slot"
      }
    },
    {
      prop: "amountInOrder",
      label: "订单数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      formatter: ({ decimalNumber, amountInOrder }) =>
        isEffectiveValue(amountInOrder) ? precisionConversion(amountInOrder, decimalNumber) : ""
    },
    {
      prop: "finishAmount",
      label: "完工数量",
      width: 120,
      align: "right",
      formatter: ({ finishAmount, bizType, decimalNumber }) => {
        return bizType === 2
          ? ""
          : isEffectiveValue(finishAmount)
            ? precisionConversion(finishAmount, decimalNumber)
            : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    }
  ]
})

const materialTableConfigs = ref<ITableConfig>({
  height: 200,
  stripe: true,
  columns: [
    {
      type: "index",
      prop: "",
      label: "序号",
      width: 65,
      align: "center",
      fixed: "left"
    },
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelCode",
      label: "编号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "processSerials",
      label: "投料工序",
      align: "center",
      minWidth: 160,
      showOverflowTooltip: true,
      slots: {
        default: "processSerials-slot"
      }
    },
    {
      prop: "totalAmount",
      label: "投料数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      formatter: ({ decimalNumber, totalAmount }) =>
        isEffectiveValue(totalAmount) ? precisionConversion(totalAmount, decimalNumber) : ""
    },
    {
      prop: "availAmount",
      label: "正常可领数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      formatter: ({ decimalNumber, availAmount }) =>
        isEffectiveValue(availAmount) ? precisionConversion(availAmount, decimalNumber) : ""
    },
    {
      prop: "exceedAmount",
      label: "超领数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      formatter: ({ decimalNumber, exceedAmount }) =>
        isEffectiveValue(exceedAmount) ? precisionConversion(exceedAmount, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center",
      showOverflowTooltip: true
    }
  ]
})

onBeforeMount(async () => {
  await getProductionOrderDetail(props.id)
  getMaterialTableData()
})

/** 获取生产订单详情 */
const getProductionOrderDetail = async (id: string) => {
  loading.value = true
  const data = await queryProductionOrderDetail(id)
  loading.value = false
  if (data) {
    formData.value = data
  }
}

/** 编辑工艺信息 */
const onEditProcessClick = () => {
  if (formData.value) {
    emit("order-craft-config", formData.value.techProcess, formData.value.type, formData.value)
  }
}

/** 下载附件 */
const onDownloadClick = async (files: IFile[]) => {
  for (let key of files) {
    await fileDownloadHandle(key.fileId)
  }
}

// 获取物料清单
const getMaterialTableData = async () => {
  const techProcessId = formData.value?.techProcess?.id
  const orderAmount = formData.value?.orderAmount
  if (!techProcessId || orderAmount === undefined || orderAmount === null) {
    materialTableData.value = []
    return
  }
  const data = await requestMaterialListByProductionOrder({
    techProcessId,
    orderAmount
  })
  materialTableData.value = data
}
</script>

<style lang="scss" scoped>
.production-order-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--g-color);

  .production-order-content {
    overflow-y: auto;
    flex: 1;
  }
}

.top-back {
  margin: 12px 20px;
}

.order {
  font-weight: bold;
  margin: 0 0 16px 20px;
  line-height: 24px;

  .status {
    margin-left: 16px;
  }
}

.progress-wrap {
  display: flex;
  justify-content: center;
  align-items: center;

  .progress-text {
    width: 80px;
    flex: none;
  }

  .progress {
    width: 100px;
    height: 8px;
    border-radius: 4px;
    background-color: #ededed;
    position: relative;
    overflow: hidden;

    .progress-slid {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--el-color-primary);
    }
  }
}

.material-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;

  .tab-group {
    margin-bottom: 12px;

    &:deep(.el-radio-button__inner) {
      padding: 8px 32px;
    }
  }
}

.readd-record {
  display: flex;
  flex-direction: column;
  padding: 16px 20px 16px;

  .title {
    height: 24px;
    font-weight: bold;
    margin-bottom: 16px;
  }
}
</style>
