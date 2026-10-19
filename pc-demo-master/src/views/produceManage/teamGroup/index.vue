<!--
生产运营管理 - 班次管理 - 班组管理
-->
<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="custom-table-container">
        <CustomTitle title="班组管理">
          <div v-if="isAuth">
            <el-button
              icon="Plus"
              type="primary"
              @click="
                () => {
                  resetUpdateForm()
                  updateForm.show = true
                }
              "
            >
              新建班组
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
          <template #teamStatus-default="{ row }">
            <el-tag link :type="row.teamStatus === 1 ? 'success' : 'danger'">{{
              row.teamStatus === 1 ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="editSeeRow(row.teamStatus === 1, row)"
            >
              {{ row.teamStatus === 1 || !isAuth ? "查看详情" : "编辑查看" }}
            </el-button>
            <el-button
              v-if="isAuth"
              link
              @click="onAbleRow(row)"
              :type="row.teamStatus === 1 ? 'danger' : 'primary'"
              size="small"
              >{{ row.teamStatus === 1 ? "停用" : "启用" }}</el-button
            >
            <el-button
              v-if="row.teamStatus !== 1 && isAuth"
              link
              type="danger"
              size="small"
              @click="deleteRow(row)"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>
    </div>

    <CustomDialog
      :title="!isAuth ? '查看班组' : updateForm.id ? '编辑查看' : '新建班组'"
      v-model="updateForm.show"
      size="mini"
    >
      <CustomForm
        ref="updateFromRef"
        :configs="formConfig"
        :label-width="100"
        v-model="updateForm"
      />

      <template #footer>
        <el-button @click="resetUpdateForm">取 消</el-button>
        <el-button type="primary" v-if="isAuth" :disabled="updateForm.justSee" @click="updateFormOk"
          >保 存</el-button
        >
      </template>
    </CustomDialog>

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="updateForm.leaderIds"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts" name="teamGroupManage">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createTeamGroupItem,
  deleteTeamGroupItem,
  disabledTeamGroupItem,
  enableTeamGroupItem,
  getTeamGroupList,
  updateTeamGroupItem
} from "@/api/scheduling"
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
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { ITeamGroupItem as ITableRow } from "@/types/production-manage/scheduling"

defineOptions({
  name: "ProduceArrangeGroup"
})

const isAuth = useButtonAuth("ProduceArrangeGroup_update", "ProduceArrangeGroup_query")

// 班组管理
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "teamCode",
      label: "班组编号",
      minWidth: 160
    },
    {
      prop: "teamName",
      label: "班组名称",
      minWidth: 160
    },
    {
      prop: "teamStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "teamStatus-default"
      }
    },
    {
      prop: "memberNumber",
      label: "班组人数",
      width: 120,
      align: "right"
    },
    {
      prop: "leaderNames",
      label: "班组长",
      width: 120,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160
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

const [updateForm, resetUpdateForm] = useResetRef<{
  id: string
  show: boolean
  justSee: boolean
  time: [string, string]
  startTime: string
  endTime: string
  man: any[]

  leaderIds: string[]
  memberNumber: string
  remark: string
  teamName: string
  teamCode: string
}>({
  id: "",
  show: false,
  justSee: false,
  time: ["", ""],
  startTime: "",
  endTime: "",
  man: [],

  leaderIds: [],
  memberNumber: "",
  remark: "",
  teamName: "",
  teamCode: ""
})
const updateFromRef = ref<InstanceType<typeof CustomForm>>()

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "班组名称",
    field: "teamName",
    rules: [
      {
        required: true,
        message: "请输入班组名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      disabled: updateForm.value.justSee || !isAuth.value
    }
  },
  {
    componentType: "el-input",
    label: "班组编号",
    field: "teamCode",
    props: {
      placeholder: "不填则自动生成",
      disabled: !!(updateForm.value.justSee || !isAuth.value || updateForm.value.id)
    }
  },
  {
    componentType: "el-input",
    label: "班组人数",
    field: "memberNumber",
    rules: [
      {
        pattern: /^[1-9]\d*$/,
        message: "请输入正整数",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      disabled: updateForm.value.justSee || !isAuth.value
    }
  },
  {
    componentType: "el-select",
    label: "班组长",
    field: "leaderIds",
    rules: [
      {
        required: true,
        trigger: "blur",
        message: "请选择班组长"
      }
    ],
    props: {
      placeholder: "请选择",
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      disabled: updateForm.value.justSee || !isAuth.value,
      customChildren: selectedPersonList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: (visible: boolean) => {
        if (visible) {
          selectPersonVisible.value = true
        }
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入",
      disabled: updateForm.value.justSee || !isAuth.value,
      maxlength: 200,
      showWordLimit: true
    }
  }
])
onMounted(() => {
  customTableRef.value?.requestData()
})

const queryConfig: ITableRequestConfig<[], ITableRow, false> = {
  api: getTeamGroupList
}

const deleteRow = async (data: any) => {
  try {
    await ElMessageBox.confirm("此操作将永久删除该班组, 是否继续?", "提示", {
      type: "warning"
    })
    await deleteTeamGroupItem(data.id)
    ElMessage.success("删除成功")
    customTableRef.value?.requestData()
  } catch (error) {
    /* empty */
  }
}

const onAbleRow = async (data: any) => {
  try {
    await ElMessageBox.confirm(`确定${data.teamStatus === 1 ? "停用" : "启用"}该班组吗？`, "提示", {
      type: "warning"
    })
    if (data.teamStatus === 1) {
      await disabledTeamGroupItem(data.id)
      ElMessage.success("停用成功")
    } else {
      await enableTeamGroupItem(data.id)
      ElMessage.success("启用成功")
    }
    customTableRef.value?.requestData()
  } catch (error) {
    /* empty */
  }
}

const editSeeRow = async (justSee: boolean, data: any) => {
  const leaders = data.leaderList ?? []
  updateForm.value = {
    ...updateForm.value,
    ...data,
    leaderIds: leaders.map((item: any) => item.id),
    show: true,
    justSee
  }
  selectedPersonList.value = leaders.map((item: any) => ({
    label: item.name,
    value: item.id
  }))
}

const updateFormOk = async () => {
  await updateFromRef.value?.validateForm()
  const params = {
    leaderIds: updateForm.value.leaderIds,
    memberNumber: Number(updateForm.value.memberNumber),
    remark: updateForm.value.remark,
    teamName: updateForm.value.teamName,
    teamCode: updateForm.value.teamCode || undefined
  }

  try {
    if (updateForm.value.id) {
      await updateTeamGroupItem(updateForm.value.id, params)
      ElMessage.success("编辑成功")
    } else {
      await createTeamGroupItem(params)
      ElMessage.success("新建成功")
    }
    resetUpdateForm()
    customTableRef.value?.requestData()
  } catch (error) {
    /* empty */
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  updateForm.value.leaderIds = data.map((item) => item.id)
}
</script>

<style scoped lang="scss"></style>
