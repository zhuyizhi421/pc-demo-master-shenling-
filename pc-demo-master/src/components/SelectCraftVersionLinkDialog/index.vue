<template>
  <CustomDialog v-model="visible" title="选择工艺路线" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    >
      <template #status-default="{ row }">
        <el-tag v-if="row.publishStatus === EnumCraftStatus.PUBLISHED" type="success">{{
          EnumCraftStatusMap[row.publishStatus as EnumCraftStatus]
        }}</el-tag>
        <el-tag v-else-if="row.publishStatus === EnumCraftStatus.DESIGN" type="primary">{{
          EnumCraftStatusMap[row.publishStatus as EnumCraftStatus]
        }}</el-tag>
        <el-tag v-else-if="row.publishStatus === EnumCraftStatus.INVALID" type="danger">{{
          EnumCraftStatusMap[row.publishStatus as EnumCraftStatus]
        }}</el-tag>
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="lookDetail(row)">选择工序</el-button>
      </template>
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="customTableRef?.requestData()"
    />
  </CustomDialog>

  <!-- 子工序 -->
  <CustomDialog v-model="show" title="选择工序" size="medium">
    <CustomTable
      ref="subCustomTableRef"
      v-model:table-data="subTableData"
      :config="subTableConfig"
      :query-config="subQueryConfig"
    >
      <template #operation-default="{ row }">
        <el-checkbox
          class="table-checkbox"
          :disabled="disabledIds.includes(row.id)"
          :model-value="selectedDataId.has(row.id)"
          @change="selectChange(row)"
        />
      </template>
    </CustomTable>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" @click="modalClick"> 复制 </el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts" name="SelectCraftVersionLink">
import { ElMessage } from "element-plus"

import { getTechProcessList, queryCraftRoutePageList, type TechProcessInfo } from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"
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
import {
  EnumCraftStatus,
  EnumCraftStatusMap,
  EnumCraftType,
  EnumCraftTypeMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import type { ICraftRouteItem as ITableRow, ICraftRouteParams } from "@/types/base-info/craftRoute"

import type { ICraftVersionLinkDialogEmits, ICraftVersionLinkDialogProps } from "./type"

defineOptions({
  name: "SelectCraftVersionLinkDialog"
})

const props = withDefaults(defineProps<ICraftVersionLinkDialogProps>(), {
  multiple: true,
  productNo: "",
  disabledIds: () => []
})
const emits = defineEmits<ICraftVersionLinkDialogEmits>()

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "queryProductName",
    label: "产品名称",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    key: "queryProductNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Select,
    key: "publishStatusList",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "设计中",
        value: 1
      },
      {
        label: "已发布",
        value: 2
      },
      {
        label: "已作废",
        value: 3
      }
    ],
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "sourceType",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: [
      {
        label: "mes",
        value: 1
      },
      {
        label: "erp",
        value: 2
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  queryProductName?: string
  queryProductNo?: string
  sourceType?: number
  publishStatusList?: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const selectedDataId = ref(new Map<string, TechProcessInfo>())
const show = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "name",
      label: "产品名称",
      width: 160
    },
    {
      prop: "productModel.code",
      label: "产品编号",
      width: 160
    },
    {
      prop: "no",
      label: "工艺路线编号",
      width: 160
    },
    {
      prop: "version",
      label: "路线版本",
      width: 120,
      align: "center"
    },
    {
      prop: "techVersion.sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumProductionOrderSourceMap[row.sourceType as EnumProductionOrderSource]
      }
    },
    {
      prop: "techVersion.status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160
    },
    {
      prop: "remarks",
      label: "备注",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const subTechVersionId = ref("")
const subCustomTableRef = ref<ComponentExposed<typeof CustomTable>>()
const subTableData = ref<TechProcessInfo[]>([])
const subTableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "processSerial",
      label: "工序",
      minWidth: 120
    },
    {
      prop: "name",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "type",
      label: "工艺类型",
      width: 120,
      align: "center",
      formatter: (row: TechProcessInfo) => {
        return EnumCraftTypeMap[row.type as EnumCraftType]
      }
    },
    {
      prop: "nature",
      label: "性质",
      width: 120,
      align: "center",
      formatter: (row: TechProcessInfo) => {
        return row.nature === 1 ? "自制" : "委外"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 70,
      fixed: "right",
      align: "center",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      searchList.value.find((item) => item.key === "queryProductNo")!.value = props.productNo
      nextTick(async () => {
        await customTableRef.value?.requestData()
        if (props.selectedList?.length) {
          props.selectedList.forEach((item: any) => {
            selectedDataId.value.set(item.id, item) // 回显
          })
        }
      })
    } else {
      resetForm()
      customTableData.value = []
      selectedDataId.value.clear()
    }
  }
)

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[ICraftRouteParams], ITableRow, true> = {
  api: queryCraftRoutePageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: getFormData()
      }
    ]
  }
}

const subQueryConfig: ITableRequestConfig<[string], TechProcessInfo, false> = {
  api: getTechProcessList,
  getParams: () => {
    return [subTechVersionId.value]
  }
}

const selectChange = (row: TechProcessInfo) => {
  if (selectedDataId.value.has(row.id)) {
    selectedDataId.value.delete(row.id)
  } else {
    if (!props.multiple) {
      selectedDataId.value.clear()
    }
    selectedDataId.value.set(row.id, row)
  }
}

const modalClick = () => {
  if (!selectedDataId.value.size) {
    ElMessage.warning("请选择工艺")
    return
  }
  emits("success", [...selectedDataId.value.values()])
  show.value = false
  visible.value = false
}

const lookDetail = (row: ITableRow) => {
  subTechVersionId.value = row?.techVersion?.id
  show.value = true
  nextTick(async () => {
    await subCustomTableRef.value?.requestData()
  })
}
</script>

<style scoped lang="scss">
.table-checkbox {
  &:deep(.el-checkbox__label) {
    padding: 0;
  }

  &:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;

    &::before {
      width: 17px;
      top: 7px;
    }

    &::after {
      width: 4px;
      height: 10px;
      left: 6px;
      top: 1px;
    }
  }
}
</style>
