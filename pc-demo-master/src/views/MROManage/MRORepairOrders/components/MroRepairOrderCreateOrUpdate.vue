<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content" v-loading="loading">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <CustomForm ref="customFormRef" v-model="formInline" :configs="formConfigs" />
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
    </div>

    <SelectMroDialog
      v-model="selectMroVisible"
      :selected-row-keys="[mroInfoId]"
      identity-manage
      @success="onSelectMroSuccess"
    />

    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="formInline.reportUserId ? [formInline.reportUserId] : []"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryMroRepairDetail,
  requestCreateMroRepair,
  requestUpdateMroRepair
} from "@/api/operation/mro/mro-repair"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import {
  EnumMRORepairMode,
  type EnumMRORepairMode as EnumMRORepairModeType,
  EnumMRORepairModeMap,
  EnumSelectUser
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"

defineOptions({
  name: "MroRepairOrderCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    id?: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const [formInline, resetFormInline] = useResetRef<{
  mroNo: string
  mroModelNo: string
  mroModelName: string
  lifeSpan: string
  reportUserId: string
  reportUserNo: string
  mroModelId: string
  mroSpec: string
  mroClassifyName: string
  mroCategoryName: string
  faultDescription: string
  analysis: string
  solutionMeasures: string
  repairMode: EnumMRORepairModeType
  entrustUnit: string
}>({
  mroNo: "",
  mroModelNo: "",
  mroModelName: "",
  lifeSpan: "",
  reportUserId: "",
  reportUserNo: "",
  mroModelId: "",
  mroSpec: "",
  mroClassifyName: "",
  mroCategoryName: "",
  faultDescription: "",
  analysis: "",
  solutionMeasures: "",
  repairMode: EnumMRORepairMode.INTERNAL,
  entrustUnit: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const loading = ref(false)
const submitLoading = ref(false)
const mroInfoId = ref("")

const selectMroVisible = ref(false)
const selectedMroList = ref<IOption[]>([])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const pageTitle = computed(() => (props.id ? "编辑维修" : "新建维修"))

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "MRO序列号",
    field: "mroNo",
    props: {
      placeholder: "请选择",
      clearable: false,
      multiple: false,
      customChildren: selectedMroList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: ($event: boolean) => onSelectMroVisibleChange($event)
    },
    rules: [{ required: true, message: "请选择", trigger: "change" }]
  },
  {
    componentType: "el-input",
    label: "MRO编号",
    field: "mroModelNo",
    props: {
      disabled: true,
      placeholder: "自动带出"
    }
  },
  {
    componentType: "el-input",
    label: "MRO名称",
    field: "mroModelName",
    props: {
      disabled: true,
      placeholder: "自动带出"
    }
  },
  {
    componentType: "el-input",
    label: "维修前寿命(次)",
    field: "lifeSpan",
    props: {
      disabled: true,
      placeholder: "自动带出"
    }
  },
  {
    componentType: "el-select",
    label: "报修人名称",
    field: "reportUserId",
    props: {
      placeholder: "请选择",
      clearable: true,
      multiple: false,
      customChildren: selectedPersonList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      change: ($event: string) => onSelectPersonChange($event),
      visibleChange: ($event: boolean) => onSelectPersonVisibleChange($event)
    },
    rules: [{ required: true, message: "请选择", trigger: "change" }]
  },
  {
    componentType: "el-input",
    label: "报修人编号",
    field: "reportUserNo",
    props: {
      disabled: true,
      placeholder: "自动带出"
    }
  },
  {
    componentType: "el-select",
    label: "维修方式",
    field: "repairMode",
    props: {
      placeholder: "请选择",
      customChildren: Object.entries(EnumMRORepairModeMap).map(([key, label]) => ({
        componentType: "el-option",
        props: {
          label,
          value: Number(key)
        }
      }))
    },
    events: {
      change: (value: EnumMRORepairModeType) => {
        if (value !== EnumMRORepairMode.EXTERNAL) {
          formInline.value.entrustUnit = ""
        }
      }
    },
    rules: [{ required: true, message: "请选择", trigger: "change" }]
  },
  {
    componentType: "el-input",
    label: "委托单位",
    field: "entrustUnit",
    hidden: formInline.value.repairMode !== EnumMRORepairMode.EXTERNAL,
    props: {
      clearable: true,
      placeholder: "请输入"
    },
    rules:
      formInline.value.repairMode === EnumMRORepairMode.EXTERNAL
        ? [{ required: true, message: "请输入", trigger: "blur" }]
        : []
  },
  {
    componentType: "el-input",
    label: "故障描述",
    field: "faultDescription",
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true,
      clearable: true,
      placeholder: "请输入"
    },
    rules: [{ required: false, message: "请填写", trigger: "blur" }]
  }
])

