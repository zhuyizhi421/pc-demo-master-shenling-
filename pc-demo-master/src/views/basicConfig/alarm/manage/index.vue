<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="告警模型">
          <div v-if="isAuth">
            <el-button icon="Plus" type="primary" @click="showUpdate = true">
              新建告警模型
            </el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #isEnabled-default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? "启用" : "停用" }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onEditRowClick(row)">
              {{ !row.isEnabled && isAuth ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="isAuth"
              link
              :type="row.isEnabled ? 'danger' : 'primary'"
              size="small"
              @click="onSwitchStatusClick(row)"
            >
              {{ row.isEnabled ? "停用" : "启用" }}
            </el-button>
            <el-button
              link
              v-if="!row.isEnabled && isAuth"
              type="danger"
              @click="onDeleteRowClick(row)"
              size="small"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 新建，编辑，查看 -->
    <CustomDrawer
      v-model="showUpdate"
      @close="resetUpdateForm()"
      class="alarmManage-drawer"
      :title="`${!isAuth ? '查看' : updateForm.id ? (currentEditRow.isEnabled ? '查看' : '编辑') : '新建'}告警模型`"
    >
      <CustomTitle title="基础信息" style="margin-top: 0"></CustomTitle>
      <CustomDescription
        v-if="updateForm.id"
        :data="currentEditRow"
        :configs="detailConfig"
        :label-width="100"
        :columns="!updateForm.id || !!(updateForm.id && !currentEditRow.isEnabled) ? 2 : 3"
        style="padding: 0"
      ></CustomDescription>
      <CustomForm
        v-if="!updateForm.id || !!(updateForm.id && !currentEditRow.isEnabled)"
        v-model="updateForm"
        :configs="updateFormConfigs"
        :label-width="120"
        :columns="2"
        style="margin-top: 20px"
      ></CustomForm>
      <CustomDescription
        v-else
        :data="updateForm"
        :configs="updateDetailConfig"
        :label-width="100"
        :columns="3"
        style="padding: 0; margin-top: 12px"
      ></CustomDescription>
      <CustomTitle title="告警上报">
        <template #title>
          <div class="flex items-center gap-[4px]">
            <span>告警上报</span>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="告警开始后，到达相应触发时长会将告警消息上报至通知对象，直至报警解除"
              placement="top-start"
            >
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>

        <el-button icon="Plus" :disabled="isDisabled" type="primary" @click="addReportLevel">
          新增上报层级
        </el-button>
      </CustomTitle>

      <CustomTable
        ref="detailOrEditTableRef"
        v-model:table-data="updateForm.levelConfigVOList"
        :config="detailOrEditTableConfig"
        class="custom-table"
      >
        <template #level-default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>

        <template #levelObject-default="{ row }">
          {{ row.notifyObjectNames?.join(",") || "--" }}
        </template>

        <template #levelTime-default="{ row }">
          {{ row.alarmTriggerDuration }}
        </template>

        <template #levelRepeat-default="{ row }">
          <el-switch disabled :model-value="!!row.isRepeatAlarm" />
        </template>

        <template #levelRepeatTime-header>
          <div class="flex items-center gap-[4px]">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="若告警触发时长后，报警仍未解除，支持重复告警（最多3次）"
              placement="top-start"
            >
              <el-icon color="#409eff">
                <Warning />
              </el-icon>
            </el-tooltip>
            <span>重复告警间隔(分)</span>
          </div>
        </template>
        <template #levelRepeatTime-default="{ row }">
          {{ row.isRepeatAlarm ? row.repeatAlarmInterval : "--" }}
        </template>

        <template #operation-default="scope">
          <el-button
            :disabled="isDisabled"
            link
            type="primary"
            @click="onEditAlarmReport(scope.row, scope.$index)"
            size="small"
            >编辑</el-button
          >
          <el-button
            :disabled="isDisabled"
            link
            type="danger"
            @click="updateForm.levelConfigVOList.splice(scope.$index, 1)"
            size="small"
            >删除本行</el-button
          >
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="showUpdate = false">取消</el-button>
        <el-button type="primary" :disabled="isDisabled" @click="onDrawerSubmit()">保存</el-button>
      </template>
    </CustomDrawer>

    <CustomDialog
      v-model="showUpdateLayer"
      :title="updateLayerForm.id ? '编辑上报层级' : '新增上报层级'"
      size="default"
    >
      <CustomForm ref="updateLayerFormRef" v-model="updateLayerForm" :configs="formConfigs">
        <template #notifyObjectIds-default>
          <div class="w-[100%] flex items-center flex-nowrap">
            <el-select
              v-model="updateLayerForm.notifyObjectIds"
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
              class="w-[120px] flex-none ml-[12px]"
              v-model="updateLayerForm.notifyObjectType"
              placeholder="请选择"
              @change="updateLayerForm.notifyObjectIds = []"
            >
              <el-option
                v-for="item in EnumSelectUserTypes"
                :key="item.type"
                :label="item.label"
                :value="item.type"
              />
            </el-select>
          </div>
        </template>

        <template #alarmTriggerDuration-append> <span>分</span> </template>

        <template #repeatAlarmInterval-append> <span>分</span> </template>
      </CustomForm>

      <template #footer>
        <el-button @click="showUpdateLayer = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitAlarmReport()">保 存</el-button>
      </template>
    </CustomDialog>

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="curSelectPersonType"
      :selected-ids="updateLayerForm.notifyObjectIds"
      multiple
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  abledAlarmModel,
  createAlarmModel,
  deleteAlarmModel,
  getAlarmModelItemById,
  getAlarmModelPaged,
  type IAlarmItem,
  updateAlarmModel
} from "@/api/alarm"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
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
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUserTypes } from "@/constant/enums"
import { EnumSelectUser } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IAlarmModelItem as ITableRow, IAlarmModelParams } from "@/types/base-info/alarm"
import type { IOption } from "@/types/common"

