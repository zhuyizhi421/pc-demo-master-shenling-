<!-- 机-设备列表 -->
<template>
  <div class="machine-tab">
    <CustomTitle title="设备列表">
      <div v-if="!isOnlyView" class="machine-tab__actions">
        <div class="machine-tab__buttons">
          <el-button type="primary" icon="Plus" @click="selectDeviceCategoryVisible = true"
            >新增设备型号</el-button
          >
          <el-button type="primary" icon="Plus" @click="selectDeviceVisible = true"
            >新增设备</el-button
          >
        </div>
      </div>
    </CustomTitle>

    <el-alert
      v-if="hasChange && !isOnlyView"
      class="machine-tab__pending-alert"
      type="info"
      :closable="false"
      title="已加入当前工序，待保存"
      description="设备分类和设备选择结果已加入当前工序，点击下方保存后生效。"
      show-icon
    />

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ $index }">
        <el-button
          v-if="!isOnlyView"
          link
          type="danger"
          size="small"
          @click="onDeleteRowClick($index)"
          >删除</el-button
        >
      </template>
    </CustomTable>

    <div class="operation">
      <el-button v-if="!isOnlyView" type="primary" @click="onSaveClick()">保存</el-button>
    </div>

    <!-- 选择设备分类弹窗 -->
    <SelectDeviceCategoryDialog
      v-model="selectDeviceCategoryVisible"
      :selected-row-keys="selectedDeviceCategoryIds"
      multiple
      @success="onSelectDeviceCategorySuccess"
    />

    <!-- 选择设备弹窗 -->
    <SelectRouteDeviceDialog
      v-model="selectDeviceVisible"
      :selected-row-keys="selectedDeviceIds"
      enable
      multiple
      @success="onSelectDeviceSuccess"
    />

  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getTechStandardMachineList, setProduceBasic } from "@/api/craft"
import { requestDeviceCategoryTree } from "@/api/operation/equipment/equipment-category"
import { requestEquipmentListByIds } from "@/api/operation/equipment/equipment-info"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMachineStandardType } from "@/constant/enums"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

import SelectDeviceCategoryDialog from "./SelectDeviceCategoryDialog.vue"
import SelectRouteDeviceDialog from "./SelectRouteDeviceDialog.vue"

interface ITableRow {
  id: string
  refId: string
  type: EnumMachineStandardType
  machineCategoryName: string
  machineCategoryNo?: string
  machineName: string
  machineNo: string
  parentCategoryName?: string
  remarks?: string
  techDetailId: string
  refSpecifications: {
    id: string
    monitor: number // 是否开启监控 0关闭 1开启
    refId: string // 引用配置id
    standard: any[]
  }[]
}

interface IDeviceCategoryItem {
  id: string
  categoryNo: string
  categoryName: string
  parentCategoryName: string
  remarks: string
}

defineOptions({
  name: "PersonTab"
})

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
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
        return row.type === EnumMachineStandardType.MODEL ? "按设备分类" : "按设备"
      }
    },
    {
      prop: "machineCategoryName",
      label: "设备分类",
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

const hasChange = ref(false) // 是否有修改
const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))

const categoryMap = ref(new Map<string, IDeviceCategoryItem>())

const selectDeviceCategoryVisible = ref(false)
const selectedDeviceCategoryIds = computed(() =>
  customTableData.value.filter((item) => item.type === 1).map((item) => item.refId)
)

const selectDeviceVisible = ref(false)
const selectedDeviceIds = computed(() =>
  customTableData.value.filter((item) => item.type === 2).map((item) => item.refId)
)

onBeforeMount(() => {
  getMachineList()
})

const normalizeCategoryNode = (node: IDeviceCateHierarchyTreeRes) => {
  categoryMap.value.set(String(node.id), {
    id: String(node.id),
    categoryNo: node.categoryNo || "",
    categoryName: node.categoryName || "",
    parentCategoryName: node.parentCategoryName || "",
    remarks: node.remarks || ""
  })
  ;(node.subDirs || []).forEach(normalizeCategoryNode)
}

const getCategoryMap = async () => {
  const res = await requestDeviceCategoryTree()
  categoryMap.value.clear()
  ;(res?.subDirs || []).forEach(normalizeCategoryNode)
}

// 获取机器列表
const getMachineList = async () => {
  await getCategoryMap()
  const res = await getTechStandardMachineList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId
  })
  if (res) {
    const deviceIds = res
      .filter((item) => item.type === EnumMachineStandardType.DEVICE && item.refId)
      .map((item) => String(item.refId))
    const deviceList = deviceIds.length
      ? await requestEquipmentListByIds({
          idList: deviceIds
        })
      : []
    const deviceMap = new Map(deviceList.map((item) => [String(item.id), item]))

    customTableData.value = res.map((item) => {
      const isCategory = item.type === EnumMachineStandardType.MODEL
      const currentCategory = categoryMap.value.get(String(item.refId || ""))
      const currentDevice = deviceMap.get(String(item.refId || ""))
      return {
        id: item.id,
        refId: item.refId,
        type: item.type,
        machineCategoryName: isCategory
          ? currentCategory?.categoryName || item.tsesEquipmentModel?.equipmentCategoryName || ""
          : currentDevice?.equipmentModel?.equipmentCategoryName ||
            item.tsesEquipment?.equipmentModel?.equipmentCategoryName ||
            "",
        machineCategoryNo: isCategory ? currentCategory?.categoryNo || "" : "",
        machineName: currentDevice?.equipmentName || item.tsesEquipment?.equipmentName || "",
        machineNo:
          item.type === EnumMachineStandardType.DEVICE
            ? currentDevice?.equipmentNo || item.tsesEquipment?.equipmentNo || ""
            : "",
        parentCategoryName: isCategory ? currentCategory?.parentCategoryName || "" : "",
        remarks: isCategory
          ? currentCategory?.remarks || ""
          : currentDevice?.remarks || item.tsesEquipment?.remarks || "",
        techDetailId: item.techDetailId,
        refSpecifications: []
      }
    })

    hasChange.value = false
  }
}

// 选择设备分类成功回调
const onSelectDeviceCategorySuccess = (data: IDeviceCategoryItem[]) => {
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
        machineCategoryName: item.categoryName,
        machineCategoryNo: item.categoryNo,
        machineName: "",
        machineNo: "",
        parentCategoryName: item.parentCategoryName,
        remarks: item.remarks,
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
        machineCategoryName: item.equipmentModel.equipmentCategoryName,
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
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId
  })
  ElMessage.success("保存成功")
  if (isUpdate) {
    await getMachineList()
  }
}

/** 更新数据 */
const updateTableData = () => {
  if (hasChange.value) {
    return onSaveClick(false)
  }
  return undefined
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.machine-tab {
  &__actions {
    display: flex;
    align-items: center;
  }

  &__buttons {
    display: flex;
    gap: 8px;
  }

  &__pending-alert {
    margin-bottom: 12px;
  }
}

.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 20px 0 20px;
}
</style>
