<!-- 包装容器详情弹窗 -->
<template>
  <CustomDialog v-model="visible" title="包装容器详情" size="large" @close="visible = false">
    <!-- 容器基础信息 -->
    <CustomDescription
      :data="detailData!"
      :configs="detailConfig"
      :label-width="130"
      style="padding: 0 0 10px"
    >
      <template #parentContainer-content>
        <el-button
          type="primary"
          link
          @click="onOpenPackDialog(detailData?.parentContainer?.id)"
          class="pack-container-code"
          >{{ detailData?.parentContainer?.barcode }}</el-button
        >
      </template>
    </CustomDescription>
    <!-- 产品汇总列表 -->
    <CustomTitle style="margin: 0">
      <template #title>
        <div class="flex items-center">
          产品汇总列表<el-tooltip
            class="box-item"
            effect="dark"
            content="包含此包装以及内部子包装的所有产品总数"
            placement="top-start"
          >
            <el-icon class="text-[16px] ml-[6px]"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
    </CustomTitle>
    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig"></CustomTable>
    <div class="bottom">
      <div class="bottom-left">
        <CustomTitle style="margin: 0">
          <template #title>
            <div class="flex items-center">装载的子包装</div>
          </template>
        </CustomTitle>
        <CustomTable
          ref="sonPackTableRef"
          v-model:table-data="sonPackTableData"
          :config="sonPackTableConfig"
        >
          <template #barcode-default="{ row }">
            <el-button
              type="primary"
              link
              @click="onOpenPackDialog(row.id)"
              class="pack-container-code"
              >{{ row.barcode }}</el-button
            >
          </template>
        </CustomTable>
      </div>
      <div class="bottom-right">
        <CustomTitle style="margin: 0">
          <template #title>
            <div class="flex items-center">
              装载的产品<el-tooltip
                class="box-item"
                effect="dark"
                content="仅包含直接装入此包装内的产品"
                placement="top-start"
              >
                <el-icon class="text-[16px] ml-[6px]"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </CustomTitle>
        <CustomTable
          ref="sonProductTableRef"
          v-model:table-data="sonProductTableData"
          :config="sonProductTableConfig"
        ></CustomTable>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
    </template>

    <PackContainerDialog v-model="packVisible" :id="chooseId" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue"

import { getPackContainerData } from "@/api/logistics/packContainer"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  IPackContainerBindProductItem,
  IPackContainerPageItem,
  IPackContainerTotalProductItem
} from "@/types/logistics/packContainer"
import { precisionConversion } from "@/utils/common"

defineOptions({
  name: "PackContainerDialog"
})

const props = defineProps<{
  modelValue: boolean
  id: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", val: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const detailData = ref<IPackContainerPageItem>({} as IPackContainerPageItem)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "包装容器标签码：",
    field: "barcode"
  },
  {
    label: "包装容器类型：",
    field: "containerType"
  },
  {
    label: "所属容器：",
    field: "parentContainer",
    slots: {
      content: "parentContainer-content"
    }
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "使用时间：",
    field: "useTime"
  }
])

// 产品汇总列表
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<IPackContainerTotalProductItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "200px",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      minWidth: 160
    },
    {
      prop: "defaultQuantity",
      label: "数量",
      minWidth: 120,
      align: "right",
      formatter: (row: IPackContainerTotalProductItem) => {
        return precisionConversion(row.defaultQuantity, row.decimalNumber)
      }
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

// 装载的子容器
const sonPackTableRef = ref<ComponentExposed<typeof CustomTable>>()
const sonPackTableData = ref<IPackContainerPageItem[]>([])
const sonPackTableConfig = ref<ITableConfig>({
  height: "200px",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160,
      slots: {
        default: "barcode-default"
      }
    },
    {
      prop: "containerType",
      label: "容器类型",
      minWidth: 160
    }
  ]
})

// 装载的产品
const sonProductTableRef = ref<ComponentExposed<typeof CustomTable>>()
const sonProductTableData = ref<IPackContainerBindProductItem[]>([])
const sonProductTableConfig = ref<ITableConfig>({
  height: "200px",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "defaultQuantity",
      label: "数量",
      minWidth: 120,
      align: "right",
      formatter: (row: IPackContainerBindProductItem) => {
        return precisionConversion(row.defaultQuantity, row.decimalNumber)
      }
    },
    {
      prop: "defaultUnitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

const packVisible = ref(false)
const chooseId = ref("")

const onOpenPackDialog = (id?: string) => {
  if (!id) return
  chooseId.value = id
  packVisible.value = true
}

const getPackContainerDetail = async () => {
  const res = await getPackContainerData(props.id)
  detailData.value = res
  tableData.value = res.totalProducts
  sonPackTableData.value = res.childContainers
  sonProductTableData.value = res.bindProducts
}

watch(
  () => props.modelValue,
  (judge) => {
    if (judge) {
      getPackContainerDetail()
    }
  }
)
</script>

<style lang="scss" scoped>
.pack-container-code {
  height: 100%;
  padding: 0;
  display: flex;
}
.bottom {
  display: flex;
  width: 100%;
  margin-top: 16px;

  .bottom-left {
    width: 35%;
    margin-right: 16px;
  }

  .bottom-right {
    flex: 1;
    overflow: hidden;
  }
}
</style>
