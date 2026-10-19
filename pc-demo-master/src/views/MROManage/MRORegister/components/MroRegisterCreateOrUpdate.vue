<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle :title="pageTitle" showShortBar />
      <CustomForm
        ref="customFormRef"
        v-model="formData"
        :configs="formConfigs"
        :columns="isEdit ? 0 : 4"
      >
        <template #mroRegisterNo-default>
          {{ formData.mroRegisterNo }}
        </template>

        <template #warehouseNo-default>
          {{ formData.warehouseNo }}
        </template>

        <template #status-default>
          <el-tag
            size="small"
            :type="
              (formData.status as unknown as EnumMRORegisterStatus) ===
              EnumMRORegisterStatus.NOT_REVIEWED
                ? 'danger'
                : 'success'
            "
          >
            {{ EnumMRORegisterStatusMap[formData.status as unknown as EnumMRORegisterStatus] }}
          </el-tag>
        </template>

        <template #createByName-default>
          {{ formData.createByName }}
        </template>

        <template #createTime-default>
          {{ formatDisplayTime(formData.createTime) }}
        </template>

        <template #mroRegisterEmpId-default>
          <div class="register-person-field">
            <el-input
              :model-value="registerPersonDisplay"
              readonly
              placeholder="请选择 MRO 登记人"
              @click="openSelectRegisterPersonDialog"
            />
            <el-button plain @click="openSelectRegisterPersonDialog">选择</el-button>
            <el-button
              v-if="formData.mroRegisterEmpId"
              link
              type="danger"
              @click="clearRegisterPerson"
            >
              清空
            </el-button>
          </div>
        </template>
      </CustomForm>
    </div>

    <div class="custom-table-container">
      <CustomTitle title="登记项列表">
        <el-button type="primary" icon="Plus" @click="onMroAddClick()">新增 MRO 信息</el-button>
      </CustomTitle>
      <CustomTable ref="customTableRef" v-model:table-data="tableData" :config="tableConfig">
        <template #registerNums-default="{ row }">
          <el-input v-model="row.registerNums" type="number" :min="1" />
        </template>

        <template #barcodeHandleType-default="{ row }">
          <el-select
            v-if="row.identityManage"
            v-model="row.barcodeHandleType"
            placeholder="请选择"
            @change="onBarcodeHandleTypeChange(row)"
          >
            <el-option label="客户已有标签码" value="customer_existing" />
            <el-option label="系统自动生成标签码" value="system_generate" />
          </el-select>
        </template>

        <template #warehouseLocation-default="{ row }">
          <el-select v-model="row.warehouseLocationId" placeholder="请选择" filterable clearable>
            <el-option
              v-for="item in locationOptions"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </template>

        <template #remarks-default="{ row }">
          <el-input v-model="row.remarks" clearable />
        </template>

        <template #operation-default="{ $index }">
          <el-button type="danger" size="small" link @click="tableData.splice($index, 1)">
            删除本行
          </el-button>
        </template>
      </CustomTable>
    </div>
  </div>

  <SelectMroModelDialog
    v-model="selectMroModelVisible"
    :selected-row-keys="selectedMroModelIds"
    multiple
    @success="onSelectMroModelSuccess"
  />

  <SelectPersonDialog
    v-model="selectRegisterPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedRegisterPersonIds"
    @success="onSelectRegisterPersonSuccess"
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
  requestCreateMroRegister,
  requestUpdateMroRegister
} from "@/api/operation/mro/mro-register"
import CustomForm from "@/components/CustomForm/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectMroModelDialog from "@/components/SelectMroModelDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import {
  EnumMROIdentityManageMap,
  EnumMRORegisterStatus,
  EnumMRORegisterStatusMap,
  EnumSelectUser} from "@/constant/enums"
import { FORMAT_TIME } from "@/constant/time"
import useUserStore from "@/store/modules/user"
import type { IOption } from "@/types/common"
import type { IMroModelPageListItem } from "@/types/maintain/mro-manage/mro-model"
import type {
  IMroRegisterCreateTableItem as ITableRow,
  IMroRegisterPageListItem,
  MroBarcodeHandleType
} from "@/types/maintain/mro-manage/mro-register"

defineOptions({
  name: "MroRegisterCreateOrUpdate"
})

