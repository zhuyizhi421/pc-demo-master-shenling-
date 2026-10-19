<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content" style="flex: 1; display: block" v-loading="loading">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="基础信息" :showShortBar="false">
        <el-button link type="primary" @click="isBaseInfoCollapsed = !isBaseInfoCollapsed">
          {{ isBaseInfoCollapsed ? "展开" : "收起" }}
        </el-button>
      </CustomTitle>
      <el-collapse-transition>
        <div v-show="!isBaseInfoCollapsed">
          <CustomDescription :data="detailData || {}" :configs="baseInfoConfigs">
            <template #equipmentNo-content>
              <el-button link type="primary" size="small" @click="deviceInfoVisible = true">
                {{ detailData?.equipmentNo }}
              </el-button>
            </template>

            <template #equipmentName-content>
              <el-button link type="primary" size="small" @click="deviceInfoVisible = true">
                {{ detailData?.equipmentName }}
              </el-button>
            </template>
          </CustomDescription>
        </div>
      </el-collapse-transition>

      <CustomTitle title="处理反馈" :showShortBar="false" />
      <el-tabs v-model="activeFeedbackTab" class="detail-tabs">
        <el-tab-pane label="处理反馈" :name="EnumFeedbackTabs.Form">
          <el-form
            ref="formRef"
            class="feedback-form"
            label-width="100px"
            :model="feedbackForm"
            :rules="formRules"
          >
            <div class="feedback-grid">
              <el-form-item label="故障描述" prop="faultDescription">
                <el-input
                  v-model.trim="feedbackForm.faultDescription"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!canSubmitFeedback"
                  placeholder="请输入故障描述"
                />
              </el-form-item>

              <el-form-item label="故障分析" prop="analysis">
                <el-input
                  v-model.trim="feedbackForm.analysis"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!canSubmitFeedback"
                  placeholder="请输入故障分析"
                />
              </el-form-item>

              <el-form-item label="解决措施" prop="solutionMeasures">
                <el-input
                  v-model.trim="feedbackForm.solutionMeasures"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!canSubmitFeedback"
                  placeholder="请输入解决措施"
                />
              </el-form-item>

              <el-form-item label="结果" prop="solution">
                <el-select
                  v-model="feedbackForm.solution"
                  class="w-full"
                  :disabled="!canSubmitFeedback"
                  placeholder="请选择结果"
                >
                  <el-option
                    v-for="item in resultOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>

          <div class="feedback-action">
            <div>
              <span v-show="showSubmitButton && !canSubmitFeedback" class="submit-tip">
                {{ submitDisableReason }}
              </span>
            </div>

            <el-button
              v-show="showSubmitButton"
              type="primary"
              :loading="submitLoading"
              :disabled="!canSubmitFeedback"
              @click="onSubmitFeedback"
            >
              提交反馈
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="异常工单附件" :name="EnumFeedbackTabs.Attachments">
          <div class="attachment-box">
            <div class="attachment-operation" v-if="showSubmitButton">
              <UploadFile
                v-model="attachmentList"
                :limit="10"
                :show-tip="false"
                :show-file-list="false"
                multiple
                @success="onUploadSuccess"
              >
                <el-button icon="Upload" plain :disabled="!canSubmitFeedback">上传附件</el-button>
              </UploadFile>
            </div>

            <el-table :data="attachmentTableData" border class="attachment-table">
              <el-table-column
                prop="fileName"
                label="文件名"
                min-width="220"
                show-overflow-tooltip
              />
              <el-table-column label="操作" width="160" align="center" fixed="right">
                <template #default="{ row, $index }">
                  <el-button link type="primary" @click="onDownloadAttachment(row)">下载</el-button>
                  <el-button
                    v-if="showSubmitButton"
                    link
                    type="danger"
                    :disabled="!canSubmitFeedback"
                    @click="onDeleteAttachment($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

      <CustomTitle title="异常明细" :showShortBar="false" />
      <el-table :data="sourceItemList" border class="source-table">
        <el-table-column
          prop="inspectionName"
          label="巡检项名称"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="inspectionNo"
          label="巡检项编号"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="巡检结果" min-width="100" align="center">
          <template #default="{ row }">
            {{ inspectionResultMap[Number(row.inspectionResult ?? 2)] || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inspectionMethod"
          label="检测方式"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="检验标准类型" min-width="120" align="center">
          <template #default="{ row }">
            {{
              EnumMROMaintenanceStandardTypeMap[
                row?.inspectionStandard?.standardType as EnumMROMaintenanceStandardType
              ] || "-"
            }}
          </template>
        </el-table-column>
        <el-table-column label="检验标准" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ typeNumberHandle(row?.inspectionStandard as any) || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="practicalValue" label="实测值" min-width="100" />
        <el-table-column label="单位" width="100" align="center">
          <template #default="{ row }">
            {{ row?.inspectionStandard?.unitName || row?.unitName || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="巡检人" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatEmployeeNames(row?.inspectionUsers) }}
          </template>
        </el-table-column>
        <el-table-column label="巡检时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDisplayTime(row?.inspectionTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="上传图片" min-width="180">
          <template #default="{ row }">
            <div v-if="row?.remarkFiles?.length" class="img-list">
              <el-image
                v-for="item in row.remarkFiles"
                :key="item.id"
                :preview-src-list="[formatImgUrlPreview(item.path)]"
                :src="formatImgUrlPreview(item.path)"
                preview-teleported
                class="w-[50px] h-[50px]"
                fit="contain"
              />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="layout-footer">
      <div class="footer-right">
        <el-button @click="emit('close')">关闭</el-button>
      </div>
    </div>

    <DeviceInfo v-model="deviceInfoVisible" :id="detailData?.equipmentId || ''" />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import { fileDownloadHandle } from "@/api/fileResource"
import {
  queryEquipmentExceptionOrderDetail,
  requestSubmitEquipmentExceptionOrderFeedback
} from "@/api/operation/equipment/equipment-exception-order"
import {
  queryEquipmentPatrolTaskDetail,
  queryEquipmentPatrolTaskPageList
} from "@/api/operation/equipment/equipment-patrol-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumMROMaintenanceExceptionStatus,
  EnumMROMaintenanceExceptionStatusMap,
  EnumMROMaintenanceFeedbackSolution,
  EnumMROMaintenanceStandardType,
  EnumMROMaintenanceStandardTypeMap
} from "@/constant/enums"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import useUserStore from "@/store/modules/user"
import type { IFile } from "@/types/base-info/implement-config"
import type {
  IEquipmentExceptionOrderFeedbackParams,
  IEquipmentExceptionOrderPageListItem
} from "@/types/maintain/equipment-manage/equipment-exception-order"
import type {
  IEquipmentPatrolTaskItem,
  IEquipmentPatrolTaskPageItem
} from "@/types/maintain/equipment-manage/equipment-patrol-task"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"

interface IAttachmentRow {
  id?: string
  deploymentId?: string
  fileId?: string
  fileName: string
  path?: string
  size?: number | string
  sourceName?: string
}

type IAttachmentUploadRow = IFile & Partial<IAttachmentRow>

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

defineOptions({
  name: "EquipmentPatrolErrorOrderDetail"
})

const userStore = useUserStore()
const authType = useButtonAuth("PollCheckExpect_update", "PollCheckExpect_query")

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const isBaseInfoCollapsed = ref(false)
const deviceInfoVisible = ref(false)

const detailData = ref<IEquipmentExceptionOrderPageListItem>()
const sourceItemList = ref<IEquipmentPatrolTaskItem[]>([])
const attachmentList = ref<IAttachmentUploadRow[]>([])

enum EnumFeedbackTabs {
  Form = "form",
  Attachments = "attachments"
}

const activeFeedbackTab = ref<EnumFeedbackTabs>(EnumFeedbackTabs.Form)

const resultOptions = [
  { label: "已解决", value: EnumMROMaintenanceFeedbackSolution.UNOBSTRUCTED },
  { label: "维修", value: EnumMROMaintenanceFeedbackSolution.REPAIR },
  { label: "报废", value: EnumMROMaintenanceFeedbackSolution.SCRAP }
]

const inspectionResultMap: Record<number, string> = {
  0: "NG",
  1: "OK",
  2: "未出结果"
}

const feedbackForm = reactive({
  faultDescription: "",
  analysis: "",
  solutionMeasures: "",
  solution: undefined as EnumMROMaintenanceFeedbackSolution | undefined
})

const formRules: FormRules = {
  faultDescription: [{ required: false, message: "请填写故障描述", trigger: "blur" }],
  analysis: [{ required: false, message: "请填写故障分析", trigger: "blur" }],
  solution: [{ required: true, message: "请选择结果", trigger: "change" }]
}

const currentEmpId = computed(() => String((userStore.userInfo as any)?.empId || ""))
const isPending = computed(
  () => Number(detailData.value?.taskStatus) === EnumMROMaintenanceExceptionStatus.PENDING
)
const hasResponsibleUsers = computed(() => Boolean(detailData.value?.responsibleUsers?.length))
const isCurrentResponsible = computed(() => {
  if (!currentEmpId.value) return false
  return true
})
const showSubmitButton = computed(() => authType.value !== AuthType.View && isPending.value)
const canSubmitFeedback = computed(
  () => showSubmitButton.value && hasResponsibleUsers.value && isCurrentResponsible.value
)
const submitDisableReason = computed(() => {
  if (!hasResponsibleUsers.value) return "未指派责任人，无法提交反馈"
  if (!isCurrentResponsible.value) return "仅当前指派责任人可提交反馈"
  return ""
})

const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "-"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : text.replace(/[TZ]/g, " ").trim()
}

