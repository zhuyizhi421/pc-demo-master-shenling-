<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="缺陷列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="onOpenCreate" icon="Plus">新建缺陷</el-button>
            <el-button @click="defectTypeRef?.setVisible(true)">缺陷类型</el-button>
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
            <el-tag v-if="row.isEnabled" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>

          <template #operation-default="{ row }">
            <template v-if="isAuth">
              <el-button link type="primary" size="small" @click="onReviewClick(row)">
                {{ row.isEnabled == true ? "查看详情" : "编辑查看" }}
              </el-button>
              <el-button
                link
                :type="row.isEnabled ? 'danger' : 'primary'"
                size="small"
                @click="onSwitchStatusClick(row)"
              >
                {{ row.isEnabled == true ? "停用" : "启用" }}
              </el-button>
              <el-button
                v-if="row.isEnabled == false"
                link
                type="danger"
                size="small"
                @click="onDeleteClick(row.id)"
                >删除</el-button
              >
            </template>
            <template v-else>
              <el-button
                link
                type="primary"
                size="small"
                @click="onReviewClick(row)"
                v-if="row.isEnable"
              >
                查看详情
              </el-button>
            </template>
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

    <!-- 新建、编辑缺陷 -->
    <CustomDialog
      v-model="flawEditShow"
      :title="`${editForm.id ? '编辑查看' : '新建缺陷'}`"
      @close="resetEditForm()"
    >
      <CustomForm ref="customFormRef" v-model="editForm" :configs="formConfigs" :labelWidth="100">
      </CustomForm>
      <template #footer>
        <el-button @click="flawEditShow = false">取 消</el-button>
        <el-button type="primary" v-preventReClick="[updateFlawOk]">{{
          editForm.id ? "保存" : "创建并启用"
        }}</el-button>
      </template>
    </CustomDialog>

    <!-- 查看详情 -->
    <CustomDialog v-model="flawDetailShow" title="查看详情">
      <CustomDescription
        :data="detailForm"
        :configs="detailConfig"
        :columns="2"
        :labelWidth="90"
      ></CustomDescription>
      <template #footer>
        <el-button @click="flawDetailShow = false">返 回</el-button>
      </template>
    </CustomDialog>

    <!-- 缺陷类型弹窗 -->
    <DefectType ref="defectTypeRef" @onOk="getFlawGradeOptions()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getFlawGradeList } from "@/api/quality/defectGrades"
import {
  createFlaw,
  deleteFlaw,
  getFlawListPaged,
  updateEnabledStatusFlaw,
  updateFlaw
} from "@/api/quality/defectManage"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IFlawListItem as ITableRow, IFlawListParams } from "@/types/quality-manage/flaw"

import DefectType from "./components/DefectType.vue"

defineOptions({
  name: "DefectManage"
})

const isAuth = useButtonAuth("DefectManage_update", "DefectManage_query")

const flawGradeTypeOptions = ref<{ label: string; value: string }[]>([]) // 缺陷类型下拉

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "flawNo",
    label: "缺陷编号",
    value: "",
    placeholder: "请输入缺陷编号"
  },
  {
    type: EnumComponentType.Input,
    key: "flawName",
    label: "缺陷名称",
    value: "",
    placeholder: "请输入缺陷名称"
  },
  {
    type: EnumComponentType.Select,
    key: "flawGradeId",
    label: "缺陷类型",
    value: "",
    placeholder: "请选择缺陷类型",
    options: flawGradeTypeOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  flawName: string
  flawGradeId: string
  flawNo: string
}>(searchFormData.value)

const pagination = ref({ currentPage: 1, pageSize: 20, total: 0 })

// 编辑缺陷弹窗数据
const [editForm, resetEditForm] = useResetRef<any>({
  flawName: "",
  flawGradeId: "",
  flawNo: "",
  id: "",
  remarks: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "缺陷名称",
    field: "flawName",
    rules: [{ required: true, message: "请输入缺陷名称", trigger: "blur" }],
    props: { type: "text", placeholder: "请输入缺陷名称" }
  },
  {
    componentType: "el-input",
    label: "缺陷编号",
    field: "flawNo",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return !!editForm.value.id
      }
    }
  },
  {
    componentType: "el-select",
    label: "缺陷类型",
    field: "flawGradeId",
    rules: [{ required: true, message: "请选择缺陷类型", trigger: "change" }],
    props: {
      placeholder: "请选择",
      customChildren: flawGradeTypeOptions.value.map((item) => {
        return { componentType: "el-option", props: { label: item.label, value: item.value } }
      })
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: { type: "textarea", placeholder: "请输入备注", maxlength: 200, showWordLimit: true }
  }
])

