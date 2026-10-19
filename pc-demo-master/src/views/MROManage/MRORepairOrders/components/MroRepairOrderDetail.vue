<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content" style="flex: 1; display: block" v-loading="loading">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="基础信息" :show-short-bar="false">
        <el-button link type="primary" @click="isBaseInfoCollapsed = !isBaseInfoCollapsed">
          {{ isBaseInfoCollapsed ? "展开" : "收起" }}
        </el-button>
      </CustomTitle>
      <el-collapse-transition>
        <div v-show="!isBaseInfoCollapsed">
          <CustomDescription
            :data="mroRepairOrderInfo || {}"
            :configs="baseInfoConfigs"
            :label-width="130"
          >
            <template #mroNo-content>
              <el-button link type="primary" size="small" @click="mroInfoVisible = true">
                {{ mroRepairOrderInfo?.mroNo || "--" }}
              </el-button>
            </template>

            <template #mroModelNo-content>
              <el-button link type="primary" size="small" @click="mroModelInfoVisible = true">
                {{ mroRepairOrderInfo?.mroModelNo || "--" }}
              </el-button>
            </template>

            <template #mroModelName-content>
              <el-button link type="primary" size="small" @click="mroModelInfoVisible = true">
                {{ mroRepairOrderInfo?.mroModelName || "--" }}
              </el-button>
            </template>

            <template #mroScrapProcInstId-content>
              <el-button
                link
                type="primary"
                size="small"
                @click="useFlowDetail.setStatus(true, mroRepairOrderInfo?.mroScrapProcInstId)"
              >
                查看详情
              </el-button>
            </template>
          </CustomDescription>
        </div>
      </el-collapse-transition>

      <CustomTitle title="处理反馈" :show-short-bar="false" />
      <el-tabs v-model="activeFeedbackTab" class="detail-tabs">
        <el-tab-pane label="处理反馈" :name="EnumFeedbackTabs.Form">
          <el-form
            ref="formRef"
            :model="feedbackForm"
            :rules="formRules"
            label-width="110px"
            class="feedback-form"
          >
            <div class="feedback-grid">
              <el-form-item label="处理人名称" prop="handleUserId">
                <el-select
                  v-model="feedbackForm.handleUserId"
                  class="w-full"
                  clearable
                  :disabled="!showSubmitButton"
                  placeholder="请选择处理人"
                  @change="onSelectPersonChange"
                  @visible-change="onSelectPersonVisibleChange"
                >
                  <el-option
                    v-for="item in selectedPersonList"
                    :key="String(item.value)"
                    :label="String(item.label)"
                    :value="String(item.value)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="处理人工号" prop="handleUserCodes">
                <el-input v-model="feedbackForm.handleUserCodes" disabled placeholder="自动带出" />
              </el-form-item>

              <el-form-item label="维修方式" prop="repairMode">
                <el-select
                  v-model="feedbackForm.repairMode"
                  class="w-full"
                  :disabled="!showSubmitButton"
                  placeholder="请选择维修方式"
                  @change="onRepairModeChange"
                >
                  <el-option
                    v-for="item in repairModeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item v-if="isExternalRepair" label="委托单位" prop="entrustUnit">
                <el-input
                  v-model.trim="feedbackForm.entrustUnit"
                  :disabled="!showSubmitButton"
                  placeholder="请输入委托单位"
                />
              </el-form-item>

              <el-form-item label="故障描述" prop="faultDescription">
                <el-input
                  v-model.trim="feedbackForm.faultDescription"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showSubmitButton"
                  placeholder="请输入故障描述"
                />
              </el-form-item>

              <el-form-item label="故障分析" prop="analysis">
                <el-input
                  v-model.trim="feedbackForm.analysis"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showSubmitButton"
                  placeholder="请输入故障分析"
                />
              </el-form-item>

              <el-form-item label="解决措施" prop="solutionMeasures">
                <el-input
                  v-model.trim="feedbackForm.solutionMeasures"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showSubmitButton"
                  placeholder="请输入解决措施"
                />
              </el-form-item>

              <el-form-item label="结果" prop="repairResult">
                <el-select
                  v-model="feedbackForm.repairResult"
                  class="w-full"
                  :disabled="!showSubmitButton"
                  placeholder="请选择结果"
                  @change="onRepairResultChange"
                >
                  <el-option
                    v-for="item in repairResultOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="开始维修时间" prop="repairStartTime">
                <el-date-picker
                  v-model="feedbackForm.repairStartTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                  :disabled="!showSubmitButton"
                  placeholder="请选择开始维修时间"
                />
              </el-form-item>

              <el-form-item label="维修完成时间" prop="repairEndTime">
                <el-date-picker
                  v-model="feedbackForm.repairEndTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                  :disabled="!showSubmitButton"
                  placeholder="请选择维修完成时间"
                />
              </el-form-item>

              <el-form-item v-if="isResolvedRepair" label="维修后寿命（次）" prop="repairAfterLife">
                <el-input
                  v-model.trim="feedbackForm.repairAfterLife"
                  type="number"
                  :disabled="!showSubmitButton"
                  placeholder="请输入维修后寿命"
                />
              </el-form-item>

              <el-form-item
                v-if="isScrappedRepair"
                label="报废原因"
                prop="scrapReason"
                class="full-span"
              >
                <el-input
                  v-model.trim="feedbackForm.scrapReason"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showSubmitButton"
                  placeholder="请输入报废原因"
                />
              </el-form-item>

              <el-form-item label="备注" prop="remarks" class="full-span">
                <el-input
                  v-model.trim="feedbackForm.remarks"
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showSubmitButton"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </div>
          </el-form>

          <div class="feedback-action">
            <div></div>
            <el-button
              v-show="showSubmitButton"
              type="primary"
              :loading="submitLoading"
              @click="onSubmitFeedback"
            >
              提交反馈
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="维修单附件" :name="EnumFeedbackTabs.Attachments">
          <div class="attachment-box">
            <div class="attachment-operation" v-if="showSubmitButton">
              <UploadFile
                v-model="attachmentList"
                :limit="10"
                :show-tip="false"
                :show-file-list="false"
                multiple
              >
                <el-button icon="Upload" plain :disabled="!showSubmitButton">上传附件</el-button>
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
    </div>

    <div class="layout-footer">
      <div class="footer-right">
        <el-button @click="emit('close')">关闭</el-button>
      </div>
    </div>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="mroRepairOrderInfo?.mroInformationId || ''" />

    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="mroRepairOrderInfo?.mroModelId || ''"
    />

    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="feedbackForm.handleUserId ? [feedbackForm.handleUserId] : []"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import { fileDownloadHandle } from "@/api/fileResource"