const formatEmployeeNames = (list?: { name?: string }[]) =>
  list
    ?.map((item) => item?.name)
    .filter(Boolean)
    .join(",") || "-"

const formatEmployeeNos = (list?: { empNo?: string }[]) =>
  list
    ?.map((item) => item?.empNo)
    .filter(Boolean)
    .join(",") || "-"

const formatExceptionHandlePosition = () => {
  const names = (detailData.value?.exceptionHandlePositionList || [])
    .map((item) => [item.depName, item.positionName].filter(Boolean).join("-"))
    .filter(Boolean)
  if (names.length) return names.join(",")
  return detailData.value?.exceptionHandlePositionName || "-"
}

const baseInfoConfigs = ref<ICustomDescriptionConfig[]>([
  { field: "taskNo", label: "异常单号：" },
  {
    field: "taskStatus",
    label: "状态：",
    formatter: () =>
      EnumMROMaintenanceExceptionStatusMap[
        detailData.value?.taskStatus as EnumMROMaintenanceExceptionStatus
      ]
  },
  {
    field: "createTime",
    label: "生成时间：",
    formatter: () => formatDisplayTime(detailData.value?.createTime)
  },
  {
    field: "source",
    label: "来源：",
    formatter: () => "设备巡检"
  },
  { field: "sourceNo", label: "来源单号：" },
  {
    field: "equipmentNo",
    label: "设备编号：",
    slots: { content: "equipmentNo-content" }
  },
  {
    field: "equipmentName",
    label: "设备名称：",
    slots: { content: "equipmentName-content" }
  },
  { field: "equipmentTypeNo", label: "类型编号：" },
  { field: "equipmentTypeName", label: "类型名称：" },
  { field: "areaName", label: "所属区域：" },
  {
    field: "reportUserName",
    label: "报修人名称：",
    formatter: () => formatEmployeeNames(detailData.value?.reportUsers)
  },
  {
    field: "reportUserId",
    label: "报修人工号：",
    formatter: () => formatEmployeeNos(detailData.value?.reportUsers)
  },
  {
    field: "exceptionHandlePositionName",
    label: "异常处理职位：",
    formatter: () => formatExceptionHandlePosition()
  },
  {
    field: "responsibleUserName",
    label: "责任人姓名：",
    formatter: () => formatEmployeeNames(detailData.value?.responsibleUsers)
  },
  {
    field: "responsibleUserId",
    label: "责任人工号：",
    formatter: () => formatEmployeeNos(detailData.value?.responsibleUsers)
  },
  {
    field: "handleUserName",
    label: "处理人姓名：",
    formatter: () => formatEmployeeNames(detailData.value?.handleUsers)
  },
  {
    field: "handleUserId",
    label: "处理人工号：",
    formatter: () => formatEmployeeNos(detailData.value?.handleUsers)
  }
])

