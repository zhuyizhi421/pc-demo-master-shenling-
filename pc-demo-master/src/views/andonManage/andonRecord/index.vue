<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="Andon记录"></CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #status-default="{ row }">
            <el-tag v-if="row.status === EnumAndonRecordStatus.CONFIRMED" type="success">{{
              andonRecordStatusToMap[row.status]
            }}</el-tag>
            <el-tag v-else-if="row.status === EnumAndonRecordStatus.WAITING" type="danger">{{
              andonRecordStatusToMap[row.status]
            }}</el-tag>
            <el-tag v-else-if="row.status === EnumAndonRecordStatus.PROCESSING" type="primary">{{
              andonRecordStatusToMap[row.status]
            }}</el-tag>
            <el-tag
              v-else-if="row.status === EnumAndonRecordStatus.WAITING_CONFIRM"
              type="warning"
              >{{ andonRecordStatusToMap[row.status] }}</el-tag
            >
          </template>

          <template #andonFeedback-default="{ row }">
            <el-tag v-if="row.andonFeedback === EnumAndonFeedback.NO" type="danger">否</el-tag>
            <el-tag v-else type="success">是</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button type="primary" size="small" link @click="onReviewDetailClick(row)"
              >查看详情</el-button
            >
            <el-button
              type="primary"
              v-if="
                row.status === EnumAndonRecordStatus.CONFIRMED &&
                row.andonFeedback !== EnumAndonFeedback.NO
              "
              size="small"
              link
              @click="onReviewFeedbackClick(row)"
            >
              {{ row.andonFeedback === EnumAndonFeedback.YES && isAuth ? "维修反馈" : "查看反馈" }}
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

    <!-- 维修反馈及查看 -->
    <CustomDialog
      draggable
      title="维修反馈"
      v-model="feedbackDialogVisible"
      @close="onCloseFeedbackDialog()"
      size="medium"
    >
      <CustomForm
        v-model="putBackForm"
        :configs="feedbackFormConfigs"
        :labelWidth="90"
        :columns="2"
      />
      <CustomTitle title="维修使用的备品备件" class="!mt-0">
        <el-button
          type="primary"
          :disabled="isDisabled"
          icon="Plus"
          @click="mroDialogVisible = true"
          >新增备品备件</el-button
        >
      </CustomTitle>
      <CustomTable :config="feedbackTableConfig" v-model:table-data="feedbackTableData">
        <template #lifeSpan-default="{ row: { lifeSpan } }">
          {{ formatPercent(lifeSpan) }}
        </template>
        <template #mroModelId-default="{ row }">
          {{ row.mroModelVo?.mroModelName || "--" }}
        </template>
        <template #name-default="{ row }">
          {{ row.mroModelVo?.mroCategoryName || "--" }}
        </template>
        <template #stocks-default="{ row }">
          {{ precisionConversion(row.stocks, row?.decimalNumber ?? 2) }}
        </template>
        <template #unit-default="{ row }">
          {{ row.mroModelVo?.unitModelName || "--" }}
        </template>
        <template #operation-default="scope">
          <el-button
            link
            type="danger"
            :disabled="isDisabled"
            @click="onDeleteFeedbackRowClick(scope.$index)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>
      <template #footer>
        <el-button @click="feedbackDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          v-if="isAuth"
          :disabled="!!putBackForm.id"
          @click="onConfirmFeedbackClick()"
          >确认反馈</el-button
        >
      </template>
    </CustomDialog>

    <!-- 查看详情弹窗 -->
    <CustomDialog size="medium" v-model="detailDialogVisible" title="Andon记录详情">
      <CustomDescription
        :columns="3"
        :data="currentDetailInfo"
        :configs="desclConfig"
        :label-width="100"
        class="!px-0"
      ></CustomDescription>

      <div class="mt-[20px] max-h-[45vh] overflow-y-scroll no-scrollbar">
        <el-timeline class="pl-[5px]" v-if="currentDetailInfo.andonRecordItem?.length">
          <el-timeline-item
            v-for="item in currentDetailInfo.andonRecordItem"
            :key="item.id"
            :timestamp="item.andonExecuteTime"
            placement="top"
            hollow
            type="primary"
          >
            <el-card>
              <div class="text-[#303133] text-[14px] leading-[24px]">
                {{ andonRecordTypeToMap[item.type] ?? "--" }}
              </div>
              <div class="text-[#909399] text-[14px] leading-[24px] mt-[10px]">
                <template v-if="item.type === EnumAndonRecordType.TRIGGER">
                  <div>生产区域：{{ item.entityName }}</div>
                  <div>设备：{{ item.equipmentName }}</div>
                  <div>来源：{{ item.triggerTypeName }}</div>
                </template>
                <template v-else-if="item.type === EnumAndonRecordType.PROCESS">
                  <div>
                    处理人：
                    {{ item.andonExecuteEmpName }}
                  </div>
                  <div>响应耗时：{{ item.andonConsumeTime }}</div>
                  <div>
                    是否停产：{{ andonExecuteResultToMap[item.andonExecuteResult] || "--" }}
                  </div>
                </template>
                <template v-else-if="item.type === EnumAndonRecordType.CLOSE">
                  <div>
                    关闭人：
                    {{ item.andonExecuteEmpName }}
                  </div>
                  <div>处理耗时：{{ item.andonConsumeTime }}</div>
                  <div>故障：{{ item.andonFaultName }}</div>
                  <div>故障类型：{{ item.andonFaultCategoryName }}</div>
                </template>
                <template v-else-if="item.type === EnumAndonRecordType.CONFIRM">
                  <div>
                    确认结果：{{ andonExecuteResultToMap[item.andonExecuteResult] || "--" }}
                  </div>
                </template>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">返 回</el-button>
        <!-- <el-button type="primary" @click="detailDialogVisible = false">确 认</el-button> -->
      </template>
    </CustomDialog>

    <!-- 选择MRO弹窗 -->
    <SelectMroDialog
      v-model="mroDialogVisible"
      :selected-row-keys="selectedMroIds"
      fixed-mro-cate="备品备件"
      multiple
      @success="onMROCallback"
    />

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="[putBackForm.userIds]"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestSystemFaultTree } from "@/api/baseInfo/system-fault/system-fault"
import { getAndonCascadeTree } from "@/api/operation/andon/andonModel"
import {
  andonExecuteResultToMap,
  andonRecordStatusToMap,
  andonRecordTypeToMap,
  EnumAndonFeedback,
  EnumAndonRecordStatus,
  EnumAndonRecordType,
  feedBackAndon,
  getAndonRecordItemById,
  getAndonRecordPaged,
  getFeedbackInfo
} from "@/api/operation/andon/andonRecord"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
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
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser, EnumSystemFaultType } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { IAndonRecordItem as ITableRow, IAndonRecordParams } from "@/types/maintain/andon"
import { formatPercent, precisionConversion } from "@/utils/common"

