<!-- 工艺路线-配置 -->
<template>
  <div class="craft-route-config">
    <div class="tabs-header">
      <el-tabs v-model="activeName" @tab-change="onTabChange()">
        <el-tab-pane label="工序" :name="EnumTab.LEFT"></el-tab-pane>
        <el-tab-pane label="料产出" :name="EnumTab.RIGHT"></el-tab-pane>
      </el-tabs>
      <div class="tabs-actions">
        <el-button type="primary" @click="onSaveClick">保存</el-button>
        <el-button @click="emit('close')">返回</el-button>
      </div>
    </div>

    <!-- 工艺路线信息 -->
    <div class="craft-route-info">
      <CustomTitle :title="configInfoTitle" style="margin-top: 0">
        <div>
          <template v-if="!isOrderCraft">
            <template v-if="!isOnlyView">
              <el-button
                v-if="craftRouteForm.publishStatus === EnumCraftStatus.DESIGN"
                type="primary"
                @click="openPublishDialog"
                >{{ publishButtonText }}</el-button
              >
            </template>
          </template>
          <!-- 订单工艺显示的操作按钮 -->
          <template v-else>
            <el-button
              v-if="orderInfo?.status === EnumProductionOrderStatus.UN_REVIEW"
              type="primary"
              @click="onCheckFlowClick()"
              >校验流程完整性</el-button
            >
            <el-button
              v-if="
                orderInfo?.type === EnumProductionOrderType.TEST &&
                orderInfo?.status === EnumProductionOrderStatus.REVIEW
              "
              type="primary"
              @click="onUpdateOrderClick()"
              >更新工单流程</el-button
            >
            <el-button
              v-if="
                orderInfo?.status === EnumProductionOrderStatus.REVIEW ||
                orderInfo?.status === EnumProductionOrderStatus.SETTLE
              "
              type="primary"
              @click="onSyncToCraftRouteClick()"
              >同步为工艺路线</el-button
            >
          </template>
        </div>
      </CustomTitle>
      <CustomForm ref="customFormRef" v-model="craftRouteForm" :configs="formConfigs"></CustomForm>
    </div>
    <!-- 只在左侧工序标签页显示工艺标准/过程控制计划切换 -->
    <el-radio-group v-if="activeName === EnumTab.LEFT" style="margin-top: 20px;" v-model="radioValue">
      <el-radio-button label="工艺标准">工艺标准</el-radio-button>
      <el-radio-button label="过程控制计划">过程控制计划</el-radio-button>
    </el-radio-group>
      <!-- 子工艺列表 -->
    <ChildCraftList
      v-if="activeName === EnumTab.LEFT && radioValue === '工艺标准'"
      :craft-version-id="craftRouteForm.techVersionId"
      :craft-type="curCraftType!"
      :status="craftRouteForm.publishStatus!"
      :product-model-no="craftRouteForm.productModelNo"
      :product-model-name="craftRouteForm.productModelName"
      @config-craft="onConfigCraft"
      @current-change="onCurrentChange"
    />

    <!-- 过程控制计划列表 -->
    <ProcessControlPlanList
      v-if="activeName === EnumTab.LEFT && radioValue === '过程控制计划'"
      ref="processControlPlanListRef"
      :craft-version-id="craftRouteForm.techVersionId"
      :is-only-view="isOnlyView"
      @save="onProcessControlPlanSave"
    />

    <!-- 左侧工序-生产要素信息 -->
    <CraftProductionFactorLeft
      v-if="activeName === EnumTab.LEFT && curSelectProcessInfo?.techVersionId && craftRouteForm.publishStatus !== EnumCraftStatus.DESIGN"
      :key="curSelectProcessInfo?.techVersionId"
      :tech-version-info="curSelectProcessInfo"
      :craft-type="curCraftType"
      :is-pack="curSelectProcessInfo.bizType === EnumCraftBizType.PACK"
      :product-model-id="craftRouteForm.productModelId"
      :product-model-name="craftRouteForm.productModelName"
    />

    <!-- 右侧工艺路线-生产要素信息 -->
    <CraftProductionFactorRight
      v-if="activeName === EnumTab.RIGHT && craftRouteForm.techVersionId"
      :key="craftRouteForm.techVersionId"
      :tech-version-info="craftFormInfo"
      :craft-type="curCraftType"
      is-summary
    />
    
  </div>

  <!-- 产品选择 -->
  <SelectProductDialog
    v-model="selectProductVisible"
    :selected-row-keys="[craftRouteForm.productModelId]"
    @success="onSelectProductSuccess"
  />

  <!-- 工艺路线发布弹窗 -->
  <CraftRoutePublishDialog
    v-if="craftRoutePublishVisible"
    :id="craftRouteForm.id"
    :publishRemarks="publishRemarks"
    @close="craftRoutePublishVisible = false"
    @success="onCraftRoutePublishSuccess()"
  />

  <!-- 订单工艺同步为工艺路线弹窗 -->
  <SyncCraftRouteDialog
    v-if="syncToCraftRouteVisible"
    :id="craftRouteForm.id"
    @close="syncToCraftRouteVisible = false"
  />

  <!-- 生产要素配置弹窗 -->
  <el-dialog
    v-model="productionFactorVisible"
    title="配置生产要素"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <CraftProductionFactorLeft
      v-if="productionFactorVisible && curSelectProcessInfo?.techVersionId"
      :key="curSelectProcessInfo?.techVersionId"
      :tech-version-info="curSelectProcessInfo"
      :craft-type="curCraftType"
      :is-pack="curSelectProcessInfo.bizType === EnumCraftBizType.PACK"
      :product-model-id="craftRouteForm.productModelId"
      :product-model-name="craftRouteForm.productModelName"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getTechProcessInfo, updateCraftRouteItem } from "@/api/craft"
