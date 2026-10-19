<template>
  <div class="create-preparation-material-plan">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!props.selectId ? '新建领料计划' : '编辑领料计划'"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="物料清单" :is-table-title="false" show-short-bar>
        <el-button
          type="primary"
          :disabled="!formData.orderId && !formData.taskId"
          @click="onAddMaterialClick"
          >新增物料</el-button
        >
      </CustomTitle>

      <CustomTable v-model:table-data="tableData" :config="tableConfig" class="custom-table">
        <template #prepareQuantity-default="{ row, $index }">
          <NoNegativeInput v-model="row.prepareQuantity" @blur="onTableBlur($index)" />
        </template>

        <template #operation-default="{ row, $index }">
          <el-button
            v-if="row.replaceList?.length > 0"
            link
            type="primary"
            size="small"
            @click="openMaterialReplaceDialog(row, $index)"
            >替代料
          </el-button>
          <el-button link type="danger" size="small" @click="deleteMaterial($index)"
            >删除
          </el-button>
        </template>
      </CustomTable>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onSaveClick()">{{
        props.selectId ? "保存" : "创建"
      }}</el-button>
    </div>
  </div>

  <!-- 选择委外订单弹窗 -->
  <SelectOutsourceOrderDialog
    v-model="selectOutsourceOrderVisible"
    :selected-row-keys="[formData.orderId]"
    :status="[EnumOutsourcingOrderStatus.REVIEWED, EnumOutsourcingOrderStatus.RECEIVED]"
    @success="onSelectOutsourceOrderSuccess"
  />

  <!-- 选择生产任务弹窗 -->
  <SelectProductTaskDialog
    v-model="selectTaskVisible"
    :selected-row-keys="[formData.taskId]"
    :status="[
      EnumProductionTaskStatus.REVIEWED,
      EnumProductionTaskStatus.RUNNING,
      EnumProductionTaskStatus.PAUSE
    ]"
    @success="onSelectProductTaskSuccess"
  />

  <!-- 替代料编辑弹窗 -->
  <ReplaceMaterialDialog
    :replaceNeedAmount="replaceNeedAmount"
    :tableData="replaceTableData"
    v-model="replaceMaterialVisible"
    @close="replaceMaterialVisible = false"
    @success="onReplaceMaterialSuccess"
  />

  <!-- 选择料弹窗 -->
  <SelectMaterialModel
    v-model="materialSelectVisible"
    :selectedList="tableData"
    :useFor="formData.useFor"
    :delegateOrderId="formData.orderId"
    :productionTaskId="formData.taskId"
    @on-ok="onSelectMaterialSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryOutsourcingOrderPageList } from "@/api/logistics/delegate"
