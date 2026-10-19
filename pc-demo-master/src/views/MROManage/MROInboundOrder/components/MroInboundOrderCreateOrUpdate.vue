<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="4">
        <template #mroInboundNo-default>
          {{ formData.mroInboundNo }}
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

        <template #mroInboundEmpId-default>
          <div class="operator-field">
            <el-input
              :model-value="inboundPersonDisplay"
              readonly
              placeholder="请选择入库人"
              @click="openSelectInboundPersonDialog"
            />
            <el-button plain @click="openSelectInboundPersonDialog">选择</el-button>
            <el-button
              v-if="formData.mroInboundEmpId"
              link
              type="danger"
              @click="clearInboundPerson"
            >
              清空
            </el-button>
          </div>
        </template>
      </CustomForm>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="入库明细">
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

        <template #inboundQty-default="{ row }">
          <span v-if="row.sourceDetailType === 'mro_resume'">1</span>
          <el-input-number
            v-else
            v-model="row.inboundQty"
            :min="1"
            :precision="0"
            controls-position="right"
          />
        </template>

        <template #warehouseLocation-default="{ row }">
          <el-select v-model="row.warehouseLocationId" placeholder="请选择" filterable clearable>
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
          <el-button type="danger" size="small" link @click="tableData.splice($index, 1)">
            删除
          </el-button>
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
    v-model="selectInboundPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedInboundPersonIds"
    @success="onSelectInboundPersonSuccess"
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
  requestCreateMroInboundOrder,
  requestUpdateMroInboundOrder
} from "@/api/operation/mro/mro-inbound-order"
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
  EnumMRORegisterStatusMap,
  EnumSelectUser
} from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type {
  IMroInboundOrderCreateTableItem as ITableRow,
  IMroInboundOrderPageListItem,
  MroInboundDetailSourceType,
  MroInboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-inbound-order"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"

defineOptions({
  name: "MroInboundOrderCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    data?: IMroInboundOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const sourceTypeMap: Record<MroInboundOrderSourceType, string> = {
  manual_create: "手工新增",
  register_auto: "登记自动生成"
}

const detailSourceTypeMap: Record<MroInboundDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}

const userStore = useUserStore()
const warehouseOptions = ref<(IOption & { code: string })[]>([])
const locationOptions = ref<(IOption & { code: string })[]>([])
const selectMroModelVisible = ref(false)
const selectMroResumeVisible = ref(false)
const selectInboundPersonVisible = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const isEdit = computed(() => !!props.data?.id)
const pageTitle = computed(() => (isEdit.value ? "编辑 MRO 入库单" : "新建 MRO 入库单"))
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
const selectedInboundPersonIds = computed(() =>
  formData.mroInboundEmpId ? [formData.mroInboundEmpId] : []
)
const inboundPersonDisplay = computed(() => formData.mroInboundEmpName || "")

const formData = reactive<{
  warehouseId: string
  warehouseNo: string
  mroInboundEmpId: string
  mroInboundEmpName: string
  mroInboundEmpNo: string
  mroInboundNo: string
  status: EnumMRORegisterStatus
  createByName: string
  createTime: string
  sourceType: MroInboundOrderSourceType
}>({
  warehouseId: "",
  warehouseNo: "",
  mroInboundEmpId: "",
  mroInboundEmpName: "",
  mroInboundEmpNo: "",
  mroInboundNo: "",
  status: EnumMRORegisterStatus.NOT_REVIEWED,
  createByName: "",
  createTime: "",
  sourceType: "manual_create"
})

const tableData = ref<ITableRow[]>([])

const formatDisplayTime = (value?: string) => {
  if (!value) return "--"
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const getStatusText = (status: EnumMRORegisterStatus) => EnumMRORegisterStatusMap[status]

const getDetailSourceTypeText = (sourceDetailType?: string) => {
  if (sourceDetailType === "mro_info" || sourceDetailType === "mro_resume") {
    return detailSourceTypeMap[sourceDetailType]
  }
  return "--"
}

const formConfigs = computed(() => [
  {
    componentType: "div",
    field: "mroInboundNo",
    label: "MRO入库单号：",
    hidden: !isEdit.value,
    slots: { default: "mroInboundNo-default" }
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
    hidden: isEdit.value,
    props: {
      disabled: true
    }
  },
  {
    componentType: "div",
    field: "warehouseNo",
    label: "仓库编号：",
    hidden: !isEdit.value,
    slots: { default: "warehouseNo-default" }
  },
  {
    componentType: "div",
    field: "mroInboundEmpId",
    label: "入库人：",
    slots: { default: "mroInboundEmpId-default" },
    rules: [{ required: true, message: "请选择入库人", trigger: "change" }]
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
      minWidth: 160
    },
    {
      prop: "mroNo",
      label: "MRO序列号",
      minWidth: 160,
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
      prop: "inboundQty",
      label: "入库数量",
      width: 140,
      align: "center",
      slots: { default: "inboundQty-default" }
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

  initInboundEmployeeFromCurrentUser()
})

const setInboundPerson = (person?: { id?: string; name?: string; no?: string }) => {
  formData.mroInboundEmpId = person?.id || ""
  formData.mroInboundEmpName = person?.name || ""
  formData.mroInboundEmpNo = person?.no || ""
}

const initInboundEmployeeFromCurrentUser = () => {
  const userInfo = userStore.userInfo as Partial<{
    empId: string
    empName: string
    empNo: string
  }>

  if (!userInfo?.empId) return
  setInboundPerson({
    id: userInfo.empId,
    name: userInfo.empName,
    no: userInfo.empNo
  })
}

const openSelectInboundPersonDialog = () => {
  selectInboundPersonVisible.value = true
}

const clearInboundPerson = () => {
  setInboundPerson()
}

const onSelectInboundPersonSuccess = (data: ITree[]) => {
  if (!data.length) return

  setInboundPerson({
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
      inboundQty: "",
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
      inboundQty: 1,
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
      warehouseLocationId: "",
      warehouseLocationName: "",
      warehouseLocationNo: ""
    })
  })
}

const initFormData = () => {
  formData.warehouseId = props.data?.warehouseId || ""
  formData.warehouseNo = props.data?.warehouseNo || ""
  formData.mroInboundEmpId = props.data?.mroInboundEmpId || ""
  formData.mroInboundEmpName = props.data?.mroInboundEmpName || ""
  formData.mroInboundEmpNo = props.data?.mroInboundEmpNo || ""
  formData.mroInboundNo = props.data?.mroInboundNo || ""
  formData.status = (props.data?.status as EnumMRORegisterStatus) || EnumMRORegisterStatus.NOT_REVIEWED
  formData.createByName = props.data?.createByName || ""
  formData.createTime = props.data?.createTime || ""
  formData.sourceType = props.data?.sourceType || "manual_create"

  tableData.value = (props.data?.detailVos || []).map((item) => ({
    id: item.id,
    barcode: item.barcode,
    currentLocationName: item.currentLocationName,
    identityManage: item.identityManage,
    inboundQty: item.inboundQty,
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
    return ElMessage.warning("请至少选择一条入库明细")
  }

  const invalidQtyRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_info" && Number(item.inboundQty || 0) <= 0
  )
  if (invalidQtyRow) {
    return ElMessage.warning(`${invalidQtyRow.mroModelName} 的入库数量必须大于 0`)
  }

  const locationRequiredRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_resume" && !item.warehouseLocationId
  )
  if (locationRequiredRow) {
    return ElMessage.warning(`${locationRequiredRow.mroModelName} 为MRO履历入库，必须选择库位`)
  }

  const payload = {
    warehouseId: formData.warehouseId,
    mroInboundEmpId: formData.mroInboundEmpId,
    mroInboundEmpName: formData.mroInboundEmpName,
    mroInboundEmpNo: formData.mroInboundEmpNo,
    data: tableData.value.map((item) => ({
      id: item.id,
      inboundQty: item.sourceDetailType === "mro_resume" ? 1 : Number(item.inboundQty),
      mroId: item.mroId,
      mroModelId: item.mroModelId,
      remarks: item.remarks,
      sourceDetailType: item.sourceDetailType,
      warehouseLocationId: item.warehouseLocationId || ""
    }))
  }

  if (isEdit.value) {
    await requestUpdateMroInboundOrder({
      id: props.data!.id,
      ...payload
    })
  } else {
    await requestCreateMroInboundOrder(payload)
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
