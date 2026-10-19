<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        :menuItems="treeList"
        :horizonScroll="true"
        label-attr="categoryName"
        @node-click="onNodeClick"
        :show-custom-icon="false"
        virtualize
      >
        <template #afterIcon="{ data }" v-if="isAuth">
          <template v-if="data.faultType">
            <el-icon class="mr-[10px]" @click="onEditFaultTypeClick(data)">
              <EditPen color="var(--tree-right-icon-color)" />
            </el-icon>
            <el-icon class="mr-[10px]" @click="onDeleteFaultTypeClick(data)">
              <CircleClose color="var(--tree-right-icon-color)" />
            </el-icon>
          </template>
        </template>
      </CustomTreeMenu>
    </div>
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        :label-width="120"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="Andon故障列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onOpenFaultDialog()"
              >新建Andon故障</el-button
            >
            <el-button type="primary" icon="Plus" @click="onOpenFaultTypeDialog()"
              >新建Andon故障类型</el-button
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

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewFaultClick(row)">
              {{ row.isEnabled || !isAuth ? "查看详情" : "编辑查看" }}
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
              @click="onDeleteFaultClick(row)"
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

    <!-- Andon故障类型弹窗 -->
    <CustomDialog
      :title="`${updateFaultCateForm.id ? '编辑' : '新建'}Andon故障类型`"
      v-model="updateFaultCateShow"
      @close="resetFaultCateForm()"
      size="mini"
    >
      <CustomForm
        ref="updateFaultCateFormRef"
        :label-width="110"
        v-model="updateFaultCateForm"
        :configs="updateFaultCateFormConfig"
      />
      <template #footer>
        <el-button @click="updateFaultCateShow = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitFaultTypeClick()">确 定</el-button>
      </template>
    </CustomDialog>

    <!-- Andon故障弹窗 -->
    <CustomDialog
      draggable
      :title="`${!isAuth ? '查看' : !updateFaultForm.id ? '新建' : updateFaultForm.isEnabled ? '' : '编辑'}Andon故障${updateFaultForm.isEnabled ? '详情' : ''}`"
      v-model="updateFaultShow"
      @close="resetFaultForm()"
      size="mini"
    >
      <CustomForm
        ref="updateFaultFormRef"
        :label-width="130"
        v-model="updateFaultForm"
        :configs="updateFaultFormConfig"
      />
      <template #footer>
        <el-button @click="updateFaultShow = false">取 消</el-button>
        <el-button type="primary" v-if="isAuth" @click="onSubmitFaultClick()">确 定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  querySystemFaultPageList,
  requestCreateSystemFault,
  requestDeleteSystemFault,
  requestSwitchStatusSystemFault,
  requestUpdateSystemFault
} from "@/api/baseInfo/system-fault/system-fault"
import {
  requestAllSystemFaultCategory,
  requestCreateSystemFaultCategory,
  requestDeleteSystemFaultCategory,
  requestUpdateSystemFaultCategory
} from "@/api/baseInfo/system-fault/system-fault-category"
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
import { EnumSystemFaultType } from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type {
  ISystemFaultInfo as ITableRow,
  ISystemFaultPageParams
} from "@/types/base-info/system-fault"
import { uuidv4 } from "@/utils"

defineOptions({
  name: "AndonFault"
})

const isAuth = useButtonAuth("AndonFault_update", "AndonFault_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "faultName",
    label: "Andon故障名称",
    value: "",
    placeholder: "请输入Andon故障名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  faultName?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const updateFaultCateShow = ref(false)
const [updateFaultCateForm, resetFaultCateForm] = useResetRef<any>({
  remarks: "",
  categoryNo: "",
  id: "",
  categoryName: ""
})
const updateFaultCateFormRef = ref<InstanceType<typeof CustomForm>>()
const faultCateList = ref<any[]>([])
const treeRootId = ref(uuidv4())
const treeList = computed(() => {
  const list = [
    {
      id: treeRootId.value,
      categoryName: "全部Andon故障类型",
      children: [] as any[]
    }
  ]
  list[0].children = faultCateList.value.map((item: any) => {
    return {
      ...item,
      children: []
    }
  })
  return list
})

const currentTreeNode = ref()

const updateFaultShow = ref(false)
const [updateFaultForm, resetFaultForm] = useResetRef<any>({
  faultName: "",
  faultNo: "",
  remarks: "",
  faultCategoryId: "",
  id: "",
  isEnabled: false
})
const updateFaultFormRef = ref<InstanceType<typeof CustomForm>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "faultNo",
      label: "Andon故障编号",
      minWidth: 160
    },
    {
      prop: "faultName",
      label: "Andon故障名称",
      minWidth: 160
    },
    {
      prop: "faultCategoryName",
      label: "Andon故障类型",
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
const queryConfig: ITableRequestConfig<[ISystemFaultPageParams], ITableRow, true> = {
  api: querySystemFaultPageList,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        faultCategoryId:
          currentTreeNode.value?.id === treeRootId.value ? undefined : currentTreeNode.value?.id,
        faultType: EnumSystemFaultType.Andon,
        ...getFormData()
      }
    ]
  }
}

onMounted(() => {
  getTreeList()
  customTableRef.value?.requestData()
})

