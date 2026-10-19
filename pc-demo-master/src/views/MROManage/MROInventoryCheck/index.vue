<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />
      <div class="custom-table-container">
        <CustomTitle title="MRO盘点单">
          <el-button v-if="isAuth" type="primary" @click="onOpenLockDialog">仓库锁定</el-button>
          <el-button v-if="isAuth" type="primary" plain @click="onOpenUnlockDialog"
            >仓库解锁</el-button
          >
          <el-button v-if="isAuth" type="primary" icon="Plus" @click="onCreate">新增盘点</el-button>
        </CustomTitle>
        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #checkStatus-default="{ row }">
            <el-tag
              :type="EnumWarehouseCheckStatusTagMap[row.checkStatus as EnumWarehouseCheckStatus]"
            >
              {{ EnumWarehouseCheckStatusMap[row.checkStatus as EnumWarehouseCheckStatus] || "--" }}
            </el-tag>
          </template>
          <template #operation-default="{ row }">
            <template v-if="row.checkStatus === EnumWarehouseCheckStatus.Un_publish && isAuth">
              <el-button link size="small" type="primary" @click="onEdit(row)">编辑查看</el-button>
              <el-button link size="small" type="primary" @click="onPublish(row)">发布</el-button>
              <el-button link size="small" type="danger" @click="onDelete(row)">删除</el-button>
            </template>
            <el-button
              v-if="row.checkStatus !== EnumWarehouseCheckStatus.Un_publish || !isAuth"
              link
              size="small"
              type="primary"
              @click="onDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.checkStatus === EnumWarehouseCheckStatus.Published && isAuth"
              link
              size="small"
              type="danger"
              @click="onSettle(row)"
            >
              结案
            </el-button>
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
    </div>

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />
      <CreateOrUpdate
        v-if="[EnumPageType.Create, EnumPageType.Update].includes(curPageKey)"
        :current-row="currentRow"
        :locked-warehouse-options="lockedWarehouseOptions"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />
      <Detail
        v-if="curPageKey === EnumPageType.Detail"
        :detail-data="currentRow"
        :just-see="!isAuth"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />
    </div>

    <el-dialog v-model="warehouseLockDialogVisible" title="仓库锁定" width="460px">
      <el-form label-width="90px">
        <el-form-item label="仓库">
          <el-select
            v-model="selectedWarehouseIdForLock"
            filterable
            class="w-full"
            placeholder="请选择仓库"
          >
            <el-option
              v-for="item in warehouseOptionsForLock"
              :key="item.value"
              :label="`${item.label} (${item.code})`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库编号">
          <el-input :model-value="selectedWarehouseCodeForLock" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="warehouseLockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmLockWarehouse">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="warehouseUnlockDialogVisible" title="仓库解锁" width="460px">
      <el-form label-width="90px">
        <el-form-item label="仓库">
          <el-select
            v-model="selectedWarehouseIdForUnlock"
            filterable
            class="w-full"
            placeholder="请选择仓库"
          >
            <el-option
              v-for="item in lockedWarehouseOptions"
              :key="item.value"
              :label="`${item.label} (${item.code})`"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库编号">
          <el-input :model-value="selectedWarehouseCodeForUnlock" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="warehouseUnlockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmUnlockWarehouse">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryFactoryModelList } from "@/api/fm"
import {
  queryMroInventoryCheckLockedWarehouses,
  queryMroInventoryCheckPageList,
  requestDeleteMroInventoryCheck,
  requestLockMroInventoryCheckWarehouse,
  requestPublishMroInventoryCheck,
  requestUnlockMroInventoryCheckWarehouse
} from "@/api/operation/mro/mro-inventory-check"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import {
  EnumWarehouseCheckStatus,
  EnumWarehouseCheckStatusMap,
  EnumWarehouseCheckStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IMroInventoryCheckPageListItem as ITableRow,
  IMroInventoryCheckPageListParams
} from "@/types/maintain/mro-manage/mro-inventory-check"

