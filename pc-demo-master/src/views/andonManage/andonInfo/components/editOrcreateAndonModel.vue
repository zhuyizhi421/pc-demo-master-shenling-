<template>
  <CustomDialog
    v-model="visible"
    :title="isEdit ? '编辑Andon' : '新建Andon'"
    size="large"
    @close="onCloseDialog"
  >
    <CustomForm ref="ruleFormRef" :configs="formConfig" v-model="andonCateForm" :label-width="120">
      <template #tag-default>
        {{ andonCateForm.isEnabled ? "启用" : "停用" }}
      </template>
      <template #needFeedback-default>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="Andon确认解决后，要求处理人在PC端填写维修反馈"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          <el-checkbox class="ml-2" label="" v-model="andonCateForm.needFeedback" size="large" />
        </div>
      </template>
      <template #isAutoConfirm-default>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="处理对象关闭Andon后，系统自动确认问题已解决"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          <el-checkbox class="ml-2" label="" v-model="andonCateForm.isAutoConfirm" size="large" />
        </div>
      </template>
      <template #needAlarmModel-default>
        <div class="flex items-center h-[32px]">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="员工触发Andon后，若处理对象未及时到场处理，则会触发告警通知"
            placement="top-start"
          >
            <el-button :icon="QuestionFilled" size="small" circle class="text-[16px]" />
          </el-tooltip>
          <el-checkbox class="ml-2" label="" v-model="andonCateForm.needAlarmModel" size="large" />
        </div>
      </template>
      <template #handlerIds-default>
        <div class="handler-select">
          <el-select
            class="type-select"
            v-model="andonCateForm.handlerType"
            placeholder="请选择"
            @change="andonCateForm.handlerIds = []"
          >
            <el-option
              v-for="item in EnumSelectUserTypes"
              :key="item.type"
              :label="item.value"
              :value="item.value"
            />
          </el-select>
          <el-select
            style="width: 188px"
            v-model="andonCateForm.handlerIds"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            @visible-change="onSelectPersonVisibleChange"
          >
            <el-option
              v-for="item in selectedHandlerList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </template>
    </CustomForm>

    <CustomTitle title="关联故障" class="!mt-0" />
    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="scope">
        <el-button link type="danger" size="small" @click="tableData.splice(scope.$index, 1)"
          >删除本行</el-button
        >
      </template>
    </CustomTable>
    <div class="flex mb-[16px]" v-if="isAuth">
      <el-button
        class="mt-4 border-dashed"
        style="width: 50%"
        @click="SelectAndonFaultTypeShow = true"
        icon="Plus"
      >
        新增Andon故障类型</el-button
      >
      <el-button
        class="mt-4 border-dashed"
        style="width: 50%"
        @click="andonFaultShow = true"
        icon="Plus"
      >
        新增Andon故障</el-button
      >
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(ruleFormRef)">取消</el-button>
        <el-button v-if="isAuth" type="primary" @click="onSubmitSave(ruleFormRef)">
          {{ isEdit ? "保存" : "创建" }}
        </el-button>
      </span>
    </template>

    <!-- 选择Andon故障弹窗 -->
    <SelectAndonFaultDialog
      v-model="andonFaultShow"
      :selected-row-keys="selectedAndonFaultKeys"
      multiple
      @success="onSelectAndonFaultSuccess"
    />

    <!-- 选择Andon故障类型弹窗 -->
    <SelectAndonFaultTypeDialog
      v-model="SelectAndonFaultTypeShow"
      :selected-row-keys="selectedAndonFaultTypeKeys"
      multiple
      @success="onSelectAndonFaultTypeSuccess"
    />

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="andonCateForm.handlerType"
      :selected-ids="andonCateForm.handlerIds"
      multiple
      @success="onSelectPersonSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

import { getAlarmModelList } from "@/api/alarm"
import { getAndonCategoryAll } from "@/api/operation/andon/andonCategory"
import {
  BindType,
  createAndonModel,
  queryAndonModelDetail,
  updateAndonModel
} from "@/api/operation/andon/andonModel"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectAndonFaultDialog from "@/components/SelectAndonFaultDialog/index.vue"
import SelectAndonFaultTypeDialog from "@/components/SelectAndonFaultTypeDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser, EnumSelectUserTypes } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { ISystemFaultInfo } from "@/types/base-info/system-fault"
import type { ISystemFaultCategoryInfo } from "@/types/base-info/system-fault-category"
import type { IOption } from "@/types/common"

const props = defineProps<{
  categoryId?: string
}>()