// 缺陷详情弹窗数据
const [detailForm] = useResetRef<any>({ flawName: "", flawNo: "", remarks: "", flawGradeId: "" })

const detailConfig = ref<ICustomDescriptionConfig[]>([
  { field: "flawName", label: "缺陷名称：" },
  { field: "flawNo", label: "缺陷编号：" },
  {
    field: "flawGradeId",
    label: "缺陷类型：",
    formatter: ({ data: { flawGradeId } }) => {
      return flawGradeTypeOptions.value.find((item) => item.value === flawGradeId)?.label
    }
  },
  { field: "remarks", label: "备注：" }
])

const defectTypeRef = ref<InstanceType<typeof DefectType>>()

const flawEditShow = ref(false)
const flawDetailShow = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "flawNo", label: "缺陷编号", minWidth: 160 },
    { prop: "flawName", label: "缺陷名称", minWidth: 160 },
    { prop: "flawGradeName", label: "缺陷类型", minWidth: 160 },
    {
      prop: "isEnabled",
      label: "状态",
      width: 90,
      align: "center",
      slots: { default: "isEnabled-default" }
    },
    { prop: "createTime", label: "创建时间", width: 160, align: "center" },
    { prop: "remarks", label: "备注", width: 200, align: "center" },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IFlawListParams], ITableRow, true> = {
  api: getFlawListPaged,
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

onMounted(async () => {
  getFlawGradeOptions()
  await customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 获取缺陷类型下拉 */
const getFlawGradeOptions = async () => {
  const res: any = await getFlawGradeList({})
  flawGradeTypeOptions.value = res.map((item: any) => {
    return { label: item.gradeName, value: item.id }
  })
}

/** 切换缺陷状态 */
const onSwitchStatusClick = async (row: any) => {
  await ElMessageBox.confirm(`此操作将${row.isEnabled ? "停用" : "启用"}该缺陷，是否继续?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await updateEnabledStatusFlaw({ flawId: row.id, newEnabledStatus: !row.isEnabled })
  ElMessage.success(row.isEnabled ? "停用成功" : "启用成功")
  await customTableRef.value?.requestData()
}

/** 删除缺陷 */
const onDeleteClick = async (Id: string) => {
  await ElMessageBox.confirm(`确定删除该缺陷?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deleteFlaw(Id)
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

/** 新建 */
const onOpenCreate = () => {
  flawEditShow.value = true
  customFormRef.value?.resetForm()
}

/** 查看详情、编辑查看 */
const onReviewClick = (row: any) => {
  if (row.isEnabled == true) {
    // 查看详情
    flawDetailShow.value = true
    detailForm.value = {
      flawName: row?.flawName,
      flawNo: row?.flawNo,
      remarks: row?.remarks,
      flawGradeId: row?.flawGradeId
    }
  } else {
    // 编辑查看
    flawEditShow.value = true
    customFormRef.value?.resetForm()
    editForm.value = {
      id: row?.id,
      flawName: row?.flawName,
      flawNo: row?.flawNo,
      remarks: row?.remarks,
      flawGradeId: row?.flawGradeId
    }
  }
}

/** 提交编辑缺陷 */
const updateFlawOk = async () => {
  await customFormRef.value?.validateForm()
  const params = {
    flawName: editForm.value.flawName,
    flawNo: editForm.value.flawNo || undefined,
    remarks: editForm.value.remarks,
    flawGradeId: editForm.value.flawGradeId,
    id: editForm.value?.id || undefined
  }
  if (editForm.value.id) {
    await updateFlaw(params)
    ElMessage.success("编辑成功")
  } else {
    await createFlaw(params)
    ElMessage.success("新建成功")
  }
  flawEditShow.value = false
  await customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
:deep(.custom-description) {
  padding: 0;
}
</style>
