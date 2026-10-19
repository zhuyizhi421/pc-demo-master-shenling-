<template>
  <CustomDialog v-model="dialogVisible" title="编辑设备">
    <CustomTitle title="" style="margin-top: 0px">
      <div v-if="!isReadonly">
        <el-button
          type="primary"
          icon="Plus"
          :disabled="props.type === EnumOperationType.Review"
          @click="deviceVisible = true"
          >添加设备</el-button
        >
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #operation-default="{ $index }">
        <el-button
          type="danger"
          link
          size="small"
          :disabled="props.type === EnumOperationType.Review || isReadonly"
          @click="onRemoveRow($index)"
          >删除</el-button
        >
      </template>
    </CustomTable>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-if="props.type !== EnumOperationType.Review && !isReadonly"
        type="primary"
        @click="onConfirmClick()"
        >确定</el-button
      >
    </template>
  </CustomDialog>

  <!-- 选择设备弹窗 -->
  <SelectDeviceDialog
    v-model="deviceVisible"
    :selected-row-keys="selectedIds"
    enable
    multiple
    @success="onSelectDeviceSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryModelDevices, requestUpdateModelDevices } from "@/api/fm"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import { EnumOperationType } from "@/constant/enums"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

interface ITableRow {
  machineName: string
  machineNo: string
  id: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    parentId: string
    type: EnumOperationType
    isStorage: boolean
    isReadonly?: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const deviceVisible = ref(false) // 选择设备弹窗显示标识

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "machineName",
      label: "设备名称",
      minWidth: 160
    },
    {
      prop: "machineNo",
      label: "设备编号",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const selectedIds = computed(() => customTableData.value.map((item) => item.id))
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      getDetail()
    } else {
      customTableData.value = []
    }
  }
)

/** 获取详情 */
const getDetail = async () => {
  const data = await queryModelDevices(props.id)
  if (!data) {
    return
  }
  customTableData.value = data.map((item) => {
    return {
      machineName: item.name,
      machineNo: item.equipmentNo,
      id: item.id
    }
  })
}

/** 删除设备行操作 */
const onRemoveRow = (index: number) => {
  customTableData.value.splice(index, 1)
}

/** 选择设备成功回调 */
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  if (!data?.length) {
    return
  }

  const list: ITableRow[] = data.map((item) => {
    return {
      machineName: item.equipmentName,
      machineNo: item.equipmentNo,
      id: item.id
    }
  })
  list.forEach((item) => {
    const idx = customTableData.value.findIndex((i) => i.id === item.id)
    if (idx === -1) {
      customTableData.value.push(item)
    }
  })
}

/** 确认操作 */
const onConfirmClick = () => {
  requestUpdateModelDevices({
    id: props.id,
    equipmentIds: selectedIds.value
  })
  ElMessage.success("编辑成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped>
.barcode-item {
  &:deep(.el-form-item__content) {
    display: flex;

    .el-input {
      flex: 1;
    }
  }
}

.operation {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  i {
    cursor: pointer;
  }
}
</style>
