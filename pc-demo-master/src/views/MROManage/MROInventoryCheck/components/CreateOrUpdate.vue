<template>
  <div class="content">
    <div class="top-back">
      <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
    </div>
    <div class="top-content">
      <CustomTitle
        :title="!isEdit ? '新建MRO盘点单' : `盘点单号：${props.currentRow?.checkNo}`"
        :is-table-title="false"
        show-short-bar
        style="margin-top: 0"
      />
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
        <template #warehouse-options="{ data }">
          <el-option
            v-for="item in data.options || []"
            :key="item.value"
            :label="`${item.label} (${item.code})`"
            :value="item.value"
          />
        </template>
      </CustomForm>
    </div>
    <div class="table-box">
      <CustomTitle title="盘点清单" :is-table-title="false" show-short-bar>
        <el-button type="primary" :disabled="!formData.warehouseId" @click="onGenerateDetail"
          >生成明细</el-button
        >
      </CustomTitle>
      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        :config="tableConfig"
        class="custom-table"
      >
        <template #mroSerialNo-default="{ row }">
          <el-button link type="primary" size="small" @click="onOpenMroInfoDialog(row)">
            {{ row.mroSerialNo || "--" }}
          </el-button>
        </template>
        <template #mroModelName-default="{ row }">
          <el-button link type="primary" size="small" @click="onOpenMroModelDialog(row)">
            {{ row.mroModelName || "--" }}
          </el-button>
        </template>
        <template #checkQuantity-default="{ row }">
          <el-input-number
            v-model="row.checkQuantity"
            :min="0"
            :precision="0"
            controls-position="right"
            style="width: 120px"
          />
        </template>
      </CustomTable>
    </div>
  </div>
  <div class="layout-footer">
    <el-button @click="emits('close')">取消</el-button>
    <el-button type="primary" @click="submitForm">{{ isEdit ? "保存" : "创建" }}</el-button>
  </div>

  <SelectPersonDialog
    v-model="selectCheckPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="selectedCheckPersonIds"
    @success="onSelectCheckPersonSuccess"
  />

  <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedMroInfoId" />
  <MroModelInfoDialog v-model="mroModelInfoVisible" :mro-model-id="selectedMroModelId" />
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroInventoryCheckDetail,
  requestCreateMroInventoryCheck,
  requestGenerateMroInventoryCheckDetail,
  requestUpdateMroInventoryCheck
} from "@/api/operation/mro/mro-inventory-check"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser } from "@/constant/enums"
import type {
  IMroInventoryCheckDetailItem,
  IMroInventoryCheckPageListItem
} from "@/types/maintain/mro-manage/mro-inventory-check"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

type IWarehouseOption = { value: string; label: string; code: string }
const props = defineProps<{
  currentRow: IMroInventoryCheckPageListItem
  lockedWarehouseOptions?: IWarehouseOption[]
}>()
const emits = defineEmits<{ (e: "close"): void; (e: "success"): void }>()
const isEdit = computed(() => !!props.currentRow?.id)
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const selectCheckPersonVisible = ref(false)
const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedMroInfoId = ref("")
const selectedMroModelId = ref("")

const formData = ref({
  warehouseId: "",
  checkEmpId: "",
  checkEmpName: "",
  checkDate: dayjs().format("YYYY-MM-DD"),
  remark: "",
  checkStatusName: "",
  createTime: ""
})
const tableData = ref<IMroInventoryCheckDetailItem[]>([])
const selectedCheckPersonIds = computed(() =>
  formData.value.checkEmpId ? [formData.value.checkEmpId] : []
)

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "仓库",
    field: "warehouseId",
    rules: [{ required: true, message: "请选择仓库", trigger: "change" }],
    props: {
      class: "w-[100%]",
      filterable: true,
      placeholder: "请选择仓库",
      get disabled() {
        return isEdit.value && !!tableData.value.length
      },
      get options() {
        const source = props.lockedWarehouseOptions || []
        if (!isEdit.value) return source
        const currentId = String(formData.value.warehouseId || "")
        if (!currentId || source.some((item) => item.value === currentId)) return source
        return [
          ...source,
          {
            value: currentId,
            label: props.currentRow.warehouseName || currentId,
            code: props.currentRow.warehouseNo || ""
          }
        ]
      }
    },
    slots: {
      default: "warehouse-options"
    },
    events: {
      change: () => {
        if (!isEdit.value) tableData.value = []
      }
    }
  },
  {
    componentType: "el-input",
    label: "盘点人",
    field: "checkEmpName",
    rules: [{ required: true, message: "请选择盘点人", trigger: "change" }],
    props: {
      readonly: true,
      placeholder: "点击选择盘点人"
    },
    events: {
      click: () => {
        selectCheckPersonVisible.value = true
      }
    }
  },
  {
    componentType: "el-date-picker",
    label: "盘点日期",
    field: "checkDate",
    props: { type: "date", valueFormat: "YYYY-MM-DD", class: "w-[100%]" }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: { maxlength: 200, showWordLimit: true }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "checkStatusName",
    hidden: !isEdit.value,
    props: { disabled: true }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "createTime",
    hidden: !isEdit.value,
    props: { disabled: true }
  }
])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "mroModelNo", label: "MRO编号", minWidth: 140 },
    {
      prop: "mroSerialNo",
      label: "MRO序列号",
      minWidth: 160,
      slots: { default: "mroSerialNo-default" }
    },
    { prop: "barcode", label: "标签码", minWidth: 160 },
    {
      prop: "mroModelName",
      label: "MRO名称",
      minWidth: 160,
      slots: { default: "mroModelName-default" }
    },
    { prop: "mroSpec", label: "MRO规格", minWidth: 140 },
    { prop: "mroClassifyName", label: "MRO分类", minWidth: 140 },
    { prop: "mroTypeName", label: "MRO类型", minWidth: 120 },
    {
      prop: "identityManage",
      label: "标识管理",
      width: 100,
      formatter: (row: IMroInventoryCheckDetailItem) => (row.identityManage ? "是" : "否")
    },
    { prop: "warehouseLocationNo", label: "库位编号", minWidth: 140 },
    { prop: "warehouseLocationName", label: "库位名称", minWidth: 140 },
    { prop: "originalQuantity", label: "账面数量", width: 100, align: "right" },
    {
      prop: "checkQuantity",
      label: "盘点数量",
      width: 130,
      align: "center",
      slots: { default: "checkQuantity-default" }
    },
    {
      prop: "changeQuantity",
      label: "差异数量",
      width: 100,
      align: "right",
      formatter: (row: IMroInventoryCheckDetailItem) =>
        String((row.checkQuantity ?? 0) - (row.originalQuantity ?? 0))
    }
  ]
})

