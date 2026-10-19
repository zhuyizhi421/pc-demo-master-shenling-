<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content" v-loading="loading">
      <div v-if="!embedded" class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
        <div class="toolbar-right">
          <el-button @click="onPrint">打印</el-button>
        </div>
      </div>

      <CustomTitle title="基础信息" :show-short-bar="false" />
      <div class="base-info-grid">
        <div
          v-for="item in baseInfoItems"
          :key="item.key"
          class="base-info-item"
          :class="{ 'full-span': item.fullSpan }"
        >
          <div class="base-info-label">{{ item.label }}</div>
          <div class="base-info-content">
            <template v-if="item.key === 'repairStatus'">
              <el-tag :type="repairStatusTagTypeMap[Number(detailData?.repairStatus)]">
                {{ formatDeviceRepairStatus(detailData?.repairStatus) }}
              </el-tag>
            </template>
            <template v-else-if="item.key === 'repairResult'">
              <span v-if="detailData?.repairResult === ''">-</span>
              <el-tag v-else :type="equipmentRepairResultTagTypeMap[Number(detailData?.repairResult)]">
                {{ formatDeviceRepairResult(detailData?.repairResult) }}
              </el-tag>
            </template>
            <template v-else-if="item.key === 'equipmentName'">
              <el-button link type="primary" @click="deviceInfoVisible = true">
                {{ detailData?.equipmentName || "--" }}
              </el-button>
            </template>
            <template v-else>
              {{ item.value || "-" }}
            </template>
          </div>
        </div>
      </div>
      <CustomTitle title="业务明细" :show-short-bar="false" class="section-title" />
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="维修反馈信息" name="feedback">
          <el-form
            ref="feedbackFormRef"
            :model="feedbackForm"
            :rules="feedbackRules"
            label-width="110px"
            class="detail-form"
          >
            <div class="detail-grid">
              <el-form-item label="责任人">
                <el-input :model-value="detailData?.responsibleUser?.name || '-'" disabled />
              </el-form-item>

              <el-form-item label="责任人编号">
                <el-input :model-value="detailData?.responsibleUser?.empNo || '-'" disabled />
              </el-form-item>

              <el-form-item label="派工人">
                <el-input :model-value="detailData?.assignUser?.name || '-'" disabled />
              </el-form-item>

              <el-form-item label="派工时间">
                <el-input :model-value="formatDateTime(detailData?.assignTime)" disabled />
              </el-form-item>

              <el-form-item label="维修人" prop="repairUserId">
                <el-select
                  v-model="feedbackForm.repairUserId"
                  class="w-full"
                  clearable
                  filterable
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择维修人"
                  @change="onRepairUserChange"
                  @visible-change="(visible) => onPersonVisibleChange(visible, 'repairUser')"
                >
                  <el-option
                    v-for="item in selectedRepairUserOptions"
                    :key="String(item.value)"
                    :label="String(item.label)"
                    :value="String(item.value)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="维修人编号">
                <el-input v-model="feedbackForm.repairUserNo" disabled placeholder="自动带出" />
              </el-form-item>

              <el-form-item label="接单时间" prop="receiveTime">
                <el-date-picker
                  v-model="feedbackForm.receiveTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择接单时间"
                />
              </el-form-item>

              <el-form-item label="修复时间" prop="repairTime">
                <el-date-picker
                  v-model="feedbackForm.repairTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择修复时间"
                />
              </el-form-item>

              <el-form-item label="维修方式" prop="repairMode">
                <el-select
                  v-model="feedbackForm.repairMode"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择维修方式"
                  @change="onRepairModeChange"
                >
                  <el-option
                    v-for="item in deviceRepairModeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="Number(feedbackForm.repairMode) === EquipmentRepairMode.External"
                label="委托单位"
                prop="entrustUnit"
              >
                <el-input
                  v-model.trim="feedbackForm.entrustUnit"
                  :disabled="!showFeedbackSubmit"
                  maxlength="50"
                  placeholder="请输入委托单位"
                />
              </el-form-item>

              <el-form-item label="维修结果" prop="repairResult">
                <el-select
                  v-model="feedbackForm.repairResult"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择维修结果"
                  @change="onRepairResultChange"
                >
                  <el-option
                    v-for="item in deviceRepairResultOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                label="转下一轮原因"
                prop="nextRoundReason"
              >
                <el-select
                  v-model="feedbackForm.nextRoundReason"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择转下一轮原因"
                >
                  <el-option
                    v-for="item in deviceRepairNextRoundReasonOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <div
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                class="detail-subsection full-span"
              >
                转下一轮交接信息
              </div>

              <el-form-item
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                label="交接时间"
              >
                <el-date-picker
                  v-model="feedbackForm.handoverTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择交接时间"
                />
              </el-form-item>

              <el-form-item
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                label="交接人"
              >
                <el-select
                  v-model="feedbackForm.handoverUserId"
                  class="w-full"
                  clearable
                  filterable
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择交接人"
                  @change="onHandoverUserChange"
                  @visible-change="(visible) => onPersonVisibleChange(visible, 'handoverUser')"
                >
                  <el-option
                    v-for="item in selectedHandoverUserOptions"
                    :key="String(item.value)"
                    :label="String(item.label)"
                    :value="String(item.value)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                label="交接人编号"
              >
                <el-input v-model="feedbackForm.handoverUserNo" disabled placeholder="自动带出" />
              </el-form-item>

              <el-form-item
                v-if="Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound"
                label="未修复工作交接情况"
                prop="handoverContent"
                class="full-span"
              >
                <el-input
                  v-model.trim="feedbackForm.handoverContent"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  :disabled="!showFeedbackSubmit"
                  placeholder="请输入未修复工作交接情况"
                />
              </el-form-item>

              <el-form-item label="故障原因">
                <el-select
                  v-model="feedbackForm.faultReasonId"
                  class="w-full"
                  clearable
                  filterable
                  :disabled="!showFeedbackSubmit"
                  placeholder="请选择故障原因"
                  @change="onFaultReasonChange"
                >
                  <el-option
                    v-for="item in faultReasonOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="故障原因分析" class="full-span">
                <el-input
                  v-model.trim="feedbackForm.faultReasonAnalysis"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  :disabled="!showFeedbackSubmit"
                  placeholder="请输入故障原因分析"
                />
              </el-form-item>

              <el-form-item label="维修准备时间(分)">
                <el-input-number
                  v-model="feedbackForm.prepareDuration"
                  class="w-full"
                  :min="0"
                  :controls="false"
                  :disabled="!showFeedbackSubmit"
                />
              </el-form-item>

              <el-form-item label="备件等待时间(分)">
                <el-input-number
                  v-model="feedbackForm.waitPartsDuration"
                  class="w-full"
                  :min="0"
                  :controls="false"
                  :disabled="!showFeedbackSubmit"
                />
              </el-form-item>

              <el-form-item label="实际维修时间(分)">
                <el-input-number
                  v-model="feedbackForm.actualRepairDuration"
                  class="w-full"
                  :min="0"
                  :controls="false"
                  :disabled="!showFeedbackSubmit"
                />
              </el-form-item>

              <el-form-item label="累计停机时间(分)">
                <el-input-number
                  v-model="feedbackForm.downDuration"
                  class="w-full"
                  :min="0"
                  :controls="false"
                  :disabled="!showFeedbackSubmit"
                />
              </el-form-item>

              <el-form-item label="维修情况、方法" prop="repairMethod" class="full-span">
                <el-input
                  v-model.trim="feedbackForm.repairMethod"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  :disabled="!showFeedbackSubmit"
                  placeholder="请输入维修情况、方法"
                />
              </el-form-item>

              <el-form-item label="故障防范、改善措施" class="full-span">
                <el-input
                  v-model.trim="feedbackForm.preventionImprovementMeasures"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  :disabled="!showFeedbackSubmit"
                  placeholder="请输入故障防范、改善措施"
                />
              </el-form-item>

              <el-form-item label="备注" class="full-span">
                <el-input
                  v-model.trim="feedbackForm.remarks"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  :disabled="!showFeedbackSubmit"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </div>
          </el-form>

          <div v-if="showFeedbackSubmit" class="tab-action">
            <el-button type="primary" :loading="feedbackLoading" @click="onSubmitFeedback">
              保存维修反馈
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="更换配件" name="parts">
          <div class="table-toolbar">
            <el-button v-if="showFeedbackSubmit" type="primary" plain @click="selectMroVisible = true">
              新增配件
            </el-button>
          </div>
          <el-table :data="feedbackForm.replacementParts" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="mroNo" label="MRO编号" min-width="140" />
            <el-table-column prop="mroName" label="MRO名称" min-width="180" />
            <el-table-column prop="mroSpec" label="MRO规格" min-width="140" />
            <el-table-column prop="mroClassifyName" label="MRO分类" min-width="140" />
            <el-table-column prop="mroCategoryName" label="MRO类型" min-width="140" />
            <el-table-column label="数量" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :controls="false"
                  :disabled="!showFeedbackSubmit"
                />
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="180">
              <template #default="{ row }">
                <el-input v-model.trim="row.remarks" :disabled="!showFeedbackSubmit" placeholder="请输入备注" />
              </template>
            </el-table-column>
            <el-table-column v-if="showFeedbackSubmit" label="操作" width="100" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="feedbackForm.replacementParts.splice($index, 1)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="维修附件" name="attachments">
          <div class="table-toolbar">
            <UploadFile
              v-if="showFeedbackSubmit"
              v-model="attachmentList"
              :limit="10"
              :show-tip="false"
              :show-file-list="false"
              multiple
            >
              <el-button type="primary" plain>上传附件</el-button>
            </UploadFile>
          </div>
          <el-table :data="attachmentList" border>
            <el-table-column prop="fileName" label="文件名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="size" label="大小" width="120" align="center" />
            <el-table-column label="操作" width="160" align="center" fixed="right">
              <template #default="{ row, $index }">
                <el-button link type="primary" @click="onDownloadAttachment(row)">下载</el-button>
                <el-button
                  v-if="showFeedbackSubmit"
                  link
                  type="danger"
                  @click="attachmentList.splice($index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="确认/验收信息" name="confirm">
          <el-form
            ref="confirmFormRef"
            :model="confirmForm"
            :rules="confirmRules"
            label-width="110px"
            class="detail-form"
          >
            <div class="detail-grid">
              <el-form-item label="执行人" prop="executeUserId">
                <el-select
                  v-model="confirmForm.executeUserId"
                  class="w-full"
                  clearable
                  filterable
                  :disabled="!showConfirmSubmit"
                  placeholder="请选择执行人"
                  @change="onExecuteUserChange"
                  @visible-change="(visible) => onPersonVisibleChange(visible, 'executeUser')"
                >
                  <el-option
                    v-for="item in selectedExecuteUserOptions"
                    :key="String(item.value)"
                    :label="String(item.label)"
                    :value="String(item.value)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="执行人编号">
                <el-input v-model="confirmForm.executeUserNo" disabled placeholder="自动带出" />
              </el-form-item>

              <el-form-item label="确认人" prop="confirmUserId">
                <el-select
                  v-model="confirmForm.confirmUserId"
                  class="w-full"
                  clearable
                  filterable
                  :disabled="!showConfirmSubmit"
                  placeholder="请选择确认人"
                  @change="onConfirmUserChange"
                  @visible-change="(visible) => onPersonVisibleChange(visible, 'confirmUser')"
                >
                  <el-option
                    v-for="item in selectedConfirmUserOptions"
                    :key="String(item.value)"
                    :label="String(item.label)"
                    :value="String(item.value)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="确认人编号">
                <el-input v-model="confirmForm.confirmUserNo" disabled placeholder="自动带出" />
              </el-form-item>

              <el-form-item label="是否落实" prop="isImplemented">
                <el-select
                  v-model="confirmForm.isImplemented"
                  class="w-full"
                  :disabled="!showConfirmSubmit"
                  placeholder="请选择是否落实"
                >
                  <el-option
                    v-for="item in deviceRepairImplementOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="确认时间">
                <el-input :model-value="formatDateTime(detailData?.confirmTime)" disabled />
              </el-form-item>

              <el-form-item label="验收意见" prop="acceptanceOpinion">
                <el-radio-group v-model="confirmForm.acceptanceOpinion" :disabled="!showConfirmSubmit">
                  <el-radio label="合格">合格</el-radio>
                  <el-radio label="不合格">不合格</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-form>

          <div v-if="showConfirmSubmit" class="tab-action">
            <el-button type="primary" :loading="confirmLoading" @click="onSubmitConfirm">
              保存确认/验收
            </el-button>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

    <div v-if="!embedded" class="layout-footer">
      <el-button @click="emit('close')">关闭</el-button>
    </div>

    <DeviceInfo v-model="deviceInfoVisible" :id="detailData?.equipmentId || ''" />

    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="selectedPersonIds"
      @success="onSelectPersonSuccess"
    />

    <SelectMroDialog
      v-model="selectMroVisible"
      multiple
      :selected-row-keys="feedbackForm.replacementParts.map((item) => item.mroId)"
      @success="onSelectMroSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import { fileDownloadHandle } from "@/api/fileResource"
