<template>
  <CustomDialog class="dialog" v-model="visible" :title="dialogTitle">
    <CustomForm ref="customFormRef" class="form" v-model="formData" :configs="formConfigs">
      <template #inspection-content>
        <div class="block-title">检验内容</div>
      </template>

      <template #numberUpperLimit-default>
        <div class="flex w-[100%]">
          <el-select class="mr-[4px]" v-model="formData.standardMaxInclusive" style="width: 100px">
            <el-option label="<" :value="0" />
            <el-option label="≤" :value="1" />
          </el-select>
          <el-input
            v-model="formData.standardMax"
            type="number"
            placeholder="请输入"
            @mousewheel.prevent
            clearable
          />
        </div>
      </template>

      <template #numberLowerLimit-default>
        <div class="flex w-[100%]">
          <el-select class="mr-[4px]" v-model="formData.standardMinInclusive" style="width: 100px">
            <el-option label=">" :value="0" />
            <el-option label="≥" :value="1" />
          </el-select>
          <el-input
            v-model="formData.standardMin"
            placeholder="请输入"
            type="number"
            @mousewheel.prevent
            clearable
          />
        </div>
      </template>

      <template #inspection-condition>
        <div class="block-title">检验条件</div>
      </template>
    </CustomForm>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit()">保存</el-button>
      </span>
    </template>
  </CustomDialog>

  <!-- 选择部门组件 -->
  <SelectPersonDialog
    v-model="selectDepartmentVisible"
    :type="EnumSelectUser.Department"
    :selected-ids="selectedDepartmentIds"
    :multiple="departmentType === 2"
    @success="onSelectDepartmentSuccess($event)"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryInspectOptionTemplateDetail,
  queryInspectOptionTemplateList
} from "@/api/baseInfo/inspectOptionTemplate"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import PositiveIntInput from "@/components/PositiveIntInput/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import type { IOption, IPhoto } from "@/types/common"
import type { IMroModelConfigTableRow } from "@/types/maintain/mro-manage/mro-model"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"

enum EnumConfigType {
  Check = 1, //校验
  Maintenance = 2 //保养
}

enum EnumStandardType {
  Number = 1, //数值
  Text = 2 //文本
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    type: number // 1:检验  2：保养
    data?: IMroModelConfigTableRow
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IMroModelConfigTableRow): void
}>()

const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([]) //检验项模板下拉options
const unitOptions = ref<{ label: string; value: string }[]>([])
const departmentType = ref(1) // 当前查看的部门类型  1：执行部门 2：NG处理部门
const selectDepartmentVisible = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed(() => [
  {
    componentType: "div",
    special: true,
    slots: {
      default: "inspection-content"
    }
  },
  {
    componentType: "el-select",
    field: "configItemId",
    label: props.type === EnumConfigType.Check ? "检验项名称" : "保养项名称",
    props: {
      placeholder: "请输入",
      clearable: true,
      filterable: true,
      allowCreate: true,
      defaultFirstOption: true,
      customChildren: inspectTemplateOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.itemName,
          value: item.id
        }
      }))
    },
    events: {
      change: ($event: string) => onInspectNameChange($event)
    },
    rules: [
      {
        required: true,
        message: "不能为空",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-input",
    field: "configItemNo",
    label: props.type === EnumConfigType.Check ? "校验项编号" : "保养项编号",
    props: {
      placeholder: "不填则自动生成",
      disabled: !!props.data
    }
  },
  {
    componentType: "el-input",
    field: "methodRequire",
    label: "方法要求",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-select",
    field: "standardType",
    label: "检验标准类型",
    props: {
      placeholder: "请选择",
      customChildren: [
        {
          componentType: "el-option",
          props: {
            label: "数值",
            value: EnumStandardType.Number
          }
        },
        {
          componentType: "el-option",
          props: {
            label: "文本",
            value: EnumStandardType.Text
          }
        }
      ]
    }
  },
  {
    componentType: "div",
    field: "numberUpperLimit",
    label: "数值上限",
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "numberUpperLimit-default"
    },
    hidden: formData.value.standardType !== EnumStandardType.Number
  },
  {
    componentType: "div",
    field: "numberLowerLimit",
    label: "数值下限",
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "numberLowerLimit-default"
    },
    hidden: formData.value.standardType !== EnumStandardType.Number
  },
  {
    componentType: "el-select",
    field: "unitId",
    label: "单位",
    props: {
      placeholder: "请选择",
      clearable: true,
      filterable: true,
      customChildren: unitOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    hidden: formData.value.standardType !== EnumStandardType.Number
  },
  {
    componentType: "el-input",
    field: "standardDesc",
    label: "检验标准",
    props: {
      placeholder: "请输入",
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    hidden: formData.value.standardType !== EnumStandardType.Text
  },
  {
    componentType: markRaw(UploadImage),
    field: "imageList",
    label: "图片说明",
    props: {
      limit: 5,
      multiple: true
    }
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "inspection-condition"
    }
  },
  {
    componentType: markRaw(PositiveIntInput),
    field: "configFrequency",
    label: props.type === EnumConfigType.Check ? "校验频率(天)" : "保养频率(天)",
    props: {
      placeholder: "请输入整数1~365"
    },
    rules: [
      {
        required: true,
        message: "不能为空",
        trigger: "change"
      },
      {
        message: "请输入1~365的整数",
        trigger: "blur",
        validator: (_: any, value: string) => {
          return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 365
        }
      }
    ]
  },
  {
    componentType: "el-select",
    field: "configDepartmentIds",
    label: props.type === EnumConfigType.Check ? "校验执行部门" : "保养执行部门",
    props: {
      placeholder: "请选择",
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: formData.value.configDepartments.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: ($event: boolean) => onSelectDepartmentVisibleChange($event, 1),
      change: ($event: string[]) => onSelectDepartmentChange($event, 1)
    },
    rules: [
      {
        required: true,
        message: "不能为空",
        trigger: "change"
      }
    ]
  },
  {
    componentType: "el-select",
    field: "ngDepartmentIds",
    label: "NG处理部门",
    props: {
      placeholder: "请选择",
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: formData.value.ngDepartments.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: ($event: boolean) => onSelectDepartmentVisibleChange($event, 2),
      change: ($event: string[]) => onSelectDepartmentChange($event, 2)
    },
    rules: [
      {
        required: true,
        message: "不能为空",
        trigger: "change"
      }
    ]
  }
])

