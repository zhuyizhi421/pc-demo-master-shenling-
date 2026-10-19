<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        :menuItems="treeList"
        :horizonScroll="true"
        label-attr="categoryName"
        @node-click="onNodeClick"
        :showCustomIcon="false"
        virtualize
      >
        <template #afterIcon="{ data }" v-if="isAuth">
          <template v-if="data.categoryNo">
            <el-icon class="mr-[10px]" @click="onUpdateAndonTypeClick(data)">
              <EditPen color="var(--tree-right-icon-color)" />
            </el-icon>
            <el-icon class="mr-[10px]" @click="onDeleteAndonTypeClick(data)">
              <CircleClose color="var(--tree-right-icon-color)" />
            </el-icon>
          </template>
        </template>
      </CustomTreeMenu>
    </div>
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="Andon列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="andonUpdateRef!.setVisible(true)"
              >新建Andon</el-button
            >
            <el-button type="primary" icon="Plus" @click="onUpdateAndonTypeClick()"
              >新建Andon类型</el-button
            >
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

          <template #needFeedback-default="{ row }">
            <el-tag v-if="row.needFeedback" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onEditAndonClick(row)">
              {{ row.isEnabled ? "查看详情" : isAuth ? "编辑查看" : "查看详情" }}
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
              @click="onDeleteAndonClick(row)"
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

    <!-- Andon类型弹窗 -->
    <CustomDialog
      draggable
      :title="updateFaultCateForm.title"
      v-model="updateFaultCateForm.show"
      @close="resetFaultCateForm()"
      size="mini"
    >
      <CustomForm
        :configs="updateFaultCateFormConfig"
        :model-value="updateFaultCateForm"
        ref="updateFaultCateFormRef"
        :label-width="90"
      />

      <template #footer>
        <el-button @click="updateFaultCateForm.show = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitAndonTypeClick()">确 定</el-button>
      </template>
    </CustomDialog>

    <!-- 新增、编辑andon弹窗 -->
    <AndonUpdateDialog
      ref="andonUpdateRef"
      :categoryId="currentNode?.id"
      @onOk="customTableRef?.requestData()"
    />

    <!-- andon详情弹窗 -->
    <AndonDetailDialog v-model="detailVisible" :id="selectedAndonId" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createAndonType,
  deleteAndonType,
  getAndonCategoryAll,
  updateAndonType
} from "@/api/operation/andon/andonCategory"
import {
  deleteAndonModel,
  getAndonModelListPaged,
  updateEnabledStatusAndonModel
} from "@/api/operation/andon/andonModel"
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
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IAndonModelItem as ITableRow, IAndonModelParams } from "@/types/maintain/andon"

import AndonDetailDialog from "./components/andonModelDetail.vue"
import AndonUpdateDialog from "./components/editOrcreateAndonModel.vue"

defineOptions({
  name: "AndonInfo"
})

enum EnumAndonModelTitle {
  ADD = "新增Andon类型",
  EDIT = "编辑查看"
}

const isAuth = useButtonAuth("AndonInfo_update", "AndonInfo_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "andonName",
    label: "Andon名称",
    value: "",
    placeholder: "请输入Andon名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  andonName?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const [updateFaultCateForm, resetFaultCateForm] = useResetRef<any>({
  show: false,
  remarks: "",
  categoryNo: "",
  id: "",
  categoryName: "",
  title: ""
})

const andonUpdateRef = ref<InstanceType<typeof AndonUpdateDialog>>()
const updateFaultCateFormRef = ref<InstanceType<typeof CustomForm>>()

const faultCateList = ref<any[]>([])
const currentNode = ref<any>({})

const treeList = computed(() => {
  const list = [
    {
      id: 0,
      categoryName: "全部Andon类型",
      children: []
    }
  ]
  list[0].children = faultCateList.value.map((item: any) => {
    return {
      ...item,
      children: []
    }
  }) as any
  return list
})

