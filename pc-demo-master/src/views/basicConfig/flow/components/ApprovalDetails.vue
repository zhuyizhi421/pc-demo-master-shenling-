<template>
  <div class="flowDetail">
    <CustomDrawer v-model="visible" @close="resetFlowBasic()" :title="drawerTitle">
      <div class="examine-box">
        <CustomTitle title="流程基础" style="margin-top: 0"></CustomTitle>

        <CustomForm
          ref="customFormRef"
          v-model="flowBasic"
          :label-width="80"
          :configs="formConfigs"
        ></CustomForm>

        <CustomTitle title="层级审批">
          <el-button type="primary" icon="Plus" v-if="isAuth" @click="showExamDialog = true">
            添加层级审批
          </el-button>
        </CustomTitle>

        <!-- 层级审批列表 -->
        <Examine
          :data="flowExamList"
          @delete-row="onDeleteExamRow"
          @edit-row="onEditExamRow"
          :buttonAuthed="!!isAuth"
        />
      </div>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button
          v-if="isAuth"
          :disabled="flowExamList.length <= 0"
          type="primary"
          @click="onExamOrCreateHandle()"
          >{{ type !== FlowDetailType.EXAM ? "保存" : "审批操作" }}</el-button
        >
      </template>
    </CustomDrawer>

    <!-- 层级审批弹窗 -->
    <CustomDialog
      :title="`${editExamItemForm.editIndex > -1 ? '编辑' : '新增'}审批流程`"
      v-model="showExamDialog"
      size="mini"
      class="level-approval-dialog"
      @close="customEditFormRef?.resetForm()"
    >
      <CustomForm
        ref="customEditFormRef"
        v-model="editExamItemForm"
        :label-width="80"
        :configs="editFormConfigs"
      >
        <template #approver-default>
          <el-select
            v-model="editExamItemForm.approver"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            @visible-change="onSelectPersonVisibleChange"
          >
            <el-option
              v-for="item in selectedPersonList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="editExamItemForm.currentSelectedType"
            placeholder="请选择"
            style="width: 120px; margin-left: 12px; flex: none"
            @change="onExamTypeChange"
          >
            <el-option
              v-for="item in EnumSelectUserWithoutSectionTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </CustomForm>

      <template #footer>
        <el-button @click="showExamDialog = false">取 消</el-button>
        <el-button type="primary" @click="onAddExamItemClick()">确定</el-button>
      </template>
    </CustomDialog>

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="editExamItemForm.currentSelectedType"
      :selected-ids="editExamItemForm.approver"
      multiple
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"

import {
  createFlowableDefine,
  getFlowableDefineInfo,
  type ICreateFlowableDefineProcessNodes
} from "@/api/flowable"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser, EnumSelectUserWithoutSectionTypes } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import { UserTypeEnum } from "@/types/personal/flow"
import { randomId } from "@/utils"

import { CompletionConditionType, FlowDetailType, MultiInstanceEnum } from "../utils"
import Examine from "./Examine.vue"

defineOptions({
  name: "ApprovalDetails"
})

const isAuth = useButtonAuth("FlowConfig_update", "FlowConfig_query")

const [flowBasic, resetFlowBasic] = useResetRef({
  name: "",
  documentation: "",
  key: ""
})
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "流程名称",
    field: "name",
    rules: [
      {
        required: true,
        message: "请输入流程名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入流程名称"
    }
  },
  {
    componentType: "el-input",
    label: "流程说明",
    field: "documentation",
    props: {
      type: "text",
      placeholder: "请输入流程说明"
    }
  }
])

