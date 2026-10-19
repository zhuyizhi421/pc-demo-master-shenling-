<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="page-toolbar">
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle :title="pageTitle" showShortBar />

      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="4">
        <template #mroOutboundNo-default>
          {{ formData.mroOutboundNo }}
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

        <template #warehouseOperatorId-default>
          <div class="operator-field">
            <el-input
              :model-value="outboundPersonDisplay"
              readonly
              placeholder="请选择出库人"
              @click="openSelectOutboundPersonDialog"
            />
            <el-button plain @click="openSelectOutboundPersonDialog">选择</el-button>
            <el-button
              v-if="formData.warehouseOperatorId"
              link
              type="danger"
              @click="clearOutboundPerson"
            >
              清空
            </el-button>
          </div>
        </template>
      </CustomForm>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="出库明细">
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

        <template #barcode-default="{ row }">
          {{ row.barcode || "--" }}
        </template>

        <template #currentLocationName-default="{ row }">
          {{ row.currentLocationName || "--" }}
        </template>

        <template #outboundQty-default="{ row }">
          <span v-if="row.sourceDetailType === 'mro_resume'">1</span>
          <el-input-number
            v-else
            v-model="row.outboundQty"
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
    v-model="selectOutboundPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedOutboundPersonIds"
    @success="onSelectOutboundPersonSuccess"
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
  requestCreateMroOutboundOrder,
  requestUpdateMroOutboundOrder
} from "@/api/operation/mro/mro-outbound-order"
import CustomForm from "@/components/CustomForm/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroDialog from "@/components/SelectMroDialog/index.vue"
import SelectMroModelDialog from "@/components/SelectMroModelDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import {
  EnumMROIdentityManageMap,
  EnumMRORegisterStatus,
  EnumSelectUser
} from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type {
  IMroOutboundOrderCreateTableItem as ITableRow,
  IMroOutboundOrderPageListItem,
  MroOutboundDetailSourceType,
  MroOutboundOrderSourceType
} from "@/types/maintain/mro-manage/mro-outbound-order"
import type { IMroInfoPageListItem } from "@/types/maintain/mro-manage/mro-info"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"

