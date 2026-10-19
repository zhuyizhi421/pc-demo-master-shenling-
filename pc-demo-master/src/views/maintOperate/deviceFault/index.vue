<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        class="tree-sidebar"
        :menuItems="treeList"
        label-attr="categoryName"
        @node-click="onMenuNodeClick"
        :showCustomIcon="false"
      >
        <template #afterIcon="{ data }" v-if="isAuth">
          <template v-if="data.faultType">
            <el-button link class="mr-[4px]" @click="onEditFaultTypeClick(data)">
              <el-icon>
                <EditPen color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
            <el-button link class="mr-[4px]" @click="onDeleteFaultTypeClick(data)">
              <el-icon>
                <CircleClose color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
          </template>
          <template v-else>
            <el-button link class="mr-[4px]" @click="onOpenCateFault">
              <el-icon>
                <CirclePlus color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
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
        <CustomTitle title="设备故障列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onOpenFault">新建设备故障</el-button>
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
            <el-button link type="primary" size="small" @click="onEditFaultClick(row)">
              {{ row.isEnabled || !isAuth ? "查看详情" : "编辑查看" }}
            </el-button>
            <el-button
              link
              v-if="isAuth"
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

    <!-- 设备故障类型弹窗 -->
    <CustomDialog
      v-model="updateFaultCateShow"
      :title="`${updateFaultCateForm.id ? '编辑' : '新建'}设备故障类型`"
      @close="resetFaultCateForm()"
      size="mini"
    >
      <CustomForm
        ref="updateFaultCateFormRef"
        v-model="updateFaultCateForm"
        :label-width="110"
        :configs="updateFaultCateFormConfigs"
      >
      </CustomForm>

      <template #footer>
        <el-button @click="updateFaultCateShow = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitFaultTypeClick()">确 定</el-button>
      </template>
    </CustomDialog>

    <!-- 设备故障弹窗 -->
    <CustomDialog
      v-model="updateFaultShow"
      :title="`${!isAuth ? '查看' : !updateFaultForm.id ? '新建' : updateFaultForm.isEnabled ? '' : '编辑'}设备故障${updateFaultForm.isEnabled ? '详情' : ''}`"
      @close="resetFaultForm()"
      size="mini"
    >
      <CustomForm
        ref="updateFaultFormRef"
        v-model="updateFaultForm"
        :label-width="110"
        :configs="updateFaultFormConfigs"
      >
      </CustomForm>
      <template #footer>
        <el-button @click="updateFaultShow = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="!!updateFaultForm.isEnabled || !isAuth"
          @click="onSubmitFaultClick()"
          >确 定</el-button
        >
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
  name: "DeviceFault"
})

const isAuth = useButtonAuth("DeviceFault_update", "DeviceFault_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "faultName",
    label: "设备故障名称",
    value: "",
    placeholder: "请输入设备故障名称"
  },
  {
    type: EnumComponentType.Select,
    key: "isEnabled",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "启用",
        value: true
      },
      {
        label: "停用",
        value: false
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  faultName: string
  isEnabled: boolean
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const [updateFaultCateForm, resetFaultCateForm] = useResetRef<any>({
  remarks: "",
  categoryNo: "",
  id: "",
  categoryName: ""
})

const [updateFaultForm, resetFaultForm] = useResetRef<any>({
  faultName: "",
  faultNo: "",
  remarks: "",
  faultCategoryId: "",
  id: "",
  isEnabled: false
})

const treeRootId = ref(uuidv4())
const currentTreeNode = ref()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "faultNo",
      label: "设备故障编号",
      minWidth: 160
    },
    {
      prop: "faultName",
      label: "设备故障名称",
      minWidth: 160
    },
    {
      prop: "faultCategoryName",
      label: "设备故障类型",
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
        faultCategoryId:
          currentTreeNode.value?.id === treeRootId.value ? undefined : currentTreeNode.value?.id,
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        faultType: EnumSystemFaultType.Equipment,
        ...getFormData()
      }
    ]
  }
}

const updateFaultCateFormRef = ref<InstanceType<typeof CustomForm>>()
const updateFaultCateFormConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "故障类型名称",
    field: "categoryName",
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
    componentType: "el-input",
    label: "故障类型编号",
    field: "categoryNo",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return !!updateFaultCateForm.value.id
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      placeholder: "请输入备注",
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    }
  }
])
const updateFaultCateShow = ref(false)
const faultCateList = ref<any[]>([])

