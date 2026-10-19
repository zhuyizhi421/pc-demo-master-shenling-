<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="流程单列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onOpenFlowDrawer()">新建流程</el-button>
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
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onOpenFlowDrawer(row)">{{
              isAuth ? "编辑查看" : "查看详情"
            }}</el-button>
            <el-button
              v-if="isAuth"
              type="danger"
              size="small"
              link
              @click="onFlowDelete(row.deploymentId)"
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

    <!-- 流程详情抽屉 -->
    <FlowInfoDrawer
      ref="flowInfoDrawerRef"
      :type="selectType"
      :data="selectData"
      @on-ok="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { deleteFlowableDefine, getFlowableDefinitionPaged } from "@/api/flowable"
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
import type {
  IFlowableDefinitionItem as ITableRow,
  IFlowableDefinitionParams
} from "@/types/personal/flow"

import FlowInfoDrawer from "./components/ApprovalDetails.vue"
import { FlowDetailType } from "./utils"

defineOptions({
  name: "FlowConfig"
})

const isAuth = useButtonAuth("FlowConfig_update", "FlowConfig_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "流程名称",
    value: "",
    placeholder: "请输入流程名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const flowInfoDrawerRef = ref<InstanceType<typeof FlowInfoDrawer>>()

// 流程单操作类型
const selectType = ref(FlowDetailType.CREATE)
const selectData = ref<any>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "流程名称",
      minWidth: 160
    },
    {
      prop: "createBy",
      label: "新建员工编号",
      minWidth: 160
    },
    {
      prop: "deploymentTime",
      label: "创建时间",
      minWidth: 160
    },
    {
      prop: "documentation",
      label: "流程说明",
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
const queryConfig: ITableRequestConfig<[IFlowableDefinitionParams], ITableRow, true> = {
  api: getFlowableDefinitionPaged,
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

onMounted(() => {
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 删除流程单 */
const onFlowDelete = async (deployId: string) => {
  const confirm = await ElMessageBox.confirm("此操作将删除此流程配置，是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  if (confirm === "confirm") {
    await deleteFlowableDefine(deployId)
    ElMessage({
      type: "success",
      message: "删除成功!"
    })
    customTableRef.value?.requestData()
  }
}

/** 打开流程详情抽屉 */
const onOpenFlowDrawer = (data?: any) => {
  if (data) {
    // 编辑、查看详情
    selectType.value = FlowDetailType.EDIT
    selectData.value = data
  } else {
    // 新增
    selectType.value = FlowDetailType.CREATE
    selectData.value = undefined
  }
  flowInfoDrawerRef.value?.setVisible(true)
}
</script>

<style scoped lang="scss"></style>
