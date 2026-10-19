<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="4">
        <template #mroReturnNo-default>
          {{ formData.mroReturnNo }}
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

        <template #linkedMroInboundNo-default>
          {{ formData.linkedMroInboundNo || "--" }}
        </template>

        <template #returnEmpId-default>
          <div class="operator-field">
            <el-input
              :model-value="returnPersonDisplay"
              readonly
              placeholder="请选择还回人"
              @click="openSelectReturnPersonDialog"
            />
            <el-button plain @click="openSelectReturnPersonDialog">选择</el-button>
            <el-button v-if="formData.returnEmpId" link type="danger" @click="clearReturnPerson">
              清空
            </el-button>
          </div>
        </template>
      </CustomForm>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="还回明细">
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

        <template #returnQty-default="{ row }">
          <span v-if="row.sourceDetailType === 'mro_resume'">1</span>
          <el-input-number
            v-else
            v-model="row.returnQty"
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
    v-model="selectReturnPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedReturnPersonIds"
    @success="onSelectReturnPersonSuccess"
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
  requestCreateMroReturnOrder,
  requestUpdateMroReturnOrder
} from "@/api/operation/mro/mro-return-order.ts"
import CustomForm from "@/components/CustomForm/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectMroModelDialog from "@/components/SelectMroModelDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumMRORegisterStatus, EnumSelectUser } from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"
import type {
  IMroReturnOrderCreateTableItem as ITableRow,
  IMroReturnOrderPageListItem,
  MroReturnDetailSourceType,
  MroReturnOrderSourceType
} from "@/types/maintain/mro-manage/mro-return-order"