const [editExamItemForm, resetEditExamItemForm] = useResetRef<{
  userType: UserTypeEnum
  approver: string[]
  editIndex: number
  isMultiInstance: MultiInstanceEnum
  currentSelectedType: EnumSelectUser
  currentSelectedList: []
  completionConditionType: CompletionConditionType
}>({
  userType: UserTypeEnum.OnlyOne,
  approver: [],
  editIndex: -1, // 用来辨识是否编辑
  isMultiInstance: MultiInstanceEnum.NO,
  currentSelectedType: EnumSelectUser.Staff,
  currentSelectedList: [],
  completionConditionType: CompletionConditionType.All
})
const customEditFormRef = ref<InstanceType<typeof CustomForm>>()
const editFormConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    label: "审批对象",
    field: "approver",
    props: {
      class: "flex justify-between w-full"
    },
    rules: [
      {
        required: true,
        message: "请选择审批对象",
        trigger: "change"
      }
    ],
    slots: {
      default: "approver-default"
    }
  },
  {
    componentType: "el-switch",
    label: "开启会签",
    field: "isMultiInstance",
    props: {
      activeValue: MultiInstanceEnum.YES,
      inactiveValue: MultiInstanceEnum.NO
    }
  }
])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const props = defineProps<{
  type: FlowDetailType
  data?: any // 编辑/审批时候的数据
}>()

const emits = defineEmits<{
  (e: "onOk"): void
}>()

// 2024-03-13 与后端任何龙重新确认
// userType 控制选几个人，选一个传1，选多个传2，选职位传3
// isMultiInstance 控制会签，0关闭 1开启

const visible = ref(false) // 抽屉显示标识
const flowExamList = ref<Partial<ICreateFlowableDefineProcessNodes>[]>([]) // 层级审批列表数据

const showExamDialog = ref(false)

/** 抽屉标题 */
const drawerTitle = computed(() => {
  let titleMap = {
    [FlowDetailType.CREATE]: "新建流程",
    [FlowDetailType.EDIT]: "编辑流程",
    [FlowDetailType.EXAM]: "流程审批"
  }
  return titleMap[props.type]
})

watch(
  () => visible.value,
  async (val) => {
    if (val) {
      if (props.type === FlowDetailType.EDIT && props.data?.id) {
        const res = await getFlowableDefineInfo({
          prcDefId: props.data.id
        })
        flowBasic.value = {
          name: res.name,
          documentation: res.documentation,
          key: res.key
        }
        flowExamList.value = res.processNodes
      }
    } else {
      flowExamList.value = []
    }
  }
)

const setVisible = (value: boolean) => {
  visible.value = value
}

/** 选择处理对象下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  editExamItemForm.value.approver = data.map((item) => item.id)
}

const buildAssigneeHandlerList = () => {
  if (selectedPersonList.value.length) {
    return selectedPersonList.value.map((item) => ({
      id: String(item.value),
      name: String(item.label || "")
    }))
  }

  return (editExamItemForm.value.approver || []).map((id) => ({
    id: String(id),
    name: String(id)
  }))
}

/** 新增层级审批行数据 */
const onAddExamItemClick = async () => {
  const valid = await customEditFormRef.value?.validateForm()
  if (!valid) return

  if (editExamItemForm.value.editIndex === -1) {
    const data: any = {}
    data.assignee = {
      completionConditionType: CompletionConditionType.All, // 3.13后改动后默认全选，兼容之前用completionConditionType 做会签的老数据
      data: editExamItemForm.value.approver,
      handlerList: buildAssigneeHandlerList(),
      isMultiInstance: editExamItemForm.value.isMultiInstance,
      userType: editExamItemForm.value.userType
    }
    if (
      editExamItemForm.value.approver?.length > 1 &&
      editExamItemForm.value.userType === UserTypeEnum.OnlyOne
    ) {
      data.assignee.userType = UserTypeEnum.Multi
    }
    data.id = randomId()
    data.type = 1
    if (flowExamList.value.length) {
      const lastItem = flowExamList.value[flowExamList.value.length - 1]
      lastItem.nextId = [data.id]
    }
    flowExamList.value.push(data)
  } else {
    const data = flowExamList.value[editExamItemForm.value.editIndex] as any
    data.assignee = {
      completionConditionType: CompletionConditionType.All,
      data: editExamItemForm.value.approver,
      handlerList: buildAssigneeHandlerList(),
      isMultiInstance: editExamItemForm.value.isMultiInstance,
      userType: editExamItemForm.value.userType
    }
    if (
      editExamItemForm.value.approver?.length > 1 &&
      editExamItemForm.value.userType === UserTypeEnum.OnlyOne
    ) {
      data.assignee.userType = UserTypeEnum.Multi
    }
    flowExamList.value[editExamItemForm.value.editIndex] = cloneDeep(data)
  }
  showExamDialog.value = false
  resetEditExamItemForm()
  selectedPersonList.value = []
}