const attachmentTableData = computed(() => attachmentList.value)

const syncFeedbackData = () => {
  feedbackForm.faultDescription = String(detailData.value?.faultDescription || "")
  feedbackForm.analysis = String(detailData.value?.analysis || "")
  feedbackForm.solutionMeasures = String(detailData.value?.solutionMeasures || "")
  const solutionValue = Number(detailData.value?.solution || 0)
  feedbackForm.solution =
    solutionValue > 0 ? (solutionValue as EnumMROMaintenanceFeedbackSolution) : undefined

  attachmentList.value = (detailData.value?.attachmentFileList || []).map((item) => ({
    fileId: String(item.fileId || item.deploymentId || item.id || ""),
    fileName: String(item.fileName || item.sourceName || "未命名附件"),
    size: Number(item.size || 0),
    path: String(item.path || "")
  }))
}

const init = async () => {
  loading.value = true
  try {
    await getPatrolErrorOrderDetail()
    syncFeedbackData()
    await getSourceItemList()
  } finally {
    loading.value = false
  }
}

const getPatrolErrorOrderDetail = async () => {
  const data = await queryEquipmentExceptionOrderDetail(props.id)
  detailData.value = data
}

const getSourceItemList = async () => {
  sourceItemList.value = []
  const sourceTaskId = String(detailData.value?.sourceTaskId || "")
  const sourceNo = String(detailData.value?.sourceTaskNo || detailData.value?.sourceNo || "")
  const sourceItemIds = new Set((detailData.value?.sourceItemIds || []).map((item) => String(item)))

  let taskDetail: IEquipmentPatrolTaskPageItem | undefined

  if (sourceTaskId) {
    taskDetail = await queryEquipmentPatrolTaskDetail(sourceTaskId)
  } else if (sourceNo) {
    const pageData = await queryEquipmentPatrolTaskPageList({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        taskNo: sourceNo
      },
      dateRange: {},
      sort: []
    })
    taskDetail = pageData?.records?.[0]
  }

  const taskItems: IEquipmentPatrolTaskItem[] = Array.isArray(taskDetail?.items)
    ? taskDetail?.items || []
    : []
  sourceItemList.value = sourceItemIds.size
    ? taskItems.filter((item) => sourceItemIds.has(String(item.id)))
    : taskItems
}

