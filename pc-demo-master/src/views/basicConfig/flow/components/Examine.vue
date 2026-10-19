<template>
  <div class="examine-table-box">
    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #data-default="{ row, $index }">
        <div class="flex items-center">
          <template v-if="[UserTypeEnum.OnlyOne, UserTypeEnum.Multi].includes(row.userType)">
            {{ userListRender(row.data) }}
          </template>
          <template v-if="row.userType === UserTypeEnum.Position">
            {{ positionListRender(row.data) }}
          </template>
          <el-button
            v-if="isReadonly"
            @click="examineDialogIndex = $index"
            link
            type="primary"
            size="small"
            class="ml-[4px]"
            >详情</el-button
          >
        </div>
      </template>

      <template #statusTagTypeMap-default="{ row }">
        <el-tag
          v-if="
            statusTagTypeMap[
              calcFlowResult(row.id, row.isMultiInstance, row.completionConditionType)
            ]
          "
          :type="
            statusTagTypeMap[
              calcFlowResult(row.id, row.isMultiInstance, row.completionConditionType)
            ]
          "
        >
          {{ calcFlowResult(row.id, row.isMultiInstance, row.completionConditionType) }}
        </el-tag>
      </template>

      <template #operation-default="{ $index }">
        <el-button link type="primary" @click="emits('editRow', $index)">编辑</el-button>
        <el-button link type="danger" @click="emits('deleteRow', $index)">删除</el-button>
      </template>
    </CustomTable>

    <!-- 层级审批弹窗 -->
    <CustomDialog
      v-model="examineDialog"
      title="层级审批情况"
      size="medium"
      @close="examineDialogIndex = -1"
    >
      <CustomTable
        ref="customTableRef"
        v-model:table-data="taskDetailData"
        :config="tableDetailConfig"
      >
        <template #taskProcess-default="{ row }">
          <el-tag
            v-if="statusTagTypeMap[StatusTuple[row.taskProcess]]"
            :type="statusTagTypeMap[StatusTuple[row.taskProcess]]"
          >
            {{ StatusTuple[row.taskProcess] ?? "-" }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="examineDialog = false">取消</el-button>
        <el-button type="primary" @click="examineDialog = false"> 确定 </el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script lang="ts" setup>
import { queryEmployees, queryPositions } from "@/api/component"
import { type ICreateFlowableDefineProcessNodes } from "@/api/flowable"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import { UserTypeEnum } from "@/types/personal/flow"

import { CompletionConditionType, ExamUserType, MultiInstanceEnum } from "../utils"

defineOptions({
  name: "ExamineComponent"
})

interface ITableRow {
  isMultiInstance: MultiInstanceEnum
  data: string[]
  userType: number
  completionConditionType: CompletionConditionType
  id: string
  employeeList: any[]
}

const props = withDefaults(
  defineProps<{
    data: Partial<ICreateFlowableDefineProcessNodes>[]
    type?: "edit" | "readonly"
    flowTaskDto?: any[]
    buttonAuthed?: boolean
  }>(),
  {
    data: () => [],
    flowTaskDto: () => [],
    type: "edit",
    buttonAuthed: true
  }
)

const emits = defineEmits<{
  (e: "deleteRow", index: number): void
  (e: "editRow", index: number): void
}>()

// 尽量只做展示
const StatusTuple = ["-", "进行中", "已通过", "已拒绝"] as const
const statusTagTypeMap: Record<string, string> = {
  "-": "",
  进行中: "warning",
  已通过: "success",
  已拒绝: "danger"
}
const examineDialog = ref(false)
const examineDialogIndex = ref(-1)
const taskDetailData = ref<any[]>([])
const flowSelectTypeRef = ref([
  {
    label: "员工",
    id: 1
  },
  {
    label: "员工", //  多选的时候,3.13 好与后端确定后改动
    id: 2
  },
  {
    label: "职位",
    id: 3
  }
])

const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      label: "层级序号",
      width: 90,
      type: "index",
      align: "center"
    },
    {
      prop: "userType",
      label: "审批选人方式",
      width: 160,
      formatter: (row: ITableRow) => {
        return flowSelectTypeRef.value.find((item) => item.id === row.userType)?.label || ""
      }
    },
    {
      prop: "data",
      label: "审批人",
      minWidth: 200,
      slots: {
        default: "data-default"
      }
    },
    {
      prop: "isMultiInstance",
      label: "是否会签",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.isMultiInstance === MultiInstanceEnum.YES ? "是" : "否"
      }
    },
    {
      prop: "calcFlowEndTime",
      label: "流程结束时间",
      width: 160,
      get hidden() {
        return !isReadonly.value
      },
      formatter: (row: ITableRow) => {
        return calcFlowEndTime(row.id, row.isMultiInstance, row.completionConditionType)
      }
    },
    {
      prop: "statusTagType",
      label: "流程结果",
      width: 120,
      align: "center",
      fixed: "right",
      get hidden() {
        return !isReadonly.value
      },
      slots: {
        default: "statusTagTypeMap-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      get hidden() {
        return isReadonly.value || !props.buttonAuthed
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const tableDetailConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "name",
      label: "员工姓名",
      minWidth: 160
    },
    {
      prop: "empNo",
      label: "员工编号",
      minWidth: 160
    },
    {
      prop: "positionNames",
      label: "职位",
      minWidth: 160
    },
    {
      prop: "auditTime",
      label: "审批时间",
      width: 160
    },
    {
      prop: "auditRemark",
      label: "审批备注",
      minWidth: 160
    },
    {
      prop: "taskProcess",
      label: "审批进度",
      width: 120,
      align: "center",
      fixed: "right",
      slots: {
        default: "taskProcess-default"
      }
    }
  ]
})