const updateFaultShow = ref(false)
const updateFaultFormRef = ref<InstanceType<typeof CustomForm>>()
const updateFaultFormConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "设备故障名称",
    field: "faultName",
    rules: [
      {
        required: true,
        message: "请输入故障名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入名称",
      get disabled() {
        return !!(updateFaultForm.value.id && updateFaultForm.value.isEnabled) || !isAuth
      }
    }
  },
  {
    componentType: "el-input",
    label: "故障编号",
    field: "faultNo",
    props: {
      placeholder: "不填则自动生成",
      get disabled() {
        return !!updateFaultForm.value.id
      }
    }
  },
  {
    componentType: "el-select",
    label: "设备故障类型",
    field: "faultCategoryId",
    rules: [
      {
        required: true,
        message: "请选择故障类型",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请选择故障类型",
      get disabled() {
        return !!(updateFaultForm.value.id && updateFaultForm.value.isEnabled) || !isAuth
      },
      get customChildren() {
        return faultCateList.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: item.categoryName,
              value: item.id
            }
          }
        })
      }
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remark",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true,
      get disabled() {
        return !!(updateFaultForm.value.id && updateFaultForm.value.isEnabled) || !isAuth
      }
    }
  }
])

const treeList = computed(() => {
  const list: any[] = [
    {
      id: treeRootId.value,
      categoryName: "全部设备故障类型",
      children: []
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

onMounted(() => {
  getMenuTreeData()
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

const onOpenFault = () => {
  resetFaultForm()
  updateFaultFormRef.value?.resetForm()
  console.log(currentTreeNode.value)
  updateFaultForm.value.faultCategoryId =
    currentTreeNode.value?.id === treeRootId.value ? "" : currentTreeNode.value?.id
  updateFaultShow.value = true
}

const onOpenCateFault = () => {
  resetFaultCateForm()
  updateFaultCateFormRef.value?.resetForm()
  updateFaultCateShow.value = true
}

/** 菜单节点点击 */
const onMenuNodeClick = (data: any) => {
  currentTreeNode.value = cloneDeep(data)
  onReset()
}

/** 获取菜单树数据 */
const getMenuTreeData = async () => {
  const res = await requestAllSystemFaultCategory({
    faultType: EnumSystemFaultType.Equipment
  })
  faultCateList.value = res
}

/** 故障类型弹窗提交 */
const onSubmitFaultTypeClick = async () => {
  try {
    const valid = updateFaultCateFormRef.value?.validateForm()
    if (!valid) return
    const params = {
      categoryName: updateFaultCateForm.value.categoryName,
      remarks: updateFaultCateForm.value.remarks,
      categoryNo: updateFaultCateForm.value.categoryNo || undefined,
      id: updateFaultCateForm.value.id || undefined,
      faultType: EnumSystemFaultType.Equipment
    }
    if (updateFaultCateForm.value.id) {
      await requestUpdateSystemFaultCategory(params)
    } else {
      await requestCreateSystemFaultCategory(params)
    }
    updateFaultCateShow.value = false
    ElMessage.success(updateFaultCateForm.value.id ? "编辑成功" : "新建成功")
    getMenuTreeData()
  } catch (error) {
    console.log(error)
  }
}

/** 故障类型删除 */
const onDeleteFaultTypeClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该故障类型, 是否继续?", "提示", {
    type: "warning"
  })
  await requestDeleteSystemFaultCategory(data.id)
  ElMessage.success("删除成功")
  getMenuTreeData()
}

/** 故障类型编辑 */
const onEditFaultTypeClick = (data: any) => {
  updateFaultCateFormRef.value?.resetForm()
  updateFaultCateForm.value = {
    id: data.id,
    categoryName: data.categoryName,
    remarks: data.remarks,
    categoryNo: data.categoryNo
  }
  updateFaultCateShow.value = true
}

/** 设备故障提交 */
const onSubmitFaultClick = async () => {
  try {
    if (updateFaultForm.value.id && updateFaultForm.value.isEnabled) {
      updateFaultShow.value = false
      return
    }
    const valid = updateFaultFormRef.value?.validateForm()
    if (!valid) return
    const params = {
      faultName: updateFaultForm.value.faultName,
      faultNo: updateFaultForm.value.faultNo || undefined,
      remarks: updateFaultForm.value.remarks,
      faultCategoryId: updateFaultForm.value.faultCategoryId,
      id: updateFaultForm.value.id || undefined,
      faultType: EnumSystemFaultType.Equipment
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
  } catch (error) {
    console.log(error)
  }
}

/** 编辑设备故障 */
const onEditFaultClick = (data: any) => {
  updateFaultFormRef.value?.resetForm()
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

/** 删除设备故障 */
const onDeleteFaultClick = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该故障, 是否继续?", "提示", {
    type: "warning"
  })
  await requestDeleteSystemFault(data.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
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
</script>

<style scoped lang="scss">
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 1px solid #e8e8e8;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}

.tree-sidebar {
  height: 100%;
  overflow-y: auto;

  &:deep(.el-button + .el-button) {
    margin-left: 0px;
  }
}
</style>