import {
  queryPreparationMaterialPlanDetail,
  requestCreatePreparationMaterialPlan,
  requestDelegateCandidateProductModels,
  requestProductCandidateProductModels,
  requestUpdatePreparationMaterialPlan
} from "@/api/logistics/preparationMaterial"
import { queryProductTaskPageList } from "@/api/scheduling"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import NoNegativeInput from "@/components/NoNegativeInput/index.vue"
import SelectOutsourceOrderDialog from "@/components/SelectOutsourceOrderDialog/index.vue"
import SelectProductTaskDialog from "@/components/SelectProductTaskDialog/index.vue"
import {
  EnumGetMaterialPurpose,
  EnumGetMaterialPurposeMap,
  EnumOutsourcingOrderStatus,
  EnumOutsourcingOrderStatusMap,
  EnumPreparationMaterialPlanType,
  EnumPreparationMaterialPlanTypeMap,
  EnumProductionTaskStatus,
  EnumProductionTaskStatusMap
} from "@/constant/enums"
import type { DelegateOrder } from "@/types/logistics/delegate"
import type {
  IPreparationMaterialReplaceItem,
  IPreparationMaterialRes,
  ISelectMaterialModel
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"
import customMath from "@/utils/customMath"

import ReplaceMaterialDialog from "./ReplaceMaterialDialog.vue"
import SelectMaterialModel from "./SelectMaterialModel.vue"

type ITableData = IPreparationMaterialRes & { prepareQuantity?: number }

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const formData = reactive<{
  no: string
  useFor: number
  planTime: string
  type: number
  sourceNo: string
  sourceStatus?: number
  remarks: string
  orderId: string // 委外订单ID
  taskId: string // 生产任务ID
}>({
  no: "",
  useFor: 1,
  planTime: "",
  type: 1,
  sourceNo: "",
  sourceStatus: undefined,
  remarks: "",
  orderId: "",
  taskId: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "计划单号",
    field: "no",
    props: {
      type: "text",
      placeholder: "无输入时系统自动创建",
      maxlength: 50,
      get disabled() {
        return !!props.selectId
      }
    }
  },
  {
    componentType: "el-select",
    label: "领取用途",
    field: "useFor",
    rules: [
      {
        required: true,
        message: "请选择领取用途",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      get customChildren() {
        return Object.keys(EnumGetMaterialPurposeMap)
          .filter((key) =>
            [EnumGetMaterialPurpose.PRODUCTION, EnumGetMaterialPurpose.OUTSOURCING].includes(
              +key as unknown as EnumGetMaterialPurpose
            )
          )
          .map((key) => {
            return {
              componentType: "el-option",
              props: {
                label: EnumGetMaterialPurposeMap[key as unknown as EnumGetMaterialPurpose],
                value: +key
              }
            }
          })
      }
    },
    events: {
      change: onUseForChange
    }
  },
  {
    componentType: "el-date-picker",
    label: "计划领料时间",
    field: "planTime",
    rules: [
      {
        required: true,
        message: "请选择计划领料时间",
        trigger: "change"
      }
    ],
    props: {
      type: "datetime",
      placeholder: "请选择",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD HH:mm:ss",
      get disabledDate() {
        return disabledDate
      }
    }
  },
  {
    componentType: "el-select",
    label: "类型",
    field: "type",
    rules: [
      {
        required: true,
        message: "请选择类型",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      get customChildren() {
        return Object.keys(EnumPreparationMaterialPlanTypeMap).map((key) => {
          return {
            componentType: "el-option",
            props: {
              label:
                EnumPreparationMaterialPlanTypeMap[
                  key as unknown as EnumPreparationMaterialPlanType
                ],
              value: +key
            }
          }
        })
      }
    },
    events: {
      change: onTypeChange
    }
  },
  {
    componentType: "el-input",
    label: "来源单号",
    field: "sourceNo",
    rules: [
      {
        required: true,
        message: "请选择来源单号",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择订单",
      maxlength: 50,
      readonly: true
    },
    events: {
      click: openSelectOrderDialog
    }
  },
  {
    componentType: "el-select",
    label: "任务状态",
    field: "sourceStatus",
    props: {
      placeholder: "请选择",
      get customChildren() {
        return Object.keys(statusMap.value).map((key) => {
          return {
            componentType: "el-option",
            props: {
              label:
                statusMap.value[
                  key as unknown as EnumProductionTaskStatus & EnumOutsourcingOrderStatus
                ],
              value: +key
            }
          }
        })
      },
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
      showWordLimit: true
    }
  }
])

const tableData = ref<ITableData[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      minWidth: 160
    },
    {
      prop: "needAmount",
      label: "生产需求数量",
      width: 120,
      align: "right",
      formatter: (row: ITableData) => {
        return precisionConversion(row.needAmount, row.decimalNumber)
      }
    },
    {
      prop: "pickedAmount",
      label: "已计划数量",
      width: 120,
      align: "right",
      formatter: (row: ITableData) => {
        return precisionConversion(row.pickedAmount, row.decimalNumber)
      }
    },
    {
      prop: "backAmount",
      label: "退料数量",
      width: 120,
      align: "right",
      formatter: (row: ITableData) => {
        return precisionConversion(row.backAmount, row.decimalNumber)
      }
    },
    {
      prop: "unPickAmount",
      label: "待计划数量",
      width: 120,
      align: "right",
      formatter: (row: ITableData) => {
        return precisionConversion(row.unPickAmount, row.decimalNumber)
      }
    },
    {
      prop: "stockNumber",
      label: "在库数量",
      width: 120,
      align: "right",
      formatter: (row: ITableData) => {
        return precisionConversion(row.stockNumber, row.decimalNumber)
      }
    },
    {
      prop: "overPickRate",
      label: "超领比",
      width: 120,
      align: "center",
      formatter: (row: ITableData) => {
        return row.overPickRate !== null && row.overPickRate !== undefined
          ? row.overPickRate + "%"
          : ""
      }
    },
    {
      prop: "prepareQuantity",
      label: "计划领取数量",
      width: 160,
      align: "center",
      slots: {
        default: "prepareQuantity-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
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

const replaceNeedAmount = ref(0)
const replaceTableData = ref<IPreparationMaterialReplaceItem[]>([])
const replaceIndex = ref(-1)

const statusMap = computed(() => {
  return formData.useFor === EnumGetMaterialPurpose.PRODUCTION
    ? EnumProductionTaskStatusMap
    : EnumOutsourcingOrderStatusMap
})
const selectOutsourceOrderVisible = ref(false) // 选择委外订单弹窗是否可见
const selectTaskVisible = ref(false) // 选择任务弹窗是否可见

const replaceMaterialVisible = ref(false) // 替代料编辑弹窗显示标识
const materialSelectVisible = ref(false)

onBeforeMount(() => {
  if (props.selectId) {
    getPreparationMaterialPlanDetail(props.selectId)
  }
})

/** 切换“领取用途” */
function onUseForChange() {
  formData.sourceNo = ""
  formData.sourceStatus = undefined
  formData.orderId = ""
  formData.taskId = ""
  tableData.value = []
}

// 计划领取时间大于当前时间
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 3600 * 1000
}

const validateTableData = () => {
  for (let item of tableData.value) {
    if (!item.prepareQuantity && item.prepareQuantity !== 0) {
      ElMessage.warning("请输入计划领取数量")
      return false
    }
    if (item.prepareQuantity < 0) {
      ElMessage.warning("计划领取数量必须大于等于0")
      return false
    }
    if (formData.type === EnumPreparationMaterialPlanType.NORMAL) {
      // 正常领料
      // 计算规则：生产需求数量-已计划数量+退料数量
      if (
        item.prepareQuantity >
        customMath.add(customMath.subtract(item.needAmount, item.pickedAmount), item.backAmount)
      ) {
        ElMessage.warning("已超领")
        return false
      }
    } else if (formData.type === EnumPreparationMaterialPlanType.OVER) {
      // 超领领料
      // 计算规则：生产需求数量*(1+超领比)-已计划数量+退料数量
      if (
        item.prepareQuantity >
        customMath.add(
          customMath.subtract(
            customMath.multiply(item.needAmount, customMath.add(1, item.overPickRate / 100)),
            item.pickedAmount
          ),
          item.backAmount
        )
      ) {
        ElMessage.warning("已超领")
        return false
      }
    }
  }
  return true
}

/** 切换“类型” */
function onTypeChange() {
  // 切换“类型”时，进行物料清单校验
  tableData.value = tableData.value.map((item) => {
    const list = item.replaceList?.map((val) => {
      return {
        ...val,
        quantity: 0
      }
    })
    return {
      ...item,
      prepareQuantity: formData.type == 2 ? 0 : Math.min(item.stockNumber, item.unPickAmount),
      replaceList: list || []
    }
  })
  validateTableData()
}

/** 点击来源单号，依据“领取用途”打开不同弹窗 */
const openSelectOrderDialog = () => {
  if (formData.useFor === EnumGetMaterialPurpose.PRODUCTION) {
    // 生产
    selectTaskVisible.value = true
  } else if (formData.useFor === EnumGetMaterialPurpose.OUTSOURCING) {
    // 委外
    selectOutsourceOrderVisible.value = true
  }
}

/** 选择委外订单成功回调 */
const onSelectOutsourceOrderSuccess = async (data: DelegateOrder[]) => {
  let order = data[0]
  if (order) {
    formData.sourceNo = order.no!
    formData.orderId = order.id!
    formData.sourceStatus = order.status
    tableData.value = await getTableListFromSource()
  } else {
    formData.sourceNo = ""
    formData.orderId = ""
    formData.sourceStatus = undefined
    tableData.value = []
  }
}

/** 选择生产任务成功回调 */
const onSelectProductTaskSuccess = async (data: any[]) => {
  let task = data[0]
  if (task) {
    formData.sourceNo = task.no
    formData.taskId = task.id
    formData.sourceStatus = task.status
    tableData.value = await getTableListFromSource()
  } else {
    formData.sourceNo = ""
    formData.taskId = ""
    formData.sourceStatus = undefined
    tableData.value = []
  }
}

const getTableListFromSource = async (): Promise<ITableData[]> => {
  try {
    if (formData.useFor === EnumGetMaterialPurpose.OUTSOURCING) {
      const res = await requestDelegateCandidateProductModels(formData.orderId)
      return res
        .filter((item) => item.defaultPrepare)
        .map((item: ISelectMaterialModel) => {
          const unPickAmount = Math.min(item.needAmount, item.unPickAmount)
          return {
            ...item,
            prepareQuantity: unPickAmount,
            unPickAmount
          }
        })
    } else {
      const res: any = await requestProductCandidateProductModels(formData.taskId)
      return res
        .filter((item: any) => item.defaultPrepare)
        .map((item: ISelectMaterialModel) => {
          const unPickAmount = Math.min(item.needAmount, item.unPickAmount)
          return {
            ...item,
            prepareQuantity: unPickAmount,
            unPickAmount
          }
        })
    }
  } catch (error) {
    return []
  }
}

/** 获取领料计划详情 */
const getPreparationMaterialPlanDetail = async (id: string) => {
  const data = await queryPreparationMaterialPlanDetail(id)
  if (data) {
    formData.no = data.no
    formData.useFor = data.useFor
    formData.planTime = data.planTime
    formData.type = data.type
    formData.sourceNo = data.sourceNo
    formData.sourceStatus = data.sourceStatus
    formData.remarks = data.remarks
    tableData.value = data.itemList.map((item) => {
      const pickedAmount = customMath.subtract(item.pickedAmount, item.planAmount)
      const unPickAmount = Math.min(
        customMath.add(customMath.subtract(item.needAmount, pickedAmount), item.backAmount),
        item.needAmount
      )
      return {
        ...item,
        pickedAmount,
        unPickAmount,
        prepareQuantity: item.planAmount
      }
    })
    if (formData.useFor === EnumGetMaterialPurpose.PRODUCTION) {
      getProductTaskDetail(formData.sourceNo)
    } else {
      getDelegateOrderDetail(formData.sourceNo)
    }
  }
}

/** 获取委外订单详情 */
const getDelegateOrderDetail = async (no: string) => {
  const { records } = await queryOutsourcingOrderPageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 10
    },
    queryParam: {
      no
    }
  })
  if (records?.length) {
    formData.orderId = String(records[0].id)
  }
}

/** 获取生产订单详情 */
const getProductTaskDetail = async (no: string) => {
  const { records } = await queryProductTaskPageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 10
    },
    queryParam: {
      productionTaskNo: no
    }
  })
  if (records?.length) {
    formData.taskId = String(records[0].id)
  }
}