defineOptions({
  name: "MroReturnOrderCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    data?: IMroReturnOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const sourceTypeMap: Record<MroReturnOrderSourceType, string> = {
  manual_create: "手工新增",
  terminal_direct: "终端提交"
}
const returnOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const detailSourceTypeMap: Record<MroReturnDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const userStore = useUserStore()
const warehouseOptions = ref<(IOption & { code: string })[]>([])
const locationOptions = ref<(IOption & { code: string })[]>([])
const selectMroModelVisible = ref(false)
const selectMroResumeVisible = ref(false)
const selectReturnPersonVisible = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const isEdit = computed(() => !!props.data?.id)
const pageTitle = computed(() => (isEdit.value ? "编辑 MRO 还回单" : "新建 MRO 还回单"))
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
const selectedReturnPersonIds = computed(() => (formData.returnEmpId ? [formData.returnEmpId] : []))
const returnPersonDisplay = computed(() => formData.returnEmpName || "")

const formData = reactive<{
  warehouseId: string
  warehouseNo: string
  returnEmpId: string
  returnEmpName: string
  returnEmpNo: string
  returnArea: string
  mroReturnNo: string
  linkedMroInboundNo: string
  status: EnumMRORegisterStatus
  createByName: string
  createTime: string
  sourceType: MroReturnOrderSourceType
  remark: string
}>({
  warehouseId: "",
  warehouseNo: "",
  returnEmpId: "",
  returnEmpName: "",
  returnEmpNo: "",
  returnArea: "",
  mroReturnNo: "",
  linkedMroInboundNo: "",
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

const getStatusText = (status: EnumMRORegisterStatus) => returnOrderStatusMap[status]

const getDetailSourceTypeText = (sourceDetailType?: string) => {
  if (sourceDetailType === "mro_info" || sourceDetailType === "mro_resume") {
    return detailSourceTypeMap[sourceDetailType]
  }
  return "--"
}

const formConfigs = computed(() => [
  {
    componentType: "div",
    field: "mroReturnNo",
    label: "MRO还回单号：",
    hidden: !isEdit.value,
    slots: { default: "mroReturnNo-default" }
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
    field: "returnEmpId",
    label: "还回人姓名：",
    slots: { default: "returnEmpId-default" },
    rules: [{ required: true, message: "请选择还回人", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "returnEmpNo",
    label: "还回人工号：",
    props: {
      disabled: true,
      placeholder: "自动带出"
    },
    rules: [{ required: true, message: "请选择还回人", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "returnArea",
    label: "还回区域：",
    props: {
      clearable: true,
      placeholder: "请输入还回区域"
    },
    rules: [{ required: true, message: "请输入还回区域", trigger: "blur" }]
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
    field: "linkedMroInboundNo",
    label: "关联MRO入库单号：",
    hidden: !isEdit.value,
    slots: { default: "linkedMroInboundNo-default" }
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
      prop: "returnQty",
      label: "还回数量",
      width: 140,
      align: "center",
      slots: { default: "returnQty-default" }
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

  initReturnEmployeeFromCurrentUser()
})

const setReturnPerson = (person?: { id?: string; name?: string; no?: string }) => {
  formData.returnEmpId = person?.id || ""
  formData.returnEmpName = person?.name || ""
  formData.returnEmpNo = person?.no || ""
}

const initReturnEmployeeFromCurrentUser = () => {
  const userInfo = userStore.userInfo as Partial<{
    empId: string
    empName: string
    empNo: string
  }>
  if (!userInfo?.empId) return
  setReturnPerson({
    id: userInfo.empId,
    name: userInfo.empName,
    no: userInfo.empNo
  })
}

const openSelectReturnPersonDialog = () => {
  selectReturnPersonVisible.value = true
}

const clearReturnPerson = () => {
  setReturnPerson()
}

const onSelectReturnPersonSuccess = (data: ITree[]) => {
  if (!data.length) return
  setReturnPerson({
    id: data[0].id,
    name: data[0].label,
    no: data[0].no
  })
}

const getCurrentLocationName = (row: IMroInfoPageListItem) => {
  return (
    row.productionAreaDisplayName ||
    row.warehouseLocationName ||
    row.entityName ||
    row.displayStatus ||
    ""
  )
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
      returnQty: "",
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
      returnQty: 1,
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
  formData.returnEmpId = props.data?.returnEmpId || ""
  formData.returnEmpName = props.data?.returnEmpName || ""
  formData.returnEmpNo = props.data?.returnEmpNo || ""
  formData.returnArea = props.data?.returnArea || ""
  formData.mroReturnNo = props.data?.mroReturnNo || ""
  formData.linkedMroInboundNo = props.data?.linkedMroInboundNo || ""
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
    returnQty: item.returnQty,
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
    return ElMessage.warning("请至少选择一条还回明细")
  }

  const invalidQtyRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_info" && Number(item.returnQty || 0) <= 0
  )
  if (invalidQtyRow) {
    return ElMessage.warning(`${invalidQtyRow.mroModelName} 的还回数量必须大于 0`)
  }

  const locationRequiredRow = tableData.value.find((item) => !item.warehouseLocationId)
  if (locationRequiredRow) {
    return ElMessage.warning(`${locationRequiredRow.mroModelName} 缺少库位，请补全`)
  }

  const resumeIdSet = new Set<string>()
  for (const row of tableData.value.filter((item) => item.sourceDetailType === "mro_resume")) {
    const mroId = String(row.mroId || "")
    if (!mroId) {
      return ElMessage.warning("MRO履历明细缺少MRO序列号")
    }
    if (resumeIdSet.has(mroId)) {
      return ElMessage.warning("同一MRO序列号在同一还回单中不允许重复")
    }
    resumeIdSet.add(mroId)
  }

  const payload = {
    warehouseId: formData.warehouseId,
    returnEmpId: formData.returnEmpId,
    returnEmpName: formData.returnEmpName,
    returnEmpNo: formData.returnEmpNo,
    returnArea: formData.returnArea,
    remark: formData.remark,
    data: tableData.value.map((item) => ({
      id: item.id,
      mroId: item.mroId,
      mroModelId: item.mroModelId,
      returnQty: item.sourceDetailType === "mro_resume" ? 1 : Number(item.returnQty),
      remarks: item.remarks,
      sourceDetailType: item.sourceDetailType,
      warehouseLocationId: item.warehouseLocationId || ""
    }))
  }

  if (isEdit.value) {
    await requestUpdateMroReturnOrder({
      id: props.data!.id,
      ...payload
    })
  } else {
    await requestCreateMroReturnOrder(payload)
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