const userList = ref<any[]>([])
const positionList = ref<any[]>([])

const isReadonly = computed(() => props.type === "readonly")

watch(
  () => props.data,
  (val: any) => {
    if (!val.length) {
      customTableData.value = []
      return
    }
    customTableData.value = val.map((item: any) => {
      const d = item.assignee ? item.assignee : undefined
      const id = item.id ?? ""
      const userType = d?.userType ?? ExamUserType.assignee
      return {
        employeeList: item.employeeList ?? [],
        isMultiInstance:
          d?.completionConditionType == CompletionConditionType.ANY
            ? MultiInstanceEnum.NO
            : (d?.isMultiInstance ?? MultiInstanceEnum.NO),
        data: d?.data ?? [],
        userType: userType,
        // 流程详情时需展示
        endTime: item.endTime ?? "",
        procProgress: item.procProgress ?? "",
        id
      }
    })
  },
  {
    deep: true
  }
)

watch(
  () => examineDialogIndex.value,
  async (index) => {
    const dealFlow = async () => {
      const flow = customTableData.value[index]
      taskDetailData.value = flow.employeeList.map((item: any) => {
        item.positionNames = item.positionList?.length
          ? item.positionList.map((item: any) => item.name).join(",")
          : "-"
        return item
      })
    }
    if (index > -1) {
      dealFlow()
      examineDialog.value = true
    } else {
      taskDetailData.value = []
    }
  }
)

onBeforeMount(() => {
  getPositionList()
  getEmployeeList()
})

const userListRender = (data: string[]) => {
  let list: string[] = []
  userList.value.forEach((item) => {
    if (data.includes(item.empId)) {
      list.push(item.empName)
    }
  })
  return list.join("，")
}

const positionListRender = (data: string[]) => {
  let list: string[] = []
  positionList.value.forEach((item) => {
    if (data.includes(item.positionId)) {
      list.push(item.positionName)
    }
  })
  return list.join("，")
}

const getPositionList = async () => {
  const data = await queryPositions()
  positionList.value = data
}

const getEmployeeList = async () => {
  const data = await queryEmployees()
  userList.value = data
}

const calcFlowResult = (
  id: string,
  isMultiInstance: MultiInstanceEnum,
  completionConditionType: CompletionConditionType
) => {
  if (completionConditionType === CompletionConditionType.ANY) {
    isMultiInstance = MultiInstanceEnum.NO
  }
  if (props.flowTaskDto?.length) {
    if (!isMultiInstance) {
      let taskProcess = 0
      const filterData = props.flowTaskDto.filter((i) => i.taskDefKey == id)
      filterData.forEach((item: any, index: number) => {
        if (!taskProcess) {
          if (item.taskProcess == 2) {
            taskProcess = item.taskProcess
          }
          if (item.taskProcess == 1) {
            taskProcess = item.taskProcess
          }
          if (item.taskProcess == 3 && index === filterData.length - 1) {
            taskProcess = item.taskProcess
          }
        }
      })
      return StatusTuple[taskProcess] ?? "-"
    } else {
      let taskProcess = 0
      const filterData = props.flowTaskDto.filter((i) => i.taskDefKey == id)

      filterData.forEach((item: any, index: number) => {
        if (!taskProcess) {
          if (item.taskProcess == 3) {
            taskProcess = item.taskProcess
          }
          if (item.taskProcess == 1) {
            taskProcess = item.taskProcess
          }
          if (item.taskProcess == 2 && index === filterData.length - 1) {
            taskProcess = item.taskProcess
          }
        }
      })
      return StatusTuple[taskProcess] ?? "-"
    }
  }
  return "-"
}

const calcFlowEndTime = (
  id: string,
  isMultiInstance: MultiInstanceEnum,
  completionConditionType: CompletionConditionType
) => {
  if (completionConditionType === CompletionConditionType.ANY) {
    isMultiInstance = MultiInstanceEnum.NO
  }
  if (props.flowTaskDto?.length) {
    if (!isMultiInstance) {
      const item = props.flowTaskDto.find((item: any) => item.taskDefKey === id)
      return item?.endTime ?? "-"
    } else {
      let endTime
      let taskProcess = 0
      const filterData = props.flowTaskDto
        .filter((i) => i.taskDefKey == id)
        .sort((a, b) => {
          return (new Date(a.endTime) as any) - (new Date(b.endTime) as any)
        })
      filterData.forEach((item: any, index: number) => {
        if (!taskProcess) {
          if (item.taskProcess == 3) {
            taskProcess = item.taskProcess
            endTime = item.endTime
          }
          if (item.taskProcess == 1) {
            taskProcess = item.taskProcess
            endTime = item.endTime
          }
          if (item.taskProcess == 2 && index === filterData.length - 1) {
            taskProcess = item.taskProcess
            endTime = item.endTime
          }
        }
      })
      return endTime ?? "-"
    }
  }
  return "-"
}
</script>

<style lang="scss" scoped>
.examine-table-box {
  flex: 1;
  width: 100%;
  overflow: hidden;

  .custom-table {
    height: 100%;
  }
}
</style>
