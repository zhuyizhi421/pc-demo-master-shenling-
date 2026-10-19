<template>
  <CustomDialog v-model="visible" :title="dialogTitle" size="mini">
    <div class="action-dialog">
      <div class="action-summary">
        <div class="action-summary__item">
          <span class="label">{{ summaryLabels.mroNo }}</span>
          <span class="value">{{ row?.mroNo || "-" }}</span>
        </div>
        <div class="action-summary__item">
          <span class="label">{{ summaryLabels.mroInfo }}</span>
          <span class="value">{{ row?.mroModelVo?.mroModelName || "-" }}</span>
        </div>
        <div class="action-summary__item">
          <span class="label">{{ summaryLabels.currentStatus }}</span>
          <span class="value">{{ formatLedgerStatus(row?.ledgerStatus) }}</span>
        </div>
        <div class="action-summary__item">
          <span class="label">{{ summaryLabels.nextStatus }}</span>
          <span class="value">{{ nextStatusText }}</span>
        </div>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="88px">
        <el-form-item v-if="mode === 'archive'" :label="archiveReasonLabel" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            :placeholder="archiveReasonPlaceholder"
          />
        </el-form-item>

        <template v-if="mode === 'unarchive'">
          <el-form-item :label="unarchiveMethodLabel" prop="method">
            <el-select v-model="formData.method" placeholder="请选择解封方式" class="w-full">
              <el-option
                v-for="item in unarchiveMethodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="unarchiveReasonLabel" prop="reason">
            <el-input
              v-model="formData.reason"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="请输入解封原因"
            />
          </el-form-item>
        </template>

        <el-form-item v-if="mode === 'scrap'" :label="remarkLabel" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            :placeholder="scrapRemarkPlaceholder"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ cancelText }}</el-button>
      <el-button type="primary" @click="submit">{{ confirmText }}</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { type FormInstance, type FormRules } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import type { IMroInfoLedgerActionParams, IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"

import { formatLedgerStatus, formatUnarchiveMethod } from "../status"

defineOptions({
  name: "MroLedgerStatusActionDialog"
})

type TLedgerActionMode = "archive" | "unarchive" | "scrap"

const archiveReasonLabel = "\u5c01\u5b58\u539f\u56e0"
const archiveReasonPlaceholder = "\u8bf7\u8f93\u5165\u5c01\u5b58\u539f\u56e0"
const remarkLabel = "\u5907\u6ce8"
const unarchiveMethodLabel = "\u89e3\u5c01\u65b9\u5f0f"
const unarchiveReasonLabel = "\u89e3\u5c01\u539f\u56e0"
const scrapRemarkPlaceholder = "\u8bf7\u8f93\u5165\u62a5\u5e9f\u5907\u6ce8\uff0c\u53ef\u4e0d\u586b"
const cancelText = "\u53d6\u6d88"

const summaryLabels = {
  mroNo: "MRO\u5e8f\u5217\u53f7",
  mroInfo: "MRO\u4fe1\u606f",
  currentStatus: "\u5f53\u524d\u72b6\u6001",
  nextStatus: "\u76ee\u6807\u72b6\u6001"
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: TLedgerActionMode
    row?: IMroInfoPageListItem | null
  }>(),
  {
    modelValue: false,
    mode: "archive",
    row: null
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IMroInfoLedgerActionParams): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const formRef = ref<FormInstance>()
const formData = reactive({
  method: "offline_verify" as NonNullable<IMroInfoLedgerActionParams["method"]>,
  reason: "",
  remark: ""
})

const dialogTitleMap: Record<TLedgerActionMode, string> = {
  archive: "\u5c01\u5b58MRO",
  unarchive: "\u89e3\u5c01MRO",
  scrap: "\u62a5\u5e9fMRO"
}

const nextStatusTextMap: Record<TLedgerActionMode, string> = {
  archive: "\u5c01\u5b58",
  unarchive: "\u542f\u7528",
  scrap: "\u62a5\u5e9f"
}

const confirmTextMap: Record<TLedgerActionMode, string> = {
  archive: "\u786e\u8ba4\u5c01\u5b58",
  unarchive: "\u786e\u8ba4\u89e3\u5c01",
  scrap: "\u786e\u8ba4\u62a5\u5e9f"
}

const dialogTitle = computed(() => dialogTitleMap[props.mode])
const nextStatusText = computed(() => nextStatusTextMap[props.mode])
const confirmText = computed(() => confirmTextMap[props.mode])
const unarchiveMethodOptions = computed(() => {
  const options: { label: string; value: NonNullable<IMroInfoLedgerActionParams["method"]> }[] = [
    {
      label: formatUnarchiveMethod("offline_verify"),
      value: "offline_verify"
    }
  ]

  if (props.row?.mroModelVo?.maintenanceManage === 1) {
    options.push({
      label: formatUnarchiveMethod("maintenance"),
      value: "maintenance"
    })
  }

  if (props.row?.mroModelVo?.checkManage === 1) {
    options.push({
      label: formatUnarchiveMethod("inspection"),
      value: "inspection"
    })
  }

  return options
})

const rules = computed<FormRules<typeof formData>>(() => ({
  reason:
    props.mode === "archive" || props.mode === "unarchive"
      ? [
          {
            required: true,
            message:
              props.mode === "archive"
                ? "\u8bf7\u8f93\u5165\u5c01\u5b58\u539f\u56e0"
                : "\u8bf7\u8f93\u5165\u89e3\u5c01\u539f\u56e0",
            trigger: "blur"
          }
        ]
      : [],
  method:
    props.mode === "unarchive"
      ? [
          {
            required: true,
            message: "\u8bf7\u9009\u62e9\u89e3\u5c01\u65b9\u5f0f",
            trigger: "change"
          }
        ]
      : [],
  remark: []
}))

const resetFormData = () => {
  formData.method =
    props.mode === "unarchive" && unarchiveMethodOptions.value.some((item) => item.value === props.row?.unarchiveMethod)
      ? (props.row?.unarchiveMethod as NonNullable<IMroInfoLedgerActionParams["method"]>)
      : unarchiveMethodOptions.value[0]?.value || "offline_verify"
  formData.reason =
    props.mode === "archive"
      ? props.row?.archiveReason || ""
      : props.mode === "unarchive"
        ? props.row?.unarchiveReason || ""
        : ""
  formData.remark = ""
}

watch(
  () => [props.modelValue, props.mode, props.row?.id],
  ([nextVisible]) => {
    if (!nextVisible) {
      return
    }
    resetFormData()
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
)

const submit = async () => {
  if (!props.row?.id) {
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (valid === false) {
    return
  }

  emit("success", {
    id: props.row.id,
    method: props.mode === "unarchive" ? formData.method : undefined,
    reason:
      props.mode === "archive" || props.mode === "unarchive"
        ? formData.reason.trim()
        : undefined,
    remark: props.mode === "scrap" ? formData.remark.trim() : undefined
  })
}
</script>

<style scoped lang="scss">
.action-dialog {
  display: grid;
  gap: 16px;
}

.action-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
}

.action-summary__item {
  display: grid;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.value {
  color: var(--el-text-color-primary);
  line-height: 1.5;
  word-break: break-all;
}

@media (max-width: 768px) {
  .action-summary {
    grid-template-columns: 1fr;
  }
}
</style>
