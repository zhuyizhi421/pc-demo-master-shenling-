<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <CustomTitle :title="title" :is-table-title="false" show-short-bar>
        <div>
          <el-button @click="onBack()">返回</el-button>
          <el-button v-if="!isDetail" type="primary" @click="onSave()">保存</el-button>
          <el-button v-if="isDetail && isAuth" type="primary" @click="onEdit()">编辑</el-button>
        </div>
      </CustomTitle>

      <template v-if="isDetail">
        <CustomDescription
          :data="formData"
          :configs="detailConfig"
          style="padding: 0"
        ></CustomDescription>
      </template>
      <template v-else>
        <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :columns="3">
        </CustomForm>
      </template>
    </div>

    <div class="layout-child-page-content bottom-content">
      <CustomTitle title="梯度列表">
        <div v-if="!isDetail">
          <el-button type="primary" @click="onAddClick()" icon="Plus">增加梯度</el-button>
        </div>
      </CustomTitle>

      <div class="table-box">
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          :config="tableConfig"
          class="custom-table"
        >
          <template #batchNumMin-default="{ row }">
            <template v-if="!isDetail">
              <el-input v-model="row.batchNumMin" placeholder="请输入" clearable type="number" />
            </template>
            <template v-else>
              {{ row.batchNumMin }}
            </template>
          </template>

          <template #batchNumMax-default="{ row }">
            <template v-if="!isDetail">
              <el-input v-model="row.batchNumMax" placeholder="请输入" clearable type="number" />
            </template>
            <template v-else>
              {{ row.batchNumMax }}
            </template>
          </template>

          <template #sampleNum-default="{ row }">
            <template v-if="!isDetail">
              <el-input v-model="row.sampleNum" placeholder="请输入" clearable type="number" />
            </template>
            <template v-else>
              {{ row.sampleNum }}
            </template>
          </template>

          <template #operation-default="{ $index }">
            <el-button link type="danger" size="small" @click="onDeleteClick($index)"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { gradientModelCreateOrUpdate, queryGradientDetail } from "@/api/quality/gradientModel"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { ISaveGradientParams } from "@/types/quality-manage/inspection-task"

defineOptions({
  name: "GradientModelDetail"
})

const props = defineProps<{
  id?: string
  isEdit?: boolean
}>()
const emits = defineEmits<{
  (e: "close"): void
  (
    e: "change-status",
    data: {
      status: number // 0: 新增 1: 编辑 2: 详情
      isEdit?: boolean // 是否为编辑操作
      id?: string // 新增梯度模型成功后返回的id
    }
  ): void
  (e: "success"): void
}>()

const isAuth = useButtonAuth("DefectManage_update", "DefectManage_query")

const modelStatusResType = ref<{ label: string; value: number }[]>([
  {
    label: "停用",
    value: 0
  },
  {
    label: "启用",
    value: 1
  }
])
const title = computed(() => {
  if (!isDetail.value) {
    if (isUpdate.value) {
      return "编辑梯度模型"
    } else {
      return "新建梯度模型"
    }
  } else {
    return "梯度模型详情"
  }
})

const isUpdate = computed(() => !!props.isEdit)
const isDetail = computed(() => !!props.id && !isUpdate.value)

const [formData] = useResetRef<ISaveGradientParams>({
  id: "",
  itemList: [],
  modelName: "",
  modelNo: "",
  remarks: "",
  status: 1
})

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "modelNo",
    label: "梯度编号："
  },
  {
    field: "modelName",
    label: "梯度名称："
  },
  {
    field: "status",
    label: "状态：",
    formatter: ({ data: { status } }) => {
      return modelStatusResType.value.find((item) => item.value === status)?.label
    }
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: 3
  }
])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input",
    label: "梯度编号",
    field: "modelNo",
    rules: [
      {
        required: true,
        message: "请输入梯度编号",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入梯度编号"
    }
  },
  {
    componentType: "el-input",
    label: "梯度名称",
    field: "modelName",
    rules: [
      {
        required: true,
        message: "请输入梯度名称",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入梯度名称"
    }
  },
  {
    componentType: "el-select",
    label: "状态",
    field: "status",
    rules: [
      {
        required: true,
        message: "请选择状态",
        trigger: "change"
      }
    ],
    props: {
      clearable: false,
      placeholder: "请选择状态",
      customChildren: modelStatusResType.value.map((item) => {
        return { componentType: "el-option", props: { label: item.label, value: item.value } }
      })
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    colspan: 3,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ISaveGradientParams["itemList"]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      type: "index",
      prop: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "batchNumMin",
      label: "批量下限",
      minWidth: 160,
      slots: {
        default: "batchNumMin-default"
      }
    },
    {
      prop: "batchNumMax",
      label: "批量上限",
      minWidth: 160,
      slots: {
        default: "batchNumMax-default"
      }
    },
    {
      prop: "sampleNum",
      label: "样本数",
      minWidth: 160,
      slots: {
        default: "sampleNum-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 70,
      fixed: "right",
      hidden: () => {
        return isDetail.value
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

watch(
  () => props.id,
  async () => {
    if (props.id) {
      formData.value = await queryGradientDetail({ modelId: props.id })
      customTableData.value = formData.value.itemList
    }
  },
  {
    immediate: true
  }
)

const onAddClick = () => {
  let item = {
    id: "",
    batchNumMax: 0,
    batchNumMin: 0,
    sampleNum: 0
  }
  customTableData.value.push(item)
}

const onDeleteClick = (index: number) => {
  customTableData.value.splice(index, 1)
}

// 返回操作
const onBack = async () => {
  // 非详情状态下，返回时二次提示确认
  if (!isDetail.value) {
    await ElMessageBox.confirm("填写的数据将不会被保存,是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      closeOnClickModal: false,
      closeOnPressEscape: false,
      autofocus: false,
      type: "warning"
    })
  }

  if (!isUpdate.value) {
    emits("close")
  } else {
    emits("change-status", {
      status: 2
    })
  }
}

// 新增、编辑状态下保存操作
const onSave = async () => {
  if (customTableData.value.length === 0) {
    ElMessage.warning("请添加梯度")
    return
  }
  formData.value.itemList = customTableData.value
  const { id: newId } = await gradientModelCreateOrUpdate(formData.value)
  ElMessage.success(props.id ? "编辑成功" : "新建成功")
  emits("change-status", {
    status: 2,
    id: newId,
    isEdit: false
  })
  emits("success")
}

// 详情状态下编辑操作
const onEdit = () => {
  emits("change-status", {
    status: 1,
    isEdit: true
  })
}
</script>

<style lang="scss" scoped>
.bottom-content {
  flex: 1;
  overflow: hidden;
  padding-top: 0 !important;
}

:deep(.table-box) {
  flex: 1;
  display: flex;
  flex-direction: column;

  .custom-table {
    flex: 1;
    overflow: hidden;
  }
}

.footer-operation {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