import { getProductModelById, type IProductModelListItem } from "@/api/product"
import {
  requestCachedTechProcessByOrder,
  requestCheckOrderProcess,
  requestUpdateOrderProcess
} from "@/api/scheduling"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import {
  EnumCraftBizType,
  EnumCraftStatus,
  EnumCraftStatusMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderType
} from "@/constant/enums"
import type {
  ICraftConfigInfo,
  ICraftPageCrumbsData,
  ICraftRouteItem,
  ITechVersionProps
} from "@/types/base-info/craftRoute"

import ChildCraftList from "./ChildCraftList.vue"
import CraftProductionFactorLeft from "./CraftProductionFactor/CraftProductionFactorLeft.vue"
import CraftProductionFactorRight from "./CraftProductionFactor/CraftProductionFactorRight.vue"
import CraftRoutePublishDialog from "./CraftRoutePublishDialog.vue"
import type { IProcessControlRow } from "./ProcessControlPlanTab/ProcessControlPlanList.vue"
import ProcessControlPlanList from "./ProcessControlPlanTab/ProcessControlPlanList.vue"
import SyncCraftRouteDialog from "./SyncCraftRouteDialog.vue"

const props = withDefaults(
  defineProps<{
    data: ICraftPageCrumbsData
    routePurpose?: "standard" | "rework-template"
  }>(),
  {
    routePurpose: "standard"
  }
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "update-page-list", data: ICraftConfigInfo): void
  (e: "update-view-status", data: boolean): void
}>()

enum EnumTab {
  LEFT = 1,
  RIGHT = 2
}

const isOnlyView = inject<Ref<boolean>>("isOnlyView") // 订单工艺是否只读

const activeName = ref(EnumTab.LEFT)
const selectProductVisible = ref(false) // 产品选择弹窗显示标识
const publishRemarks = ref("") // 发布工艺路线备注
const craftRoutePublishVisible = ref(false) // 工艺路线发布弹窗显示标识
const curSelectProcessInfo = ref<ITechVersionProps>({
  techVersionId: "",
  status: 0,
  type: 0,
  bizType: EnumCraftBizType.PROCESS,
  defaultCodeRelationType: undefined,
  processId: ""
}) // 当前子工艺列表选中的工序部分信息