/** 抽屉提交操作 */
const onExamOrCreateHandle = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const processNodes = cloneDeep(flowExamList.value).map((item: any) => {
    if (item.assignee?.data?.length) {
      item.assignee.data = item.assignee.data.map((i: any) => {
        return i?.empId || i?.positionId || i // 返回自身是编辑的时候
      })
    }
    return item
  })

  if (props.type !== FlowDetailType.EXAM) {
    // 编辑和创建是同一个接口
    const params = {
      category: flowBasic.value.name,
      documentation: flowBasic.value.documentation,
      name: flowBasic.value.name,
      processNodes: processNodes,
      startNodeId: flowExamList.value[0].id,
      key: flowBasic.value.key || undefined
    }
    await createFlowableDefine(params)
    ElMessage.success(props.type === FlowDetailType.CREATE ? "新建成功" : "编辑成功")
    setVisible(false)
    emits("onOk")
  }
}

/** 删除层级审批行数据 */
const onDeleteExamRow = (index: number) => {
  // 处理流程id衔接问题
  if (index > -1) {
    // 删除行不是表格第一行和最后一行时，将前一行的nextId指向删除后一行的id形成的数组
    if (index > 0 && index < flowExamList.value.length - 1) {
      const prevItem = flowExamList.value[index - 1]
      const nextItem = flowExamList.value[index + 1]
      prevItem.nextId = [String(nextItem.id)]
    }

    // 删除行是表格最后一行时，将前一行的nextId指向空数组
    if (index === flowExamList.value.length - 1) {
      const prevItem = flowExamList.value[index - 1]
      prevItem && (prevItem.nextId = [])
    }
    flowExamList.value.splice(index, 1)
  }
}

/** 编辑层级审批行数据 */
const onEditExamRow = (index: number) => {
  if (flowExamList.value[index]) {
    const selectedData = cloneDeep(flowExamList.value[index])
    editExamItemForm.value = {
      completionConditionType: CompletionConditionType.All,
      currentSelectedType: [1, 2].includes(selectedData.assignee.userType)
        ? EnumSelectUser.Staff
        : EnumSelectUser.Post,
      approver: selectedData.assignee.data,
      editIndex: index,
      isMultiInstance:
        selectedData.assignee.completionConditionType == CompletionConditionType.ANY
          ? MultiInstanceEnum.NO
          : selectedData.assignee.isMultiInstance,
      userType: selectedData.assignee.userType,
      currentSelectedList: selectedData.assignee.data
    }
    const handlerList = Array.isArray(selectedData.assignee.handlerList)
      ? selectedData.assignee.handlerList
      : []
    selectedPersonList.value = handlerList.length
      ? handlerList.map((item: any) => ({
          label: String(item.name || item.label || item.id || ""),
          value: String(item.id || item.value || "")
        }))
      : (selectedData.assignee.data || []).map((item: any) => {
          const value = String(item?.empId || item?.positionId || item?.id || item || "")
          const label = String(item?.empName || item?.positionName || item?.name || value)
          return {
            label,
            value
          }
        })
    showExamDialog.value = true
  }
}

/** 层级流程审批对象类型切换 */
const onExamTypeChange = (type: EnumSelectUser) => {
  editExamItemForm.value.approver = []
  selectedPersonList.value = []
  if (type === EnumSelectUser.Staff) {
    editExamItemForm.value.userType = UserTypeEnum.OnlyOne
  } else {
    editExamItemForm.value.userType = UserTypeEnum.Position
  }
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped>
.examine-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.flowDetail {
  &:deep(.SelectPersion-inputWrapper) {
    height: auto;
    min-height: 32px;
    width: 100px;
  }
}
:deep(.level-approval-dialog) {
  .SelectPersion-inputWrapper {
    height: 32px;
  }
}
</style>