defineOptions({
  name: "AlarmManage"
})

const isAuth = useButtonAuth("AlarmManage_update", "AlarmManage_query")
const [updateForm, resetUpdateForm] = useResetRef<IAlarmItem & { id: string }>({
  modelName: "",
  modelNo: "",
  remarks: "",
  levelConfigVOList: [],
  id: ""
})

const [updateLayerForm, resetUpdateLayerForm] = useResetRef<any>({
  alarmTriggerDuration: "",
  isRepeatAlarm: false,
  levelNum: 0,
  notifyObjectIds: [],
  notifyObjectEchoIds: [],
  notifyObjectType: 1,
  repeatAlarmInterval: "",
  id: ""
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  modelName: string
  isEnabled: boolean
}>([
  {
    type: EnumComponentType.Input,
    key: "modelName",
    label: "告警模型名称",
    value: "",
    placeholder: "请输入告警模型名称"
  },
  {
    type: EnumComponentType.Select,
    key: "isEnabled",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      { label: "启用", value: true },
      { label: "停用", value: false }
    ]
  }
])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "modelNo",
      label: "告警模型编号",
      minWidth: 160
    },
    {
      prop: "modelName",
      label: "告警模型名称",
      minWidth: 160
    },
    {
      prop: "totalLevel",
      label: "上报层级数",
      width: 120,
      align: "center"
    },
    {
      prop: "isEnabled",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "isEnabled-default"
      }
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IAlarmModelParams], ITableRow, true> = {
  api: getAlarmModelPaged,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        ...getFormData()
      }
    ]
  }
}

