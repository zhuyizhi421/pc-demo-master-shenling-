<template>
  <div class="craft-params-tab">
    <CraftParamsConfigPanel
      v-if="activeMachine"
      :key="`${activeMachine.id}-${props.techVersionInfo.techVersionId}`"
      :data="activeMachine"
      :tech-version-id="props.techVersionInfo.techVersionId"
      :read-only="isReadOnly"
      @success="getMachineList"
    />

    <el-empty
      v-else
      description="请先在机tab中保存设备或设备分类，再配置工艺参数"
      :image-size="120"
    />
  </div>
</template>

<script setup lang="ts">
import { getTechStandardMachineList } from "@/api/craft"
import { requestDeviceCategoryTree } from "@/api/operation/equipment/equipment-category"
import { requestEquipmentListByIds } from "@/api/operation/equipment/equipment-info"
import { EnumCraftStatus, EnumMachineStandardType } from "@/constant/enums"
import type { ITechVersionProps } from "@/types/base-info/craftRoute"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

import CraftParamsConfigPanel from "../MachineTab/CraftParamsConfigPanel.vue"

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
  refSpecifications: any[]
}

interface IDeviceCategoryItem {
  id: string
  categoryNo: string
  categoryName: string
  parentCategoryName: string
  remarks: string
}

const props = withDefaults(
  defineProps<{
    techVersionInfo: ITechVersionProps
  }>(),
  {}
)

const isOnlyView = inject<Ref<boolean>>("isOnlyView", ref(false))
const isReadOnly = computed(
  () => !!isOnlyView.value || props.techVersionInfo.status === EnumCraftStatus.PUBLISHED
)

const machineRows = ref<ITableRow[]>([])
const categoryMap = ref(new Map<string, IDeviceCategoryItem>())

const activeMachine = computed(() => machineRows.value[0])

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

const getMachineList = async () => {
  await getCategoryMap()
  const res = await getTechStandardMachineList({
    techVersionId: props.techVersionInfo.techVersionId,
    processId: props.techVersionInfo.processId
  })
  const deviceIds = (res || [])
    .filter((item) => item.type === EnumMachineStandardType.DEVICE && item.refId)
    .map((item) => String(item.refId))
  const deviceList = deviceIds.length
    ? await requestEquipmentListByIds({
        idList: deviceIds
      })
    : []
  const deviceMap = new Map<string, IEquipmentPageItem>(
    deviceList.map((item) => [String(item.id), item])
  )

  machineRows.value = (res || [])
    .filter((item) => item.id)
    .map((item) => {
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
        refSpecifications: item.refSpecifications || []
      }
    })
}

const updateTableData = () => {
  return undefined
}

defineExpose({ updateTableData })
</script>

<style lang="scss" scoped>
.craft-params-tab {
  min-height: 500px;
}
</style>