const onUploadSuccess = () => {
  attachmentList.value = attachmentList.value.map((item) => ({
    ...item,
    path: item.path || ""
  }))
}

const onDeleteAttachment = (index: number) => {
  attachmentList.value.splice(index, 1)
}

const onDownloadAttachment = async (row: IAttachmentRow) => {
  if (row.path) {
    const link = document.createElement("a")
    link.href = new URL(row.path, window.location.origin).toString()
    link.download = row.fileName || "download"
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }

  const fileId = String(row.fileId || "")
  if (!fileId) return
  await fileDownloadHandle(fileId, row.fileName || "download")
}

const onSubmitFeedback = async () => {
  if (!showSubmitButton.value) return
  if (!canSubmitFeedback.value) {
    ElMessage.error(submitDisableReason.value || "当前无法提交反馈")
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const responsibleUserIds = (detailData.value?.responsibleUsers || [])
    .map((item) => String(item.id || ""))
    .filter(Boolean)
  if (!responsibleUserIds.length) {
    ElMessage.error("请先指派责任人后再反馈")
    return
  }

  submitLoading.value = true
  try {
    const params: IEquipmentExceptionOrderFeedbackParams = {
      id: props.id,
      faultDescription: feedbackForm.faultDescription,
      analysis: feedbackForm.analysis,
      solutionMeasures: feedbackForm.solutionMeasures,
      solution: Number(feedbackForm.solution),
      remarks: feedbackForm.faultDescription,
      handleUserIds: responsibleUserIds,
      responsibleUserIds,
      scrapFileIds: attachmentList.value.map((item) => String(item.fileId || "")).filter(Boolean)
    }
    await requestSubmitEquipmentExceptionOrderFeedback(params)
    ElMessage.success("提交成功")
    await init()
    emit("success")
  } finally {
    submitLoading.value = false
  }
}

watch(
  () => props.id,
  () => {
    if (props.id) {
      init()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.detail-tabs,
.source-table {
  margin-bottom: 16px;
}

.feedback-form {
  padding-right: 8px;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.feedback-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.attachment-box {
  width: 100%;
}

.attachment-operation {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.submit-tip {
  color: var(--el-color-warning);
  font-size: 12px;
}

@media (max-width: 1280px) {
  .feedback-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