const isAuth = useButtonAuth("AndonInfo_update", "AndonInfo_query")
const [andonCateForm, resetAndonCateForm] = useResetRef<any>({
  andonName: "",
  categoryId: "",
  needFeedback: "", //是否需要维修反馈(1-需要 0-不需要)
  handlerIds: [],
  needAlarmModel: "", // 是否需要超时未处理告警(1-需要 0-不需要)
  alarmModelId: "", // 告警模型ID(仅当needAlarmModel为1时必填)
  isAutoConfirm: "", // 是否超时自动确认(1-是 0-否)
  remarks: "",
  handlerType: EnumSelectUser.Staff,
  selectType: "",
  andonNo: "",
  isEnabled: "",
  createTime: "",
  id: ""
})

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const SelectTypeEnum: Record<string, string> = {
  1: "按故障类型",
  2: "按故障"
}

const ruleFormRef = ref<InstanceType<typeof CustomForm>>()
const visible = ref(false)
const andonFaultShow = ref(false)
const SelectAndonFaultTypeShow = ref(false)
const isAvaviblePost = ref(false)
const isEdit = ref(false)
const tableData = ref<any[]>([])
const warehouseType = ref<any[]>([]),
  alarmModelType = ref<any[]>([])

const selectPersonVisible = ref(false)
const selectedHandlerList = ref<IOption[]>([])

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    field: "andonName",
    label: "Andon名称",
    rules: [{ required: true, message: "请输入Andon名称", trigger: "blur" }],
    props: {
      placeholder: "请输入Andon名称"
    }
  },
  {
    componentType: "el-input",
    field: "andonNo",
    label: "Andon编号",
    props: {
      placeholder: "不填则自动生成",
      disabled: isEdit.value
    }
  },
  {
    componentType: "el-select",
    field: "categoryId",
    label: "Andon类型",
    rules: [{ required: true, message: "请选择Andon类型", trigger: "change" }],
    props: {
      placeholder: "请选择Andon类型",
      valueKey: "id",
      customChildren: warehouseType.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.categoryName,
          value: item.id
        }
      }))
    }
  },
  {
    componentType: "el-tag",
    field: "isEnabled",
    hidden: !isEdit.value,
    label: "状态",
    slots: {
      default: "tag-default"
    },
    props: {
      type: andonCateForm.value.isEnabled ? "success" : "danger"
    }
  },
  {
    componentType: "div",
    field: "needFeedback",
    label: "维修反馈",
    slots: {
      default: "needFeedback-default"
    }
  },
  {
    componentType: "div",
    field: "isAutoConfirm",
    label: "自动确认",
    slots: {
      default: "isAutoConfirm-default"
    }
  },
  {
    componentType: "el-input",
    field: "createTime",
    label: "创建时间",
    hidden: !isEdit.value,
    props: {
      disabled: true,
      placeholder: "请输入"
    }
  },
  {
    componentType: "div",
    field: "needAlarmModel",

    label: "超时未处理告警",
    slots: {
      default: "needAlarmModel-default"
    }
  },
  {
    componentType: "el-select",
    field: "alarmModelId",
    label: "告警模型",
    rules: [
      {
        required: andonCateForm.value.needAlarmModel ? true : false,
        message: "请选择告警模型",
        trigger: "change"
      }
    ],
    hidden: !andonCateForm.value.needAlarmModel,
    props: {
      valueKey: "id",
      placeholder: "请选择",
      customChildren: alarmModelType.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.modelName,
          value: item.id
        }
      }))
    }
  },
  {
    label: "处理对象",
    field: "handlerIds",
    rules: [{ required: true, message: "请选择处理对象", trigger: "change" }],
    componentType: "div",
    slots: {
      default: "handlerIds-default"
    }
  },
  {
    componentType: "el-input",
    field: "remarks",
    label: "备注",
    props: {
      placeholder: "请输入"
    }
  }
])

const tableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 300,
  columns: [
    {
      prop: "selectType",
      label: "选择方式",
      minWidth: 120
    },
    {
      prop: "faultCategoryName",
      label: "Andon故障类型",
      minWidth: 140,
      showOverflowTooltip: true
    },
    {
      prop: "faultName",
      label: "Andon故障名称",
      minWidth: 120
    },
    {
      prop: "faultNo",
      label: "Andon故障编号",
      minWidth: 120
    },
    {
      prop: "operation",
      label: "操作",
      hidden: !isAuth.value,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
}))

// 已选中Andon故障
const selectedAndonFaultKeys = computed(() => {
  return tableData.value
    .filter((item) => item.bindType === BindType.Fault)
    .map((item) => item.faultId)
})

// 已选中Andon故障类型
const selectedAndonFaultTypeKeys = computed(() => {
  return tableData.value
    .filter((item) => item.bindType === BindType.FaultType)
    .map((item) => item.faultCategoryId)
})