const selectedDepartmentIds = computed(() =>
  departmentType.value === 1 ? formData.value.configDepartmentIds : formData.value.ngDepartmentIds
)
const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})
const dialogTitle = computed(() => {
  if (props.type === EnumConfigType.Check) {
    return !props.data ? "新增校验项" : "编辑校验项"
  } else {
    return !props.data ? "新增保养项" : "编辑保养项"
  }
})

const [formData, resetFormContent] = useResetRef<{
  configItemId: string
  configItemName: string
  configItemNo: string
  methodRequire: string
  configFrequency: string
  configDepartments: IOption[]
  configDepartmentIds: string[]
  ngDepartments: IOption[]
  ngDepartmentIds: string[]
  imageList: IPhoto[]
  standardType: EnumStandardType
  standardMax: number
  standardMin: number
  standardMinInclusive: number
  standardMaxInclusive: number
  standardDesc: string
  unitId: string
}>({
  configItemId: "",
  configItemName: "",
  configItemNo: "",
  methodRequire: "",
  configFrequency: "",
  configDepartments: [],
  configDepartmentIds: [],
  ngDepartments: [],
  ngDepartmentIds: [],
  imageList: [],
  standardType: EnumStandardType.Text,
  standardMax: 0,
  standardMin: 0,
  standardMinInclusive: 1,
  standardMaxInclusive: 0,
  standardDesc: "",
  unitId: ""
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      // 先拉取下拉 options，保证回显时能根据检验项编号/名称匹配到模板 id
      await Promise.all([getInspectOptionTemplate(), getUnitOptions()])
      props.data && initFormData(props.data)
    } else {
      resetFormContent()
      customFormRef.value?.resetForm()
    }
  }
)

/** 回显formData数据 */
const initFormData = (data: IMroModelConfigTableRow) => {
  const rowData: IMroModelConfigTableRow = cloneDeep(data)
  const {
    checkStandardValue: {
      standardType,
      standardDesc,
      standardMax,
      standardMin,
      standardMinInclusive,
      standardMaxInclusive,
      unitId
    }
  } = rowData

  formData.value.configItemName = rowData.configItemName
  // configItemId 用于回显下拉；优先使用后端/列表回传的 id，其次用编号/名称在模板列表里匹配
  formData.value.configItemId =
    rowData.configItemId ||
    inspectTemplateOptions.value.find((t) => t.itemCode === rowData.configItemNo)?.id ||
    inspectTemplateOptions.value.find((t) => t.itemName === rowData.configItemName)?.id ||
    rowData.configItemName ||
    ""

  formData.value.configItemNo = rowData.configItemNo
  formData.value.methodRequire = rowData.methodRequire || ""

  formData.value.standardType = standardType
  formData.value.standardDesc = standardDesc
  formData.value.standardMax =
    standardMax !== null && standardMax !== undefined && standardMax !== ""
      ? Number(standardMax)
      : 0
  formData.value.standardMin =
    standardMin !== null && standardMin !== undefined && standardMin !== ""
      ? Number(standardMin)
      : 0
  formData.value.standardMinInclusive = standardMinInclusive || 0
  formData.value.standardMaxInclusive = standardMaxInclusive || 0
  formData.value.unitId = unitId

  formData.value.configFrequency = String(rowData.configFrequency)
  formData.value.configDepartments = rowData.configDepartments || []
  formData.value.configDepartmentIds =
    rowData.configDepartments?.map((i) => i.value as string) || []
  formData.value.ngDepartments = rowData.ngDepartments || []
  formData.value.ngDepartmentIds =
    rowData.ngDepartments?.map((i: IOption) => i.value as string) || []
  formData.value.imageList = rowData.files || []
}

