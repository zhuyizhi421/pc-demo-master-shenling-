<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="单位列表">
          <div v-if="isAuth">
            <el-button icon="Plus" type="primary" @click="createOrEditHandle()">新建单位</el-button>
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
            <el-button
              link
              type="primary"
              size="small"
              :disabled="!isAuth"
              @click="createOrEditHandle(row)"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              :disabled="!isAuth"
              @click="deleteHandle(row.id)"
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

    <!-- 创建编辑单位 弹窗 -->
    <CustomDialog v-model="modalStatus.show" :title="`${modalStatus.type}单位`" size="mini">
      <CustomForm ref="customFormRef" v-model="unitForm" :configs="formConfigs"></CustomForm>
      <template #footer>
        <el-button @click="modalStatus.show = false">取消</el-button>
        <el-button @click="requestCreateOrEdit" type="primary">确定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts" name="unitsManage">
import { ElMessage, ElMessageBox } from "element-plus"

import { createUnit, deleteUnit, getUnitItemPaged, updateUnit } from "@/api/units"
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
import type { IUnitItem as ITableRow, IUnitParams } from "@/types/base-info/unit"

defineOptions({
  name: "UnitManagement"
})

enum ModalType {
  Create = "新建",
  Edit = "编辑",
  Close = ""
}

const isAuth = useButtonAuth("UnitManagement_update", "UnitManagement_query")
const modalStatus = reactive<{
  show: boolean
  type: ModalType
}>({
  show: false,
  type: ModalType.Close
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "unitName",
    label: "单位",
    value: "",
    placeholder: "请输入单位"
  },
  {
    type: EnumComponentType.Input,
    key: "unitCode",
    label: "单位编号",
    value: "",
    placeholder: "请输入单位编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  unitName: string
  unitCode: string
}>(searchFormData.value)

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
      prop: "unitName",
      label: "单位",
      minWidth: 160
    },
    {
      prop: "unitCode",
      label: "单位编号",
      minWidth: 160
    },
    {
      prop: "decimalNumber",
      label: "保留小数点",
      width: 120,
      align: "right"
    },
    // {
    //   prop: "",
    //   label: "创建时间",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "创建人",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "更新时间",
    //   minWidth: 160,
    //   align: "center"
    // },
    // {
    //   prop: "",
    //   label: "更新人",
    //   minWidth: 160,
    //   align: "center"
    // },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 100,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IUnitParams], ITableRow, true> = {
  api: getUnitItemPaged,
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

const unitForm = ref({
  unitName: "",
  unitCode: "",
  decimalNumber: 2,
  remarks: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "单位名称",
    field: "unitName",
    rules: [
      {
        required: true,
        message: "请输入单位名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入单位名称"
    }
  },
  {
    componentType: "el-input",
    label: "单位编号",
    field: "unitCode",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return modalStatus.type !== ModalType.Create
      }
    }
  },
  {
    componentType: "el-input-number",
    label: "保留小数点位",
    field: "decimalNumber",
    rules: [
      {
        required: true,
        message: "请输入保留小数点位",
        trigger: "blur"
      }
    ],
    props: {
      min: 0,
      max: 5,
      step: 1,
      stepStrictly: true
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

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

const deleteHandle = async (id: number) => {
  await ElMessageBox.confirm(
    "如果该单位已被其他业务关联，可能会引发数据错误，后果自负，确认一定要删除吗？",
    "提示",
    {
      type: "warning"
    }
  )
  await deleteUnit({ id })
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

const createOrEditHandle = async (data?: ITableRow) => {
  modalStatus.show = true
  customFormRef.value?.resetForm()
  if (data) {
    modalStatus.type = ModalType.Edit
    unitForm.value = cloneDeep(data)
    return
  }
  modalStatus.type = ModalType.Create
  unitForm.value = {
    unitName: "",
    unitCode: "",
    decimalNumber: 2,
    remarks: ""
  }
}

const requestCreateOrEdit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  try {
    if (modalStatus.type === ModalType.Create) {
      await createUnit(unitForm.value)
    } else if (modalStatus.type === ModalType.Edit) {
      await updateUnit(unitForm.value)
    }
    await customTableRef.value?.requestData()
    ElMessage.success(`${modalStatus.type}成功`)
    modalStatus.show = false
  } catch (error) {
    console.log("requestCreateOrEdit", error)
  }
}
</script>

<style scoped lang="scss">
.unitsManage {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.titleTableBox {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.el-table) {
    flex: 1;
    margin-bottom: 16px;
  }
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}
</style>
