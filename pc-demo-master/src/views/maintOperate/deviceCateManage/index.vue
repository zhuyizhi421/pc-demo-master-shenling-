<template>
  <div class="layout-container">
    <div v-show="curPageKey === EnumPageType.Main" class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="设备信息列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="onCreateDeviceClick()">
              新建设备信息
            </el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #modelStatus-default="{ row }">
            <el-tag v-if="row.modelStatus === EnumStatus.enable" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="onEditDeviceClick(row)">
                {{ canEdit ? "编辑" : "查看" }}
              </el-button>
              <el-dropdown>
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button link type="primary" size="small" @click="onInitSettingClick(row)">
                        初始化配置
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="canEdit"
                      @click="onSwitchStatusClick(row.id, row.modelStatus)"
                    >
                      <el-button
                        link
                        :type="row.modelStatus === EnumStatus.enable ? 'danger' : 'primary'"
                        size="small"
                      >
                        {{ row.modelStatus === EnumStatus.enable ? "停用" : "启用" }}
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="canEdit" @click="onDeleteDeviceClick(row.id)">
                      <el-button link type="danger" size="small">删除</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <div v-if="curPageKey !== EnumPageType.Main" class="layout-child-page">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <DeviceInitSetting
        v-if="curPageKey === EnumPageType.InitConfig"
        :model-id="selectedRowId"
        :justSee="!canEdit"
        @close="onInitSettingClose"
        @success="customTableRef?.requestData()"
      />
    </div>

    <DeviceModelDialog
      ref="deviceModalRef"
      :status="editDeviceStatus.status"
      :device-info="editDeviceStatus.deviceInfo"
      :category-options="categoryOptions"
      :justSee="!canEdit"
      @onOk="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestDeviceCategoryTree } from "@/api/operation/equipment/equipment-category"
import {
  queryEquipmentModelPageList,
  requestDeleteEquipmentModel,
  requestDisableEquipmentModel,
  requestEnableEquipmentModel
} from "@/api/operation/equipment/equipment-model"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { IDeviceCateHierarchyTreeRes } from "@/types/maintain/equipment-manage/equipment-category"
import type {
  IEquipmentModelDepartmentPosition,
  IEquipmentModelPageItem as ITableRow,
  IEquipmentModelPageListParams
} from "@/types/maintain/equipment-manage/equipment-model"
import DeviceInitSetting from "@/views/maintOperate/components/deviceInitSetting.vue"

import DeviceModelDialog from "./components/DeviceModelDialog.vue"

defineOptions({
  name: "DeviceCategory"
})

interface ICategoryOption {
  label: string
  value: string
  children?: ICategoryOption[]
}

enum EnumPageType {
  Main,
  InitConfig
}

enum EnumStatus {
  disabled,
  enable
}

const authType = useButtonAuth("DeviceCategory_update", "DeviceCategory_query")
const canEdit = computed(() => authType.value !== AuthType.View)
const curPageKey = ref(EnumPageType.Main)
const selectedRowId = ref("")
const pageTree = [
  {
    name: "设备信息列表",
    key: EnumPageType.Main,
    children: [
      {
        name: "初始化配置",
        key: EnumPageType.InitConfig
      }
    ]
  }
]

const categoryTree = ref<IDeviceCateHierarchyTreeRes[]>([])
const categoryOptions = computed<ICategoryOption[]>(() => {
  const mapTree = (rows: IDeviceCateHierarchyTreeRes[]) => {
    return rows.map((item) => ({
      label: item.categoryName,
      value: item.id,
      children: mapTree(item.subDirs || [])
    }))
  }

  return mapTree(categoryTree.value)
})

const formatDepartmentPosition = (departmentName?: string, positionName?: string) => {
  if (departmentName && positionName) {
    return `${departmentName}-${positionName}`
  }
  return positionName || departmentName || ""
}

const formatExceptionHandlePositions = (rows: IEquipmentModelDepartmentPosition[] = []) => {
  return rows
    .map((item) => formatDepartmentPosition(item.depName, item.positionName))
    .filter(Boolean)
    .join(", ")
}

