<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content" v-loading="loading">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <div class="form-grid">
          <el-form-item label="设备编号/名称" prop="equipmentId" class="full-span">
            <el-select
              v-model="formData.equipmentId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择设备"
              @change="onEquipmentChange"
              @visible-change="onDeviceVisibleChange"
            >
              <el-option
                v-for="item in selectedDeviceOptions"
                :key="String(item.value)"
                :label="String(item.label)"
                :value="String(item.value)"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="报修单位" prop="reportUnit">
            <el-input v-model.trim="formData.reportUnit" maxlength="50" placeholder="请输入报修单位" />
          </el-form-item>

          <el-form-item label="报修人" prop="reportUserId">
            <el-select
              v-model="formData.reportUserId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择报修人"
              @change="onReportUserChange"
              @visible-change="onReportUserVisibleChange"
            >
              <el-option
                v-for="item in selectedReportUserOptions"
                :key="String(item.value)"
                :label="String(item.label)"
                :value="String(item.value)"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="报修人编号">
            <el-input v-model="formData.reportUserNo" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model.trim="formData.contactPhone"
              maxlength="30"
              placeholder="请输入联系电话"
            />
          </el-form-item>

          <el-form-item label="报修时间" prop="reportTime">
            <el-date-picker
              v-model="formData.reportTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
              placeholder="请选择报修时间"
            />
          </el-form-item>

          <el-form-item label="故障类型" prop="faultCategoryId">
            <el-select
              v-model="formData.faultCategoryId"
              class="w-full"
              clearable
              filterable
              placeholder="请选择故障类型"
            >
              <el-option
                v-for="item in faultCategoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="故障等级" prop="faultLevel">
            <el-select v-model="formData.faultLevel" class="w-full" placeholder="请选择故障等级">
              <el-option
                v-for="item in faultLevelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备编号">
            <el-input v-model="formData.equipmentNo" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="设备名称">
            <el-input v-model="formData.equipmentName" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="类型编号">
            <el-input v-model="formData.equipmentModelNo" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="类型名称">
            <el-input v-model="formData.equipmentModelName" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="设备所在地点" class="full-span">
            <el-input v-model="formData.locationName" disabled placeholder="自动带出" />
          </el-form-item>

          <el-form-item label="故障现象及影响情况" prop="faultDescription" class="full-span">
            <el-input
              v-model.trim="formData.faultDescription"
              type="textarea"
              maxlength="500"
              show-word-limit
              :rows="4"
              placeholder="请输入故障现象及影响情况"
            />
          </el-form-item>

          <el-form-item label="备注" class="full-span">
            <el-input
              v-model.trim="formData.remarks"
              type="textarea"
              maxlength="200"
              show-word-limit
              :rows="3"
              placeholder="请输入备注"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
    </div>

    <SelectDeviceDialog
      v-model="selectDeviceVisible"
      :selected-row-keys="formData.equipmentId ? [formData.equipmentId] : []"
      enable
      @success="onSelectDeviceSuccess"
    />

    <SelectPersonDialog
      v-model="selectReportUserVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="formData.reportUserId ? [formData.reportUserId] : []"
      @success="onSelectReportUserSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import {
  queryEquipmentRepairDetail,
  requestCreateEquipmentRepair,
  requestUpdateEquipmentRepair
} from "@/api/operation/equipment/equipment-repair"
import { requestEquipmentRepairBaseConfigList } from "@/api/operation/equipment/equipment-repair-base-config"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser } from "@/constant/enums"
import type { IOption } from "@/types/common"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

