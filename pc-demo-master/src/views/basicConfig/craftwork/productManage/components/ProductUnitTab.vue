<template>
  <CustomTitle title="" style="margin-top: 0">
    <div>
      <el-button type="primary" icon="Plus" @click="onAdd" v-if="!isReadonly">添加单位</el-button>
    </div>
  </CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #isDefaultUnit-default="{ row }">
      <el-tag link :type="getIsDefaultUnit(row) === 1 ? 'success' : 'danger'">{{
        getIsDefaultUnit(row) === 1 ? "是" : "否"
      }}</el-tag>
    </template>

    <template #operation-default="{ row }">
      <el-button
        type="danger"
        link
        size="small"
        @click="onDelete(row)"
        :disabled="!!isReadonly || getIsDefaultUnit(row) === 1"
      >
        删除本行
      </el-button>
    </template>
  </CustomTable>

  <!-- 新增单位配置弹窗 -->
  <CustomDialog title="添加单位" v-model="addUnitDialogVisible" size="mini">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :configs="formConfigs"
      :label-width="80"
    ></CustomForm>
    <template #footer>
      <el-button @click="addUnitDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="onAddSave">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createProductModelUnit,
  deleteProductModelUnit,
  getUnitList,
  type IUnitItem as ITableRow
} from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IOption } from "@/types/common"

const props = withDefaults(
  defineProps<{
    id: string
    isReadonly?: boolean
    unitList: (IOption & { unitCode: string })[]
    currentDefaultUnitId?: string
  }>(),
  {
    id: "",
    isReadonly: false,
    unitList: () => [],
    currentDefaultUnitId: ""
  }
)

const emits = defineEmits<{
  (e: "refreshDetailData"): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
      align: "center",
      type: "index"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "unitCode",
      label: "单位编号",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "isDefaultUnit",
      label: "默认单位",
      minWidth: 160,
      align: "center",
      slots: {
        default: "isDefaultUnit-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      get hidden() {
        return props.isReadonly
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const addUnitDialogVisible = ref(false)
const existingUnitIds = computed(() => new Set(tableData.value.map((item) => String(item.unitId))))
const selectableUnitList = computed(() =>
  props.unitList.filter((item) => !existingUnitIds.value.has(String(item.value)))
)

const formData = ref<{
  unitId: string
  unitCode: string
  isDefaultUnit: number
}>({
  unitId: "",
  unitCode: "",
  isDefaultUnit: 0
})
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "单位名称",
    field: "unitId",
    rules: [
      {
        required: true,
        message: "请选择单位名称",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择单位名称",
      filterable: true,
      get customChildren() {
        return selectableUnitList.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.label,
              value: item.value
            }
          }
        })
      }
    },
    events: {
      change: onUnitChange
    }
  },
  {
    componentType: "el-input",
    label: "单位编号",
    field: "unitCode",
    props: {
      type: "text",
      placeholder: "请选择单位名称",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "默认单位",
    field: "isDefaultUnit",
    props: {
      placeholder: "请选择默认单位",
      customChildren: [
        {
          componentType: "el-option",
          props: {
            label: "是",
            value: 1
          }
        },
        {
          componentType: "el-option",
          props: {
            label: "否",
            value: 0
          }
        }
      ]
    }
  }
])

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: getUnitList,
  getParams: () => {
    return [props.id]
  }
}

const getIsDefaultUnit = (row: Pick<ITableRow, "unitId" | "isDefaultUnit">) => {
  if (props.currentDefaultUnitId) {
    return String(row.unitId) === String(props.currentDefaultUnitId) ? 1 : 0
  }
  return row.isDefaultUnit === 1 ? 1 : 0
}

const onAdd = () => {
  customFormRef.value?.resetForm()
  formData.value.unitId = ""
  formData.value.unitCode = ""
  formData.value.isDefaultUnit = 0
  if (!selectableUnitList.value.length) {
    ElMessage.warning("可添加的单位已全部配置")
    return
  }
  addUnitDialogVisible.value = true
}

/** 删除本行 */
const onDelete = async (row: ITableRow) => {
  if (getIsDefaultUnit(row) === 1) {
    ElMessage.warning("默认单位不能删除")
    return
  }

  const confirm = await ElMessageBox.confirm("此操作将删除该数据，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  if (confirm === "confirm") {
    await deleteProductModelUnit(row.id)
    ElMessage.success("操作成功")
    emits("refreshDetailData")
    await tableRef.value?.requestData()
  }
}

/** 新增单位保存 */
const onAddSave = async () => {
  try {
    const valid = await customFormRef.value?.validateForm()
    if (!valid) return

    if (existingUnitIds.value.has(String(formData.value.unitId))) {
      ElMessage.warning("该单位已存在，不能重复添加")
      return
    }

    await createProductModelUnit({
      productModelId: props.id,
      unitId: formData.value.unitId,
      isDefaultUnit: formData.value.isDefaultUnit
    })
    ElMessage.success("操作成功")
    addUnitDialogVisible.value = false
    emits("refreshDetailData")
    await tableRef.value?.requestData()
  } catch (error) {
    console.error(error)
  }
}

/** 单位名称选择 */
const onUnitChange = (value: string) => {
  const unit = props.unitList.find((item) => item.value === value)
  formData.value.unitCode = unit?.unitCode || ""
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

defineOptions({
  name: "ProductUnitTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