/** 部门选择visibleChange事件 */
const onSelectDepartmentVisibleChange = (val: boolean, type: number) => {
  if (val) {
    departmentType.value = type
    selectDepartmentVisible.value = val
  }
}

/** 部门选择change事件 */
const onSelectDepartmentChange = (val: string[], type: number) => {
  // 使用nextTick更新options，避免option更新时导致表单校验失败
  nextTick(() => {
    if (type === 1) {
      formData.value.configDepartments = formData.value.configDepartments.filter((item) =>
        val.includes(item.value as string)
      )
    } else if (type === 2) {
      formData.value.ngDepartments = formData.value.ngDepartments.filter((item) =>
        val.includes(item.value as string)
      )
    }
  })
}

/** 选择部门弹窗回调成功 */
const onSelectDepartmentSuccess = (data: ITree[]) => {
  if (departmentType.value === 1) {
    // 设置执行部门
    formData.value.configDepartments = data.map((item) => ({
      label: item.label,
      value: item.id
    }))

    // 使用nextTick延迟修改select选中值，避免与option同时更新时导致表单校验失败
    nextTick(() => {
      formData.value.configDepartmentIds = data.map((item) => item.id)
    })
  } else if (departmentType.value === 2) {
    // 设置NG处理部门
    formData.value.ngDepartments = data.map((item) => ({
      label: item.label,
      value: item.id
    }))
    // 使用nextTick延迟修改select选中值，避免与option同时更新时导致表单校验失败
    nextTick(() => {
      formData.value.ngDepartmentIds = data.map((item) => item.id)
    })
  }
}

/** 获取检验项模板列表 */
const getInspectOptionTemplate = async () => {
  const res = await queryInspectOptionTemplateList({})
  inspectTemplateOptions.value = res || []
}

/** 获取单位下拉列表 */
const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => {
    return {
      label: item.unitName,
      value: String(item.id)
    }
  })
}

/** 切换检验项名称 */
const onInspectNameChange = async (val: string) => {
  if (!val) {
    return
  }

  // 判断是否是通过选择检验项模板来切换的，如果是，则需要根据模板id查询检验项详情，
  // 并将检验项详情赋值到表单中，如果不是，则清空检验性id
  const isSelect = inspectTemplateOptions.value.some((item) => item.id === val)
  if (isSelect) {
    const detailInfo = await queryInspectOptionTemplateDetail(val)
    if (detailInfo) {
      formData.value.configItemName = detailInfo.inspectItemName
      formData.value.configItemNo = detailInfo.inspectItemCode
      formData.value.methodRequire = detailInfo.methodDesc

      formData.value.standardType = detailInfo.standardType as unknown as EnumStandardType
      formData.value.standardDesc = detailInfo.standardDesc
      formData.value.standardMax = detailInfo.standardMax
      formData.value.standardMaxInclusive = detailInfo.standardMaxInclusive ?? 0
      formData.value.standardMin = detailInfo.standardMin
      formData.value.standardMinInclusive = detailInfo.standardMinInclusive ?? 1
      formData.value.unitId = detailInfo.unitId

      formData.value.imageList =
        detailInfo.images?.map((item) => ({
          fileName: item.fileName,
          fileUrl: formatImgUrlPreview(item.path),
          fileId: item.id
        })) || []
    }
  } else {
    formData.value.configItemId = val
    formData.value.configItemName = val
  }
}

/** 提交操作 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  if (formData.value.standardType === EnumStandardType.Number) {
    if (!formData.value.standardMax && !formData.value.standardMin) {
      ElMessage({
        type: "warning",
        message: "请填写数值上限或数值下限"
      })
      return
    }
    if (
      !isNumberStandardValid(
        formData.value.standardMax,
        formData.value.standardMin,
        !!Number(formData.value.standardMaxInclusive),
        !!Number(formData.value.standardMinInclusive)
      )
    ) {
      return
    }
  }

  const result: IMroModelConfigTableRow = {
    configFrequency: +formData.value.configFrequency,
    configItemName: formData.value.configItemName,
    configItemNo: formData.value.configItemNo,
    methodRequire: formData.value.methodRequire,
    checkStandardValue: {
      standardType: formData.value.standardType,
      standardDesc: formData.value.standardDesc,
      standardMax: formData.value.standardMax,
      standardMin: formData.value.standardMin,
      standardMinInclusive: formData.value.standardMinInclusive,
      standardMaxInclusive: formData.value.standardMaxInclusive,
      unitId: formData.value.unitId,
      unitName: ""
    },
    configDepartments: formData.value.configDepartments,
    ngDepartments: formData.value.ngDepartments,
    files: formData.value.imageList
  }

  emit("success", result)
  visible.value = false
}
</script>

<style scoped lang="scss">
.block-title {
  font-size: 16px;
  color: #303133;
  margin: 16px 0 12px;
}

.form {
  &:deep(.el-form-item) {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  }
}

.dialog {
  &:deep(.custom-dialog-content) {
    max-height: 650px;
    overflow: auto;
  }
}
</style>