/** 设置弹窗状态 */
const setVisible = async (value: boolean, data?: any) => {
  isAvaviblePost.value = false
  visible.value = value
  if (visible.value) {
    const categoryData: any = await getAndonCategoryAll()
    warehouseType.value = categoryData
    const modelData: any = await getAlarmModelList({})
    alarmModelType.value = modelData.filter((i: any) => i.isEnabled == true)
  }
  if (data) {
    isEdit.value = true
    const res: any = await queryAndonModelDetail(data.id)
    andonCateForm.value = cloneDeep(res)
    andonCateForm.value.needFeedback = !!andonCateForm.value.needFeedback
    andonCateForm.value.isAutoConfirm = !!andonCateForm.value.isAutoConfirm
    andonCateForm.value.needAlarmModel = !!andonCateForm.value.needAlarmModel
    andonCateForm.value.handlerType = EnumSelectUserTypes.find(
      (i) => i.type === andonCateForm.value.handlerType
    )?.value
    andonCateForm.value.selectType = andonCateForm.value.handlerType
    selectedHandlerList.value =
      res.handlerList?.map((item: any) => ({
        label: item.name,
        value: item.id
      })) || []
    tableData.value =
      res?.bindFaultList?.map((item: any) => ({
        ...item,
        selectType: SelectTypeEnum[item.bindType]
      })) ?? []
  } else {
    ruleFormRef.value?.resetForm()
    if (props.categoryId) {
      andonCateForm.value.categoryId = props.categoryId
    }
  }
}

/** 选择处理对象下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedHandlerList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  andonCateForm.value.handlerIds = data.map((item) => item.id)
}

/** andon新增、编辑提交 */
const onSubmitSave = async (formEl: InstanceType<typeof CustomForm> | undefined) => {
  if (!formEl) return
  const valid = await formEl.validateForm()
  if (!valid) {
    return
  }

  let temptable = tableData.value.map((item: any) => ({
    bindType: item.bindType || undefined,
    faultCategoryId: item.faultCategoryId || undefined,
    faultCategoryName: item.faultCategoryName || undefined,
    faultId: item.faultId || undefined,
    faultName: item.faultName || undefined,
    faultNo: item.faultNo || undefined
  }))

  let fn = isEdit.value ? updateAndonModel : createAndonModel
  let params = {
    bindFaultVOList: temptable,
    andonName: andonCateForm.value.andonName,
    alarmModelId: andonCateForm.value.alarmModelId || undefined,
    categoryId: andonCateForm.value.categoryId,
    handlerType: EnumSelectUserTypes.find((i) => i.value === andonCateForm.value.handlerType)!.type,
    isAutoConfirm: andonCateForm.value.isAutoConfirm || false,
    needAlarmModel: andonCateForm.value.needAlarmModel || false,
    needFeedback: andonCateForm.value.needFeedback || false,
    remarks: andonCateForm.value.remarks,
    handlerIds: andonCateForm.value.handlerIds,
    id: isEdit.value ? andonCateForm.value.id : undefined,
    andonNo: andonCateForm.value.andonNo
  }
  await fn(params)
  ElMessage.success(isEdit.value ? "编辑成功" : "新建成功")
  visible.value = false
  emits("onOk")
  isAvaviblePost.value = true
}

const resetForm = (formEl: InstanceType<typeof CustomForm> | undefined) => {
  if (!formEl) return
  formEl.resetForm()
  resetAndonCateForm()
  tableData.value.length = 0
  visible.value = false
  isEdit.value = false
}

/** andon故障弹窗回调 */
const onSelectAndonFaultSuccess = (data: ISystemFaultInfo[]) => {
  data.forEach((item) => {
    if (!selectedAndonFaultKeys.value.includes(item.id)) {
      tableData.value.push({
        ...item,
        bindType: BindType.Fault, // 绑定类型(1-按故障类型 2-按故障)
        selectType: "按故障",
        faultId: item.id
      })
    }
  })
}

/** andon故障类型弹窗回调 */
const onSelectAndonFaultTypeSuccess = (data: ISystemFaultCategoryInfo[]) => {
  data.forEach((item) => {
    if (!selectedAndonFaultTypeKeys.value.includes(item.id)) {
      tableData.value.push({
        ...item,
        bindType: BindType.FaultType, // 绑定类型(1-按故障类型 2-按故障)
        selectType: "按故障类型",
        faultCategoryId: item.id,
        faultCategoryName: item.categoryName
      })
    }
  })
}

const onCloseDialog = () => {
  resetAndonCateForm()
  tableData.value.length = 0
  isEdit.value = false
}

defineExpose({
  setVisible,
  isAvaviblePost
})
</script>

<style scoped lang="scss">
.handler-select {
  display: flex;
  align-items: center;
  width: 100%;

  .type-select {
    width: 75px;
    flex: none;
    margin-right: 8px;
  }
}
</style>
