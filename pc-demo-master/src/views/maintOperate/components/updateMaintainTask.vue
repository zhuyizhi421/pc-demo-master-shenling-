<template>
  <div class="updateMaintainTask">
    <CustomDrawer
      v-model="visible"
      :title="`${!id ? '新建' : '编辑'}保养`"
      size="medium"
      @close="onClose()"
    >
      <CustomTitle title="保养项设备"></CustomTitle>

      <CustomForm ref="formRef" v-model="form" :configs="formConfigs"></CustomForm>

      <CustomTitle title="保养项列表">
        <el-button
          icon="Plus"
          :disabled="!form.equipmentId"
          type="primary"
          @click="showSelect = true"
          >添加保养项</el-button
        >
      </CustomTitle>

      <CustomTable ref="customTableRef" v-model:table-data="tableData" :config="tableConfig">
        <template #img-desc-default="{ row }">
          <el-image
            v-for="item in row.maintenanceItem?.files"
            :key="item.id"
            :src="formatImgUrlPreview(item.path)"
            preview-teleported
            :preview-src-list="[formatImgUrlPreview(item.path)]"
            class="w-[50px] h-[50px]"
            fit="contain"
          />
        </template>
        <template #operation-default="{ $index }">
          <el-button link type="danger" size="small" @click="tableData.splice($index, 1)"
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" :disabled="!tableData.length" @click="onSubmitClick">{{
          id ? "编辑" : "创建"
        }}</el-button>
      </template>
    </CustomDrawer>

    <!-- 选择保养项 -->
    <SelectDeviceMaintainDialog
      v-model="showSelect"
      :equipment-id="form.equipmentId"
      :config-type="3"
      :selected-row-keys="selectedConfigIds"
      multiple
      @success="onSelectDeviceMaintainSuccess"
    />

    <!-- 选择设备 -->
    <SelectDeviceDialog
      v-model="selectDeviceVisible"
      :selected-row-keys="[form.equipmentId]"
      @success="onSelectDeviceSuccess"
    />
  </div>
</template>

<script setup lang="ts" name="updateMaintainTask">
import { ElMessage } from "element-plus"

import {
  queryEquipmentMaintenanceTaskDetail,
  requestCreateEquipmentMaintenanceTask,
  requestUpdateEquipmentMaintenanceTask
} from "@/api/operation/equipment/equipment-maintenance-task"
import { inspectionStandardTypeToNameMap } from "@/api/operation/equipment/types"
import { getEnabledClassesList } from "@/api/scheduling"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectDeviceMaintainDialog from "@/components/SelectDeviceMaintainDialog/index.vue"
import { FORMAT_DATE, FORMAT_TIME } from "@/constant/time"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { IEquipmentConfigPageListItem } from "@/types/maintain/equipment-manage/equipment-config"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import { formatImgUrlPreview } from "@/utils/common"

const props = defineProps<{
  modelValue: boolean
  data?: any[]
  id?: string // 编辑时传入
}>()
const emit = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const selectDeviceOptions = ref<IOption[]>([])