/** 新增物料 */
const onAddMaterialClick = () => {
  materialSelectVisible.value = true
}

/** 物料清单输入框失去焦点 */
const onTableBlur = (index: number) => {
  let list = tableData.value[index].replaceList?.map((item, i) => {
    return {
      ...item,
      quantity: i === 0 ? +tableData.value[index].prepareQuantity! : 0
    }
  })
  tableData.value[index].replaceList = list || []
}

/** 删除物料 */
const deleteMaterial = (index: number) => {
  tableData.value.splice(index, 1)
}

/** 替代料成功回调 */
const onReplaceMaterialSuccess = (data: IPreparationMaterialReplaceItem[]) => {
  tableData.value[replaceIndex.value].replaceList = data
  replaceIndex.value = -1
  replaceMaterialVisible.value = false
}

/** 打开替代料编辑弹窗 */
const openMaterialReplaceDialog = (row: ITableData, index: number) => {
  replaceNeedAmount.value = row?.prepareQuantity ? +row.prepareQuantity : 0
  replaceTableData.value = row.replaceList
  replaceIndex.value = index
  replaceMaterialVisible.value = true
}

/** 新增料的成功回调 */
const onSelectMaterialSuccess = (data: ISelectMaterialModel[]) => {
  let arr: ITableData[] = []
  if (data?.length) {
    data.forEach((item: ISelectMaterialModel) => {
      let index = tableData.value.findIndex((row) => item.productModelId === row.productModelId)
      if (index > -1) {
        arr.push(tableData.value[index])
      } else {
        const prepareQuantity = item.unPickAmount
        arr.push({
          ...item,
          prepareQuantity,
          unPickAmount: Math.min(item.needAmount, item.unPickAmount)
        })
      }
    })
  } else {
    arr = []
  }
  tableData.value = arr
  materialSelectVisible.value = true
}