import {
  queryEquipmentRepairDetail,
  requestConfirmEquipmentRepair,
  requestFeedbackEquipmentRepair
} from "@/api/operation/equipment/equipment-repair"
import { requestEquipmentRepairBaseConfigList } from "@/api/operation/equipment/equipment-repair-base-config"
import {
  EquipmentRepairMode,
  EquipmentRepairResult,
  equipmentRepairResultTagTypeMap,
  repairStatusTagTypeMap
} from "@/api/operation/equipment/types"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadFile from "@/components/UploadFile/index.vue"
import { EnumSelectUser } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IEquipmentRepairPageItem,
  IEquipmentRepairReplacementPartItem
} from "@/types/maintain/equipment-manage/equipment-repair"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"
import {
  canConfirmDeviceRepair,
  canFeedbackDeviceRepair,
  deviceRepairImplementOptions,
  deviceRepairModeOptions,
  deviceRepairNextRoundReasonOptions,
  deviceRepairResultOptions,
  formatDeviceRepairMode,
  formatDeviceRepairResult,
  formatDeviceRepairSourceType,
  formatDeviceRepairStatus
} from "@/views/maintOperate/deviceRepair/constants"
import { formatDateTime } from "@/views/maintOperate/status"

defineOptions({
  name: "DeviceRepairDetail"
})