onMounted(async () => {
  if (!isEdit.value) return
  formData.value.warehouseId = props.currentRow.warehouseId || ""
  formData.value.checkEmpId = props.currentRow.checkEmpId || ""
  formData.value.checkEmpName = props.currentRow.checkEmpName || ""
  formData.value.checkDate = props.currentRow.checkDate || formData.value.checkDate
  formData.value.remark = props.currentRow.remark || ""
  formData.value.checkStatusName =
    ["未发布", "已发布", "已结案"][props.currentRow.checkStatus] || "--"
  formData.value.createTime = props.currentRow.createTime || ""
  tableData.value = await queryMroInventoryCheckDetail(props.currentRow.id)
})

const onGenerateDetail = async () => {
  if (!formData.value.warehouseId) {
    ElMessage.warning("请先选择仓库")
    return
  }
  if (
    tableData.value.some(
      (item) => item.checkQuantity !== null && item.checkQuantity !== item.originalQuantity
    )
  ) {
    await ElMessageBox.confirm("重新生成会覆盖当前盘点数量，是否继续？", "提示", {
      type: "warning"
    })
  }
  const data = await requestGenerateMroInventoryCheckDetail({
    id: props.currentRow?.id,
    warehouseId: formData.value.warehouseId
  })
  tableData.value = data.map((item) => ({
    ...item,
    checkQuantity: item.checkQuantity ?? item.originalQuantity
  }))
}

const onSelectCheckPersonSuccess = (data: ITree[]) => {
  const person = data?.[0]
  if (!person) return
  formData.value.checkEmpId = String(person.id || "")
  formData.value.checkEmpName = String(person.label || "")
}

const onOpenMroInfoDialog = (row: IMroInventoryCheckDetailItem) => {
  const mroInfoId = String(row.mroInformationId || "")
  if (!mroInfoId) {
    ElMessage.warning("该行未关联MRO信息，无法查看详情")
    return
  }
  selectedMroInfoId.value = mroInfoId
  mroInfoVisible.value = true
}

const onOpenMroModelDialog = (row: IMroInventoryCheckDetailItem) => {
  const mroModelId = String(row.mroModelId || "")
  if (!mroModelId) {
    ElMessage.warning("该行未关联MRO型号，无法查看详情")
    return
  }
  selectedMroModelId.value = mroModelId
  mroModelInfoVisible.value = true
}

const submitForm = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  if (!tableData.value.length) {
    ElMessage.warning("请先生成盘点明细")
    return
  }
  if (
    tableData.value.some((item) => item.checkQuantity === null || item.checkQuantity === undefined)
  ) {
    ElMessage.warning("请完整填写盘点数量")
    return
  }
  const payload = {
    warehouseId: formData.value.warehouseId,
    checkEmpId: formData.value.checkEmpId,
    checkEmpName: formData.value.checkEmpName,
    checkDate: formData.value.checkDate,
    remark: formData.value.remark,
    detailList: tableData.value.map((item) => ({
      id: item.id,
      mroInformationId: item.mroInformationId,
      mroModelId: item.mroModelId,
      mroModelNo: item.mroModelNo,
      mroSerialNo: item.mroSerialNo,
      mroModelName: item.mroModelName,
      mroSpec: item.mroSpec,
      mroClassifyName: item.mroClassifyName,
      mroTypeName: item.mroTypeName,
      barcode: item.barcode,
      identityManage: item.identityManage,
      warehouseLocationId: item.warehouseLocationId,
      warehouseLocationNo: item.warehouseLocationNo,
      warehouseLocationName: item.warehouseLocationName,
      originalQuantity: Number(item.originalQuantity || 0),
      checkQuantity: Number(item.checkQuantity || 0)
    }))
  }
  if (isEdit.value) {
    await requestUpdateMroInventoryCheck({ id: props.currentRow.id, ...payload })
    ElMessage.success("保存成功")
  } else {
    await requestCreateMroInventoryCheck(payload)
    ElMessage.success("创建成功")
  }
  emits("success")
  emits("close")
}
</script>

<style scoped lang="scss">
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.top-back {
  margin: 12px 20px;
}
.top-content {
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}
.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  overflow: hidden;
  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
