<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="custom-table-container">
        <CustomTitle title="编码模型列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onUpdateEncodeModelClick('create')">
              新建编码模型
            </el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="onUpdateEncodeModelClick('edit', row)"
              >编辑查看</el-button
            >
            <el-button link type="danger" size="small" @click="onDeleteEncodeModelClick(row.id)"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>
    </div>

    <!-- 编码模型弹窗 -->
    <CustomDialog
      v-model="modalStatus.show"
      :title="`${modalStatus.status === 'edit' ? '编辑' : '新建'}编码模型`"
      size="medium"
      @close="resetCodeModalData()"
    >
      <div class="flex items-center justify-between mb-[20px]">
        <CustomForm
          style=""
          ref="codeModalFormRef"
          v-model="codeModalData"
          :configs="codeModalDataConfigs"
        ></CustomForm>
        <el-button style="margin-bottom: 12px" type="primary" @click="addCodeItemModal = true"
          >新增编码项</el-button
        >
      </div>

      <CustomTable v-model:table-data="codeModalData.codeItemList" :config="codeTableConfig">
        <template #operation-default="scope">
          <el-button
            @click="onSortClick('up', scope.$index)"
            link
            :disabled="scope.$index === 0"
            :type="scope.$index === 0 ? 'info' : 'primary'"
          >
            <el-icon>
              <SortUp />
            </el-icon>
          </el-button>
          <el-button
            @click="onSortClick('down', scope.$index)"
            :disabled="scope.$index === codeModalData.codeItemList.length - 1"
            link
            :type="scope.$index === codeModalData.codeItemList.length - 1 ? 'info' : 'primary'"
          >
            <el-icon>
              <SortDown />
            </el-icon>
          </el-button>
          <el-button link type="danger" @click="onDeleteCodeItemClick(scope.$index)"
            >删除</el-button
          >
        </template>
      </CustomTable>

      <template #footer>
        <div class="flex justify-end">
          <el-button @click="modalStatus.show = false">取消</el-button>
          <el-button @click="onSubmitEncodeModelClick()" type="primary">确定</el-button>
        </div>
      </template>
    </CustomDialog>

    <!-- 新增编码项弹窗 -->
    <CustomDialog
      v-model="addCodeItemModal"
      title="新增编码项"
      size="mini"
      @close="resetUpdateForm()"
    >
      <CustomForm
        ref="addCodeItemRef"
        v-model="addCodeItemModalForm"
        :configs="addCodeformConfigs"
      ></CustomForm>
      <template #footer>
        <el-button @click="addCodeItemModal = false">取消</el-button>
        <el-button @click="onSubmitCodeItemClick" type="primary">确定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  CodeType,
  CodeTypeToNameMap,
  createCodeModel,
  deleteCodeModel,
  getAll,
  getAllCodeItem,
  getCodeItemInfo,
  type ICodeModelItem,
  type ICodeModelItemValue,
  updateCodeModel
} from "@/api/code"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { ICodeItem as ITableRow } from "@/types/base-info/code"

import {
  codeTypeOptions,
  hourMinuteSecondOptions,
  randomCodeOptions,
  resetTypeOptions,
  separatorTypeOptions,
  yearMonthDayWeekOptions
} from "./const"

defineOptions({
  name: "SystemConfigEncodeModel"
})

type Status = "edit" | "create"
const isAuth = useButtonAuth("SystemConfigEncodeModel_update", "SystemConfigEncodeModel_query")
const [codeModalData, resetCodeModalData] = useResetRef<ICodeModelItemValue>({
  id: "",
  modelName: "",
  modelCode: "",
  codeItemList: []
})
const [addCodeItemModalForm, resetUpdateForm] = useResetRef<any>({
  codeItemType: CodeType.Fixed,
  codeLength: "",
  otherRule: "",
  value: ""
})

const codeModalFormRef = ref<InstanceType<typeof CustomForm>>()
const addCodeItemRef = ref<InstanceType<typeof CustomForm>>()