import { queryMroRepairDetail, requestMroRepairFeedback } from "@/api/operation/mro/mro-repair"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumMRORepairMode,
  EnumMRORepairModeMap,
  EnumMRORepairResult,
  EnumMRORepairResultMap,
  EnumMRORepairSourceType,
  EnumMRORepairSourceTypeMap,
  EnumMRORepairStatus,
  EnumMRORepairStatusMap,
  EnumSelectUser
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IFile } from "@/types/base-info/implement-config"
import type { IOption } from "@/types/common"
import type { IMroRepairPageListItem } from "@/types/maintain/mro-manage/mro-repair"
import { formatPercent } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

defineOptions({
  name: "MroRepairOrderDetail"
})

type IAttachmentRow = IFile & { path?: string }

enum EnumFeedbackTabs {
  Form = "form",
  Attachments = "attachments"
}

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const useFlowDetail = useFlowDetailStore()
const authed = useButtonAuth("MRORepairOrders_update", "MRORepairOrders_query")

const loading = ref(false)
const submitLoading = ref(false)
const isBaseInfoCollapsed = ref(false)
const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectPersonVisible = ref(false)

const formRef = ref<FormInstance>()
const activeFeedbackTab = ref<EnumFeedbackTabs>(EnumFeedbackTabs.Form)
const selectedPersonList = ref<IOption[]>([])
const handleUserCodeMap = ref<Record<string, string>>({})
const attachmentList = ref<IAttachmentRow[]>([])
const mroRepairOrderInfo = ref<IMroRepairPageListItem>()

const showSubmitButton = computed(
  () =>
    authed.value && Number(mroRepairOrderInfo.value?.repairStatus) === EnumMRORepairStatus.PENDING
)

