<template>
  <CustomDialog v-model="visible" title="缺陷类型" size="medium">
    <CustomTitle title="缺陷类型" style="margin-top: 0">
      <div>
        <el-button type="primary" @click="flawGradesEditShow = true" icon="Plus"
          >新建缺陷类型</el-button
        >
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
        <el-button link type="primary" size="small" @click="onEditClick(row)">编辑查看</el-button>
        <el-button link type="danger" size="small" @click="onDeleteClick(row.id)">删除</el-button>
      </template>
    </CustomTable>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
      </span>
    </template>
  </CustomDialog>

  <!-- 新建、编辑缺陷类型 -->
  <CustomDialog
    v-model="flawGradesEditShow"
    :title="`${editForm.id ? '编辑查看' : '新建缺陷类型'}`"
    @close="resetEditForm()"
  >
    <CustomForm ref="customFormRef" v-model="editForm" :configs="formConfigs"></CustomForm>
    <template #footer>
      <el-button @click="flawGradesEditShow = false">取消</el-button>
      <el-button type="primary" @click="onSubmitClick()">{{
        editForm.id ? "保存" : "创建"
      }}</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createFlawGrade,
  deleteFlawGrade,
  getFlawGradeList,
  updateFlawGrade
} from "@/api/quality/defectGrades"
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
import useResetRef from "@/hooks/useResetRef"
import type {
  IFlawGradeListItem as ITableRow,
  IFlawGradeListParams
} from "@/types/quality-manage/flaw"

const [editForm, resetEditForm] = useResetRef<any>({
  gradeName: "",
  gradeNo: "",
  id: "",
  remarks: ""
})

const visible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "350px",
  columns: [
    {
      prop: "gradeNo",
      label: "缺陷类型编号",
      minWidth: 160
    },
    {
      prop: "gradeName",
      label: "缺陷类型名称",
      minWidth: 160
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 130,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "缺陷类型名称",
    field: "gradeName",
    rules: [
      {
        required: true,
        message: "请输入缺陷类型名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入缺陷类型名称"
    }
  },
  {
    componentType: "el-input",
    label: "缺陷类型编号",
    field: "gradeNo",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return !!editForm.value.id
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const flawGradesEditShow = ref(false)

const emits = defineEmits<{
  (e: "onOk"): void
}>()

/** 设置弹窗显示状态 */
const setVisible = (value: boolean) => {
  visible.value = value
  if (value) {
    nextTick(() => {
      customTableRef.value?.requestData()
    })
  }
}

const queryConfig: ITableRequestConfig<[IFlawGradeListParams], ITableRow, false> = {
  api: getFlawGradeList,
  getParams: () => {
    return [{}]
  }
}

/** 编辑缺陷类型 */
const onEditClick = (row: any) => {
  editForm.value = {
    gradeName: row.gradeName,
    gradeNo: row.gradeNo,
    remarks: row.remarks,
    id: row.id
  }
  flawGradesEditShow.value = true
}

/** 删除缺陷类型 */
const onDeleteClick = async (Id: string) => {
  await ElMessageBox.confirm("此操作将永久删除该缺陷类型, 是否继续?", "提示", {
    type: "warning"
  })
  await deleteFlawGrade(Id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
  emits("onOk")
}

/** 提交缺陷类型 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  const params = {
    gradeName: editForm.value.gradeName,
    gradeNo: editForm.value.gradeNo || undefined,
    remarks: editForm.value.remarks,
    id: editForm.value?.id || undefined
  }
  if (editForm.value.id) {
    await updateFlawGrade(params)
    ElMessage.success("编辑成功")
  } else {
    await createFlawGrade(params)
    ElMessage.success("新建成功")
  }
  flawGradesEditShow.value = false
  customTableRef.value?.requestData()
  emits("onOk")
}

defineExpose({
  setVisible
})
</script>

<style lang="scss" scoped></style>