const detailVisible = ref(false)
const selectedAndonId = ref("")
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "andonNo",
      label: "Andon编号",
      minWidth: 160
    },
    {
      prop: "andonName",
      label: "Andon名称",
      minWidth: 160
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
      prop: "categoryName",
      label: "Andon类型",
      minWidth: 160
    },
    {
      prop: "needFeedback",
      label: "报修反馈",
      width: 120,
      align: "center",
      slots: {
        default: "needFeedback-default"
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
const queryConfig: ITableRequestConfig<[IAndonModelParams], ITableRow, true> = {
  api: getAndonModelListPaged,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        categoryId: currentNode.value?.id || undefined,
        ...getFormData()
      }
    ]
  }
}

/** Andon类型弹窗表单配置 */
const updateFaultCateFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    field: "categoryName",
    label: "类型名称",
    rules: [
      {
        required: true,
        message: "请输入类型名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入名称"
    }
  },
  {
    componentType: "el-input",
    field: "categoryNo",
    label: "类型编号",
    props: {
      placeholder: "不填则自动生成",
      disabled: !!updateFaultCateForm.value.id
    }
  },
  {
    componentType: "el-input",
    field: "remarks",
    label: "备注",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

onMounted(() => {
  getTreeList()
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

/** 点击树节点 */
const onNodeClick = (data: any) => {
  currentNode.value = cloneDeep(data)
  customTableRef.value?.requestData()
}

/** 获取andon类型树形列表 */
const getTreeList = async () => {
  const data: any = await getAndonCategoryAll()
  faultCateList.value = data
}

/** 新建、修改andon类型 */
const onSubmitAndonTypeClick = async () => {
  const valid = await updateFaultCateFormRef.value?.validateForm()
  if (!valid) return

  const params = {
    categoryName: updateFaultCateForm.value.categoryName,
    remarks: updateFaultCateForm.value.remarks,
    categoryNo: updateFaultCateForm.value.categoryNo || undefined,
    id: updateFaultCateForm.value.id || undefined
  }
  if (updateFaultCateForm.value.id) {
    await updateAndonType(params)
    ElMessage.success("编辑成功")
  } else {
    await createAndonType(params)
    ElMessage.success("新建成功")
  }
  updateFaultCateForm.value.show = false
  getTreeList()
  customTableRef.value?.requestData()
}

/** 删除andon类型 */
const onDeleteAndonTypeClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该Andon类型，是否继续?", "提示", {
    type: "warning"
  })
  await deleteAndonType(data.id)
  ElMessage.success("删除成功")
  if (currentNode.value.id === data.id) {
    currentNode.value = {}
  }
  getTreeList()
  customTableRef.value?.requestData()
}

/** 新建、修改andon类型 */
const onUpdateAndonTypeClick = (data?: any) => {
  updateFaultCateForm.value = {
    show: true,
    id: data?.id || "",
    categoryName: data?.id ? data.categoryName : "",
    remarks: data?.id ? data.remarks : "",
    categoryNo: data?.id ? data.categoryNo : "",
    title: data?.id ? EnumAndonModelTitle.EDIT : EnumAndonModelTitle.ADD
  }
}

/** 编辑、查看andon */
const onEditAndonClick = (data: any) => {
  selectedAndonId.value = data.id

  if (data.isEnabled) {
    // 查看详情
    detailVisible.value = true
  } else {
    // 编辑查看
    andonUpdateRef.value!.setVisible(true, data)
  }
}

/** 停用、启用andon */
const onSwitchStatusClick = async (data: any) => {
  await ElMessageBox.confirm(
    `此操作将${data.isEnabled ? "停用" : "启用"}该Andon，是否继续?`,
    "提示",
    {
      type: "warning"
    }
  )
  await updateEnabledStatusAndonModel({ id: data.id, newEnabledStatus: !data.isEnabled })
  ElMessage.success(`${data.isEnabled ? "停用" : "启用"}成功`)
  customTableRef.value?.requestData()
}

/** 删除andon */
const onDeleteAndonClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该Andon，是否继续?", "提示", {
    type: "warning"
  })
  await deleteAndonModel(data.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 0 0 12px;
    border-right: 1px solid #e8e8e8;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}
</style>