defineOptions({
  name: "AndonRecord"
})

const isAuth = useButtonAuth("AndonRecord_update", "AndonRecord_query")

const andonCascaderOptions = ref<any[]>([])
const andonFaultCascaderOptions = ref<any[]>([])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Cascader,
    key: "andonId",
    label: "Andon名称",
    value: "",
    placeholder: "请选择Andon名称",
    options: andonCascaderOptions,
    props: {
      emitPath: false,
      children: "andonTreeNodeList",
      value: "id",
      label: "name"
    }
  },
  {
    type: EnumComponentType.Area,
    key: "entityId",
    label: "生产区域",
    value: "",
    placeholder: "请选择生产区域",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true
    }
  },
  {
    type: EnumComponentType.Cascader,
    key: "andonFaultId",
    label: "故障",
    value: "",
    placeholder: "请选择故障",
    options: andonFaultCascaderOptions,
    props: {
      emitPath: false,
      children: "faultTreeNodeList",
      value: "id",
      label: "name"
    }
  },
  {
    type: EnumComponentType.Input,
    key: "no",
    label: "编号",
    value: "",
    placeholder: "请输入编号"
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "触发时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["andonTriggerTimeStart", "andonTriggerTimeEnd"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  andonId?: string
  entityId?: string
  andonFaultId?: string
  no?: string
  andonTriggerTimeStart?: string
  andonTriggerTimeEnd?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const [putBackForm, resetBackForm] = useResetRef<any>({
  id: "",
  userIds: "",
  faultDesc: "",
  faultHandlerMethod: "",
  remark: "",
  faultReason: ""
})

const detailDialogVisible = ref(false) // 查看详情弹窗显示标识
const currentRowData = ref<any>({}) // 当前选中表格行数据
const currentDetailInfo = ref<any>({}) // 当前选中表格行对应的andon记录详情数据
const feedbackDialogVisible = ref(false) // 维修反馈及查看弹窗显示标识
const feedbackTableData = ref<any[]>([]) // 维修反馈弹窗表格数据
const feedbackFormRef = ref<InstanceType<typeof CustomForm>>() // 维修反馈弹窗表单引用

const mroDialogVisible = ref(false) // 选择MRO弹窗显示标识
const selectedMroIds = computed(() => feedbackTableData.value.map((item) => item.id))

const isDisabled = computed(() => !!putBackForm.value.id || !isAuth)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "编号",
      width: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "andonName",
      label: "Andon名称",
      width: 160
    },
    {
      prop: "andonCategoryName",
      label: "Andon类型",
      width: 160
    },
    {
      prop: "andonTriggerTime",
      label: "触发时间",
      width: 160
    },
    {
      prop: "entityName",
      label: "生产区域",
      width: 160
    },
    {
      prop: "equipmentName",
      label: "设备",
      width: 160
    },
    {
      prop: "andonFaultName",
      label: "故障",
      width: 160
    },
    {
      prop: "andonFaultCategoryName",
      label: "故障类型",
      width: 160
    },
    {
      prop: "andonFeedback",
      label: "维修反馈",
      width: 120,
      align: "center",
      slots: {
        default: "andonFeedback-slots"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 150,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IAndonRecordParams], ITableRow, true> = {
  api: getAndonRecordPaged,
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

/** 维修反馈及查看表单配置 */
const feedbackFormConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    field: "userIds",
    label: "维修人",
    rules: [
      {
        required: true,
        message: "请选择维修人",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      clearable: true,
      disabled: isDisabled.value,
      customChildren: selectedPersonList.value.map((item) => {
        return {
          componentType: "el-option",
          props: {
            label: item.label,
            value: item.value
          }
        }
      })
    },
    events: {
      visibleChange: onSelectPersonVisibleChange
    }
  },
  {
    componentType: "el-input",
    field: "faultReason",
    label: "故障分析",
    rules: [
      {
        required: false,
        message: "请输入故障分析",
        trigger: "blur"
      }
    ],
    props: {
      disabled: isDisabled.value,
      placeholder: "请输入"
    }
  },
  {
    componentType: "el-input",
    field: "faultDesc",
    label: "故障描述",
    rules: [
      {
        required: false,
        message: "请输入故障描述",
        trigger: "blur"
      }
    ],
    props: {
      disabled: isDisabled.value,
      placeholder: "请输入"
    }
  },
  {
    componentType: "el-input",
    field: "faultHandlerMethod",
    label: "解决措施",
    rules: [
      {
        required: false,
        message: "请输入解决措施",
        trigger: "blur"
      }
    ],
    props: {
      disabled: isDisabled.value,
      placeholder: "请输入"
    }
  }
])

