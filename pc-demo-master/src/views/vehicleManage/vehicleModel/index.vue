<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="载具信息列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="onOpenVehicleInfoDialog()">
              新建载具信息
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
          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="onOpenVehicleInfoDialog(row)">
                {{ canEdit ? "编辑" : "查看" }}
              </el-button>
              <el-dropdown v-if="canEdit">
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button link type="danger" size="small" @click="onDeleteVehicleInfoClick(row.id)">
                        删除
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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

    <CustomDialog
      v-model="vehicleInfoModal.show"
      :title="vehicleInfoModal.title"
      size="medium"
      @close="resetVehicleInfoModal"
    >
      <CustomForm
        ref="vehicleModelFormRef"
        v-model="vehicleInfoModal"
        :configs="vehicleInfoModalFormConfig"
        :columns="2"
        :label-width="120"
      />

      <template #footer>
        <el-button @click="vehicleInfoModal.show = false">取消</el-button>
        <el-button v-if="canEdit" type="primary" @click="onSubmitVehicleInfoClick">确定</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestFlowDefinitionList } from "@/api/flowable"
import { getVehicleCategoryTreeList } from "@/api/operation/vehicle/vehicleCategory"
import {
  deleteVehicleModel,
  getVehicleModelPage,
  getVehicleModelSaveOrUpdate
} from "@/api/operation/vehicle/vehicleModel"
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
import UploadImage from "@/components/UploadImage/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type {
  IVehicleModelPageItem as ITableRow,
  IVehicleModelPageParams
} from "@/types/maintain/vehicle"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"
import { formatImgUrlPreview } from "@/utils/common"

defineOptions({
  name: "VehicleModel"
})

interface ICategoryOption {
  label: string
  value: string
  children?: ICategoryOption[]
}