import CreateOrUpdate from "./components/CreateOrUpdate.vue"
import Detail from "./components/Detail.vue"

defineOptions({ name: "MROInventoryCheck" })

enum EnumPageType {
  Main,
  Create,
  Update,
  Detail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO盘点单列表",
    key: EnumPageType.Main,
    children: [
      { name: "MRO盘点单新建", key: EnumPageType.Create },
      { name: "MRO盘点单编辑", key: EnumPageType.Update },
      { name: "MRO盘点单详情", key: EnumPageType.Detail }
    ]
  }
])
const isAuth = useButtonAuth("MROInventoryCheck_update", "MROInventoryCheck_query")

type IWarehouseOption = { value: string; label: string; code: string }
const warehouseLockDialogVisible = ref(false)
const warehouseUnlockDialogVisible = ref(false)
const warehouseOptionsForLock = ref<IWarehouseOption[]>([])
const lockedWarehouseOptions = ref<IWarehouseOption[]>([])
const selectedWarehouseIdForLock = ref("")
const selectedWarehouseIdForUnlock = ref("")

const selectedWarehouseCodeForLock = computed(
  () =>
    warehouseOptionsForLock.value.find((item) => item.value === selectedWarehouseIdForLock.value)
      ?.code || ""
)
const selectedWarehouseCodeForUnlock = computed(
  () =>
    lockedWarehouseOptions.value.find((item) => item.value === selectedWarehouseIdForUnlock.value)
      ?.code || ""
)

const { searchList, resetForm, getFormData } = useSearchForm<{
  checkNo: string
  checkStatusList: number[]
  warehouseNo: string
  warehouseName: string
  checkEmpName: string
  mroModelNo: string
  mroSerialNo: string
  mroModelName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "盘点单号",
    key: "checkNo",
    value: "",
    placeholder: "请输入盘点单号"
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "checkStatusList",
    value: "",
    placeholder: "请选择状态",
    options: Object.entries(EnumWarehouseCheckStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Input,
    label: "盘点人",
    key: "checkEmpName",
    value: "",
    placeholder: "请输入盘点人"
  },
  {
    type: EnumComponentType.Input,
    label: "仓库编号",
    key: "warehouseNo",
    value: "",
    placeholder: "请输入仓库编号"
  },
  {
    type: EnumComponentType.Input,
    label: "仓库名称",
    key: "warehouseName",
    value: "",
    placeholder: "请输入仓库名称"
  },
  {
    type: EnumComponentType.Input,
    label: "MRO编号",
    key: "mroModelNo",
    value: "",
    placeholder: "请输入MRO编号"
  },
  {
    type: EnumComponentType.Input,
    label: "MRO序列号",
    key: "mroSerialNo",
    value: "",
    placeholder: "请输入MRO序列号"
  },
  {
    type: EnumComponentType.Input,
    label: "MRO名称",
    key: "mroModelName",
    value: "",
    placeholder: "请输入MRO名称"
  }
])

const currentRow = ref<ITableRow>({} as ITableRow)
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "checkNo", label: "盘点单号", minWidth: 180 },
    {
      prop: "checkStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: { default: "checkStatus-default" }
    },
    { prop: "checkDate", label: "盘点日期", width: 160, align: "center" },
    { prop: "checkEmpName", label: "盘点人", width: 140 },
    { prop: "warehouseNo", label: "仓库编号", minWidth: 140 },
    { prop: "warehouseName", label: "仓库名称", minWidth: 160 },
    {
      prop: "remark",
      label: "备注",
      minWidth: 180,
      formatter: ({ remark }: ITableRow) => remark || "--"
    },
    {
      prop: "createByName",
      label: "创建人",
      width: 120,
      align: "center",
      formatter: ({ createByName }: ITableRow) => createByName || "--"
    },
    { prop: "createTime", label: "创建时间", width: 160, align: "center" },
    { prop: "statementTime", label: "结案时间", width: 160, align: "center" },
    { prop: "statementEmpName", label: "结案人", width: 140, align: "center" },
    {
      prop: "operation",
      label: "操作",
      width: 190,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})