const props = withDefaults(
  defineProps<{
    data?: IMroRegisterPageListItem
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const userStore = useUserStore()
const warehouseOptions = ref<(IOption & { code: string })[]>([])
const locationOptions = ref<IOption[]>([])
const selectMroModelVisible = ref(false)
const selectRegisterPersonVisible = ref(false)
const selectedMroModelIds = computed(() => tableData.value.map((item) => item.mroModelId))
const selectedRegisterPersonIds = computed(() =>
  formData.mroRegisterEmpId ? [formData.mroRegisterEmpId] : []
)
const registerPersonDisplay = computed(() => formData.mroRegisterEmpName || "")
const isEdit = computed(() => !!props.data?.id)
const pageTitle = computed(() => (isEdit.value ? "编辑 MRO 登记单" : "新建 MRO 登记单"))

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formData = reactive({
  warehouseId: "",
  warehouseNo: "",
  mroRegisterEmpId: "",
  mroRegisterEmpName: "",
  mroRegisterEmpNo: "",
  mroRegisterNo: "",
  status: 0,
  createByName: "",
  createTime: ""
})
const formatDisplayTime = (value?: string) => {
  if (!value) {
    return "--"
  }
  const target = dayjs(value)
  return target.isValid() ? target.format(FORMAT_TIME) : value
}

const formConfigs = computed(() => [
  {
    componentType: "div",
    field: "mroRegisterNo",
    label: "MRO 登记单号：",
    hidden: !isEdit.value,
    slots: {
      default: "mroRegisterNo-default"
    }
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
    rules: [
      {
        required: true,
        message: "请选择仓库",
        trigger: "change"
      }
    ]
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
    slots: {
      default: "warehouseNo-default"
    }
  },
  {
    componentType: "div",
    field: "mroRegisterEmpId",
    label: "MRO 登记人：",
    slots: {
      default: "mroRegisterEmpId-default"
    },
    rules: [
      {
        required: true,
        message: "请选择 MRO 登记人",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "div",
    field: "status",
    label: "状态：",
    hidden: !isEdit.value,
    slots: {
      default: "status-default"
    }
  },
  {
    componentType: "div",
    field: "createByName",
    label: "创建人：",
    hidden: !isEdit.value,
    slots: {
      default: "createByName-default"
    }
  },
  {
    componentType: "div",
    field: "createTime",
    label: "创建日期：",
    hidden: !isEdit.value,
    slots: {
      default: "createTime-default"
    }
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroModelName",
      label: "MRO 名称",
      minWidth: 160
    },
    {
      prop: "mroModelNo",
      label: "MRO 编号",
      minWidth: 160
    },
    {
      prop: "mroSpec",
      label: "规格",
      minWidth: 140
    },
    {
      prop: "mroCategoryName",
      label: "MRO 类型",
      minWidth: 160
    },
    {
      prop: "identityManage",
      label: "标识管理",
      minWidth: 120,
      align: "center",
      formatter: ({ identityManage }: { identityManage: number }) =>
        EnumMROIdentityManageMap[identityManage]
    },
    {
      prop: "registerNums",
      label: "登记数量",
      minWidth: 120,
      align: "center",
      slots: {
        default: "registerNums-default"
      }
    },
    {
      prop: "barcodeHandleType",
      label: "标签码处理方式",
      minWidth: 180,
      align: "center",
      slots: {
        default: "barcodeHandleType-default"
      },
      formatter: (row: ITableRow) => {
        if (!row.identityManage) {
          return ""
        }
        return row.barcodeHandleType === "system_generate"
          ? "系统自动生成标签码"
          : "客户已有标签码"
      }
    },
    {
      prop: "warehouseLocationId",
      label: "库位",
      minWidth: 160,
      align: "center",
      slots: {
        default: "warehouseLocation-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200,
      align: "center",
      slots: {
        default: "remarks-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

onMounted(async () => {
  await getWarehouseOptions()
  initRegisterEmployeeFromCurrentUser()
  if (props.data) {
    initFormData()
    await fetchWarehouseLocationList(formData.warehouseId)
  }
})

const normalizeBarcodeHandleType = (
  identityManage: number,
  barcodeHandleType?: MroBarcodeHandleType | "",
  autoGenerateCode?: boolean
): MroBarcodeHandleType | "" => {
  if (!identityManage) {
    return ""
  }
  if (barcodeHandleType) {
    return barcodeHandleType
  }
  return autoGenerateCode ? "system_generate" : "customer_existing"
}

const setRegisterPerson = (person?: { id?: string; name?: string; no?: string }) => {
  formData.mroRegisterEmpId = person?.id || ""
  formData.mroRegisterEmpName = person?.name || ""
  formData.mroRegisterEmpNo = person?.no || ""
}

const initRegisterEmployeeFromCurrentUser = async () => {
  const userInfo = userStore.userInfo as Partial<{
    empId: string
    empName: string
    empNo: string
  }>
  if (!userInfo?.empId) {
    return
  }

  if (!isEdit.value) {
    setRegisterPerson({
      id: userInfo.empId,
      name: userInfo.empName,
      no: userInfo.empNo
    })
  }
}

const openSelectRegisterPersonDialog = () => {
  selectRegisterPersonVisible.value = true
}

const clearRegisterPerson = () => {
  setRegisterPerson()
}

const onSelectRegisterPersonSuccess = (data: ITree[]) => {
  if (!data.length) {
    return
  }

  setRegisterPerson({
    id: data[0].id,
    name: data[0].label,
    no: data[0].no
  })
}

const onBarcodeHandleTypeChange = (row: ITableRow) => {
  row.autoGenerateCode = row.barcodeHandleType === "system_generate"
}

const onSelectMroModelSuccess = (data: IMroModelPageListItem[]) => {
  if (!data.length) {
    return
  }

  data.forEach((item) => {
    const target = selectedMroModelIds.value.find((it) => it === item.id)
    if (target) {
      return
    }

    const barcodeHandleType = normalizeBarcodeHandleType(item.identityManage, "", false)
    const rowData: ITableRow = {
      mroModelId: item.id,
      mroModelName: item.mroModelName,
      mroModelNo: item.mroModelNo,
      mroSpec: item.mroSpec,
      mroCategoryName: item.mroCategoryName,
      identityManage: item.identityManage,
      registerNums: "",
      barcodeHandleType,
      autoGenerateCode: barcodeHandleType === "system_generate",
      unitModelName: item.unitModelName,
      warehouseLocationId: "",
      remarks: item.remarks
    }

    tableData.value.push(rowData)
  })
}

const initFormData = () => {
  for (const key in formData) {
    ;(formData as any)[key] = (props.data as any)[key] ?? (formData as any)[key]
  }
  const target = warehouseOptions.value.find((item) => item.value === props.data?.warehouseId)
  formData.warehouseNo = target?.code || ""

  props.data?.registerItemVos?.forEach((item) => {
    const barcodeHandleType = normalizeBarcodeHandleType(
      item.identityManage,
      item.barcodeHandleType,
      item.autoGenerateCode
    )
    tableData.value.push({
      id: item.id,
      mroModelId: item.mroModelId,
      mroModelName: item.mroModelName,
      mroModelNo: item.mroModelNo,
      mroSpec: item.mroSpec,
      mroCategoryName: item.mroCategoryName,
      identityManage: item.identityManage,
      registerNums: item.registerNums,
      barcodeHandleType,
      autoGenerateCode: barcodeHandleType === "system_generate",
      unitModelName: item.unitModelName,
      warehouseLocationId: item.warehouseLocationId,
      remarks: item.remarks
    })
  })
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

const onWarehouseChange = (val: string) => {
  if (val) {
    formData.warehouseNo = warehouseOptions.value.find((item) => item.value === val)?.code || ""
    fetchWarehouseLocationList(val)
  } else {
    formData.warehouseNo = ""
    locationOptions.value = []
  }

  tableData.value.forEach((item) => {
    item.warehouseLocationId = ""
  })
}

const onMroAddClick = () => {
  if (formData.warehouseId) {
    selectMroModelVisible.value = true
    fetchWarehouseLocationList(formData.warehouseId)
  } else {
    ElMessage.error("请先选择仓库")
  }
}

const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  if (!tableData.value.length) {
    return ElMessage.warning("请至少选择一项 MRO 信息")
  }

  const emptyNumRow = tableData.value.find((item) => !item.registerNums || Number(item.registerNums) <= 0)
  if (emptyNumRow) {
    return ElMessage.warning("请确保每一行的登记数量大于 0")
  }

  const locationRequiredRow = tableData.value.find((item) => item.identityManage && !item.warehouseLocationId)
  if (locationRequiredRow) {
    return ElMessage.warning(`${locationRequiredRow.mroModelName} 已启用标识管理，必须选择库位`)
  }

  const payloadList = tableData.value.map((item) => ({
    id: item.id || "",
    barcodeHandleType: item.identityManage
      ? normalizeBarcodeHandleType(item.identityManage, item.barcodeHandleType, item.autoGenerateCode)
      : "",
    mroModelId: item.mroModelId,
    registerNums: Number(item.registerNums),
    remarks: item.remarks,
    warehouseLocationId: item.warehouseLocationId || ""
  }))

  const basePayload = {
    warehouseId: formData.warehouseId,
    mroRegisterEmpId: formData.mroRegisterEmpId,
    mroRegisterEmpName: formData.mroRegisterEmpName,
    mroRegisterEmpNo: formData.mroRegisterEmpNo
  }

  if (isEdit.value) {
    await requestUpdateMroRegister({
      id: props.data!.id,
      ...basePayload,
      data: payloadList.map((item) => ({
        id: item.id,
        barcodeHandleType: item.barcodeHandleType,
        mroModelId: item.mroModelId,
        registerNums: item.registerNums,
        mroRegisterId: props.data!.id,
        remarks: item.remarks,
        warehouseLocationId: item.warehouseLocationId
      }))
    })
  } else {
    await requestCreateMroRegister({
      ...basePayload,
      warehouseId: formData.warehouseId,
      mroList: payloadList.map((item) => ({
        barcodeHandleType: item.barcodeHandleType,
        mroModelId: item.mroModelId,
        registerNums: item.registerNums,
        remarks: item.remarks,
        warehouseLocationId: item.warehouseLocationId
      }))
    })
  }

  ElMessage.success(`${isEdit.value ? "编辑" : "新建"}成功`)
  emit("close")
  emit("success")
}
</script>

<style lang="scss" scoped>
.register-person-field {
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