defineOptions({
  name: "DeviceRepairCreateOrUpdate"
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

const loading = ref(false)
const submitLoading = ref(false)
const selectDeviceVisible = ref(false)
const selectReportUserVisible = ref(false)
const formRef = ref<FormInstance>()

const selectedDeviceOptions = ref<IOption[]>([])
const selectedReportUserOptions = ref<IOption[]>([])
const selectedDevice = ref<IEquipmentPageItem>()
const faultCategoryOptions = ref<{ label: string; value: string }[]>([])
const faultLevelOptions = ref<{ label: string; value: string }[]>([])

const formData = reactive({
  equipmentId: "",
  equipmentNo: "",
  equipmentName: "",
  equipmentModelNo: "",
  equipmentModelName: "",
  locationName: "",
  reportUnit: "",
  reportUserId: "",
  reportUserNo: "",
  contactPhone: "",
  reportTime: "",
  faultCategoryId: "",
  faultLevel: "",
  faultDescription: "",
  remarks: ""
})

const pageTitle = computed(() => (props.id ? "编辑设备维修单" : "新建设备维修单"))

const formRules: FormRules = {
  equipmentId: [{ required: true, message: "请选择设备", trigger: "change" }],
  reportUnit: [{ required: true, message: "请输入报修单位", trigger: "blur" }],
  reportUserId: [{ required: true, message: "请选择报修人", trigger: "change" }],
  contactPhone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
  reportTime: [{ required: true, message: "请选择报修时间", trigger: "change" }],
  faultCategoryId: [{ required: true, message: "请选择故障类型", trigger: "change" }],
  faultLevel: [{ required: true, message: "请选择故障等级", trigger: "change" }],
  faultDescription: [{ required: true, message: "请输入故障现象及影响情况", trigger: "blur" }]
}

const resetForm = () => {
  formData.equipmentId = ""
  formData.equipmentNo = ""
  formData.equipmentName = ""
  formData.equipmentModelNo = ""
  formData.equipmentModelName = ""
  formData.locationName = ""
  formData.reportUnit = ""
  formData.reportUserId = ""
  formData.reportUserNo = ""
  formData.contactPhone = ""
  formData.reportTime = ""
  formData.faultCategoryId = ""
  formData.faultLevel = ""
  formData.faultDescription = ""
  formData.remarks = ""
  selectedDevice.value = undefined
  selectedDeviceOptions.value = []
  selectedReportUserOptions.value = []
  formRef.value?.clearValidate()
}

const parseLocation = (value?: string) => {
  const [areaName = "", productionUnitName = "", workstationName = ""] = String(value || "")
    .split("/")
    .map((item) => item.trim())
  return {
    areaName,
    productionUnitName,
    workstationName
  }
}

const syncEquipment = (row?: IEquipmentPageItem) => {
  selectedDevice.value = row
  formData.equipmentId = String(row?.id || "")
  formData.equipmentNo = String(row?.equipmentNo || "")
  formData.equipmentName = String(row?.equipmentName || "")
  formData.equipmentModelNo = String(row?.equipmentModel?.modelNo || "")
  formData.equipmentModelName = String(row?.equipmentModel?.modelName || "")
  const { areaName, productionUnitName, workstationName } = parseLocation(row?.fmEntityNames)
  formData.locationName = [areaName, productionUnitName, workstationName]
    .filter((item) => item)
    .join("/")
  selectedDeviceOptions.value = row?.id
    ? [
        {
          label: `${row.equipmentNo} / ${row.equipmentName}`,
          value: row.id
        }
      ]
    : []
}

const syncReportUser = (user?: { id?: string; name?: string; empNo?: string }) => {
  formData.reportUserId = String(user?.id || "")
  formData.reportUserNo = String(user?.empNo || "")
  selectedReportUserOptions.value = user?.id
    ? [
        {
          label: String(user?.name || "--"),
          value: String(user.id)
        }
      ]
    : []
}

const initFaultCategories = async () => {
  const list = await requestEquipmentRepairBaseConfigList("faultCategory")
  faultCategoryOptions.value = list.map((item) => ({
    label: item.configName,
    value: item.id
  }))
}

const initFaultLevels = async () => {
  const list = await requestEquipmentRepairBaseConfigList("faultLevel")
  faultLevelOptions.value = list.map((item) => ({
    label: item.configName,
    value: item.id
  }))
  if (!props.id && !formData.faultLevel) {
    formData.faultLevel = String(faultLevelOptions.value[0]?.value || "")
  }
}

const initById = async (id?: string) => {
  resetForm()
  if (!id) {
    return
  }
  loading.value = true
  try {
    const detail = await queryEquipmentRepairDetail(id)
    formData.reportUnit = String(detail?.reportUnit || "")
    formData.contactPhone = String(detail?.contactPhone || "")
    formData.reportTime = String(detail?.reportTime || "")
    formData.faultCategoryId = String(detail?.faultCategoryId || "")
    formData.faultLevel = String(detail?.faultLevel || "")
    formData.faultDescription = String(detail?.faultDescription || "")
    formData.remarks = String(detail?.remarks || "")
    syncEquipment({
      id: String(detail?.equipmentId || ""),
      equipmentNo: String(detail?.equipmentNo || ""),
      equipmentName: String(detail?.equipmentName || ""),
      fmEntityNames: String(detail?.locationName || detail?.areaName || ""),
      equipmentModel: {
        id: String(detail?.equipmentModelId || ""),
        modelNo: String(detail?.equipmentModelNo || ""),
        modelName: String(detail?.equipmentModelName || "")
      }
    } as IEquipmentPageItem)
    formData.locationName = [
      String(detail?.areaName || ""),
      String(detail?.productionUnitName || ""),
      String(detail?.workstationName || "")
    ]
      .filter((item) => item)
      .join("/")
    syncReportUser(detail?.reportUser)
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

onMounted(async () => {
  await Promise.all([initFaultCategories(), initFaultLevels()])
})

const onDeviceVisibleChange = (visible: boolean) => {
  if (visible) {
    selectDeviceVisible.value = true
  }
}

const onReportUserVisibleChange = (visible: boolean) => {
  if (visible) {
    selectReportUserVisible.value = true
  }
}

const onEquipmentChange = (value: string) => {
  if (!value) {
    syncEquipment(undefined)
  }
}

const onReportUserChange = (value: string) => {
  if (!value) {
    syncReportUser(undefined)
  }
}

const onSelectDeviceSuccess = (list: IEquipmentPageItem[]) => {
  if (!list.length) {
    return
  }
  syncEquipment(list[0])
}

const onSelectReportUserSuccess = (list: ITree[]) => {
  if (!list.length) {
    return
  }
  syncReportUser({
    id: list[0].id,
    name: list[0].label,
    empNo: list[0].no
  })
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  const selectedFaultCategory = faultCategoryOptions.value.find((item) => item.value === formData.faultCategoryId)
  const selectedFaultLevel = faultLevelOptions.value.find((item) => item.value === formData.faultLevel)

  submitLoading.value = true
  try {
    const payload = {
      equipmentId: formData.equipmentId,
      reportUnit: formData.reportUnit,
      reportUserId: formData.reportUserId,
      contactPhone: formData.contactPhone,
      reportTime: formData.reportTime,
      faultDescription: formData.faultDescription,
      faultCategoryId: formData.faultCategoryId,
      faultCategoryName: selectedFaultCategory?.label || "",
      faultLevel: String(formData.faultLevel || ""),
      faultLevelName: selectedFaultLevel?.label || "",
      remarks: formData.remarks,
      sourceType: 4
    }

    if (props.id) {
      await requestUpdateEquipmentRepair({
        id: props.id,
        ...payload
      })
      ElMessage.success("编辑成功")
    } else {
      await requestCreateEquipmentRepair(payload)
      ElMessage.success("新建成功")
    }
    emit("success")
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.page-toolbar {
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px 16px;
}

.form-grid :deep(.full-span) {
  grid-column: 1 / -1;
}

.layout-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1440px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