// 工艺路线信息
const craftRouteForm = reactive<{
  id: string // 工艺路线ID
  techVersionId: string // 工艺路线版本id
  productModelName: string
  productModelId: string
  productModelNo: string
  no: string // 工艺路线编号
  unitId: string
  unitOptions: { label: string; value: string }[]
  source?: EnumProductionOrderSource
  publishStatus?: EnumCraftStatus
  createTime: string
  remarks: string
  techVersion?: ICraftRouteItem["techVersion"]
}>({
  id: "",
  techVersionId: "",
  productModelName: "",
  productModelId: "",
  productModelNo: "",
  no: "",
  unitId: "",
  unitOptions: [],
  source: undefined,
  publishStatus: undefined,
  createTime: "",
  remarks: "",
  techVersion: undefined
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "产品名称",
    field: "productModelId",
    hidden: isReworkTemplate.value,
    props: {
      placeholder: "请选择产品",
      readonly: true,
      clearable: false,
      get disabled() {
        return craftRouteForm.publishStatus !== EnumCraftStatus.DESIGN || isOrderCraft.value
      },
      get customChildren() {
        return productOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    events: {
      visibleChange: () => {
        selectProductVisible.value = true
      }
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productModelNo",
    hidden: isReworkTemplate.value,
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "单位",
    field: "unitId",
    hidden: isReworkTemplate.value,
    props: {
      placeholder: "请选择单位",
      filterable: true,
      get disabled() {
        return craftRouteForm.publishStatus !== EnumCraftStatus.DESIGN || isOrderCraft.value
      },
      get customChildren() {
        return craftRouteForm.unitOptions.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    events: {
      change: updateCraftRoute
    }
  },
  {
    componentType: "el-input",
    label: "工艺路线编号",
    field: "no",
    get hidden() {
      return !!isOrderCraft.value
    },
    props: {
      placeholder: "请输入",
      maxlength: 50,
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "来源",
    field: "source",
    props: {
      placeholder: "请选择来源",
      disabled: true,
      get customChildren() {
        return Object.keys(EnumProductionOrderSourceMap).map((key) => {
          return {
            componentType: "el-option",
            props: {
              label: EnumProductionOrderSourceMap[key as unknown as EnumProductionOrderSource],
              value: +key
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-select",
    label: "状态",
    field: "publishStatus",
    props: {
      placeholder: "请选择状态",
      disabled: true,
      get customChildren() {
        return Object.keys(EnumCraftStatusMap).map((key) => {
          return {
            componentType: "el-option",
            props: {
              label: EnumCraftStatusMap[key as unknown as EnumCraftStatus],
              value: +key
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    props: {
      placeholder: "请输入",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true,
      get disabled() {
        return craftRouteForm.publishStatus !== EnumCraftStatus.DESIGN || isOnlyView?.value
      }
    },
    events: {
      change: updateCraftRoute
    }
  }
])

const productOptions = ref<{ label: string; value: unknown }[]>([])

const syncToCraftRouteVisible = ref(false) // 同步为工艺路线弹窗显示标识
const productionFactorVisible = ref(false) // 生产要素配置弹窗显示标识
const processControlPlanListRef = ref<InstanceType<typeof ProcessControlPlanList>>() // 过程控制计划列表组件引用

const craftFormInfo = computed(() => {
  return {
    techVersionId: craftRouteForm.techVersion?.id || "",
    status: craftRouteForm.techVersion?.status ?? 0,
    type: craftRouteForm.techVersion?.type ?? 0,
    bizType: craftRouteForm.techVersion?.bizType ?? EnumCraftBizType.PROCESS,
    defaultCodeRelationType: undefined
  }
}) // 工艺路线信息传参

/** 当前工艺的工艺类型 */
const curCraftType = computed(() => props.data.craftType)
const isReworkTemplate = computed(
  () => props.routePurpose === "rework-template" || props.data.routePurpose === "rework-template"
)
const configInfoTitle = computed(() => {
  if (isOrderCraft.value) return "订单工艺信息"
  return isReworkTemplate.value ? "返工工艺模板信息" : "工艺路线信息"
})
const publishButtonText = computed(() =>
  isReworkTemplate.value ? "发布返工工艺模板" : "发布工艺路线"
)

// 是否是订单工艺
const isOrderCraft = computed(() => {
  return props.data.isOrderCraft
})

/** 生产订单信息 */
const orderInfo = computed(() => {
  return props.data.orderInfo
})

const radioValue = ref("工艺标准")

/** 保存订单工艺配置 */
const onSaveClick = () => {
  // 触发 update-page-list 事件，让父组件处理保存逻辑
  const configData: ICraftConfigInfo = {
    id: props.data.craftRouteId,
    techVersionId: craftRouteForm.value.techVersionId || ""
  }
  emit("update-page-list", configData)
  emit("close")
}

onBeforeMount(async () => {
  await getCraftRouteDetail(props.data.craftRouteId)
  if (craftRouteForm.productModelId) {
    getProductInfo(craftRouteForm.productModelId)
  }
})

/** 打开发布工艺路线弹窗 */
const openPublishDialog = () => {
  publishRemarks.value = craftRouteForm.remarks
  craftRoutePublishVisible.value = true
}

/** 获取工艺路线详情 */
const getCraftRouteDetail = async (id: string) => {
  let data
  // 试产订单工艺修改时，使用生产订单缓存的工单工艺
  if (orderInfo.value && orderInfo.value?.type === EnumProductionOrderType.TEST) {
    data = await requestCachedTechProcessByOrder({ id: orderInfo.value.id })
  } else {
    data = await getTechProcessInfo(id)
  }
  if (!data) {
    return
  }

  craftRouteForm.id = data.id || ""
  craftRouteForm.techVersionId = data.techVersionId || ""
  craftRouteForm.productModelName = data.productModel?.name || ""
  craftRouteForm.productModelNo = data.productModel?.code || ""
  craftRouteForm.productModelId = data.productModel?.id || ""
  productOptions.value = data.productModel?.id
    ? [
        {
          label: data.productModel?.name || "",
          value: data.productModel?.id || ""
        }
      ]
    : []
  craftRouteForm.no = data.no || ""
  craftRouteForm.unitId = data.unitItem?.id || ""
  craftRouteForm.source = data.techVersion?.sourceType
  craftRouteForm.publishStatus = data.publishStatus
  craftRouteForm.createTime = data.createTime || ""
  craftRouteForm.remarks = data.remarks || ""
  craftRouteForm.techVersion = data.techVersion
}

/** 获取产品信息 */
const getProductInfo = async (id: string, isSetDefaultUnit?: boolean) => {
  const data = await getProductModelById(id)
  craftRouteForm.unitOptions =
    data.productModelUnitList?.map((item: any) => ({
      label: item.unitName,
      value: item.unitId
    })) || []

  // 是否设置默认单位
  if (isSetDefaultUnit) {
    craftRouteForm.unitId = data.defaultUnitId
  }
}

/** 选择产品成功回调 */
const onSelectProductSuccess = async (productList: IProductModelListItem[]) => {
  if (!productList.length) {
    return
  }

  let product = productList[0]
  craftRouteForm.productModelName = product.name
  craftRouteForm.productModelNo = product.code
  craftRouteForm.productModelId = product.id

  productOptions.value = [
    {
      label: product.name,
      value: product.id
    }
  ]

  await getProductInfo(craftRouteForm.productModelId, true)
  updateCraftRoute()
}

/** 更新工艺路线信息 */
const updateCraftRoute = async () => {
  let params = {
    processId: craftRouteForm.id,
    remarks: craftRouteForm.remarks,
    routePurpose: props.routePurpose,
    ...(!isReworkTemplate.value
      ? {
          productionModelId: craftRouteForm.productModelId,
          unitId: craftRouteForm.unitId
        }
      : {})
  }
  await updateCraftRouteItem(params)
}

/** 子工艺列表配置回调 */
const onConfigCraft = (data: ICraftConfigInfo) => {
  emit("update-page-list", data)
}

/** 子工艺列表表格选中行数据改变 */
const onCurrentChange = (data: any) => {
  if (data) {
    curSelectProcessInfo.value = {
      techVersionId: data.techVersionId,
      status: data.status,
      type: data.type,
      bizType: data.bizType,
      defaultCodeRelationType: data.defaultCodeRelationType,
      processId: data.id // 当前选中的工序ID
    }
    if(craftRouteForm.publishStatus === EnumCraftStatus.DESIGN){
      productionFactorVisible.value = true
    }
  } else {
    curSelectProcessInfo.value = {
      techVersionId: "",
      status: 0,
      type: 0,
      bizType: EnumCraftBizType.PROCESS,
      defaultCodeRelationType: undefined,
      processId: ""
    }
  }
}

/** 切换tab操作 */
const onTabChange = () => {
  if (activeName.value === EnumTab.RIGHT) {
    curSelectProcessInfo.value = {
      techVersionId: "",
      status: 0,
      type: 0,
      bizType: EnumCraftBizType.PROCESS,
      defaultCodeRelationType: undefined,
      processId: ""
    }
  }
}

/** 发布工艺路线弹窗回调 */
const onCraftRoutePublishSuccess = () => {
  getCraftRouteDetail(props.data.craftRouteId)
  emit("update-view-status", true)
}

/**
 * 工单工艺按钮操作部分
 */
/** 更新工单流程 */
const onUpdateOrderClick = async () => {
  await requestUpdateOrderProcess({ id: props.data.orderInfo?.id! })
  ElMessage.success("更新工单流程成功")
}

/** 检验流程完整性 */
const onCheckFlowClick = async () => {
  await requestCheckOrderProcess({
    orderId: props.data.orderInfo?.id!,
    id: craftRouteForm.id
  })
  ElMessage.success("校验成功，已满足生产要求")
}

/** 同步为工艺路线 */
const onSyncToCraftRouteClick = async () => {
  syncToCraftRouteVisible.value = true
}

/** 过程控制计划保存 */
const onProcessControlPlanSave = (data: IProcessControlRow[]) => {
  // TODO: 调用API保存过程控制计划数据
  console.log('保存过程控制计划:', data)
}
</script>

<style lang="scss" scoped>
.craft-route-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  color: #303133;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tabs-header .el-tabs {
  flex: 1;
}

.tabs-actions {
  display: flex;
  gap: 8px;
}

.craft-route-form {
  .el-form-item {
    width: 25%;
    min-width: 300px;
    margin-right: 0;
  }
}

.craft-route-info {
  &::after {
    content: "";
    display: block;
    width: calc(100% + 40px);
    height: 1px;
    background-color: #e4e7ed;
    margin: 6px 0 0 -20px;
  }
}

.info-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 12px;
}
</style>
