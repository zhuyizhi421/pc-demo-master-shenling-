<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="工价配置">
          <div>
            <el-button type="primary" icon="Plus" @click="openDialog('create')">新建</el-button>
            <el-button type="success" icon="Select" @click="onBatchAudit">审核</el-button>
            <el-button type="danger" icon="CloseBold" @click="onBatchInvalid">作废</el-button>
            <el-button v-if="showReportButton" icon="DataAnalysis" @click="openReportDialog">
              计件报表
            </el-button>
            <el-button icon="Download" @click="onExport">导出</el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          class="custom-table"
          @select-all="onSelectAll"
          @select-change="onSelectChange"
        >
          <template #status-default="{ row }">
            <el-tag :type="statusTagMap[row.status]">{{ pieceworkPriceStatusMap[row.status] }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog('view', row)">查看详情</el-button>
            <el-button link type="primary" size="small" @click="openHistoryPage(row)">历史工价</el-button>
            <el-button v-if="row.status === 'NOT_EFFECTIVE'" link type="primary" size="small" @click="openDialog('edit', row)">
              修改
            </el-button>
            <el-button v-if="row.status === 'NOT_EFFECTIVE'" link type="danger" size="small" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="loadTableData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="920px" @closed="resetDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="产品编号" prop="productNo">
              <div class="choose-field">
                <el-input v-model="formData.productNo" placeholder="弹框选择产品列表" disabled />
                <el-button type="primary" plain :disabled="isReadonly" @click="openProductDialog">
                  选择
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品名称">
              <el-input v-model="formData.productName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品描述">
              <el-input v-model="formData.productDesc" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="产品类别编号">
              <el-input v-model="formData.productCategoryNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品类别名称">
              <el-input v-model="formData.productCategoryName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工价（元）" prop="price">
              <el-input-number
                v-model="formData.price"
                class="w-full"
                :min="0"
                :precision="2"
                :step="0.1"
                controls-position="right"
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="工艺编号" prop="craftNo">
              <div class="choose-field">
                <el-input v-model="formData.craftNo" placeholder="弹框选择工艺列表" disabled />
                <el-button type="primary" plain :disabled="isReadonly" @click="openCraftDialog">
                  选择
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工艺名称">
              <el-input v-model="formData.craftName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="日期选择"
                class="w-full"
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="创建人">
              <el-input v-model="formData.createBy" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-input v-model="formData.createTime" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-input :model-value="pieceworkPriceStatusMap[formData.status]" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="审核人">
              <el-input v-model="formData.auditBy" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="审核时间">
              <el-input v-model="formData.auditTime" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="作废人">
              <el-input v-model="formData.invalidBy" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="作废时间">
              <el-input v-model="formData.invalidTime" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isReadonly" type="primary" @click="onSubmitDialog">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reportDialogVisible" title="工资计件报表" width="1200px">
      <div class="report-toolbar">
        <el-date-picker
          v-model="reportForm.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="report-range"
        />
        <el-input v-model="reportForm.lineName" placeholder="生产线体" class="report-input" clearable />
        <el-input v-model="reportForm.teamName" placeholder="班次" class="report-input" clearable />
        <el-button type="primary" icon="Search" @click="loadReportData">查询</el-button>
        <el-button icon="Download" @click="onExportReport">导出到EXCEL</el-button>
      </div>

      <div class="report-title">计件工资明细汇总</div>
      <el-table :data="reportSummaryList" border height="200">
        <el-table-column prop="lineName" label="生产线体" min-width="180" />
        <el-table-column prop="teamName" label="班次" min-width="120" />
        <el-table-column prop="totalPrice" label="计件工资" min-width="120" />
      </el-table>

      <div class="report-title">计件工资明细</div>
      <el-table :data="reportDetailList" border height="320">
        <el-table-column prop="workDate" label="日期" min-width="120" />
        <el-table-column prop="lineName" label="生产线体" min-width="140" />
        <el-table-column prop="teamName" label="班次" min-width="100" />
        <el-table-column prop="employeeName" label="员工姓名" min-width="220" />
        <el-table-column prop="productNo" label="产品编号" min-width="120" />
        <el-table-column prop="productName" label="产品名称" min-width="180" />
        <el-table-column prop="craftName" label="工序名称" min-width="150" />
        <el-table-column prop="price" label="工价" min-width="100" />
        <el-table-column prop="outputQty" label="生产数" min-width="100" />
        <el-table-column prop="totalPrice" label="总价" min-width="100" />
      </el-table>
    </el-dialog>

    <SelectProductDialog
      v-model="selectProductVisible"
      :selected-row-keys="[formData.productModelId]"
      @success="onSelectProductSuccess"
    />
    <SelectOrUpdateCraftDialog
      v-model="selectCraftVisible"
      type="select"
      :multiple="false"
      :just-see="false"
      @onOk="onSelectCraftSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { useRouter } from "vue-router"

import {
  auditPieceworkPriceBatch,
  createPieceworkPrice,
  deletePieceworkPrice,
  exportPieceworkPriceList,
  exportPieceworkPriceReport,
  getPieceworkProductSelectList,
  invalidPieceworkPriceBatch,
  type IPieceworkPriceItem,
  type IPieceworkProductSelectItem,
  type IPriceReportDetailItem,
  type IPriceReportSummaryItem,
  pieceworkPriceStatusMap,
  queryPieceworkPriceList,
  queryPieceworkPriceReport,
  updatePieceworkPrice
} from "@/api/pieceworkPrice"
import type { IProductModelListItem } from "@/api/product"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import type { ICraftItem } from "@/types/base-info/craftRoute"
import SelectOrUpdateCraftDialog from "@/views/basicConfig/craftwork/craftRoute/components/SelectOrUpdateCraftDialog.vue"

defineOptions({
  name: "PieceworkPrice"
})

type PriceStatus = keyof typeof pieceworkPriceStatusMap
type DialogMode = "create" | "edit" | "view"

const statusOptions = ref<{ label: string; value: PriceStatus }[]>(
  Object.keys(pieceworkPriceStatusMap).map((key) => ({
    label: pieceworkPriceStatusMap[key as PriceStatus],
    value: key as PriceStatus
  }))
)
const showReportButton = false
const router = useRouter()

const productSelectList = ref<IPieceworkProductSelectItem[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "productNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    key: "productName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    key: "craftNo",
    label: "工艺编号",
    value: "",
    placeholder: "请输入工艺编号"
  },
  {
    type: EnumComponentType.Select,
    key: "statusList",
    label: "状态",
    value: [],
    placeholder: "请选择状态",
    options: statusOptions,
    multiple: true,
    maxTag: 2
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productNo: string
  productName: string
  craftNo: string
  statusList: PriceStatus[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<IPieceworkPriceItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  reserveSelection: true,
  columns: [
    {
      prop: "selection",
      label: "",
      type: "selection",
      multiple: true,
      width: 60
    },
    { prop: "productNo", label: "产品编号", minWidth: 130 },
    { prop: "productName", label: "产品名称", minWidth: 160 },
    { prop: "productCategoryNo", label: "产品类别编号", minWidth: 130 },
    { prop: "craftNo", label: "工艺编号", minWidth: 120 },
    { prop: "craftName", label: "工艺名称", minWidth: 150 },
    { prop: "price", label: "工价", minWidth: 90 },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      slots: { default: "status-default" }
    },
    { prop: "effectiveDate", label: "生效日期", minWidth: 120 },
    { prop: "invalidTime", label: "作废日期", minWidth: 160 },
    { prop: "createBy", label: "创建人", minWidth: 120 },
    { prop: "createTime", label: "创建日期", minWidth: 160 },
    { prop: "auditBy", label: "审核人", minWidth: 120 },
    { prop: "auditTime", label: "审核日期", minWidth: 160 },
    { prop: "invalidBy", label: "作废人", minWidth: 120 },
    { prop: "invalidTime", label: "作废时间", minWidth: 160 },
    {
      prop: "operation",
      label: "操作",
      width: 240,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const statusTagMap: Record<PriceStatus, "info" | "success" | "danger"> = {
  NOT_EFFECTIVE: "info",
  EFFECTIVE: "success",
  INVALID: "danger"
}

const selectedRowMap = ref<Record<string, IPieceworkPriceItem>>({})

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>("create")
const dialogEditId = ref("")
const formRef = ref<FormInstance | null>(null)

const formData = reactive<{
  productModelId: string
  productNo: string
  productName: string
  productDesc: string
  productCategoryNo: string
  productCategoryName: string
  craftNo: string
  craftName: string
  price: number
  effectiveDate: string
  status: PriceStatus
  createBy: string
  createTime: string
  auditBy: string
  auditTime: string
  invalidBy: string
  invalidTime: string
}>({
  productModelId: "",
  productNo: "",
  productName: "",
  productDesc: "",
  productCategoryNo: "",
  productCategoryName: "",
  craftNo: "",
  craftName: "",
  price: 0,
  effectiveDate: "",
  status: "NOT_EFFECTIVE",
  createBy: "",
  createTime: "",
  auditBy: "",
  auditTime: "",
  invalidBy: "",
  invalidTime: ""
})

const isReadonly = computed(() => dialogMode.value === "view")
const dialogTitle = computed(() => {
  if (dialogMode.value === "create") return "新增/修改详情"
  if (dialogMode.value === "edit") return "新增/修改详情"
  return "工价详情"
})

const rules = reactive<FormRules<typeof formData>>({
  productNo: [{ required: true, message: "请选择产品编号", trigger: "change" }],
  craftNo: [{ required: true, message: "请选择工艺编号", trigger: "change" }],
  price: [{ required: true, message: "请输入工价", trigger: "blur" }],
  effectiveDate: [{ required: true, message: "请选择生效日期", trigger: "change" }]
})

const reportDialogVisible = ref(false)
const reportForm = reactive({
  dateRange: ["2026-03-01", "2026-03-20"] as string[],
  lineName: "",
  teamName: ""
})
const reportSummaryList = ref<IPriceReportSummaryItem[]>([])
const reportDetailList = ref<IPriceReportDetailItem[]>([])

const selectProductVisible = ref(false)
const selectCraftVisible = ref(false)

const downloadBlobFile = (fileBlob: Blob, fileName: string) => {
  const url = URL.createObjectURL(fileBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const refreshSelectedRowsInCurrentPage = () => {
  customTableData.value.forEach((row) => {
    if (selectedRowMap.value[row.id]) {
      selectedRowMap.value[row.id] = row
    }
  })
}

const getSelectedRows = () => Object.values(selectedRowMap.value)

const loadOptions = async () => {
  productSelectList.value = await getPieceworkProductSelectList()
}

const loadTableData = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const queryFormData = getFormData()
    const data = await queryPieceworkPriceList({
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      productNo: queryFormData.productNo,
      productName: queryFormData.productName,
      craftNo: queryFormData.craftNo,
      statusList: queryFormData.statusList
    })
    customTableData.value = data.records
    pagination.value.total = data.total
    refreshSelectedRowsInCurrentPage()
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await loadTableData()
}

const onSelectAll = (_checked: boolean, selection: IPieceworkPriceItem[]) => {
  customTableData.value.forEach((item) => {
    delete selectedRowMap.value[item.id]
  })
  selection.forEach((item) => {
    selectedRowMap.value[item.id] = item
  })
}

const onSelectChange = (checked: boolean, row: IPieceworkPriceItem) => {
  if (checked) {
    selectedRowMap.value[row.id] = row
    return
  }
  delete selectedRowMap.value[row.id]
}

const resetDialog = () => {
  dialogEditId.value = ""
  formData.productModelId = ""
  formData.productNo = ""
  formData.productName = ""
  formData.productDesc = ""
  formData.productCategoryNo = ""
  formData.productCategoryName = ""
  formData.craftNo = ""
  formData.craftName = ""
  formData.price = 0
  formData.effectiveDate = ""
  formData.status = "NOT_EFFECTIVE"
  formData.createBy = ""
  formData.createTime = ""
  formData.auditBy = ""
  formData.auditTime = ""
  formData.invalidBy = ""
  formData.invalidTime = ""
  formRef.value?.clearValidate()
}

const openProductDialog = () => {
  selectProductVisible.value = true
}

const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  if (!data.length) {
    return
  }
  const product = data[0]
  formData.productModelId = String(product.id)
  formData.productNo = product.code || ""
  formData.productName = product.name || ""
  formData.productDesc = product.name || ""
  formData.productCategoryNo = product.productCategoryCode || ""
  formData.productCategoryName = product.productCategoryName || ""
}

const openCraftDialog = () => {
  selectCraftVisible.value = true
}

const onSelectCraftSuccess = (data: ICraftItem[]) => {
  if (!data.length) return
  formData.craftNo = data[0].no || ""
  formData.craftName = data[0].name || ""
}

const openDialog = (mode: DialogMode, row?: IPieceworkPriceItem) => {
  dialogMode.value = mode
  resetDialog()
  if (row) {
    dialogEditId.value = row.id
    formData.productModelId =
      productSelectList.value.find((item) => item.productNo === row.productNo)?.id || ""
    formData.productNo = row.productNo
    formData.productName = row.productName
    formData.productDesc = row.productName
    formData.productCategoryNo = row.productCategoryNo
    formData.productCategoryName = row.productCategoryName
    formData.craftNo = row.craftNo
    formData.craftName = row.craftName
    formData.price = row.price
    formData.effectiveDate = row.effectiveDate
    formData.status = row.status
    formData.createBy = row.createBy || ""
    formData.createTime = row.createTime || ""
    formData.auditBy = row.auditBy || ""
    formData.auditTime = row.auditTime || ""
    formData.invalidBy = row.invalidBy || ""
    formData.invalidTime = row.invalidTime || ""
  }
  dialogVisible.value = true
}

const onSubmitDialog = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload = {
    productNo: formData.productNo,
    productName: formData.productName,
    productCategoryNo: formData.productCategoryNo,
    productCategoryName: formData.productCategoryName,
    craftNo: formData.craftNo,
    craftName: formData.craftName,
    price: Number(formData.price || 0),
    effectiveDate: formData.effectiveDate
  }

  try {
    if (dialogMode.value === "create") {
      await createPieceworkPrice(payload)
      ElMessage.success("新建成功")
    } else {
      await updatePieceworkPrice({
        id: dialogEditId.value,
        ...payload
      })
      ElMessage.success("修改成功")
    }
    dialogVisible.value = false
    await loadTableData()
  } catch (error: any) {
    ElMessage.warning(error?.message || "保存失败")
  }
}

const onDelete = async (row: IPieceworkPriceItem) => {
  try {
    await ElMessageBox.confirm("确定删除该工价记录么？", "提示", {
      type: "warning"
    })
    await deletePieceworkPrice(row.id)
    delete selectedRowMap.value[row.id]
    ElMessage.success("删除成功")
    await loadTableData()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.warning(error.message)
    }
  }
}

const openHistoryPage = (row: IPieceworkPriceItem) => {
  router.push({
    name: "PieceworkPriceHistory",
    query: {
      productNo: row.productNo,
      productName: row.productName,
      craftNo: row.craftNo,
      craftName: row.craftName
    }
  })
}

const onBatchAudit = async () => {
  const selectedRows = getSelectedRows()
  if (!selectedRows.length) {
    ElMessage.warning("请先勾选需要审核的工价")
    return
  }
  try {
    await ElMessageBox.confirm("确认批量审核选中的工价？", "提示", {
      type: "warning"
    })
    await auditPieceworkPriceBatch(selectedRows.map((item) => item.id))
    selectedRowMap.value = {}
    ElMessage.success("审核成功")
    await loadTableData()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.warning(error.message)
    }
  }
}

const onBatchInvalid = async () => {
  const selectedRows = getSelectedRows()
  if (!selectedRows.length) {
    ElMessage.warning("请先勾选需要作废的工价")
    return
  }
  try {
    await ElMessageBox.confirm("确认批量作废选中的工价？", "提示", {
      type: "warning"
    })
    await invalidPieceworkPriceBatch(selectedRows.map((item) => item.id))
    selectedRowMap.value = {}
    ElMessage.success("作废成功")
    await loadTableData()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.warning(error.message)
    }
  }
}

