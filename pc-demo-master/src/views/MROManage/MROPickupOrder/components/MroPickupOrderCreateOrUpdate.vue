<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="4">
        <template #mroPickupNo-default>
          {{ formData.mroPickupNo }}
        </template>

        <template #warehouseNo-default>
          {{ formData.warehouseNo || "--" }}
        </template>

        <template #status-default>
          <el-tag
            size="small"
            :type="formData.status === EnumMRORegisterStatus.NOT_REVIEWED ? 'danger' : 'success'"
          >
            {{ getStatusText(formData.status) }}
          </el-tag>
        </template>

        <template #createByName-default>
          {{ formData.createByName || "--" }}
        </template>

        <template #createTime-default>
          {{ formatDisplayTime(formData.createTime) }}
        </template>

        <template #sourceType-default>
          {{ sourceTypeMap[formData.sourceType] || "--" }}
        </template>

        <template #pickupEmpId-default>
          <div class="operator-field">
            <el-input
              :model-value="pickupPersonDisplay"
              readonly
              placeholder="请选择领用人"
              @click="openSelectPickupPersonDialog"
            />
            <el-button plain @click="openSelectPickupPersonDialog">选择</el-button>
            <el-button v-if="formData.pickupEmpId" link type="danger" @click="clearPickupPerson">
              清空
            </el-button>
          </div>
        </template>
      </CustomForm>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="领用明细">
        <div class="table-toolbar">
          <el-button type="primary" icon="Plus" @click="onAddMroInfoClick">新增MRO信息</el-button>
          <el-button type="primary" plain icon="Plus" @click="onAddMroResumeClick">
            新增MRO履历
          </el-button>
        </div>
      </CustomTitle>

      <CustomTable v-model:table-data="tableData" :config="tableConfig">
        <template #sourceDetailType-default="{ row }">
          {{ getDetailSourceTypeText(row.sourceDetailType) }}
        </template>

        <template #mroNo-default="{ row }">
          {{ row.mroNo || "--" }}
        </template>

        <template #barcode-default="{ row }">
          {{ row.barcode || "--" }}
        </template>

        <template #pickupQty-default="{ row }">
          <span v-if="row.sourceDetailType === 'mro_resume'">1</span>
          <el-input-number
            v-else
            v-model="row.pickupQty"
            :min="1"
            :precision="0"
            controls-position="right"
          />
        </template>

        <template #warehouseLocation-default="{ row }">
          <el-select
            v-model="row.warehouseLocationId"
            placeholder="请选择"
            filterable
            clearable
            @change="(val: string) => onWarehouseLocationChange(row, val)"
          >
            <el-option
              v-for="item in locationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>

        <template #remarks-default="{ row }">
          <el-input v-model="row.remarks" clearable />
        </template>

        <template #operation-default="{ $index }">
          <el-button type="danger" size="small" link @click="tableData.splice($index, 1)">删除</el-button>
        </template>
      </CustomTable>
    </div>
  </div>

  <SelectMroModelDialog
    v-model="selectMroModelVisible"
    :selected-row-keys="selectedMroModelIds"
    :identity-manage="0"
    multiple
    @success="onSelectMroModelSuccess"
  />

  <SelectMroDialog
    v-model="selectMroResumeVisible"
    title="选择MRO履历"
    :selected-row-keys="selectedMroResumeIds"
    :identity-manage="true"
    multiple
    @success="onSelectMroResumeSuccess"
  />

  <SelectPersonDialog
    v-model="selectPickupPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedPickupPersonIds"
    @success="onSelectPickupPersonSuccess"
  />

  <div class="layout-footer">
    <el-button @click="emit('close')">取消</el-button>
    <el-button type="primary" @click="onSubmit">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryFactoryModelList } from "@/api/fm"