const showUpdate = ref(false)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "modelNo",
    label: "告警模型编号：",
    get hidden() {
      return !updateForm.value.id || !!(updateForm.value.id && !currentEditRow.value.isEnabled)
    }
  },
  {
    field: "isEnabled",
    label: "状态：",
    formatter: ({ data: { isEnabled } }) => {
      return isEnabled ? "启用" : "停用"
    }
  },
  {
    field: "createTime",
    label: "创建时间："
  }
])
const updateFormConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "告警模型名称：",
    field: "modelName",
    props: {
      placeholder: "请输入",
      get disabled() {
        return !!(updateForm.value.id && currentEditRow.value.isEnabled)
      }
    }
  },
  {
    componentType: "el-input",
    label: "告警模型编号：",
    field: "modelNo",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return !isAuth || !!updateForm.value.id
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注：",
    field: "remarks",
    colspan: -1,
    props: {
      placeholder: "请输入",
      get disabled() {
        return !!(updateForm.value.id && currentEditRow.value.isEnabled)
      }
    }
  }
])
const updateDetailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "modelName",
    label: "告警模型名称："
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: 2
  }
])
const showUpdateLayer = ref(false)
const updateLayerFormRef = ref<InstanceType<typeof CustomForm>>()
const currentEditRow = ref<any>({})
const editReportIndex = ref(-1)

const isDisabled = computed(() => {
  return (updateForm.value.id && currentEditRow.value.isEnabled) || !isAuth
})

const detailOrEditTableRef = ref<ComponentExposed<typeof CustomTable>>()
const detailOrEditTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "level",
      label: "上报层级",
      width: 100,
      align: "center",
      slots: {
        default: "level-default"
      }
    },
    {
      prop: "levelObject",
      label: "通知对象",
      minWidth: 160,
      align: "center",
      slots: {
        default: "levelObject-default"
      }
    },
    {
      prop: "levelTime",
      label: "告警触发时长(分)",
      minWidth: 160,
      align: "right",
      slots: {
        default: "levelTime-default"
      }
    },
    {
      prop: "levelRepeat",
      label: "是否重复告警",
      minWidth: 120,
      align: "center",
      slots: {
        default: "levelRepeat-default"
      }
    },
    {
      prop: "levelRepeatTime",
      label: "重复告警间隔(分)",
      minWidth: 160,
      align: "right",
      slots: {
        header: "levelRepeatTime-header",
        default: "levelRepeatTime-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 140,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    label: "通知对象",
    field: "notifyObjectIds",
    rules: [
      {
        required: true,
        validator: validatorNotice
      }
    ],
    props: {
      class: "w-[100%] flex items-center flex-nowrap"
    },
    slots: {
      default: "notifyObjectIds-default"
    }
  },
  {
    componentType: "el-input",
    label: "触发时长",
    field: "alarmTriggerDuration",
    rules: [
      {
        required: true,
        trigger: "blur",
        validator: (rule: any, value: any, callback: any) => {
          const n = Number(value)
          if (!!value && Number.isInteger(n) && n >= 0 && n <= 720) {
            callback()
          } else {
            callback("请输入0-720数字")
          }
        }
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入0-720"
    },
    slots: {
      append: "alarmTriggerDuration-append"
    }
  },
  {
    componentType: "el-switch",
    label: "重复告警",
    field: "isRepeatAlarm"
  },
  {
    componentType: "el-input",
    label: "告警间隔",
    field: "repeatAlarmInterval",
    rules: [
      {
        validator: (rule: any, value: any, callback: any) => {
          const n = Number(value)
          if (!value) {
            callback()
            return
          }
          if (Number.isInteger(n) && n >= 3 && n <= 360) {
            callback()
          } else {
            callback("请输入3-360数字")
          }
        }
      }
    ],
    hidden: !updateLayerForm.value.isRepeatAlarm,
    props: {
      type: "text",
      placeholder: "请输入3-360"
    },
    slots: {
      append: "repeatAlarmInterval-append"
    }
  }
])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])
const curSelectPersonType = computed(() => {
  return (
    (EnumSelectUserTypes.find((item) => item.type === updateLayerForm.value.notifyObjectType)
      ?.value as EnumSelectUser) || EnumSelectUser.Staff
  )
})

onMounted(() => {
  customTableRef.value?.requestData()
})