const onExport = async () => {
  const queryFormData = getFormData()
  const file = await exportPieceworkPriceList({
    productNo: queryFormData.productNo,
    productName: queryFormData.productName,
    craftNo: queryFormData.craftNo,
    statusList: queryFormData.statusList
  })
  downloadBlobFile(file.fileBlob, file.fileName)
}

const loadReportData = async () => {
  const [startDate = "", endDate = ""] = reportForm.dateRange || []
  const data = await queryPieceworkPriceReport({
    startDate,
    endDate,
    lineName: reportForm.lineName,
    teamName: reportForm.teamName
  })
  reportSummaryList.value = data.summaryList
  reportDetailList.value = data.detailList
}

const openReportDialog = async () => {
  reportDialogVisible.value = true
  await loadReportData()
}

const onExportReport = async () => {
  const [startDate = "", endDate = ""] = reportForm.dateRange || []
  const file = await exportPieceworkPriceReport({
    startDate,
    endDate,
    lineName: reportForm.lineName,
    teamName: reportForm.teamName
  })
  downloadBlobFile(file.fileBlob, file.fileName)
}

onMounted(async () => {
  await loadOptions()
  await loadTableData()
})
</script>

<style scoped lang="scss">
.choose-field {
  display: flex;
  gap: 8px;
  width: 100%;
}

.report-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.report-range {
  width: 320px;
}

.report-input {
  width: 180px;
}

.report-title {
  margin: 12px 0 8px;
  font-weight: 600;
}
</style>