/** 保存操作 */
const onSaveClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (!valid) {
    return
  }
  const tableValid = validateTableData()

  if (!tableValid) return

  // 保存时，必须保证至少有一个物料领料数量大于0
  const rowValid = tableData.value.some((item) => item.prepareQuantity! > 0)
  if (!rowValid) {
    ElMessage.warning("物料清单至少需要一个物料计划领取数量大于0")
    return
  }

  let detailList = tableData.value.map((item) => {
    return {
      prepareQuantity: item.prepareQuantity!,
      productModelId: item.productModelId,
      unitId: item.unitId,
      replaceList: item.replaceList || []
    }
  })
  let params = {
    id: props.selectId,
    no: formData.no,
    useFor: formData.useFor,
    planTime: formData.planTime,
    type: formData.type,
    sourceNo: formData.sourceNo,
    remarks: formData.remarks,
    productList: detailList
  }
  if (props.selectId) {
    await requestUpdatePreparationMaterialPlan(params)
    ElMessage.success("编辑成功")
  } else {
    await requestCreatePreparationMaterialPlan(params)
    ElMessage.success("新建成功")
  }
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.create-preparation-material-plan {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--g-color);
}

.top-back {
  margin: 12px 20px;
}

.top-content {
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  overflow: hidden;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