const resetState = () => {
  customFormRef.value?.resetForm()
  resetFormInline()
  mroInfoId.value = ""
  selectedMroList.value = []
  selectedPersonList.value = []
}

const initById = async (id?: string) => {
  resetState()
  if (!id) {
    return
  }

  loading.value = true
  try {
    const row = await queryMroRepairDetail(id)
    if (!row) return

    mroInfoId.value = row.mroInformationId || ""
    formInline.value.mroNo = row.mroNo || ""
    formInline.value.mroModelId = row.mroModelId || ""
    formInline.value.mroModelNo = row.mroModelNo || ""
    formInline.value.mroModelName = row.mroModelName || ""
    formInline.value.lifeSpan = String(row.repairBeforeLife ?? "")
    formInline.value.reportUserId = row.reportUser?.id || ""
    formInline.value.reportUserNo = row.reportUser?.empNo || ""
    formInline.value.mroSpec = row.mroSpec || ""
    formInline.value.mroClassifyName = row.mroClassifyName || ""
    formInline.value.mroCategoryName = row.mroCategoryName || ""
    formInline.value.faultDescription = row.faultDescription || ""
    formInline.value.analysis = row.analysis || ""
    formInline.value.solutionMeasures = row.solutionMeasures || ""
    formInline.value.repairMode = (row.repairMode as EnumMRORepairModeType) || EnumMRORepairMode.INTERNAL
    formInline.value.entrustUnit = row.entrustUnit || ""

    selectedMroList.value = row.mroNo
      ? [
          {
            label: row.mroNo,
            value: row.mroNo
          }
        ]
      : []
    selectedPersonList.value = row.reportUser?.id
      ? [
          {
            label: row.reportUser?.name,
            value: row.reportUser?.id
          }
        ]
      : []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.id,
  async (id) => {
    await initById(id)
  },
  { immediate: true }
)

const onSelectMroVisibleChange = (dialogVisible: boolean) => {
  if (dialogVisible) {
    selectMroVisible.value = true
  }
}

const onSelectMroSuccess = (data: IMroInfoPageListItem[]) => {
  if (!data.length) {
    return
  }

  const first = data[0]
  selectedMroList.value = [
    {
      label: first.mroNo,
      value: first.mroNo
    }
  ]

  formInline.value.mroNo = first.mroNo
  formInline.value.mroModelId = first.mroModelId
  formInline.value.mroModelNo = first.mroModelVo?.mroModelNo || ""
  formInline.value.mroModelName = first.mroModelVo?.mroModelName || first.entityName || ""
  formInline.value.lifeSpan = String(first.lifeSpan ?? first.usedLife ?? "")
  formInline.value.mroSpec = first.mroModelVo?.mroSpec || ""
  formInline.value.mroClassifyName = first.mroModelVo?.mroClassifyName || ""
  formInline.value.mroCategoryName = first.mroModelVo?.mroCategoryName || ""
  mroInfoId.value = first.id
}

const onSelectPersonVisibleChange = (dialogVisible: boolean) => {
  if (dialogVisible) {
    selectPersonVisible.value = true
  }
}

const onSelectPersonChange = (value: string) => {
  if (!value) {
    formInline.value.reportUserNo = ""
  }
}

const onSelectPersonSuccess = (data: ITree[]) => {
  if (!data.length) {
    return
  }
  const first = data[0]
  selectedPersonList.value = [
    {
      label: first.label,
      value: first.id
    }
  ]
  formInline.value.reportUserId = first.id
  formInline.value.reportUserNo = first.no
}

const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (!mroInfoId.value) {
    ElMessage.error("请选择MRO")
    return
  }

  const payload = {
    mroInformationId: mroInfoId.value,
    mroNo: formInline.value.mroNo,
    mroModelId: formInline.value.mroModelId,
    mroModelNo: formInline.value.mroModelNo,
    mroModelName: formInline.value.mroModelName,
    mroSpec: formInline.value.mroSpec,
    mroClassifyName: formInline.value.mroClassifyName,
    mroCategoryName: formInline.value.mroCategoryName,
    repairBeforeLife: Number(formInline.value.lifeSpan || 0),
    faultDescription: formInline.value.faultDescription,
    analysis: formInline.value.analysis,
    solutionMeasures: formInline.value.solutionMeasures,
    repairMode: Number(formInline.value.repairMode),
    entrustUnit: formInline.value.entrustUnit,
    reportUserId: formInline.value.reportUserId
  }

  submitLoading.value = true
  try {
    if (props.id) {
      await requestUpdateMroRepair({
        id: props.id,
        ...payload
      })
      ElMessage.success("编辑成功")
    } else {
      await requestCreateMroRepair(payload)
      ElMessage.success("新建成功")
    }
    emit("success")
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-toolbar {
  margin-bottom: 16px;
}

.layout-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
