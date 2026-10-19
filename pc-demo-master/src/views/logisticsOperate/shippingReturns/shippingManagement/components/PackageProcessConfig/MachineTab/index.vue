<!-- 机-设备列表 -->
<template>
  <div class="machine-tab">
    <CustomTitle title="设备列表">
      <div>
        <el-button type="primary" icon="Plus" @click="selectDeviceModelVisible = true"
          >新增设备型号</el-button
        >
        <el-button type="primary" icon="Plus" @click="selectDeviceVisible = true"
          >新增设备</el-button
        >
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ row, $index }">
        <el-button
          link
          type="primary"
          size="small"
          :disabled="props.status != EnumCraftStatus.DESIGN"
          @click="setCraftParams(row)"
          >配置工艺参数</el-button
        >
        <el-button link type="danger" size="small" @click="onDeleteRowClick($index)"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择设备模型弹窗 -->
    <SelectDeviceModelDialog
      v-model="selectDeviceModelVisible"
      :selected-row-keys="selectDeviceModelIds"
      multiple
      @success="onSelectDeviceModelSuccess"
    />

    <!-- 选择设备弹窗 -->
    <SelectDeviceDialog
      v-model="selectDeviceVisible"
      :selected-row-keys="selectedDeviceIds"
      enable
      multiple
      @success="onSelectDeviceSuccess"
    />

    <!-- 配置工艺参数弹窗 -->
    <CraftParamsConfigDialog
      v-if="craftParamsVisible"
      :data="selectMachineData"
      :tech-version-id="props.techVersionId"
      @close="craftParamsVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardMachineList, setProduceBasic } from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectDeviceModelDialog from "@/components/SelectDeviceModelDialog/index.vue"
import {
  EnumCraftStatus,
  EnumMachineStandardType,
  EnumMachineStandardTypeMap
} from "@/constant/enums"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"

import CraftParamsConfigDialog from "./CraftParamsConfigDialog.vue"

interface ITableRow {
  id: string
  refId: string
  type: EnumMachineStandardType
  machineModelName: string
  machineName: string
  machineNo: string
  techDetailId: string
  refSpecifications: {
    id: string
    monitor: number // 是否开启监控 0关闭 1开启
    refId: string // 引用配置id
    standard: any[]
  }[]
}

defineOptions({
  name: "PersonTab"
})

const props = withDefaults(
  defineProps<{
    techVersionId: string
    status: number
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "type",
      label: "选择方式",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumMachineStandardTypeMap[row.type as EnumMachineStandardType]
      }
    },
    {
      prop: "machineModelName",
      label: "设备型号",
      minWidth: 160
    },
    {
      prop: "machineName",
      label: "设备名称",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.type === EnumMachineStandardType.DEVICE ? row.machineName : "--"
      }
    },
    {
      prop: "machineNo",
      label: "设备编号",
      minWidth: 160,
      formatter: (row: ITableRow) => {
        return row.type === EnumMachineStandardType.DEVICE ? row.machineNo : "--"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectMachineData = ref<any>({}) // 当前操作的表格行数据
const craftParamsVisible = ref(false) // 配置工艺参数弹窗是否显示
const hasChange = ref(false) // 是否有修改

const selectDeviceModelVisible = ref(false)
const selectDeviceModelIds = computed(() =>
  customTableData.value.filter((item) => item.type === 1).map((item) => item.refId)
)

const selectDeviceVisible = ref(false)
const selectedDeviceIds = computed(() =>
  customTableData.value.filter((item) => item.type === 2).map((item) => item.refId)
)

onBeforeMount(() => {
  getMachineList()
})

// 获取机器列表
const getMachineList = async () => {
  const res = await getTechStandardMachineList({
    techVersionId: props.techVersionId
  })
  if (res) {
    customTableData.value = res.map((item) => {
      return {
        id: item.id,
        refId: item.refId,
        type: item.type,
        machineModelName: item.tsesEquipmentModel?.modelName,
        machineName: item.tsesEquipment?.equipmentName,
        machineNo:
          item.type === EnumMachineStandardType.MODEL
            ? item.tsesEquipmentModel?.modelNo
            : item.tsesEquipment?.equipmentNo,
        techDetailId: item.techDetailId,
        refSpecifications: []
      }
    })

    hasChange.value = false
  }
}

// 选择设备类型成功回调
const onSelectDeviceModelSuccess = (data: IEquipmentModelPageItem[]) => {
  if (!data.length) {
    return
  }

  const tableIds = customTableData.value.map((item) => item.refId)
  data.forEach((item: any) => {
    if (!tableIds.includes(item.id)) {
      customTableData.value.push({
        id: "",
        refId: item.id,
        type: 1,
        machineModelName: item.modelName,
        machineName: "",
        machineNo: "",
        techDetailId: "",
        refSpecifications: []
      })
      hasChange.value = true
    }
  })
}

// 选择设备成功回调
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  if (!data.length) {
    return
  }

  const tableIds = customTableData.value.map((item) => item.refId)
  data.forEach((item) => {
    if (!tableIds.includes(item.id)) {
      customTableData.value.push({
        id: "",
        refId: item.id,
        type: 2,
        machineModelName: item.equipmentModel.modelName,
        machineName: item.equipmentName,
        machineNo: item.equipmentNo,
        techDetailId: "",
        refSpecifications: []
      })
      hasChange.value = true
    }
  })
}

/** 删除表格行 */
const onDeleteRowClick = async (index: number) => {
  const confirm = await ElMessageBox.confirm("确认删除该行数据?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
    hasChange.value = true
  }
}

/** 配置工艺参数 */
const setCraftParams = async (data: any) => {
  if (!data.id) {
    ElMessage.warning("请先保存生产要素-机")
    return
  }
  craftParamsVisible.value = true
  selectMachineData.value = data
}

/** 保存 */
const onSaveClick = async (isUpdate: boolean = true) => {
  hasChange.value = false
  await setProduceBasic({
    machineReqList: customTableData.value.map((item) => {
      return {
        id: item.id,
        refId: item.refId,
        type: item.type,
        refSpecifications: null
      }
    }),
    techVersionId: props.techVersionId
  })
  ElMessage.success("保存成功")
  isUpdate && getMachineList()
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    onSaveClick(false)
  }
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}
</style>
