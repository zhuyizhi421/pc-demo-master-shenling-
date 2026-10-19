<!-- 库位信息查看 -->
<template>
  <CustomDrawer v-model="visible" title="库位信息" size="medium">
    <div class="flex flex-col h-full">
      <CustomSearchForm
        :form-list="searchList"
        :label-width="100"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>
      <div class="custom-table-container !p-0">
        <CustomTitle title="库位列表">
          <div>
            <el-button
              v-if="!!Authed"
              type="primary"
              @click="EditLocationHandleRef!.setVisible(true, warehouseData.id, 'create')"
              icon="Plus"
              >新增库位</el-button
            >
          </div>
        </CustomTitle>

        <CustomTable
          ref="multipleTableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #isEnabled-default="{ row }">
            <el-tag v-if="row.isEnable" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>
          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="EditLocationHandleRef!.setVisible(true, row, Authed ? 'update' : 'view')"
              >{{ Authed ? "编辑库位" : "查看库位" }}
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="printBarcode([row.barcode])"
              :disabled="!row.barcode"
              >打印标签码
            </el-button>
            <el-button
              v-if="Authed"
              link
              :type="row.isEnable ? 'danger' : 'primary'"
              size="small"
              @click="disableLogLocation(row.id, row.isEnable)"
            >
              {{ row.isEnable ? "停用" : "启用" }}
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        :border="false"
        @change="multipleTableRef?.requestData()"
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">返回</el-button>
    </template>
  </CustomDrawer>

  <EditLocationHandle ref="EditLocationHandleRef" @on-ok="freshFunc" />
</template>

<script lang="ts" setup name="ApprovalDetails">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  disableLogwarehouseLocationItem,
  enableLogwarehouseLocationItem,
  getLogWarehouseLocationSearch,
  type LogWarehouseLocationSearchInter
} from "@/api/logistics/location"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
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
// import DownloadButton from "@/components/DownloadButton/index.vue"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"

import EditLocationHandle from "./EditLocationHandle.vue"

const { printBarcode } = useBarcodePrint()
const Authed = useButtonAuth("DepotManage_update", "DepotManage_query")
const EditLocationHandleRef = ref<InstanceType<typeof EditLocationHandle>>()
const visible = ref(false)
const tableData = ref<any[]>([])
const multipleTableRef = ref<ComponentExposed<typeof CustomTable>>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  locationCode: string
  locationName: string
  isEnable?: boolean
}>([
  {
    type: EnumComponentType.Input,
    label: "库位名称",
    key: "locationName",
    value: "",
    placeholder: "请输入库位名称"
  },
  {
    type: EnumComponentType.Input,
    label: "库位编号",
    key: "locationCode",
    value: "",
    placeholder: "请输入库位编号"
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "isEnable",
    value: undefined as any,
    options: [
      { label: "启用", value: true },
      { label: "停用", value: false }
    ]
  }
])

const warehouseData = ref({
  id: "",
  facilityName: ""
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const tableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: "100%",
  columns: [
    {
      label: "库位名称",
      prop: "locationName",
      minWidth: 160
    },
    {
      label: "库位编号",
      prop: "locationCode",
      minWidth: 160
    },
    {
      label: "库位标签码",
      prop: "barcode",
      minWidth: 160
    },
    {
      label: "状态",
      prop: "isEnable",
      minWidth: 90,
      align: "center",
      slots: {
        default: "isEnabled-default"
      }
    },
    {
      label: "操作",
      prop: "operation",
      width: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}))

const queryConfig: ITableRequestConfig<[LogWarehouseLocationSearchInter], any, true> = {
  api: getLogWarehouseLocationSearch,
  getParams: () => {
    return [
      {
        ...getFormData(),
        facilityId: warehouseData.value.id,
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    ]
  }
}

const onSubmit = () => {
  pagination.currentPage = 1
  setTimeout(() => {
    multipleTableRef.value?.requestData()
  }, 100)
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const setVisible = (value: boolean, data: any) => {
  visible.value = value
  warehouseData.value = data
  onReset()
}

const freshFunc = () => {
  multipleTableRef.value?.requestData()
}

const disableLogLocation = async (id: string, isEnable: boolean) => {
  const titleText = isEnable ? "停用" : "启用"
  const confirm = await ElMessageBox.confirm(`确定${titleText}该库位吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    if (isEnable) {
      await disableLogwarehouseLocationItem({ id })
      ElMessage({
        message: "停用成功",
        type: "success"
      })
    } else {
      await enableLogwarehouseLocationItem({ id })
      ElMessage({
        message: "启用成功",
        type: "success"
      })
    }
    multipleTableRef.value?.requestData()
  }
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped></style>