const feedbackForm = reactive({
  handleUserId: "",
  handleUserCodes: "",
  repairMode: EnumMRORepairMode.INTERNAL as number,
  entrustUnit: "",
  faultDescription: "",
  analysis: "",
  solutionMeasures: "",
  repairResult: undefined as EnumMRORepairResult | undefined,
  repairStartTime: "",
  repairEndTime: "",
  repairAfterLife: "",
  scrapReason: "",
  remarks: ""
})

const isExternalRepair = computed(
  () => Number(feedbackForm.repairMode) === EnumMRORepairMode.EXTERNAL
)
const isResolvedRepair = computed(
  () => Number(feedbackForm.repairResult) === EnumMRORepairResult.RESOLVED
)
const isScrappedRepair = computed(
  () => Number(feedbackForm.repairResult) === EnumMRORepairResult.SCRAPPED
)

const repairModeOptions = computed(() =>
  Object.entries(EnumMRORepairModeMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
)

const repairResultOptions = computed(() =>
  Object.entries(EnumMRORepairResultMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
)

const attachmentTableData = computed(() => attachmentList.value)

const formRules: FormRules = {
  // handleUserId: [{ required: true, message: "请选择处理人", trigger: "change" }],
  repairMode: [{ required: true, message: "请选择维修方式", trigger: "change" }],
  faultDescription: [{ required: true, message: "请输入故障描述", trigger: "blur" }],
  repairResult: [{ required: true, message: "请选择维修结果", trigger: "change" }],
  repairStartTime: [{ required: true, message: "请选择开始维修时间", trigger: "change" }],
  repairEndTime: [{ required: true, message: "请选择维修完成时间", trigger: "change" }],
  entrustUnit: [
    {
      validator: (_, value, callback) => {
        if (isExternalRepair.value && !String(value || "").trim()) {
          callback(new Error("请输入委托单位"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ],
  repairAfterLife: [
    {
      validator: (_, value, callback) => {
        if (!isResolvedRepair.value) {
          callback()
          return
        }
        const life = Number(value)
        if (!life || life <= 0) {
          callback(new Error("请输入维修后寿命"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ],
  scrapReason: [
    {
      validator: (_, value, callback) => {
        if (!isScrappedRepair.value) {
          callback()
          return
        }
        if (!String(value || "").trim()) {
          callback(new Error("请输入报废原因"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ]
}

const formatLife = (value?: number) => {
  if (value === undefined || value === null) {
    return ""
  }
  return formatPercent(Number(value))
}

const hasValue = (value: unknown) => String(value ?? "").trim() !== ""

const baseInfoConfigs = computed(() => [
  {
    field: "repairNo",
    label: "维修单号："
  },
  {
    field: "repairStatus",
    label: "状态：",
    formatter: () =>
      EnumMRORepairStatusMap[mroRepairOrderInfo.value?.repairStatus as EnumMRORepairStatus]
  },
  {
    field: "repairRound",
    label: "维修轮次："
  },
  {
    field: "previousRepairNo",
    label: "上一轮维修单：",
    hidden: !hasValue(mroRepairOrderInfo.value?.previousRepairNo)
  },
  {
    field: "linkedExceptionTaskNo",
    label: "关联异常工单："
  },
  {
    field: "sourceType",
    label: "来源类型：",
    formatter: () =>
      EnumMRORepairSourceTypeMap[mroRepairOrderInfo.value?.sourceType as EnumMRORepairSourceType]
  },
  {
    field: "sourceNo",
    label: "来源单号："
  },
  {
    field: "mroNo",
    label: "MRO序列号：",
    slots: {
      content: "mroNo-content"
    }
  },
  {
    field: "mroModelNo",
    label: "MRO编号：",
    slots: {
      content: "mroModelNo-content"
    }
  },
  {
    field: "mroModelName",
    label: "MRO名称：",
    slots: {
      content: "mroModelName-content"
    }
  },
  // {
  //   field: "mroSpec",
  //   label: "MRO规格："
  // },
  // {
  //   field: "mroClassifyName",
  //   label: "MRO分类："
  // },
  // {
  //   field: "mroCategoryName",
  //   label: "MRO类型："
  // },
  {
    field: "repairBeforeLife",
    label: "维修前寿命：",
    formatter: () => formatLife(mroRepairOrderInfo.value?.repairBeforeLife)
  },
  {
    field: "currentLife",
    label: "当前寿命：",
    formatter: () => formatLife(mroRepairOrderInfo.value?.currentLife)
  },
  {
    field: "reportUserName",
    label: "报修人名称：",
    formatter: () => mroRepairOrderInfo.value?.reportUser?.name
  },
  {
    field: "reportUserId",
    label: "报修人编号：",
    formatter: () => mroRepairOrderInfo.value?.reportUser?.empNo
  },
  {
    field: "handlePosition",
    label: "处理职位："
  },
  {
    field: "responsibleUserName",
    label: "责任人姓名：",
    formatter: () => mroRepairOrderInfo.value?.responsibleUser?.name
  },
  {
    field: "responsibleUserNo",
    label: "责任人工号：",
    formatter: () => mroRepairOrderInfo.value?.responsibleUser?.empNo
  },
  // {
  //   field: "handleUserName",
  //   label: "处理人姓名：",
  //   formatter: () => mroRepairOrderInfo.value?.handleUser?.name
  // },
  // {
  //   field: "handleUserNo",
  //   label: "处理人工号：",
  //   formatter: () => mroRepairOrderInfo.value?.handleUser?.empNo
  // },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "completeTime",
    label: "办结时间：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      !hasValue(mroRepairOrderInfo.value?.completeTime)
  },
  {
    field: "mroScrapProcInstId",
    label: "报废申请单：",
    hidden:
      mroRepairOrderInfo.value?.repairStatus !== EnumMRORepairStatus.FINISHED ||
      Number(mroRepairOrderInfo.value?.repairResult) !== EnumMRORepairResult.SCRAPPED ||
      !hasValue(mroRepairOrderInfo.value?.mroScrapProcInstId),
    slots: {
      content: "mroScrapProcInstId-content"
    }
  }
])

const resetFeedbackForm = () => {
  feedbackForm.handleUserId = ""
  feedbackForm.handleUserCodes = ""
  feedbackForm.repairMode = EnumMRORepairMode.INTERNAL
  feedbackForm.entrustUnit = ""
  feedbackForm.faultDescription = ""
  feedbackForm.analysis = ""
  feedbackForm.solutionMeasures = ""
  feedbackForm.repairResult = undefined
  feedbackForm.repairStartTime = ""
  feedbackForm.repairEndTime = ""
  feedbackForm.repairAfterLife = ""
  feedbackForm.scrapReason = ""
  feedbackForm.remarks = ""
  selectedPersonList.value = []
  handleUserCodeMap.value = {}
  attachmentList.value = []
  formRef.value?.clearValidate()
}

const syncFeedbackDataFromDetail = () => {
  resetFeedbackForm()

  const detail = mroRepairOrderInfo.value
  if (!detail) {
    return
  }

  feedbackForm.handleUserId = String(detail.handleUser?.id || "")
  feedbackForm.handleUserCodes = String(detail.handleUser?.empNo || "")
  feedbackForm.repairMode = Number(detail.repairMode || EnumMRORepairMode.INTERNAL)
  feedbackForm.entrustUnit = String(detail.entrustUnit || "")
  feedbackForm.faultDescription = String(detail.faultDescription || "")
  feedbackForm.analysis = String(detail.analysis || "")
  feedbackForm.solutionMeasures = String(detail.solutionMeasures || "")
  const resultNumber = Number(detail.repairResult)
  feedbackForm.repairResult =
    detail.repairResult !== "" && Number.isFinite(resultNumber)
      ? (resultNumber as EnumMRORepairResult)
      : undefined
  feedbackForm.repairStartTime = String(detail.repairStartTime || "")
  feedbackForm.repairEndTime = String(detail.repairEndTime || "")
  feedbackForm.repairAfterLife =
    detail.repairAfterLife === undefined || detail.repairAfterLife === null
      ? ""
      : String(detail.repairAfterLife)
  feedbackForm.scrapReason = String(detail.scrapReason || "")
  feedbackForm.remarks = String(detail.remarks || "")

  if (detail.handleUser?.id) {
    const personId = String(detail.handleUser.id)
    selectedPersonList.value = [
      {
        label: String(detail.handleUser.name || "--"),
        value: personId
      }
    ]
    handleUserCodeMap.value = {
      [personId]: String(detail.handleUser.empNo || "")
    }
  }

  attachmentList.value = (detail.scrapFiles || []).map((item) => ({
    fileId: String(item.fileId || item.deploymentId || item.id || ""),
    fileName: String(item.fileName || item.sourceName || "未命名附件"),
    size: Number(item.size || 0),
    path: String(item.path || "")
  }))
}

const getMroRepairOrderInfo = async (id: string) => {
  if (!id) {
    mroRepairOrderInfo.value = undefined
    resetFeedbackForm()
    return
  }
  loading.value = true
  try {
    const data = await queryMroRepairDetail(id)
    mroRepairOrderInfo.value = data
    syncFeedbackDataFromDetail()
  } finally {
    loading.value = false
  }
}

const onSelectPersonVisibleChange = (dialogVisible: boolean) => {
  if (dialogVisible && showSubmitButton.value) {
    selectPersonVisible.value = true
  }
}

const onSelectPersonChange = (value: string) => {
  if (!value) {
    feedbackForm.handleUserCodes = ""
    return
  }
  feedbackForm.handleUserCodes = handleUserCodeMap.value[String(value)] || ""
}

const onSelectPersonSuccess = (data: ITree[]) => {
  if (!data.length) return
  const first = data[0]
  selectedPersonList.value = [
    {
      label: first.label,
      value: first.id
    }
  ]
  handleUserCodeMap.value = {
    [first.id]: first.no || ""
  }
  feedbackForm.handleUserId = first.id
  feedbackForm.handleUserCodes = first.no || ""
}

const onRepairModeChange = (value: number) => {
  if (value !== EnumMRORepairMode.EXTERNAL) {
    feedbackForm.entrustUnit = ""
  }
}

const onRepairResultChange = (value: EnumMRORepairResult | undefined) => {
  if (value !== EnumMRORepairResult.RESOLVED) {
    feedbackForm.repairAfterLife = ""
  }
  if (value !== EnumMRORepairResult.SCRAPPED) {
    feedbackForm.scrapReason = ""
  }
}

const onDeleteAttachment = (index: number) => {
  attachmentList.value.splice(index, 1)
}

const onDownloadAttachment = async (row: IAttachmentRow) => {
  const fileId = String(row.fileId || "")
  if (fileId) {
    await fileDownloadHandle(fileId, row.fileName || "download")
    return
  }
  if (row.path) {
    const link = document.createElement("a")
    link.href = new URL(row.path, window.location.origin).toString()
    link.download = row.fileName || "download"
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const onSubmitFeedback = async () => {
  if (!showSubmitButton.value) return

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    await requestMroRepairFeedback({
      id: props.id,
      responsibleUserId: mroRepairOrderInfo.value?.responsibleUser?.id || "",
      handleUserId: feedbackForm.handleUserId,
      handleUserName:
        selectedPersonList.value.find(
          (item) => String(item.value) === String(feedbackForm.handleUserId)
        )?.label || "",
      repairMode: Number(feedbackForm.repairMode),
      entrustUnit: feedbackForm.entrustUnit,
      faultDescription: feedbackForm.faultDescription,
      analysis: feedbackForm.analysis,
      solutionMeasures: feedbackForm.solutionMeasures,
      repairResult: Number(feedbackForm.repairResult),
      repairStartTime: feedbackForm.repairStartTime,
      repairEndTime: feedbackForm.repairEndTime,
      remarks: feedbackForm.remarks,
      repairAfterLife: isResolvedRepair.value ? Number(feedbackForm.repairAfterLife || 0) : 0,
      scrapReason: isScrappedRepair.value ? feedbackForm.scrapReason : "",
      fileIds: attachmentList.value.map((item) => String(item.fileId || "")).filter(Boolean)
    })

    ElMessage.success("提交成功")
    await getMroRepairOrderInfo(props.id)
    emit("success")
  } finally {
    submitLoading.value = false
  }
}

watch(
  () => props.id,
  async (id) => {
    await getMroRepairOrderInfo(id)
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.page-toolbar {
  margin-bottom: 16px;
}

.detail-tabs {
  margin-bottom: 16px;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
}

.feedback-form :deep(.full-span) {
  grid-column: 1 / -1;
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

.layout-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.footer-right {
  display: flex;
  gap: 8px;
}

@media (max-width: 1280px) {
  .feedback-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