watch(
  () => showUpdateLayer.value,
  (val: boolean) => {
    if (!val) {
      selectedPersonList.value = []
      updateLayerFormRef.value?.resetForm()
    }
  }
)

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 删除表格行 */
const onDeleteRowClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该告警类型, 是否继续?", "提示", {
    type: "warning"
  })
  await deleteAlarmModel(data.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

/** 切换启用、停用状态 */
const onSwitchStatusClick = async (data: any) => {
  await ElMessageBox.confirm(
    `此操作将${data.isEnabled ? "停用" : "启用"}该类型, 是否继续?`,
    "提示",
    {
      type: "warning"
    }
  )
  await abledAlarmModel({ id: data.id, newEnabledStatus: !data.isEnabled })
  ElMessage.success(`${data.isEnabled ? "停用" : "启用"}成功`)
  customTableRef.value?.requestData()
}

const addReportLevel = () => {
  editReportIndex.value = -1
  resetUpdateLayerForm()
  showUpdateLayer.value = true
}

/** 编辑告警模型 */
const onEditRowClick = (data: any) => {
  currentEditRow.value = data
  showUpdate.value = true
  getAlarmModelDetail(data.id)
}

/** 告警模型信息提交 */
const onDrawerSubmit = async () => {
  let fn: any = updateForm.value.id ? updateAlarmModel : createAlarmModel
  const params = {
    ...updateForm.value,
    id: updateForm.value.id || undefined,
    levelConfigVOList: updateForm.value.levelConfigVOList.map((item: any, index: number) => {
      return {
        ...item,
        levelNum: index + 1,
        notifyObjectNames: undefined
      }
    })
  }
  await fn(params)
  showUpdate.value = false
  ElMessage.success(`${updateForm.value.id ? "编辑" : "新建"}成功`)
  customTableRef.value?.requestData()
}

/** 修改告警上报层级 */
const onEditAlarmReport = (data: any, index: number) => {
  editReportIndex.value = index
  selectedPersonList.value = data.notifyObjectIds.map((item: string, i: number) => {
    return {
      label: data.notifyObjectNames[i],
      value: item
    }
  })
  updateLayerForm.value = {
    alarmTriggerDuration: data.alarmTriggerDuration,
    isRepeatAlarm: data.isRepeatAlarm,
    levelNum: 0,
    notifyObjectIds: data.notifyObjectIds, // 回显需要在组件内部统一逻辑,后续修改
    notifyObjectEchoIds: cloneDeep(data.notifyObjectIds),
    notifyObjectType: data.notifyObjectType,
    repeatAlarmInterval: data.repeatAlarmInterval,
    id: data.id
  }
  showUpdateLayer.value = true
}

/** 提交告警上报层级 */
const onSubmitAlarmReport = async () => {
  const valid = await updateLayerFormRef.value?.validateForm()
  if (!valid) return

  let data: any = {
    ...updateLayerForm.value,
    notifyObjectNames: updateLayerForm.value.notifyObjectIds.map((item: any) => {
      return selectedPersonList.value.find((i) => i.value === item)?.label
    }),
    id: updateLayerForm.value.id || undefined
  }
  if (!data.id) {
    if (editReportIndex.value === -1) {
      updateForm.value.levelConfigVOList.push(data)
    } else {
      updateForm.value.levelConfigVOList.splice(editReportIndex.value, 1, data)
    }
  } else {
    let index = updateForm.value.levelConfigVOList.findIndex((item: any) => item.id === data.id)
    if (index > -1) {
      updateForm.value.levelConfigVOList[index] = data
    }
  }
  showUpdateLayer.value = false
}

/** 获取告警模型信息 */
const getAlarmModelDetail = async (id: string) => {
  const res = await getAlarmModelItemById(id)
  updateForm.value = {
    id: res.id,
    modelName: res.modelName,
    modelNo: res.modelNo,
    remarks: res.remarks,
    levelConfigVOList: res.levelConfigList
  }
}

/** 验证通知对象 */
const validatorNotice = (rule: any, value: any, callback: any) => {
  setTimeout(() => {
    if (updateLayerForm.value.notifyObjectIds.length) {
      callback()
    } else {
      callback("请选择负责人")
    }
  }, 50)
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
  updateLayerForm.value.notifyObjectIds = data.map((item) => item.id)
}
</script>

<style scoped lang="scss">
.alarmManage-drawer {
  :deep(.custom-drawer-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}
</style>