/** 维修反馈及查看表格配置 */
const feedbackTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: "300",
  columns: [
    {
      prop: "mroNo",
      label: "MRO编号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "lifeSpan",
      label: "寿命",
      width: 160,
      showOverflowTooltip: true,
      slots: {
        default: "lifeSpan-default"
      }
    },
    {
      prop: "mroModelId",
      label: "MRO型号",
      width: 160,
      showOverflowTooltip: true,
      slots: {
        default: "mroModelId-default"
      }
    },
    {
      prop: "name",
      label: "MRO类型",
      width: 160,
      showOverflowTooltip: true,
      slots: {
        default: "name-default"
      }
    },
    {
      prop: "stocks",
      label: "数量",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      slots: {
        default: "stocks-default"
      }
    },
    {
      prop: "name",
      label: "单位",
      width: 90,
      showOverflowTooltip: true,
      slots: {
        default: "unit-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      width: 200,
      showOverflowTooltip: true
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
}))

/** 查看详情描述配置 */
const desclConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "andonName",
    label: "Andon名称："
  },
  {
    field: "no",
    label: "编号："
  },
  {
    field: "andonCategoryName",
    label: "Andon类型："
  },
  {
    field: "andonHandlerNames",
    label: "处理对象：",
    formatter: (params) => {
      return params.data.andonHandlerNames.join(",")
    }
  },
  {
    field: "andonFeedback",
    label: "维修反馈：",
    formatter: (params) => {
      return params.data.andonFeedback === EnumAndonFeedback.YES ? "是" : "否"
    }
  },
  {
    field: "remarks",
    label: "备注："
  }
])

