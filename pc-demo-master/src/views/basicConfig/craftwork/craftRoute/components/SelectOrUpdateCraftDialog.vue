<template>
  <CustomDialog
    v-model="dialogVisible"
    @close="emits('update:modelValue', false)"
    size="large"
    :title="title"
  >
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTitle title="工艺库">
      <div v-if="type === 'update' && !justSee">
        <el-button type="primary" icon="Plus" @click="updateCraftForm.show = true"
          >新建工艺</el-button
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
      <template #operation-default="{ row }">
        <el-button
          link
          type="primary"
          :disabled="justSee"
          size="small"
          @click="tableHandle('edit', row)"
          >编辑</el-button
        >
        <el-button
          link
          type="danger"
          size="small"
          :disabled="justSee"
          @click="tableHandle('delete', row)"
          >删除</el-button
        >
      </template>
    </CustomTable>
    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      border
      @change="customTableRef?.requestData()"
    />

    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button type="primary" v-if="!justSee" @click="onConfirmClick">
        {{ okText }}
      </el-button>
    </template>

    <CustomDialog
      v-model="updateCraftForm.show"
      :title="`${updateCraftForm.id ? '编辑' : '新建'}工艺`"
      size="mini"
      @close="onCancel"
    >
      <CustomForm
        ref="customFormRef"
        v-model="updateCraftForm"
        :label-width="80"
        :configs="formConfigs"
      >
      </CustomForm>

      <template #footer>
        <el-button @click="updateCraftForm.show = false">取消</el-button>
        <el-button type="primary" @click="updateCraftOk">确定</el-button>
      </template>
    </CustomDialog>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { createCraftItem, deleteCraftItem, getCraftPaged, updateCraftItem } from "@/api/craft"
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
import useResetRef from "@/hooks/useResetRef"
import type { ICraftItem as ITableRow, ICraftTechPageParams } from "@/types/base-info/craftRoute"

defineOptions({
  name: "SelectOrUpdateCraft"
})

// 此处对工艺的选择或者编辑处理，，具体根据外部传入类型判断，用于工艺创建或者 工艺管理
const props = withDefaults(
  defineProps<{
    type: "select" | "update"
    modelValue: boolean
    justSee: boolean
    multiple?: boolean
    selectedList?: any[]
    okText?: string
    title?: string
  }>(),
  {
    type: "update",
    multiple: false,
    okText: "确定",
    title: "工艺管理",
    justSee: false
  }
)

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk", data: ITableRow[]): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emits("update:modelValue", val)
})

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "工艺名称",
    value: "",
    placeholder: "请输入工艺名称"
  },
  {
    type: EnumComponentType.Input,
    key: "no",
    label: "工艺编号",
    value: "",
    placeholder: "请输入工艺编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  no: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "300px",
  columns: [
    {
      prop: "name",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "no",
      label: "工艺编号",
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
      width: 100,
      fixed: "right",
      get hidden() {
        return !(props.type === "update")
      },
      slots: {
        default: "operation-default"
      }
    },
    {
      prop: "select",
      label: "选择",
      width: 60,
      fixed: "right",
      align: "center",
      type: "selection",
      get hidden() {
        return !(props.type === "select")
      },
      get multiple() {
        return props.multiple
      }
    }
  ]
})

const [updateCraftForm, resetUpdateCraftForm] = useResetRef({
  show: false,
  name: "",
  no: "",
  remarks: "",
  id: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "工艺名称",
    field: "name",
    rules: [
      {
        required: true,
        message: "请输入工艺名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入工艺名称"
    }
  },
  {
    componentType: "el-input",
    label: "工艺编号",
    field: "no",
    props: {
      type: "text",
      placeholder: "不填则自动生成",
      get disabled() {
        return !!updateCraftForm.value.id
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

watch(
  () => props.modelValue,
  async (val) => {
    try {
      if (val) {
        await nextTick()
        await customTableRef.value?.requestData()
        if (props.type === "select" && props.selectedList?.length) {
          props.multiple
            ? customTableRef.value?.setSelectedRows(
                props.selectedList?.map((item) => item.id) || []
              )
            : customTableRef.value?.setSelectedRow(props.selectedList?.[0].id)
        }
      } else {
        resetForm()
        customTableData.value = []
        customTableRef.value?.clearSelectedRow()
      }
    } catch (error) {
      /* empty */
    }
  },
  {
    immediate: true
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

const queryConfig: ITableRequestConfig<[ICraftTechPageParams], ITableRow, true> = {
  api: getCraftPaged,
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

const onConfirmClick = () => {
  if (props.type === "select") {
    if (!props.multiple) {
      const selectedRow = customTableRef.value?.getCurrentSingleRow() as ITableRow
      if (!selectedRow) {
        return ElMessage.warning("请选择工艺")
      }
      emits("onOk", cloneDeep([selectedRow]))
    } else {
      const selectedRows = customTableRef.value?.getCurrentMultipleRows() as ITableRow[]
      if (!selectedRows?.length) {
        return ElMessage.warning("请选择工艺")
      }
      emits("onOk", cloneDeep(selectedRows))
    }
  }
  emits("update:modelValue", false)
}

const onCancel = () => {
  resetUpdateCraftForm()
  customFormRef.value?.resetForm()
}

const updateCraftOk = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  try {
    const params = {
      name: updateCraftForm.value.name,
      remarks: updateCraftForm.value.remarks,
      id: updateCraftForm.value.id
    }
    if (updateCraftForm.value.id) {
      await updateCraftItem(params)
      ElMessage.success("编辑成功")
    } else {
      await createCraftItem({ ...params, no: updateCraftForm.value.no || undefined })
      ElMessage.success("新建成功")
    }
    updateCraftForm.value.show = false
    customFormRef.value?.resetForm()
    await customTableRef.value?.requestData()
  } catch (error) {
    /* empty */
  }
}

const tableHandle = async (type: "edit" | "delete", data: ITableRow) => {
  try {
    if (type === "edit") {
      updateCraftForm.value = {
        show: true,
        no: data.no,
        name: data.name,
        remarks: data.remarks,
        id: data.id
      }
    } else {
      await ElMessageBox.confirm("此操作将永久删除该工艺, 是否继续?", "提示", {
        type: "warning"
      })
      await deleteCraftItem(data.id)
      await customTableRef.value?.requestData()
      ElMessage.success("删除成功")
    }
  } catch (error) {
    /* empty */
  }
}
</script>

<style scoped lang="scss"></style>