import {
  requestCreateMroPickupOrder,
  requestUpdateMroPickupOrder
} from "@/api/operation/mro/mro-pickup-order"
import CustomForm from "@/components/CustomForm/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectMroModelDialog from "@/components/SelectMroModelDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import {
  EnumMRORegisterStatus,
  EnumSelectUser
} from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"
import type {
  IMroPickupOrderCreateTableItem as ITableRow,
  IMroPickupOrderPageListItem,
  MroPickupDetailSourceType,
  MroPickupOrderSourceType
} from "@/types/maintain/mro-manage/mro-pickup-order"

defineOptions({
  name: "MroPickupOrderCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    data?: IMroPickupOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const sourceTypeMap: Record<MroPickupOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const pickupOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const detailSourceTypeMap: Record<MroPickupDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const userStore = useUserStore()
const warehouseOptions = ref<(IOption & { code: string })[]>([])
const locationOptions = ref<(IOption & { code: string })[]>([])
const selectMroModelVisible = ref(false)
const selectMroResumeVisible = ref(false)
const selectPickupPersonVisible = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const isEdit = computed(() => !!props.data?.id)
const pageTitle = computed(() => (isEdit.value ? "编辑 MRO 领用单" : "新建 MRO 领用单"))
const selectedMroModelIds = computed(() =>
  tableData.value
    .filter((item) => item.sourceDetailType === "mro_info")
    .map((item) => item.mroModelId)
)
const selectedMroResumeIds = computed(() =>
  tableData.value
    .filter((item) => item.sourceDetailType === "mro_resume")
    .map((item) => String(item.mroId || ""))
)
const selectedPickupPersonIds = computed(() => (formData.pickupEmpId ? [formData.pickupEmpId] : []))
const pickupPersonDisplay = computed(() => formData.pickupEmpName || "")

const formData = reactive<{
  warehouseId: string
  warehouseNo: string
  pickupEmpId: string
  pickupEmpName: string
  pickupEmpNo: string
  pickupArea: string
  pickupProdUnit: string
  pickupStation: string
  mroPickupNo: string
  status: EnumMRORegisterStatus
  createByName: string
  createTime: string
  sourceType: MroPickupOrderSourceType
  remark: string
}>({
  warehouseId: "",
  warehouseNo: "",
  pickupEmpId: "",
  pickupEmpName: "",
  pickupEmpNo: "",
  pickupArea: "",
  pickupProdUnit: "",
  pickupStation: "",
  mroPickupNo: "",
  status: EnumMRORegisterStatus.NOT_REVIEWED,
  createByName: "",
  createTime: "",
  sourceType: "manual_create",
  remark: ""
})

const tableData = ref<ITableRow[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const getStatusText = (status: EnumMRORegisterStatus) => pickupOrderStatusMap[status]

const getDetailSourceTypeText = (sourceDetailType?: string) => {
  if (sourceDetailType === "mro_info" || sourceDetailType === "mro_resume") {
    return detailSourceTypeMap[sourceDetailType]
  }
  return "--"
}

const formConfigs = computed(() => [
  {
    componentType: "div",
    field: "mroPickupNo",
    label: "MRO领用单号：",
    hidden: !isEdit.value,
    slots: { default: "mroPickupNo-default" }
  },
  {
    componentType: "el-select",
    field: "warehouseId",
    label: "仓库名称：",
    props: {
      placeholder: "请选择仓库名称",
      filterable: true,
      customChildren: warehouseOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      change: onWarehouseChange
    },
    rules: [{ required: true, message: "请选择仓库", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "warehouseNo",
    label: "仓库编号：",
    props: {
      disabled: true
    }
  },
  {
    componentType: "div",
    field: "pickupEmpId",
    label: "领用人姓名：",
    slots: { default: "pickupEmpId-default" },
    rules: [{ required: true, message: "请选择领用人", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "pickupEmpNo",
    label: "领用人工号：",
    props: {
      disabled: true,
      placeholder: "自动带出"
    },
    rules: [{ required: true, message: "请选择领用人", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "pickupArea",
    label: "领用区域：",
    props: {
      clearable: true,
      placeholder: "请输入领用区域"
    },
    rules: [{ required: true, message: "请输入领用区域", trigger: "blur" }]
  },
  {
    componentType: "el-input",
    field: "pickupProdUnit",
    label: "领用生产单元：",
    props: {
      clearable: true,
      placeholder: "请输入领用生产单元"
    },
    rules: [{ required: true, message: "请输入领用生产单元", trigger: "blur" }]
  },
  {
    componentType: "el-input",
    field: "pickupStation",
    label: "领用工位：",
    props: {
      clearable: true,
      placeholder: "请输入领用工位"
    },
    rules: [{ required: true, message: "请输入领用工位", trigger: "blur" }]
  },
  {
    componentType: "el-input",
    field: "remark",
    label: "备注：",
    props: {
      type: "textarea",
      clearable: true
    }
  },
  {
    componentType: "div",
    field: "sourceType",
    label: "来源类型：",
    hidden: !isEdit.value,
    slots: { default: "sourceType-default" }
  },
  {
    componentType: "div",
    field: "status",
    label: "状态：",
    hidden: !isEdit.value,
    slots: { default: "status-default" }
  },
  {
    componentType: "div",
    field: "createByName",
    label: "创建人：",
    hidden: !isEdit.value,
    slots: { default: "createByName-default" }
  },
  {
    componentType: "div",
    field: "createTime",
    label: "创建时间：",
    hidden: !isEdit.value,
    slots: { default: "createTime-default" }
  }
])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "sourceDetailType",
      label: "明细来源",
      minWidth: 120,
      align: "center",
      slots: { default: "sourceDetailType-default" }
    },
    {
      prop: "mroModelNo",
      label: "MRO编号",
      minWidth: 150
    },
    {
      prop: "mroNo",
      label: "MRO序列号",
      minWidth: 150,
      slots: { default: "mroNo-default" }
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 170
    },
    {
      prop: "mroSpec",
      label: "MRO规格",
      minWidth: 140,
      formatter: ({ mroSpec }: ITableRow) => mroSpec || "--"
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      minWidth: 140,
      formatter: ({ mroClassifyName }: ITableRow) => mroClassifyName || "--"
    },
    {
      prop: "mroCategoryName",
      label: "MRO类型",
      minWidth: 140,
      formatter: ({ mroCategoryName }: ITableRow) => mroCategoryName || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      slots: { default: "barcode-default" }
    },
    {
      prop: "pickupQty",
      label: "领用数量",
      width: 140,
      align: "center",
      slots: { default: "pickupQty-default" }
    },
    {
      prop: "warehouseLocationId",
      label: "库位",
      minWidth: 160,
      align: "center",
      slots: { default: "warehouseLocation-default" }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180,
      align: "center",
      slots: { default: "remarks-default" }
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

onMounted(async () => {
  await getWarehouseOptions()

  if (props.data) {
    initFormData()
    if (formData.warehouseId) {
      await fetchWarehouseLocationList(formData.warehouseId)
    }
    return
  }

  initPickupEmployeeFromCurrentUser()
})

const setPickupPerson = (person?: { id?: string; name?: string; no?: string }) => {
  formData.pickupEmpId = person?.id || ""
  formData.pickupEmpName = person?.name || ""
  formData.pickupEmpNo = person?.no || ""
}

const initPickupEmployeeFromCurrentUser = () => {
  const userInfo = userStore.userInfo as Partial<{
    empId: string
    empName: string
    empNo: string
  }>
  if (!userInfo?.empId) return
  setPickupPerson({
    id: userInfo.empId,
    name: userInfo.empName,
    no: userInfo.empNo
  })
}

const openSelectPickupPersonDialog = () => {
  selectPickupPersonVisible.value = true
}

const clearPickupPerson = () => {
  setPickupPerson()
}

const onSelectPickupPersonSuccess = (data: ITree[]) => {
  if (!data.length) return
  setPickupPerson({
    id: data[0].id,
    name: data[0].label,
    no: data[0].no
  })
}

const getCurrentLocationName = (row: IMroInfoPageListItem) => {
  return row.productionAreaDisplayName || row.warehouseLocationName || row.entityName || row.displayStatus || ""
}

const onSelectMroModelSuccess = (rows: IMroModelPageListItem[]) => {
  rows.forEach((item) => {
    if (selectedMroModelIds.value.includes(item.id)) return
    tableData.value.push({
      mroModelId: item.id,
      mroModelName: item.mroModelName,
      mroModelNo: item.mroModelNo,
      mroSpec: item.mroSpec,
      mroClassifyName: item.mroClassifyName,
      mroCategoryName: item.mroCategoryName,
      identityManage: item.identityManage,
      pickupQty: "",
      remarks: item.remarks || "",
      sourceDetailType: "mro_info",
      warehouseLocationId: "",
      warehouseLocationName: "",
      warehouseLocationNo: ""
    })
  })
}

const onSelectMroResumeSuccess = (rows: IMroInfoPageListItem[]) => {
  rows.forEach((item) => {
    if (selectedMroResumeIds.value.includes(item.id)) return
    tableData.value.push({
      barcode: item.barcode,
      currentLocationName: getCurrentLocationName(item),
      identityManage: item.mroModelVo?.identityManage ?? 1,
      pickupQty: 1,
      mroId: item.id,
      mroModelId: item.mroModelId,
      mroModelName: item.mroModelVo?.mroModelName || "",
      mroModelNo: item.mroModelVo?.mroModelNo || "",
      mroNo: item.mroNo || "",
      mroSpec: item.mroModelVo?.mroSpec || "",
      mroClassifyName: item.mroModelVo?.mroClassifyName || "",
      mroCategoryName: item.mroModelVo?.mroCategoryName || "",
      remarks: item.remarks || "",
      sourceDetailType: "mro_resume",
      warehouseLocationId: item.warehouseLocationId || "",
      warehouseLocationName: item.warehouseLocationName || "",
      warehouseLocationNo: ""
    })
  })
}

const initFormData = () => {
  formData.warehouseId = props.data?.warehouseId || ""
  formData.warehouseNo = props.data?.warehouseNo || ""
  formData.pickupEmpId = props.data?.pickupEmpId || ""
  formData.pickupEmpName = props.data?.pickupEmpName || ""
  formData.pickupEmpNo = props.data?.pickupEmpNo || ""
  formData.pickupArea = props.data?.pickupArea || ""
  formData.pickupProdUnit = props.data?.pickupProdUnit || ""
  formData.pickupStation = props.data?.pickupStation || ""
  formData.mroPickupNo = props.data?.mroPickupNo || ""
  formData.status = (props.data?.status as EnumMRORegisterStatus) || EnumMRORegisterStatus.NOT_REVIEWED
  formData.createByName = props.data?.createByName || ""
  formData.createTime = props.data?.createTime || ""
  formData.sourceType = props.data?.sourceType || "manual_create"
  formData.remark = props.data?.remark || ""

  tableData.value = (props.data?.detailVos || []).map((item) => ({
    id: item.id,
    barcode: item.barcode,
    currentLocationName: item.currentLocationName,
    identityManage: item.identityManage,
    pickupQty: item.pickupQty,
    mroId: item.mroId,
    mroModelId: item.mroModelId,
    mroModelName: item.mroModelName,
    mroModelNo: item.mroModelNo,
    mroNo: item.mroNo,
    mroSpec: item.mroSpec,
    mroClassifyName: item.mroClassifyName,
    mroCategoryName: item.mroCategoryName,
    remarks: item.remarks,
    sourceDetailType: item.sourceDetailType,
    warehouseLocationId: item.warehouseLocationId,
    warehouseLocationName: item.warehouseLocationName,
    warehouseLocationNo: item.warehouseLocationNo
  }))
}

const getWarehouseOptions = async () => {
  const records = await queryFactoryModelList({
    isStorage: true,
    isEnable: true
  })

  warehouseOptions.value = records.map((item) => ({
    label: item.entityName,
    value: item.id,
    code: item.entityCode
  }))
}

const fetchWarehouseLocationList = async (facilityId: string) => {
  const records = await queryFactoryModelList({
    isStorageLocation: true,
    parentId: facilityId
  })

  locationOptions.value = records.map((item) => ({
    value: item.id,
    label: item.entityName,
    code: item.entityCode || ""
  }))
}

const onWarehouseLocationChange = (row: ITableRow, locationId: string) => {
  const target = locationOptions.value.find((item) => String(item.value) === String(locationId))
  row.warehouseLocationId = locationId || ""
  row.warehouseLocationName = target?.label || ""
  row.warehouseLocationNo = target?.code || ""
}

const onWarehouseChange = async (val: string) => {
  if (val) {
    formData.warehouseNo = warehouseOptions.value.find((item) => item.value === val)?.code || ""
    await fetchWarehouseLocationList(val)
  } else {
    formData.warehouseNo = ""
    locationOptions.value = []
  }

  tableData.value.forEach((item) => {
    item.warehouseLocationId = ""
    item.warehouseLocationName = ""
    item.warehouseLocationNo = ""
  })
}

const requireWarehouseBeforeSelect = () => {
  if (formData.warehouseId) return true
  ElMessage.error("请先选择仓库")
  return false
}

const onAddMroInfoClick = () => {
  if (!requireWarehouseBeforeSelect()) return
  selectMroModelVisible.value = true
}

const onAddMroResumeClick = () => {
  if (!requireWarehouseBeforeSelect()) return
  selectMroResumeVisible.value = true
}

const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (!tableData.value.length) {
    return ElMessage.warning("请至少选择一条领用明细")
  }

  const invalidQtyRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_info" && Number(item.pickupQty || 0) <= 0
  )
  if (invalidQtyRow) {
    return ElMessage.warning(`${invalidQtyRow.mroModelName} 的领用数量必须大于0`)
  }

  const resumeIdSet = new Set<string>()
  for (const row of tableData.value.filter((item) => item.sourceDetailType === "mro_resume")) {
    const mroId = String(row.mroId || "")
    if (!mroId) {
      return ElMessage.warning("MRO履历明细缺少MRO序列号")
    }
    if (resumeIdSet.has(mroId)) {
      return ElMessage.warning("同一MRO序列号在同一领用单中不允许重复")
    }
    resumeIdSet.add(mroId)
  }

  const payload = {
    warehouseId: formData.warehouseId,
    pickupEmpId: formData.pickupEmpId,
    pickupEmpName: formData.pickupEmpName,
    pickupEmpNo: formData.pickupEmpNo,
    pickupArea: formData.pickupArea,
    pickupProdUnit: formData.pickupProdUnit,
    pickupStation: formData.pickupStation,
    remark: formData.remark,
    data: tableData.value.map((item) => ({
      id: item.id,
      mroId: item.mroId,
      mroModelId: item.mroModelId,
      pickupQty: item.sourceDetailType === "mro_resume" ? 1 : Number(item.pickupQty),
      remarks: item.remarks,
      sourceDetailType: item.sourceDetailType,
      warehouseLocationId: item.warehouseLocationId || ""
    }))
  }

  if (isEdit.value) {
    await requestUpdateMroPickupOrder({
      id: props.data!.id,
      ...payload
    })
  } else {
    await requestCreateMroPickupOrder(payload)
  }

  ElMessage.success(`${isEdit.value ? "编辑" : "新建"}成功`)
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.page-toolbar {
  margin-bottom: 12px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operator-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .el-input {
    flex: 1;
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>
