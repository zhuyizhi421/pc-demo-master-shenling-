<!-- 仓库运营管理 - 仓库管理 - 仓库管理 -->
<template>
  <div class="layout-container">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="custom-table-container">
      <CustomTitle>
        <template #title>
          <div>
            <span>仓库列表</span>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="仓库的基础信息、其包含的库位信息，在“基础配置-工厂建模”进行初始化配置"
              placement="top-start"
            >
              <el-button :icon="QuestionFilled" size="small" circle class="text-[16px] ml-[5px]" />
            </el-tooltip>
          </div>
        </template>

        <template #default>
          <!-- <DownloadButton url="/logistics/warehouse/export" method="post" :params="queryParams"
          >批量导出</DownloadButton
        > -->
        </template>
      </CustomTitle>

      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
      >
        <template #isEnable-default="{ row }">
          <el-tag v-if="row.isEnable" type="success">启用</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </template>

        <template #operation-default="{ row }">
          <div class="operation-btn">
            <el-button
              link
              type="primary"
              size="small"
              @click="WarehouseLocationDetailsRef!.setVisible(true, row)"
              >查看库位
            </el-button>
            <el-dropdown>
              <el-button link type="primary" size="small">
                更多
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="Authed"
                    class="text-sky-500"
                    @click="editFacilityHandleRef!.setVisible(true, row)"
                    >编辑仓库</el-dropdown-item
                  >
                  <el-dropdown-item
                    class="text-sky-500"
                    :disabled="!row.barcode"
                    @click="printBarcode([row.barcode])"
                    >打印标签码</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="Authed"
                    divided
                    class="text-sky-500"
                    @click="disableLogWarehouse(row.id, row.isEnable)"
                    >{{ row.isEnable ? "停用" : "启用" }}</el-dropdown-item
                  >
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
      @change="tableRef?.requestData()"
    />

    <WarehouseLocationDetails ref="WarehouseLocationDetailsRef" />

    <EditFacilityHandle ref="editFacilityHandleRef" @on-ok="tableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryWarehousePage,
  requestDisableWarehouse,
  requestEnableWarehouse
} from "@/api/logistics/warehouse"
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
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumWarehouseTypeMap } from "@/constant/enums"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IWarehousePageListItem as ITableRow,
  IWarehousePageListParams
} from "@/types/logistics/warehouse"
import { outboundRuleType } from "@/utils/const"

import EditFacilityHandle from "./components/EditFacilityHandle.vue"
import WarehouseLocationDetails from "./components/WarehouseLocationDetails.vue"

defineOptions({
  name: "DepotManage"
})

const Authed = useButtonAuth("DepotManage_update", "DepotManage_query")
const { printBarcode } = useBarcodePrint()

const { searchList, resetForm, getFormData } = useSearchForm<{
  facilityName: string
  facilityCode: string
  warehouseTypeList: number[]
  isEnable: boolean
}>([
  {
    type: EnumComponentType.Input,
    label: "仓库名称",
    key: "facilityName",
    value: "",
    placeholder: "请输入仓库名称"
  },
  {
    type: EnumComponentType.Input,
    label: "仓库编号",
    key: "facilityCode",
    value: "",
    placeholder: "请输入仓库编号"
  },
  {
    type: EnumComponentType.Select,
    label: "仓库类型",
    key: "warehouseTypeList",
    value: "",
    placeholder: "请选择仓库类型",
    options: Object.entries(EnumWarehouseTypeMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    multiple: true
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "isEnable",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "启用",
        value: true
      },
      {
        label: "停用",
        value: false
      }
    ]
  }
])

const editFacilityHandleRef = ref<InstanceType<typeof EditFacilityHandle>>()
const WarehouseLocationDetailsRef = ref<InstanceType<typeof WarehouseLocationDetails>>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "facilityName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "facilityCode",
      label: "仓库编号",
      minWidth: 160
    },
    {
      prop: "barcode",
      label: "仓库标签码",
      minWidth: 160
    },
    {
      prop: "parentEntityName",
      label: "所属区域",
      minWidth: 160
    },
    {
      prop: "warehouseType",
      label: "仓库类型",
      width: 120,
      align: "center",
      formatter: ({ warehouseType }) => EnumWarehouseTypeMap[warehouseType]
    },
    {
      prop: "locationNum",
      label: "库位数量",
      width: 120,
      align: "right"
    },
    {
      prop: "isEnable",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "isEnable-default"
      }
    },
    {
      prop: "outboundRule",
      label: "出库规则",
      minWidth: 160,
      formatter: ({ outboundRule }) => outboundRuleType[outboundRule]
    },
    {
      prop: "operation",
      label: "操作",
      width: 130,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IWarehousePageListParams], ITableRow, true> = {
  api: queryWarehousePage,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  tableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 停用、启用操作 */
const disableLogWarehouse = async (id: string, isEnable: number) => {
  const titleText = isEnable ? "停用" : "启用"
  const confirm = await ElMessageBox.confirm(`确定${titleText}该仓库吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    if (isEnable) {
      await requestDisableWarehouse({ id })
      ElMessage({
        message: "停用成功",
        type: "success"
      })
    } else {
      await requestEnableWarehouse({ id })
      ElMessage({
        message: "启用成功",
        type: "success"
      })
    }
    tableRef.value?.requestData()
  }
}
</script>

<style scoped lang="scss">
.operation-btn {
  display: flex;
  align-items: center;
}
</style>
