<!-- 选择保养项弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择保养项" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
      <template #files-default="{ row }">
        <el-image
          class="w-[50px] h-[50px]"
          v-for="item in row.maintenanceItem?.files"
          :key="item.id"
          :src="formatImgUrlPreview(item.path)"
          :preview-teleported="true"
          :preview-src-list="[formatImgUrlPreview(item.path)]"
          fit="contain"
        />
      </template>
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="tableRef?.requestData()"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryEquipmentConfigListByIds,
  queryEquipmentConfigPageList
} from "@/api/operation/equipment/equipment-config"
import { inspectionStandardTypeToNameMap } from "@/api/operation/equipment/types"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  IEquipmentConfigPageListItem as ITableRow,
  IEquipmentConfigPageListParams
} from "@/types/maintain/equipment-manage/equipment-config"
import { formatImgUrlPreview } from "@/utils/common"

import type { IDeviceMaintainDialogEmits, IDeviceMaintainDialogProps } from "./type"

defineOptions({
  name: "SelectDeviceMaintainDialog"
})

const props = withDefaults(defineProps<IDeviceMaintainDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emits = defineEmits<IDeviceMaintainDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  configName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "保养项名称",
    key: "configName",
    value: "",
    placeholder: "请输入保养项名称"
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "maintenanceItem.maintenanceName",
      label: "保养项名称",
      minWidth: 160
    },
    {
      prop: "maintenanceItem.method",
      label: "方法要求",
      minWidth: 160
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      minWidth: 120,
      align: "center",
      formatter: ({ maintenanceItem }) =>
        inspectionStandardTypeToNameMap[maintenanceItem?.inspectionStandard?.standardType]
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      minWidth: 160,
      formatter: ({ maintenanceItem }) => formatStandard(maintenanceItem?.inspectionStandard)
    },
    {
      prop: "maintenanceItem.maintenanceFrequency",
      label: "保养频率(天)",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "maintenanceDepartments",
      label: "保养执行部门",
      minWidth: 160,
      formatter: ({ maintenanceItem }) =>
        maintenanceItem?.maintenanceDepartments?.map((item: any) => item.depName)?.join(",")
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      minWidth: 160,
      formatter: ({ maintenanceItem }) =>
        maintenanceItem?.ngDepartments?.map((item: any) => item.depName)?.join(",")
    },
    {
      prop: "files",
      label: "图片说明",
      minWidth: 160,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      get multiple() {
        return props.multiple
      },
      fixed: "right",
      selectable: (row) => {
        return props.multiple ? !props.selectedRowKeys?.includes(row[props.rowKey]) : true
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IEquipmentConfigPageListParams], ITableRow, true> = {
  api: queryEquipmentConfigPageList,
  getParams: () => {
    return [
      {
        pageQuery: { pageNum: pagination.currentPage, pageSize: pagination.pageSize },
        queryParam: {
          ...getFormData(),
          equipmentId: props.equipmentId,
          configType: props.configType // 保养类型
        }
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getAllEquipmentConfigData)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getAllEquipmentConfigData)
      })
    } else {
      resetForm()
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
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

/** 获取设备保养项列表全部数据 */
const getAllEquipmentConfigData = async () => {
  const data = await queryEquipmentConfigListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择保养项")
    }
    emits("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择保养项")
    }
    emits("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