/** Andon故障类型弹窗表单配置 */
const updateFaultCateFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "故障类型名称",
    field: "categoryName",
    componentType: "el-input",
    rules: [
      {
        required: true,
        message: "请输入故障类型名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入名称"
    }
  },
  {
    label: "故障类型编号",
    field: "categoryNo",
    componentType: "el-input",
    props: {
      disabled: !!updateFaultCateForm.value.id,
      placeholder: "不填则自动生成"
    }
  },
  {
    label: "备注",
    field: "remarks",
    componentType: "el-input",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

/** Andon故障弹窗表单配置  */
const updateFaultFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "Andon故障名称",
    field: "faultName",
    componentType: "el-input",
    rules: [
      {
        required: true,
        message: "请输入故障名称",
        trigger: "blur"
      }
    ],
    props: {
      disabled: !!updateFaultForm.value.id,
      placeholder: "请输入名称"
    }
  },
  {
    label: "故障编号",
    field: "faultNo",
    componentType: "el-input",
    props: {
      disabled: !!updateFaultForm.value.id,
      placeholder: "不填则自动生成"
    }
  },
  {
    label: "Andon故障类型",
    field: "faultCategoryId",
    componentType: "el-select",
    rules: [
      {
        required: true,
        message: "请选择故障类型",
        trigger: "blur"
      }
    ],
    props: {
      disabled: !!(updateFaultForm.value.id && updateFaultForm.value.isEnabled) || !isAuth.value,
      placeholder: "请选择故障类型",
      customChildren: faultCateList.value?.map((item: any) => {
        return {
          componentType: "el-option",
          props: {
            label: item.categoryName,
            value: item.id
          }
        }
      })
    }
  },
  {
    label: "备注",
    field: "remarks",
    componentType: "el-input",
    props: {
      type: "textarea",
      disabled: !!(updateFaultForm.value.id && updateFaultForm.value.isEnabled) || !isAuth.value,
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 点击andon故障类型树节点 */
const onNodeClick = (data: any) => {
  currentTreeNode.value = cloneDeep(data)
  onReset()
}

/** 获取故障类型树 */
const getTreeList = async () => {
  const res = await requestAllSystemFaultCategory({
    faultType: EnumSystemFaultType.Andon
  })
  faultCateList.value = res
}

/** 打开故障类型弹窗 */
const onOpenFaultTypeDialog = () => {
  updateFaultCateFormRef.value?.resetForm()
  updateFaultCateShow.value = true
}

/** 故障类型弹窗提交 */
const onSubmitFaultTypeClick = async () => {
  const valid = await updateFaultCateFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const params = {
    categoryName: updateFaultCateForm.value.categoryName,
    remarks: updateFaultCateForm.value.remarks,
    categoryNo: updateFaultCateForm.value.categoryNo || undefined,
    id: updateFaultCateForm.value.id || undefined,
    faultType: EnumSystemFaultType.Andon
  }
  if (updateFaultCateForm.value.id) {
    await requestUpdateSystemFaultCategory(params)
    ElMessage.success("编辑成功")
  } else {
    await requestCreateSystemFaultCategory(params)
    ElMessage.success("新建成功")
  }
  // 接口操作
  updateFaultCateShow.value = false
  getTreeList()
}

/** 删除故障类型 */
const onDeleteFaultTypeClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该故障类型, 是否继续?", "提示", {
    type: "warning"
  })
  await requestDeleteSystemFaultCategory(data.id)
  ElMessage.success("删除成功")
  getTreeList()
}

/** 修改故障类型 */
const onEditFaultTypeClick = (data: any) => {
  updateFaultCateShow.value = true
  updateFaultCateForm.value = {
    id: data.id,
    categoryName: data.categoryName,
    remarks: data.remarks,
    categoryNo: data.categoryNo
  }
}

/** 打开故障弹窗 */
const onOpenFaultDialog = () => {
  updateFaultFormRef.value?.resetForm()
  updateFaultForm.value.faultCategoryId =
    currentTreeNode.value?.id === treeRootId.value ? "" : currentTreeNode.value?.id
  updateFaultShow.value = true
}

/** 故障弹窗提交 */
const onSubmitFaultClick = async () => {
  if (updateFaultForm.value.id && updateFaultForm.value.isEnabled) {
    updateFaultShow.value = false
    return
  }
  const valid = await updateFaultFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const params = {
    faultName: updateFaultForm.value.faultName,
    remarks: updateFaultForm.value.remarks,
    faultNo: updateFaultForm.value.faultNo || undefined,
    faultCategoryId: updateFaultForm.value.faultCategoryId,
    id: updateFaultForm.value.id || undefined,
    faultType: EnumSystemFaultType.Andon
  }
  if (!updateFaultForm.value.id) {
    await requestCreateSystemFault(params)
    ElMessage.success("新建成功")
  } else {
    await requestUpdateSystemFault(params)
    ElMessage.success("编辑成功")
  }
  updateFaultShow.value = false
  customTableRef.value?.requestData()
}

/** 查看故andon障详情 */
const onReviewFaultClick = (data: any) => {
  updateFaultForm.value = {
    id: data.id,
    faultName: data.faultName,
    remarks: data.remarks,
    faultCategoryId: data.faultCategoryId,
    faultNo: data.faultNo,
    isEnabled: data.isEnabled
  }
  updateFaultShow.value = true
}

/** 切换故障状态 */
const onSwitchStatusClick = async (data: any) => {
  await ElMessageBox.confirm(
    `此操作将${data.isEnabled ? "停用" : "启用"}该故障, 是否继续?`,
    "提示",
    {
      type: "warning"
    }
  )
  await requestSwitchStatusSystemFault({ faultId: data.id, newEnabledStatus: !data.isEnabled })
  ElMessage.success(`${data.isEnabled ? "停用" : "启用"}成功`)
  customTableRef.value?.requestData()
}

/** 删除故障 */
const onDeleteFaultClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该故障, 是否继续?", "提示", {
    type: "warning"
  })
  await requestDeleteSystemFault(data.id)
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