const modalStatus = reactive<{
  show: boolean
  status: Status
}>({
  show: false,
  status: "edit"
})
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "modelName",
      label: "编码模型名称",
      width: 160
    },
    {
      prop: "modelCode",
      label: "编码模型编号",
      width: 160
    },
    {
      prop: "modelContent",
      label: "编码组成",
      minWidth: 200
    },
    {
      prop: "length",
      label: "长度",
      width: 120,
      align: "center"
    },

    {
      prop: "operation",
      label: "操作",
      width: 130,
      fixed: "right",
      hidden: !isAuth.value,
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const codeTableConfig = ref<ITableConfig>({
  height: "400",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
      formatter: (row, column, cellValue, index) => `${index + 1}`
    },
    {
      prop: "name",
      label: "编码类型",
      width: 160,
      formatter: (row) => CodeTypeToNameMap[row.codeItemType] ?? "-"
    },
    {
      prop: "length",
      label: "长度",
      minWidth: 90,
      align: "right"
    },
    {
      prop: "value",
      label: "值",
      minWidth: 120
    },

    {
      prop: "operation",
      label: "操作",
      width: 150,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const codeItems = ref<ICodeModelItem[]>([])
const addCodeItemModal = ref(false)

const isSerialNumber = computed(
  () => addCodeItemModalForm.value.codeItemType === CodeType.SerialNumber
)
const isFixed = computed(() => addCodeItemModalForm.value.codeItemType === CodeType.Fixed)
const isRandom = computed(() => addCodeItemModalForm.value.codeItemType === CodeType.Random)
const isYearMonthDayWeek = computed(
  () => addCodeItemModalForm.value.codeItemType === CodeType.YearMonthDayWeek
)
const isValueInput = computed(() =>
  [CodeType.Fixed, CodeType.SerialNumber, CodeType.Random].includes(
    addCodeItemModalForm.value.codeItemType
  )
)
const valueOptions = computed(() => {
  switch (addCodeItemModalForm.value.codeItemType) {
    case CodeType.Separator:
      return separatorTypeOptions
    case CodeType.YearMonthDayWeek:
      return yearMonthDayWeekOptions
    case CodeType.HourMinuteSecond:
      return hourMinuteSecondOptions
    default:
      return []
  }
})

watch(
  () => addCodeItemModalForm.value.codeItemType,
  (val) => {
    if (addCodeItemModal.value) {
      switch (val) {
        case CodeType.Fixed:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.Fixed,
            codeLength: "",
            otherRule: "",
            value: ""
          }
          break
        case CodeType.Separator:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.Separator,
            codeLength: "1",
            otherRule: "",
            value: "-"
          }
          break
        case CodeType.YearMonthDayWeek:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.YearMonthDayWeek,
            codeLength: "4",
            otherRule: "",
            value: "yyyy"
          }
          break
        case CodeType.HourMinuteSecond:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.HourMinuteSecond,
            codeLength: "2",
            otherRule: "",
            value: "HH"
          }
          break
        case CodeType.SerialNumber:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.SerialNumber,
            codeLength: "1",
            otherRule: "1",
            value: "X"
          }
          break
        case CodeType.Random:
          addCodeItemModalForm.value = {
            codeItemType: CodeType.Random,
            codeLength: "1",
            otherRule: [1, 2, 3],
            value: "X"
          }
          break
        default:
          break
      }
    }
  }
)

watch(
  () => addCodeItemModalForm.value.codeLength,
  (length) => {
    if (addCodeItemModal.value && (isRandom.value || isSerialNumber.value)) {
      if (!isNaN(Number(length))) {
        addCodeItemModalForm.value.value = "X".repeat(Number(length))
      }
    }
  }
)

watch(
  () => addCodeItemModalForm.value.value,
  (value) => {
    if (addCodeItemModal.value && (isFixed.value || isYearMonthDayWeek.value)) {
      addCodeItemModalForm.value["codeLength"] = String(value).length
    }
  }
)

const codeModalDataConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "编码模型名称",
    field: "modelName",
    get hidden() {
      return !isFixed.value
    },
    rules: [
      {
        required: true,
        message: "请输入编码模型名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入编码模型名称"
    }
  }
])

const addCodeformConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-select",
    label: "编码类型",
    field: "codeItemType",
    rules: [{ required: true }],
    props: {
      placeholder: "请选择",
      get customChildren() {
        return codeTypeOptions.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "值",
    field: "value",
    get hidden() {
      return !isFixed.value
    },
    rules: [
      {
        required: true,
        trigger: "blur",
        pattern: /^[A-Za-z]+$/,
        message: "请输入大小写字母组合"
      }
    ]
  },
  {
    componentType: "el-input",
    label: "值",
    field: "value",
    // hidden: !(isValueInput.value && !isFixed.value),
    get hidden() {
      return !(isValueInput.value && !isFixed.value)
    },
    props: {
      get disabled() {
        return !isFixed.value
      }
    }
  },

  {
    componentType: "el-select",
    label: "值",
    field: "value",
    // hidden: isValueInput.value,
    get hidden() {
      return isValueInput.value
    },
    props: {
      placeholder: "请选择",
      get multiple() {
        return isRandom.value
      },
      get customChildren() {
        return valueOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },

  {
    componentType: "el-select",
    label: "组成",
    field: "otherRule",
    get hidden() {
      return !isRandom.value
    },
    rules: [
      {
        required: true,
        message: "请选择组成",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择",
      multiple: true,
      "collapse-tags": true,
      get customChildren() {
        return randomCodeOptions.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },

  {
    componentType: "el-select",
    label: "复位机制",
    field: "otherRule",
    get hidden() {
      return !isSerialNumber.value
    },
    rules: [
      {
        required: true,
        message: "请选择复位机制",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择",
      get customChildren() {
        return resetTypeOptions.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.label, value: item.value }
          }
        })
      }
    }
  },
  {
    componentType: "el-input-number",
    label: "长度",
    field: "codeLength",
    rules: [
      {
        required: true,
        message: "请输入长度",
        trigger: "blur",
        validator: (rule: any, value: any, callback: any) => {
          if (isSerialNumber || isRandom) {
            if (Number(value) === 0) {
              callback("请输入长度,大于0")
            } else {
              callback()
            }
          } else {
            callback()
          }
        }
      }
    ],
    props: {
      min: 0,
      step: 1,
      "controls-position": "right",
      get disabled() {
        return !isRandom.value && !isSerialNumber.value
      }
    }
  }
])

onMounted(() => {
  customTableRef.value?.requestData()
  getCodeItemList()
})

const queryConfig: ITableRequestConfig<[], ITableRow, false> = {
  api: getAll
}

const getCodeItemList = async () => {
  const data = await getAllCodeItem()
  codeItems.value = data
}

/** 删除编码模型 */
const onDeleteEncodeModelClick = async (id: string) => {
  await ElMessageBox.confirm("确定删除该模型吗？", "提示", {
    type: "warning"
  })
  await deleteCodeModel(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

/** 编辑/新建编码模型 */
const onUpdateEncodeModelClick = async (type: Status, data?: ITableRow) => {
  if (data) {
    // 编辑查看
    const res = await getCodeItemInfo(data?.id ?? "")
    codeModalData.value = {
      id: res.id,
      modelName: res.modelName,
      modelCode: res.modelCode,
      codeItemList: res.items.map((item) => {
        return {
          codeItemType: String(item.codeItemType),
          length: String(item.length),
          value: item.value,
          otherRule: item.otherRule
        }
      }) as any
    }
  }
  modalStatus.show = true
  modalStatus.status = type
}

/** 提交编码模型 */
const onSubmitEncodeModelClick = async () => {
  const valid = await codeModalFormRef.value?.validateForm()
  if (!valid) return

  const fn = modalStatus.status === "edit" ? updateCodeModel : createCodeModel
  if (modalStatus.status === "create") {
    Reflect.deleteProperty(codeModalData.value, "id")
  }

  if (codeModalData.value) {
    await fn(codeModalData.value)
    ElMessage.success(modalStatus.status === "edit" ? "编辑成功" : "新建成功")
    await customTableRef.value?.requestData()
    modalStatus.show = false
  }
}

/** 编码项排序 */
const onSortClick = (type: "up" | "down", index: number) => {
  const data = codeModalData.value.codeItemList
  const i = type === "up" ? index - 1 : index + 1
  ;[data[index], data[i]] = [data[i], data[index]]
}

/** 删除编码项 */
const onDeleteCodeItemClick = (index: number) => {
  codeModalData.value.codeItemList.splice(index, 1)
}

/** 提交编码项 */
const onSubmitCodeItemClick = async () => {
  const valid = await addCodeItemRef.value?.validateForm()
  if (!valid) return
  codeModalData.value.codeItemList.push({
    ...addCodeItemModalForm.value,
    otherRule: isRandom.value
      ? addCodeItemModalForm.value.otherRule.join(",")
      : addCodeItemModalForm.value.otherRule,
    length: addCodeItemModalForm.value.codeLength
  })
  addCodeItemModal.value = false
}
</script>

<style scoped lang="scss">
.encodedModel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 24px;

  &:deep(.el-table) {
    flex: 1;
  }
}

.title {
  margin: 24px 0;
}
</style>