const formatRepairTargets = (rows: ITableRow["repairDepartments"] = []) => {
  return rows
    .map((item) =>
      formatDepartmentPosition(item.depName, item.positionName || item.name || "") ||
      item.positionName ||
      item.depName ||
      item.name ||
      ""
    )
    .filter(Boolean)
    .join(", ")
}

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "modelName",
    label: "类型名称",
    value: "",
    placeholder: "请输入类型名称"
  },
  {
    type: EnumComponentType.Input,
    key: "modelNo",
    label: "类型编号",
    value: "",
    placeholder: "请输入类型编号"
  },
  {
    type: EnumComponentType.Input,
    key: "deviceModel",
    label: "设备型号",
    value: "",
    placeholder: "请输入设备型号"
  },
  {
    type: EnumComponentType.Cascader,
    key: "equipmentCategoryId",
    label: "设备分类",
    value: "",
    placeholder: "请选择设备分类",
    options: categoryOptions,
    clearable: true,
    showAllLevels: false,
    props: {
      label: "label",
      value: "value",
      children: "children",
      emitPath: false,
      multiple: false,
      checkStrictly: true
    }
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  modelName: string
  modelNo: string
  deviceModel: string
  equipmentCategoryId?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "modelName",
      label: "类型名称",
      minWidth: 160
    },
    {
      prop: "modelNo",
      label: "类型编号",
      minWidth: 160
    },
    {
      prop: "deviceModel",
      label: "设备型号",
      minWidth: 160
    },
    {
      prop: "equipmentCategoryName",
      label: "设备分类",
      minWidth: 160
    },
    {
      prop: "modelStatus",
      label: "设备状态",
      width: 120,
      align: "center",
      slots: {
        default: "modelStatus-default"
      }
    },
    {
      prop: "repairProcdefName",
      label: "设备维修流程",
      minWidth: 160
    },
    {
      prop: "scrapProcdefName",
      label: "设备报废流程",
      minWidth: 160
    },
    {
      prop: "repairDepartmentNames",
      label: "指定维修职位",
      minWidth: 180,
      formatter: (row: ITableRow) => formatRepairTargets(row.repairDepartments)
    },
    {
      prop: "patrolExecutePositionName",
      label: "巡检执行职位",
      minWidth: 180,
      formatter: (row: ITableRow) =>
        formatDepartmentPosition(row.patrolExecuteDepartmentName, row.patrolExecutePositionName)
    },
    {
      prop: "maintenanceExecutePositionName",
      label: "保养执行职位",
      minWidth: 180,
      formatter: (row: ITableRow) =>
        formatDepartmentPosition(
          row.maintenanceExecuteDepartmentName,
          row.maintenanceExecutePositionName
        )
    },
    {
      prop: "exceptionHandlePositionList",
      label: "异常处理职位",
      minWidth: 220,
      formatter: (row: ITableRow) => formatExceptionHandlePositions(row.exceptionHandlePositionList)
    },
    {
      prop: "faultNames",
      label: "关联故障",
      minWidth: 180,
      formatter: (row: ITableRow) => row.faults?.map((item) => item.faultName)?.join(",") ?? ""
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentModelPageListParams], ITableRow, true> = {
  api: queryEquipmentModelPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
      }
    ]
  }
}

const deviceModalRef = ref<InstanceType<typeof DeviceModelDialog>>()

const editDeviceStatus = ref<{
  status: "edit" | "create"
  deviceInfo: any
}>({
  deviceInfo: {},
  status: "create"
})

onMounted(async () => {
  await getCategoryTreeData()
  customTableRef.value?.requestData()
})

const getCategoryTreeData = async () => {
  const res = await requestDeviceCategoryTree()
  categoryTree.value = res?.subDirs || []
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onDeleteDeviceClick = async (id: string) => {
  const res = await ElMessageBox.confirm("此操作将永久删除该设备信息，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  if (res === "confirm") {
    await requestDeleteEquipmentModel(id)
    await customTableRef.value?.requestData()
  }
}

const onSwitchStatusClick = async (id: string, status: number) => {
  await ElMessageBox.confirm(
    `此操作将${status === EnumStatus.enable ? "停用" : "启用"}该设备信息，是否继续？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )

  if (status === EnumStatus.enable) {
    await requestDisableEquipmentModel(id)
    ElMessage.success("停用成功")
  } else {
    await requestEnableEquipmentModel(id)
    ElMessage.success("启用成功")
  }
  await customTableRef.value?.requestData()
}

const onInitSettingClick = (data: ITableRow) => {
  selectedRowId.value = String(data.id)
  curPageKey.value = EnumPageType.InitConfig
}

const onInitSettingClose = () => {
  selectedRowId.value = ""
  curPageKey.value = EnumPageType.Main
}

const onCreateDeviceClick = () => {
  editDeviceStatus.value = {
    status: "create",
    deviceInfo: {
      modelName: "",
      modelNo: "",
      deviceModel: "",
      remarks: "",
      repairDepartmentIds: [],
      repairDepartments: [],
      repairProcdefId: "",
      scrapProcdefId: "",
      faultIds: [],
      equipmentCategoryId: "",
      patrolDepartmentPositionValue: [],
      maintenanceDepartmentPositionValue: [],
      exceptionHandleDepartmentPositionValues: [],
      id: ""
    }
  }
  deviceModalRef.value?.setShow()
}

const onEditDeviceClick = (data: ITableRow) => {
  editDeviceStatus.value = {
    status: "edit",
    deviceInfo: {
      modelName: data.modelName,
      modelNo: data.modelNo,
      deviceModel: data.deviceModel || "",
      remarks: data.remarks,
      repairDepartmentIds: data.repairDepartments?.map((item: any) => item.id) || [],
      repairDepartments: data.repairDepartments || [],
      repairProcdefId: data.repairProcdefId || "",
      scrapProcdefId: data.scrapProcdefId,
      faultIds: data.faults?.map((item: any) => item.id) || [],
      equipmentCategoryId: data.equipmentCategoryId,
      patrolExecuteDepartmentId: data.patrolExecuteDepartmentId || "",
      patrolExecuteDepartmentName: data.patrolExecuteDepartmentName || "",
      patrolExecutePositionId: data.patrolExecutePositionId || "",
      patrolExecutePositionName: data.patrolExecutePositionName || "",
      maintenanceExecuteDepartmentId: data.maintenanceExecuteDepartmentId || "",
      maintenanceExecuteDepartmentName: data.maintenanceExecuteDepartmentName || "",
      maintenanceExecutePositionId: data.maintenanceExecutePositionId || "",
      maintenanceExecutePositionName: data.maintenanceExecutePositionName || "",
      exceptionHandlePositionList: data.exceptionHandlePositionList || [],
      id: data.id,
      modelImgPath: data?.modelImgPath || "",
      modelImg: data?.modelImg || ""
    }
  }
  deviceModalRef.value?.setShow()
}
</script>

<style scoped lang="scss">
.layout-main-page {
  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }

    &:focus-visible {
      outline: none;
    }
  }
}
</style>