const pagination = reactive({ currentPage: 1, pageSize: 20, total: 0 })
const queryConfig: ITableRequestConfig<[IMroInventoryCheckPageListParams], ITableRow, true> = {
  api: queryMroInventoryCheckPageList,
  getParams: () => [
    { ...getFormData(), pageNum: pagination.currentPage, pageSize: pagination.pageSize }
  ]
}

onMounted(() => tableRef.value?.requestData())
onMounted(async () => {
  await loadLockedWarehouses()
  await loadWarehouseOptions()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}
const onReset = () => {
  resetForm()
  onSubmit()
}
const onCreate = () => {
  if (!lockedWarehouseOptions.value.length) {
    ElMessage.warning("请先通过“仓库锁定”选择可盘点仓库")
    return
  }
  curPageKey.value = EnumPageType.Create
  currentRow.value = {} as ITableRow
}
const onEdit = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Update
  currentRow.value = row
}
const onDetail = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Detail
  currentRow.value = row
}
const onDelete = async (row: ITableRow) => {
  await ElMessageBox.confirm("此操作将永久删除该盘点单, 是否继续?", "提示", { type: "warning" })
  await requestDeleteMroInventoryCheck(row.id)
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}
const onPublish = async (row: ITableRow) => {
  await ElMessageBox.confirm("发布后该仓库MRO库存将被锁定，直至盘点结案。", "提示", {
    confirmButtonText: "确认发布",
    type: "warning"
  })
  await requestPublishMroInventoryCheck(row.id)
  ElMessage.success("发布成功")
  tableRef.value?.requestData()
}
const onSettle = (row: ITableRow) => onDetail(row)

const loadWarehouseOptions = async () => {
  const list = await queryFactoryModelList({
    isStorage: true,
    isEnable: true
  })
  warehouseOptionsForLock.value = list
    .filter((item) => item.isStorage)
    .map((item) => ({
      value: String(item.id),
      label: String(item.entityName || ""),
      code: String(item.entityCode || "")
    }))
}

const loadLockedWarehouses = async () => {
  lockedWarehouseOptions.value = await queryMroInventoryCheckLockedWarehouses()
}

const onOpenLockDialog = () => {
  selectedWarehouseIdForLock.value = ""
  warehouseLockDialogVisible.value = true
}

const onOpenUnlockDialog = () => {
  if (!lockedWarehouseOptions.value.length) {
    ElMessage.warning("当前没有已锁定仓库")
    return
  }
  selectedWarehouseIdForUnlock.value = ""
  warehouseUnlockDialogVisible.value = true
}

const onConfirmLockWarehouse = () => {
  if (!selectedWarehouseIdForLock.value) {
    ElMessage.warning("请选择仓库")
    return
  }
  const target = warehouseOptionsForLock.value.find(
    (item) => item.value === selectedWarehouseIdForLock.value
  )
  if (!target) {
    ElMessage.warning("仓库信息不存在")
    return
  }
  requestLockMroInventoryCheckWarehouse({
    warehouseId: target.value,
    warehouseName: target.label,
    warehouseNo: target.code
  }).then(async () => {
    await loadLockedWarehouses()
    warehouseLockDialogVisible.value = false
    ElMessage.success("锁定成功")
  })
}

const onConfirmUnlockWarehouse = () => {
  if (!selectedWarehouseIdForUnlock.value) {
    ElMessage.warning("请选择仓库")
    return
  }
  requestUnlockMroInventoryCheckWarehouse({
    warehouseId: selectedWarehouseIdForUnlock.value
  }).then(async () => {
    await loadLockedWarehouses()
    warehouseUnlockDialogVisible.value = false
    ElMessage.success("解锁成功")
  })
}
</script>