defineOptions({
  name: "MroOutboundOrderCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    data?: IMroOutboundOrderPageListItem
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const sourceTypeMap: Record<MroOutboundOrderSourceType, string> = {
  manual_create: "手工新增",
  pickup_auto: "领用单自动生成"
}

const detailSourceTypeMap: Record<MroOutboundDetailSourceType, string> = {
  mro_info: "MRO信息",
  mro_resume: "MRO履历"
}
const outboundOrderStatusMap: Record<EnumMRORegisterStatus, string> = {
  [EnumMRORegisterStatus.NOT_REVIEWED]: "未复核",
  [EnumMRORegisterStatus.REVIEWED]: "已完成"
}

const userStore = useUserStore()
const warehouseOptions = ref<(IOption & { code: string })[]>([])
const locationOptions = ref<IOption[]>([])
const selectMroModelVisible = ref(false)
const selectMroResumeVisible = ref(false)
const selectOutboundPersonVisible = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const isEdit = computed(() => !!props.data?.id)
const pageTitle = computed(() => (isEdit.value ? "编辑 MRO 出库单" : "新建 MRO 出库单"))
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
const selectedOutboundPersonIds = computed(() =>
  formData.warehouseOperatorId ? [formData.warehouseOperatorId] : []
)
const outboundPersonDisplay = computed(() => formData.warehouseOperatorName || "")

const formData = reactive<{
  warehouseId: string
  warehouseNo: string
  warehouseOperatorId: string
  warehouseOperatorName: string
  warehouseOperatorNo: string
  mroOutboundNo: string
  status: EnumMRORegisterStatus
  createByName: string
  createTime: string
  sourceType: MroOutboundOrderSourceType
}>({
  warehouseId: "",
  warehouseNo: "",
  warehouseOperatorId: "",
  warehouseOperatorName: "",
  warehouseOperatorNo: "",
  mroOutboundNo: "",
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

const getStatusText = (status: EnumMRORegisterStatus) => outboundOrderStatusMap[status]

const getDetailSourceTypeText = (sourceDetailType?: string) => {
  if (sourceDetailType === "mro_info" || sourceDetailType === "mro_resume") {
    return detailSourceTypeMap[sourceDetailType]
  }
  return "--"
}

const formConfigs = computed(() => [
  {
    componentType: "div",
    field: "mroOutboundNo",
    label: "MRO出库单号：",
    hidden: !isEdit.value,
    slots: { default: "mroOutboundNo-default" }
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
    field: "warehouseOperatorId",
    label: "出库人：",
    slots: { default: "warehouseOperatorId-default" },
    rules: [{ required: true, message: "请选择出库人", trigger: "change" }]
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
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 170
    },
    {
      prop: "mroSpec",
      label: "规格",
      minWidth: 140,
      formatter: ({ mroSpec }: ITableRow) => mroSpec || "--"
    },
    {
      prop: "identityManage",
      label: "标识管理",
      width: 120,
      align: "center",
      formatter: ({ identityManage }: ITableRow) => EnumMROIdentityManageMap[identityManage] || "--"
    },
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      slots: { default: "barcode-default" }
    },
    {
      prop: "currentLocationName",
      label: "当前位置",
      minWidth: 140,
      slots: { default: "currentLocationName-default" }
    },
    {
      prop: "outboundQty",
      label: "出库数量",
      width: 140,
      align: "center",
      slots: { default: "outboundQty-default" }
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

  initOutboundEmployeeFromCurrentUser()
})

const setOutboundPerson = (person?: { id?: string; name?: string; no?: string }) => {
  formData.warehouseOperatorId = person?.id || ""
  formData.warehouseOperatorName = person?.name || ""
  formData.warehouseOperatorNo = person?.no || ""
}

const initOutboundEmployeeFromCurrentUser = () => {
  const userInfo = userStore.userInfo as Partial<{
    empId: string
    empName: string
    empNo: string
  }>

  if (!userInfo?.empId) return
  setOutboundPerson({
    id: userInfo.empId,
    name: userInfo.empName,
    no: userInfo.empNo
  })
}

const openSelectOutboundPersonDialog = () => {
  selectOutboundPersonVisible.value = true
}

const clearOutboundPerson = () => {
  setOutboundPerson()
}

const onSelectOutboundPersonSuccess = (data: ITree[]) => {
  if (!data.length) return

  setOutboundPerson({
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
      identityManage: item.identityManage,
      outboundQty: "",
      remarks: item.remarks || "",
      sourceDetailType: "mro_info",
      warehouseLocationId: "",
      warehouseLocationName: ""
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
      outboundQty: 1,
      mroId: item.id,
      mroModelId: item.mroModelId,
      mroModelName: item.mroModelVo?.mroModelName || "",
      mroModelNo: item.mroModelVo?.mroModelNo || "",
      mroSpec: item.mroModelVo?.mroSpec || "",
      remarks: item.remarks || "",
      sourceDetailType: "mro_resume",
      warehouseLocationId: "",
      warehouseLocationName: ""
    })
  })
}

const initFormData = () => {
  formData.warehouseId = props.data?.warehouseId || ""
  formData.warehouseNo = props.data?.warehouseNo || ""
  formData.warehouseOperatorId = props.data?.warehouseOperatorId || ""
  formData.warehouseOperatorName = props.data?.warehouseOperatorName || ""
  formData.warehouseOperatorNo = props.data?.warehouseOperatorNo || ""
  formData.mroOutboundNo = props.data?.mroOutboundNo || ""
  formData.status = (props.data?.status as EnumMRORegisterStatus) || EnumMRORegisterStatus.NOT_REVIEWED
  formData.createByName = props.data?.createByName || ""
  formData.createTime = props.data?.createTime || ""
  formData.sourceType = props.data?.sourceType || "manual_create"

  tableData.value = (props.data?.detailVos || []).map((item) => ({
    id: item.id,
    barcode: item.barcode,
    currentLocationName: item.currentLocationName,
    identityManage: item.identityManage,
    outboundQty: item.outboundQty,
    mroId: item.mroId,
    mroModelId: item.mroModelId,
    mroModelName: item.mroModelName,
    mroModelNo: item.mroModelNo,
    mroSpec: item.mroSpec,
    remarks: item.remarks,
    sourceDetailType: item.sourceDetailType,
    warehouseLocationId: item.warehouseLocationId,
    warehouseLocationName: item.warehouseLocationName
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
    label: item.entityName
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
    return ElMessage.warning("请至少选择一条出库明细")
  }

  const invalidQtyRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_info" && Number(item.outboundQty || 0) <= 0
  )
  if (invalidQtyRow) {
    return ElMessage.warning(`${invalidQtyRow.mroModelName} 的出库数量必须大于 0`)
  }

  const locationRequiredRow = tableData.value.find(
    (item) => item.sourceDetailType === "mro_resume" && !item.warehouseLocationId
  )
  if (locationRequiredRow) {
    return ElMessage.warning(`${locationRequiredRow.mroModelName} 为MRO履历出库，必须选择库位`)
  }

  const payload = {
    warehouseId: formData.warehouseId,
    warehouseOperatorId: formData.warehouseOperatorId,
    warehouseOperatorName: formData.warehouseOperatorName,
    warehouseOperatorNo: formData.warehouseOperatorNo,
    data: tableData.value.map((item) => ({
      id: item.id,
      outboundQty: item.sourceDetailType === "mro_resume" ? 1 : Number(item.outboundQty),
      mroId: item.mroId,
      mroModelId: item.mroModelId,
      remarks: item.remarks,
      sourceDetailType: item.sourceDetailType,
      warehouseLocationId: item.warehouseLocationId || ""
    }))
  }

  if (isEdit.value) {
    await requestUpdateMroOutboundOrder({
      id: props.data!.id,
      ...payload
    })
  } else {
    await requestCreateMroOutboundOrder(payload)
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