type PersonScene = "repairUser" | "handoverUser" | "executeUser" | "confirmUser"
type AttachmentRow = {
  id?: string
  fileId?: string
  fileName?: string
  size?: string | number
  path?: string
}

const props = withDefaults(
  defineProps<{
    id: string
    embedded?: boolean
    actionType?: "view" | "feedback" | "confirm"
    printAfterLoaded?: boolean
  }>(),
  {
    embedded: false,
    actionType: "view",
    printAfterLoaded: false
  }
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const authed = useButtonAuth("DeviceRepair_update", "DeviceRepair_query")

const loading = ref(false)
const feedbackLoading = ref(false)
const confirmLoading = ref(false)
const deviceInfoVisible = ref(false)
const selectPersonVisible = ref(false)
const selectMroVisible = ref(false)
const activeTab = ref("feedback")
const personScene = ref<PersonScene>("repairUser")

const detailData = ref<IEquipmentRepairPageItem>()
const feedbackFormRef = ref<FormInstance>()
const confirmFormRef = ref<FormInstance>()

const selectedRepairUserOptions = ref<IOption[]>([])
const selectedHandoverUserOptions = ref<IOption[]>([])
const selectedExecuteUserOptions = ref<IOption[]>([])
const selectedConfirmUserOptions = ref<IOption[]>([])
const faultReasonOptions = ref<{ label: string; value: string }[]>([])
const attachmentList = ref<AttachmentRow[]>([])

const feedbackForm = reactive({
  repairUserId: "",
  repairUserNo: "",
  receiveTime: "",
  repairTime: "",
  repairMethod: "",
  repairMode: EquipmentRepairMode.Internal,
  entrustUnit: "",
  repairResult: EquipmentRepairResult.Resolved as number | "",
  nextRoundReason: "",
  handoverContent: "",
  faultReasonId: "",
  faultReasonName: "",
  faultReasonAnalysis: "",
  handoverTime: "",
  handoverUserId: "",
  handoverUserNo: "",
  prepareDuration: 0,
  waitPartsDuration: 0,
  actualRepairDuration: 0,
  downDuration: 0,
  preventionImprovementMeasures: "",
  remarks: "",
  replacementParts: [] as IEquipmentRepairReplacementPartItem[]
})

const confirmForm = reactive({
  executeUserId: "",
  executeUserNo: "",
  confirmUserId: "",
  confirmUserNo: "",
  isImplemented: "" as number | "",
  acceptanceOpinion: ""
})

const selectedPersonIds = computed(() => {
  if (personScene.value === "repairUser") {
    return feedbackForm.repairUserId ? [feedbackForm.repairUserId] : []
  }
  if (personScene.value === "handoverUser") {
    return feedbackForm.handoverUserId ? [feedbackForm.handoverUserId] : []
  }
  if (personScene.value === "executeUser") {
    return confirmForm.executeUserId ? [confirmForm.executeUserId] : []
  }
  return confirmForm.confirmUserId ? [confirmForm.confirmUserId] : []
})

const showFeedbackSubmit = computed(
  () =>
    authed.value &&
    props.actionType === "feedback" &&
    canFeedbackDeviceRepair(detailData.value?.repairStatus)
)

const showConfirmSubmit = computed(
  () =>
    authed.value &&
    props.actionType === "confirm" &&
    canConfirmDeviceRepair(detailData.value?.repairStatus)
)

const feedbackRules: FormRules = {
  repairUserId: [{ required: true, message: "请选择维修人", trigger: "change" }],
  receiveTime: [{ required: true, message: "请选择接单时间", trigger: "change" }],
  repairTime: [{ required: true, message: "请选择修复时间", trigger: "change" }],
  repairMethod: [{ required: true, message: "请输入维修情况、方法", trigger: "blur" }],
  repairMode: [{ required: true, message: "请选择维修方式", trigger: "change" }],
  repairResult: [{ required: true, message: "请选择维修结果", trigger: "change" }],
  entrustUnit: [
    {
      validator: (_, value, callback) => {
        if (
          Number(feedbackForm.repairMode) === EquipmentRepairMode.External &&
          !String(value || "").trim()
        ) {
          callback(new Error("请输入委托单位"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ],
  nextRoundReason: [
    {
      validator: (_, value, callback) => {
        if (
          Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound &&
          !String(value || "").trim()
        ) {
          callback(new Error("请选择转下一轮原因"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  handoverContent: [
    {
      validator: (_, value, callback) => {
        if (
          Number(feedbackForm.repairResult) === EquipmentRepairResult.NextRound &&
          !String(value || "").trim()
        ) {
          callback(new Error("请输入未修复工作交接情况"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ]
}

const confirmRules: FormRules = {
  executeUserId: [{ required: true, message: "请选择执行人", trigger: "change" }],
  confirmUserId: [{ required: true, message: "请选择确认人", trigger: "change" }],
  isImplemented: [{ required: true, message: "请选择是否落实", trigger: "change" }],
  acceptanceOpinion: [{ required: true, message: "请选择验收意见", trigger: "change" }]
}

const baseInfoItems = computed(() => [
  { key: "repairNo", label: "维修单号：", value: detailData.value?.repairNo },
  { key: "repairStatus", label: "当前状态：", value: detailData.value?.repairStatus },
  { key: "repairResult", label: "维修结果：", value: detailData.value?.repairResult },
  {
    key: "sourceType",
    label: "来源：",
    value: formatDeviceRepairSourceType(detailData.value?.sourceType)
  },
  { key: "sourceNo", label: "来源单号：", value: detailData.value?.sourceNo },
  { key: "createByName", label: "创建人：", value: detailData.value?.createByName },
  {
    key: "createTime",
    label: "创建时间：",
    value: formatDateTime(detailData.value?.createTime)
  },
  {
    key: "closeTime",
    label: "关闭时间：",
    value: formatDateTime(detailData.value?.closeTime || "")
  },
  { key: "reportUnit", label: "报修单位：", value: detailData.value?.reportUnit },
  { key: "reportUser", label: "报修人：", value: detailData.value?.reportUser?.name },
  { key: "reportUserNo", label: "报修人编号：", value: detailData.value?.reportUser?.empNo },
  { key: "contactPhone", label: "联系电话：", value: detailData.value?.contactPhone },
  { key: "equipmentNo", label: "设备编号：", value: detailData.value?.equipmentNo },
  { key: "equipmentName", label: "设备名称：", value: detailData.value?.equipmentName },
  { key: "equipmentModelNo", label: "类型编号：", value: detailData.value?.equipmentModelNo },
  { key: "equipmentModelName", label: "类型名称：", value: detailData.value?.equipmentModelName },
  {
    key: "reportTime",
    label: "报修时间：",
    value: formatDateTime(detailData.value?.reportTime)
  },
  { key: "faultCategoryName", label: "故障类型：", value: detailData.value?.faultCategoryName },
  {
    key: "faultLevel",
    label: "故障等级：",
    value: detailData.value?.faultLevelName || "-"
  },
  {
    key: "locationName",
    label: "设备所在地点：",
    value: [
      detailData.value?.areaName,
      detailData.value?.productionUnitName,
      detailData.value?.workstationName
    ]
      .filter((item) => String(item || "").trim())
      .join("/")
  },
  {
    key: "faultDescription",
    label: "故障现象及影响情况：",
    value: detailData.value?.faultDescription,
    fullSpan: true
  },
  { key: "remarks", label: "备注：", value: detailData.value?.remarks, fullSpan: true }
])

const setPersonOption = (
  target: Ref<IOption[]>,
  value?: {
    id?: string
    name?: string
    empNo?: string
  }
) => {
  target.value = value?.id
    ? [
        {
          label: String(value?.name || "--"),
          value: String(value.id)
        }
      ]
    : []
}

const resetFeedbackForm = () => {
  feedbackForm.repairUserId = ""
  feedbackForm.repairUserNo = ""
  feedbackForm.receiveTime = ""
  feedbackForm.repairTime = ""
  feedbackForm.repairMethod = ""
  feedbackForm.repairMode = EquipmentRepairMode.Internal
  feedbackForm.entrustUnit = ""
  feedbackForm.repairResult = EquipmentRepairResult.Resolved
  feedbackForm.nextRoundReason = ""
  feedbackForm.handoverContent = ""
  feedbackForm.faultReasonId = ""
  feedbackForm.faultReasonName = ""
  feedbackForm.faultReasonAnalysis = ""
  feedbackForm.handoverTime = ""
  feedbackForm.handoverUserId = ""
  feedbackForm.handoverUserNo = ""
  feedbackForm.prepareDuration = 0
  feedbackForm.waitPartsDuration = 0
  feedbackForm.actualRepairDuration = 0
  feedbackForm.downDuration = 0
  feedbackForm.preventionImprovementMeasures = ""
  feedbackForm.remarks = ""
  feedbackForm.replacementParts = []
  attachmentList.value = []
  selectedRepairUserOptions.value = []
  selectedHandoverUserOptions.value = []
}

const resetConfirmForm = () => {
  confirmForm.executeUserId = ""
  confirmForm.executeUserNo = ""
  confirmForm.confirmUserId = ""
  confirmForm.confirmUserNo = ""
  confirmForm.isImplemented = ""
  confirmForm.acceptanceOpinion = ""
  selectedExecuteUserOptions.value = []
  selectedConfirmUserOptions.value = []
}

const syncDetailToForms = () => {
  resetFeedbackForm()
  resetConfirmForm()

  const detail = detailData.value
  if (!detail) {
    return
  }

  feedbackForm.repairUserId = String(detail.repairUser?.id || "")
  feedbackForm.repairUserNo = String(detail.repairUser?.empNo || "")
  feedbackForm.receiveTime = String(detail.receiveTime || "")
  feedbackForm.repairTime = String(detail.repairTime || "")
  feedbackForm.repairMethod = String(detail.repairMethod || "")
  feedbackForm.repairMode = Number(detail.repairMode || EquipmentRepairMode.Internal)
  feedbackForm.entrustUnit = String(detail.entrustUnit || "")
  feedbackForm.repairResult =
    detail.repairResult === "" ? "" : Number(detail.repairResult || EquipmentRepairResult.Resolved)
  feedbackForm.nextRoundReason = String(detail.nextRoundReason || "")
  feedbackForm.handoverContent = String(detail.handoverContent || "")
  feedbackForm.faultReasonId = String(detail.faultReasonId || "")
  feedbackForm.faultReasonName = String(detail.faultReasonName || "")
  feedbackForm.faultReasonAnalysis = String(detail.faultReasonAnalysis || "")
  feedbackForm.handoverTime = String(detail.handoverTime || "")
  feedbackForm.handoverUserId = String(detail.handoverUser?.id || "")
  feedbackForm.handoverUserNo = String(detail.handoverUser?.empNo || "")
  feedbackForm.prepareDuration = Number(detail.prepareDuration || 0)
  feedbackForm.waitPartsDuration = Number(detail.waitPartsDuration || 0)
  feedbackForm.actualRepairDuration = Number(detail.actualRepairDuration || 0)
  feedbackForm.downDuration = Number(detail.downDuration || 0)
  feedbackForm.preventionImprovementMeasures = String(
    detail.preventiveMeasures || detail.improvementMeasures || ""
  )
  feedbackForm.remarks = String(detail.remarks || "")
  feedbackForm.replacementParts = (detail.replacementParts || []).map((item) => ({ ...item }))
  attachmentList.value = (detail.attachments || []).map((item) => ({
    id: item.id,
    fileId: item.fileId || item.id,
    fileName: item.fileName || item.sourceName,
    size: item.size,
    path: item.path
  }))

  setPersonOption(selectedRepairUserOptions, detail.repairUser)
  setPersonOption(selectedHandoverUserOptions, detail.handoverUser)

  confirmForm.executeUserId = String(detail.executeUser?.id || "")
  confirmForm.executeUserNo = String(detail.executeUser?.empNo || "")
  confirmForm.confirmUserId = String(detail.confirmUser?.id || "")
  confirmForm.confirmUserNo = String(detail.confirmUser?.empNo || "")
  confirmForm.isImplemented =
    detail.isImplemented === "" || detail.isImplemented === undefined || detail.isImplemented === null
      ? ""
      : Number(detail.isImplemented)
  confirmForm.acceptanceOpinion = String(detail.acceptanceOpinion || "")

  setPersonOption(selectedExecuteUserOptions, detail.executeUser)
  setPersonOption(selectedConfirmUserOptions, detail.confirmUser)
}

const initFaultReasons = async (equipmentId?: string) => {
  if (!equipmentId && !detailData.value?.equipmentId) {
    faultReasonOptions.value = []
    return
  }
  const list = await requestEquipmentRepairBaseConfigList("faultReason")
  faultReasonOptions.value = list.map((item) => ({
    label: item.configName,
    value: item.id
  }))
}

const loadDetail = async () => {
  if (!props.id) {
    detailData.value = undefined
    return
  }
  loading.value = true
  try {
    detailData.value = await queryEquipmentRepairDetail(props.id)
    await initFaultReasons(detailData.value?.equipmentId)
    syncDetailToForms()
    if (props.printAfterLoaded) {
      await nextTick()
      window.print()
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.id,
  async () => {
    await loadDetail()
  },
  { immediate: true }
)

watch(
  () => props.actionType,
  (value) => {
    activeTab.value = value === "confirm" ? "confirm" : "feedback"
  },
  { immediate: true }
)

const onRepairModeChange = (value: number) => {
  if (value !== EquipmentRepairMode.External) {
    feedbackForm.entrustUnit = ""
  }
}

const onRepairResultChange = (value: number | "") => {
  if (Number(value) !== EquipmentRepairResult.NextRound) {
    feedbackForm.nextRoundReason = ""
    feedbackForm.handoverContent = ""
    feedbackForm.handoverTime = ""
    feedbackForm.handoverUserId = ""
    feedbackForm.handoverUserNo = ""
  }
}

const onFaultReasonChange = (value: string) => {
  const target = faultReasonOptions.value.find((item) => item.value === value)
  feedbackForm.faultReasonName = target?.label || ""
}

const onRepairUserChange = (value: string) => {
  if (!value) {
    feedbackForm.repairUserNo = ""
  }
}

const onHandoverUserChange = (value: string) => {
  if (!value) {
    feedbackForm.handoverUserNo = ""
  }
}

const onExecuteUserChange = (value: string) => {
  if (!value) {
    confirmForm.executeUserNo = ""
  }
}

const onConfirmUserChange = (value: string) => {
  if (!value) {
    confirmForm.confirmUserNo = ""
  }
}

const onPersonVisibleChange = (visible: boolean, scene: PersonScene) => {
  if (!visible) {
    return
  }
  personScene.value = scene
  selectPersonVisible.value = true
}

const onSelectPersonSuccess = (list: ITree[]) => {
  if (!list.length) {
    return
  }
  const first = list[0]
  const option = {
    label: first.label,
    value: first.id
  }
  if (personScene.value === "repairUser") {
    selectedRepairUserOptions.value = [option]
    feedbackForm.repairUserId = first.id
    feedbackForm.repairUserNo = first.no || ""
    return
  }
  if (personScene.value === "handoverUser") {
    selectedHandoverUserOptions.value = [option]
    feedbackForm.handoverUserId = first.id
    feedbackForm.handoverUserNo = first.no || ""
    return
  }
  if (personScene.value === "executeUser") {
    selectedExecuteUserOptions.value = [option]
    confirmForm.executeUserId = first.id
    confirmForm.executeUserNo = first.no || ""
    return
  }
  selectedConfirmUserOptions.value = [option]
  confirmForm.confirmUserId = first.id
  confirmForm.confirmUserNo = first.no || ""
}

const onSelectMroSuccess = (list: IMroInfoPageListItem[]) => {
  const existedIds = new Set(feedbackForm.replacementParts.map((item) => item.mroId))
  list.forEach((item) => {
    if (existedIds.has(String(item.id))) {
      return
    }
    feedbackForm.replacementParts.push({
      id: `part-${item.id}`,
      mroId: String(item.id),
      mroNo: String(item.mroNo || ""),
      mroName: String(item.mroModelVo?.mroModelName || item.entityName || ""),
      mroSpec: String(item.mroModelVo?.mroSpec || ""),
      mroClassifyName: String(item.mroModelVo?.mroClassifyName || ""),
      mroCategoryName: String(item.mroModelVo?.mroCategoryName || ""),
      quantity: 1,
      remarks: ""
    })
  })
}

const onDownloadAttachment = async (row: AttachmentRow) => {
  const fileId = String(row.fileId || "")
  if (fileId) {
    await fileDownloadHandle(fileId, row.fileName || "download")
    return
  }
  if (row.path) {
    const link = document.createElement("a")
    link.href = new URL(row.path, window.location.origin).toString()
    link.download = row.fileName || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const onSubmitFeedback = async () => {
  const valid = await feedbackFormRef.value?.validate().catch(() => false)
  if (!valid || !props.id) {
    return
  }
  feedbackLoading.value = true
  try {
    await requestFeedbackEquipmentRepair({
      id: props.id,
      repairUserId: feedbackForm.repairUserId,
      repairMode: Number(feedbackForm.repairMode),
      entrustUnit: feedbackForm.entrustUnit,
      receiveTime: feedbackForm.receiveTime,
      repairTime: feedbackForm.repairTime,
      repairMethod: feedbackForm.repairMethod,
      repairResult: Number(feedbackForm.repairResult),
      nextRoundReason: feedbackForm.nextRoundReason,
      handoverContent: feedbackForm.handoverContent,
      faultReasonId: feedbackForm.faultReasonId,
      faultReasonName: feedbackForm.faultReasonName,
      faultReasonAnalysis: feedbackForm.faultReasonAnalysis,
      handoverTime: feedbackForm.handoverTime,
      handoverUserId: feedbackForm.handoverUserId,
      prepareDuration: Number(feedbackForm.prepareDuration || 0),
      waitPartsDuration: Number(feedbackForm.waitPartsDuration || 0),
      actualRepairDuration: Number(feedbackForm.actualRepairDuration || 0),
      downDuration: Number(feedbackForm.downDuration || 0),
      preventiveMeasures: feedbackForm.preventionImprovementMeasures,
      improvementMeasures: feedbackForm.preventionImprovementMeasures,
      replacementParts: feedbackForm.replacementParts.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 1)
      })),
      fileIds: attachmentList.value.map((item) => String(item.fileId || item.id || "")).filter(Boolean),
      remarks: feedbackForm.remarks
    })
    ElMessage.success("维修反馈已保存")
    await loadDetail()
    emit("success")
  } finally {
    feedbackLoading.value = false
  }
}

const onSubmitConfirm = async () => {
  const valid = await confirmFormRef.value?.validate().catch(() => false)
  if (!valid || !props.id) {
    return
  }
  confirmLoading.value = true
  try {
    await requestConfirmEquipmentRepair({
      id: props.id,
      executeUserId: confirmForm.executeUserId,
      confirmUserId: confirmForm.confirmUserId,
      isImplemented: Number(confirmForm.isImplemented),
      acceptanceOpinion: confirmForm.acceptanceOpinion
    })
    ElMessage.success("确认/验收已保存")
    await loadDetail()
    emit("success")
  } finally {
    confirmLoading.value = false
  }
}

const onPrint = () => {
  window.print()
}
</script>

<style scoped lang="scss">
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.section-title {
  margin-top: 16px;
}
.base-info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px 20px;
  padding: 16px 20px 12px;
}

.base-info-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
}

.base-info-label {
  width: 120px;
  flex: none;
  text-align: right;
  color: #a8abb2;
}

.base-info-content {
  flex: 1;
  min-width: 0;
  color: #303133;
  word-break: break-all;
}

.base-info-item.full-span {
  grid-column: 1 / -1;
}

.detail-tabs {
  margin-top: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.detail-form :deep(.full-span) {
  grid-column: 1 / -1;
}

.detail-subsection {
  padding: 8px 12px;
  border-radius: 6px;
  background: #f4f6fb;
  color: #606266;
  font-weight: 600;
  line-height: 20px;
}

.tab-action,
.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 12px;
}

.layout-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1440px) {
  .base-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .base-info-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>