const [form, resetForm] = useResetRef({
  equipmentId: "",
  maintenanceStart: "",
  workShiftId: "",
  equipmentName: "",
  equipmentNo: ""
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    field: "equipmentName",
    label: "设备名称",
    rules: [
      {
        required: true,
        message: "请选择设备",
        trigger: "blur"
      }
    ],
    props: {
      customChildren: selectDeviceOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      })),
      clearable: false,
      placeholder: "请选择设备",
      disabled: !!props.id
    },
    events: {
      visibleChange: (val: boolean) => {
        if (val) {
          selectDeviceVisible.value = true
        }
      }
    }
  },
  {
    componentType: "el-input",
    field: "equipmentNo",
    label: "设备编号",
    props: {
      placeholder: "请选择设备",
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    field: "maintenanceStart",
    label: "排班日期",
    rules: [
      {
        required: true,
        message: "请选择排班日期",
        trigger: "blur"
      }
    ],
    props: {
      type: "date",
      placeholder: "请选择排班日期",
      disabledDate: disabledDate,
      format: FORMAT_DATE,
      valueFormat: FORMAT_TIME
    }
  },
  {
    componentType: "el-select",
    field: "workShiftId",
    label: "保养班次",
    rules: [
      {
        required: true,
        message: "请选择保养班次",
        trigger: "blur"
      }
    ],
    props: {
      customChildren: workShiftOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.rotationName,
          value: item.id
        }
      })),
      filterable: true
    }
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<any[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "maintenanceName",
      label: "保养项名称",
      width: 160,
      formatter: ({ maintenanceItem }) => maintenanceItem?.maintenanceName
    },
    {
      prop: "method",
      label: "方法要求",
      width: 160,
      formatter: ({ maintenanceItem }) =>
        maintenanceItem?.method || maintenanceItem?.maintenanceMethod
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      align: "center",
      formatter: ({ maintenanceItem }) =>
        inspectionStandardTypeToNameMap[
          maintenanceItem?.inspectionStandard?.standardType ??
            maintenanceItem?.maintenanceStandard?.standardType
        ] || "-"
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 160,
      formatter: ({ maintenanceItem }) =>
        formatStandard(maintenanceItem?.inspectionStandard || maintenanceItem?.maintenanceStandard)
    },
    {
      prop: "maintenanceDepartments",
      label: "保养执行部门",
      width: 160,
      formatter: ({ maintenanceItem }) =>
        maintenanceItem?.maintenanceDepartments?.map((item: any) => item.depName)?.join("，")
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      width: 160,
      formatter: ({ maintenanceItem }) =>
        maintenanceItem?.ngDepartments?.map((item: any) => item.depName)?.join("，")
    },
    {
      prop: "imgDesc",
      label: "图片说明",
      width: 160,
      slots: {
        default: "img-desc-default"
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
const selectedConfigIds = computed(() => tableData.value.map((item) => item.id))

const workShiftOptions = ref<any[]>([])
const selectDeviceVisible = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()
const showSelect = ref(false)

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      getWorkShiftOptions()

      if (!props.id) {
        return
      }

      const res: any = await queryEquipmentMaintenanceTaskDetail(props.id)
      form.value = {
        equipmentId: res.equipmentId,
        maintenanceStart: res.maintenanceStart,
        workShiftId: res.schedulingRotations?.[0]?.id ?? "",
        equipmentName: res.equipmentName,
        equipmentNo: res.equipmentNo
      }
      selectDeviceOptions.value = res.equipmentName
        ? [
            {
              label: res.equipmentName,
              value: res.equipmentId
            }
          ]
        : []
      tableData.value =
        res.items?.map((item: any) => {
          return {
            maintenanceItem: item,
            id: item.equipmentConfigId
          }
        }) ?? []
    }
  }
)

/** 获取班次下拉选项 */
const getWorkShiftOptions = async () => {
  const res: any = await getEnabledClassesList()
  workShiftOptions.value = res
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await formRef.value?.validateForm()

  if (!valid) return
  const params = {
    equipmentId: form.value.equipmentId,
    planDate: form.value.maintenanceStart,
    maintenanceConfigIds: tableData.value.map((item) => item.id),
    workShiftIds: [form.value.workShiftId],
    id: ""
  }
  if (props.id) {
    params.id = props.id
    await requestUpdateEquipmentMaintenanceTask(params)
    ElMessage.success("编辑成功")
  } else {
    await requestCreateEquipmentMaintenanceTask(params)
    ElMessage.success("创建成功")
  }
  visible.value = false
  emit("success")
}

/** 设备选择成功回调 */
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  if (!data.length) {
    return
  }
  const { id, equipmentName, equipmentNo } = data[0]
  form.value.equipmentId = id
  form.value.equipmentName = equipmentName
  form.value.equipmentNo = equipmentNo
  tableData.value = []
  selectDeviceOptions.value = [
    {
      label: equipmentName,
      value: id
    }
  ]
}

/** 设备保养项选择成功回调 */
const onSelectDeviceMaintainSuccess = (data: IEquipmentConfigPageListItem[]) => {
  if (data?.length) {
    tableData.value = data
  }
}

/** 格式化检验标准 */
const formatStandard = (inspectionStandard: any) => {
  if (inspectionStandard?.standardType) {
    const {
      standardType,
      standardDesc,
      standardMaxInclusive,
      standardMax,
      standardMinInclusive,
      standardMin
    } = inspectionStandard
    if (standardType === 2) {
      return standardDesc
    } else if (standardType === 1) {
      let str = ""
      if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
        str += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
      }
      str += "n"
      if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
        str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
      }
      return str
    }
  }
  return ""
}

const disabledDate = (time: Date) => {
  return (
    time.getTime() < dayjs().subtract(1, "day").valueOf() ||
    time.getTime() > dayjs().add(1, "month").valueOf()
  )
}

const onClose = () => {
  visible.value = false
  resetForm()
  tableData.value = []
}
</script>

<style scoped lang="scss">
.updateMaintainTask {
  &:deep(.custom-drawer-content) {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .custom-table {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