onMounted(async () => {
  await getAndonCascadeTreeOptions()
  await getSysFaultCascadeOptions()
  customTableRef.value?.requestData()
})

const getAndonCascadeTreeOptions = async () => {
  const res = await getAndonCascadeTree()
  andonCascaderOptions.value = transformAndonTree(res)
}

/** 转换树结构 */
const transformAndonTree = (list: any[]) => {
  const rows = Array.isArray(list) ? list : []
  // 统一label名称
  return rows.map((item) => {
    if (item.andonTreeNodeList && item.andonTreeNodeList.length) {
      item.andonTreeNodeList = transformAndonTree(item.andonTreeNodeList)
    }
    item.name = item.categoryName || item.andonName || ""
    return item
  })
}

const getSysFaultCascadeOptions = async () => {
  const res = await requestSystemFaultTree(EnumSystemFaultType.Andon)
  andonFaultCascaderOptions.value = transformFaultTree(res)
}

const transformFaultTree = (list: any[]) => {
  const rows = Array.isArray(list) ? list : []
  return rows.map((item) => {
    if (item.faultTreeNodeList && item.faultTreeNodeList.length) {
      item.faultTreeNodeList = transformFaultTree(item.faultTreeNodeList)
    }
    item.name = item.categoryName || item.faultName || ""
    return item
  })
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 查看andon记录详情 */
const onReviewDetailClick = async (data: any) => {
  const res = await getAndonRecordItemById(data.id)
  currentDetailInfo.value = res
  currentRowData.value = data
  detailDialogVisible.value = true
}

/** 反馈维修/查看反馈 */
const onReviewFeedbackClick = async (data: any) => {
  currentRowData.value = data

  if (data.andonFeedback === EnumAndonFeedback.VIEW) {
    // 查看反馈
    const res = await getFeedbackInfo(data.andonFeedbackId || "")
    putBackForm.value = {
      id: res.id,
      userIds: res.repairEmp.id,
      faultDesc: res.faultDesc,
      faultHandlerMethod: res.faultHandlerMethod,
      remark: res.remark,
      faultReason: res.faultReason
    }
    feedbackTableData.value = res.mroList
    selectedPersonList.value = [{ label: res.repairEmp.name, value: res.repairEmp.id }]
  }

  feedbackDialogVisible.value = true
}

/** 删除维修反馈行 */
const onDeleteFeedbackRowClick = (index: number) => {
  feedbackTableData.value.splice(index, 1)
}

/** 关闭反馈弹窗 */
const onCloseFeedbackDialog = () => {
  resetBackForm()
  feedbackTableData.value = []
}

/** 提交反馈 */
const onConfirmFeedbackClick = async () => {
  await feedbackFormRef.value?.validateForm()
  const params = {
    andonRecordId: currentRowData.value?.id || "",
    faultDesc: putBackForm.value.faultDesc,
    faultHandlerMethod: putBackForm.value.faultHandlerMethod,
    faultReason: putBackForm.value.faultReason,
    mroIds: feedbackTableData.value?.map((item) => item.id) || [],
    repairEmpId: putBackForm.value.userIds
  }
  await feedBackAndon(params)
  ElMessage.success("反馈成功")
  feedbackDialogVisible.value = false
  customTableRef.value?.requestData()
}

/** 确认选择MRO回调 */
const onMROCallback = (data: any[]) => {
  data.forEach((item) => {
    if (feedbackTableData.value.findIndex((i) => i.id === item.id) === -1) {
      feedbackTableData.value.push(item)
    }
  })
}

/** 选择处理对象下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  putBackForm.value.userIds = data[0].id
}
</script>

<style scoped lang="scss">
.andonRecordManage {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.titleTableBox {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.el-table) {
    flex: 1;
    margin-bottom: 16px;
  }
}

.chart {
  flex: 1;
}
</style>