const authType = useButtonAuth("VehicleModelManage_update", "VehicleModelManage_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const categoryOptions = ref<ICategoryOption[]>([])
const flowOptions = ref<IFlowableDefinitionItem[]>([])

const [vehicleInfoModal, resetVehicleInfoModal] = useResetRef({
  show: false,
  title: "新建载具信息",
  id: "",
  modelName: "",
  modelNo: "",
  vehicleCategoryId: "",
  repairProcdefId: "",
  scrapProcdefId: "",
  modelImg: "",
  modelImgPath: "",
  imageList: [] as IUploadPhoto[],
  remarks: ""
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "modelName",
    label: "类型名称",
    value: "",
    placeholder: "请输入类型名称"
  },
  {
    type: EnumComponentType.Input,
    key: "modelNo",
    label: "类型编号",
    value: "",
    placeholder: "请输入类型编号"
  },
  {
    type: EnumComponentType.Cascader,
    key: "vehicleCategoryId",
    label: "载具分类",
    value: "",
    placeholder: "请选择载具分类",
    options: categoryOptions,
    showAllLevels: false,
    props: {
      emitPath: false,
      checkStrictly: true
    }
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  modelName?: string
  modelNo?: string
  vehicleCategoryId?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const vehicleModelFormRef = ref<InstanceType<typeof CustomForm>>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "modelName",
      label: "类型名称",
      minWidth: 160
    },
    {
      prop: "modelNo",
      label: "类型编号",
      minWidth: 160
    },
    {
      prop: "vehicleCategoryName",
      label: "载具分类",
      minWidth: 160
    },
    {
      prop: "repairProcdefName",
      label: "维修流程",
      minWidth: 160
    },
    {
      prop: "scrapProcdefName",
      label: "报废流程",
      minWidth: 160
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 180
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IVehicleModelPageParams], ITableRow, true> = {
  api: getVehicleModelPage,
  getParams: () => [
    {
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: {
        ...getFormData()
      }
    }
  ]
}

const vehicleInfoModalFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "类型名称",
    componentType: "el-input",
    field: "modelName",
    rules: [{ required: true, message: "请输入类型名称", trigger: "blur" }],
    props: {
      placeholder: "请输入类型名称"
    }
  },
  {
    label: "类型编号",
    componentType: "el-input",
    field: "modelNo",
    props: {
      placeholder: "不填则自动生成",
      disabled: !!vehicleInfoModal.value.id
    }
  },
  {
    label: "载具分类",
    componentType: "el-cascader",
    field: "vehicleCategoryId",
    rules: [{ required: true, message: "请选择载具分类", trigger: "change" }],
    props: {
      options: categoryOptions.value,
      clearable: true,
      filterable: true,
      style: {
        width: "100%"
      },
      showAllLevels: false,
      props: {
        emitPath: false,
        checkStrictly: true
      },
      placeholder: "请选择载具分类"
    }
  },
  {
    label: "维修流程",
    componentType: "el-select",
    field: "repairProcdefId",
    props: {
      placeholder: "请选择维修流程",
      clearable: true,
      filterable: true,
      customChildren: flowOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.flowKey
        }
      }))
    }
  },
  {
    label: "报废流程",
    componentType: "el-select",
    field: "scrapProcdefId",
    props: {
      placeholder: "请选择报废流程",
      clearable: true,
      filterable: true,
      customChildren: flowOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.flowKey
        }
      }))
    }
  },
  {
    componentType: UploadImage,
    field: "imageList",
    label: "载具图片"
  },
  {
    componentType: "el-input",
    field: "remarks",
    label: "备注",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

onMounted(async () => {
  await Promise.all([getCategoryOptions(), getFlowOptions()])
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

const buildCategoryOptions = (rows: any[] = []): ICategoryOption[] => {
  return rows.map((item) => ({
    label: item.categoryName,
    value: String(item.id),
    children: buildCategoryOptions(item.subDirs || [])
  }))
}

const getCategoryOptions = async () => {
  const root = await getVehicleCategoryTreeList("0")
  categoryOptions.value = buildCategoryOptions(root?.subDirs || [])
}

const getFlowOptions = async () => {
  flowOptions.value = await requestFlowDefinitionList()
}

const onDeleteVehicleInfoClick = async (id: string) => {
  await ElMessageBox.confirm("此操作将永久删除该载具信息，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  await deleteVehicleModel(id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onOpenVehicleInfoDialog = (row?: ITableRow) => {
  if (row) {
    vehicleInfoModal.value = {
      show: true,
      title: canEdit.value ? "编辑载具信息" : "查看载具信息",
      id: row.id,
      modelName: row.modelName,
      modelNo: row.modelNo,
      vehicleCategoryId: row.vehicleCategoryId,
      repairProcdefId: row.repairProcdefId || "",
      scrapProcdefId: row.scrapProcdefId || "",
      modelImg: row.modelImg,
      modelImgPath: row.modelImgPath,
      imageList: row.modelImg
        ? [
            {
              fileId: row.modelImg,
              fileUrl: formatImgUrlPreview(row.modelImgPath)
            }
          ]
        : [],
      remarks: row.remarks
    }
    return
  }

  resetVehicleInfoModal()
  vehicleInfoModal.value.show = true
}

const onSubmitVehicleInfoClick = async () => {
  const valid = await vehicleModelFormRef.value?.validateForm()
  if (!valid) return

  await getVehicleModelSaveOrUpdate({
    id: vehicleInfoModal.value.id || undefined,
    modelName: vehicleInfoModal.value.modelName,
    modelNo: vehicleInfoModal.value.modelNo || undefined,
    vehicleCategoryId: vehicleInfoModal.value.vehicleCategoryId,
    repairProcdefId: vehicleInfoModal.value.repairProcdefId || undefined,
    scrapProcdefId: vehicleInfoModal.value.scrapProcdefId || undefined,
    remarks: vehicleInfoModal.value.remarks || undefined,
    modelImg: vehicleInfoModal.value.imageList[0]?.fileId || ""
  })

  ElMessage.success(vehicleInfoModal.value.id ? "编辑成功" : "新建成功")
  vehicleInfoModal.value.show = false
  customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.layout-main-page {
  overflow: hidden;

  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }

    &:focus-visible {
      outline: none;
    }
  }
}
</style>
