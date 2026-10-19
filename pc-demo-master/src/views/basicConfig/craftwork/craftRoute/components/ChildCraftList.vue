<!-- 工序列表 -->
<template>
  <div class="child-craft">
    <CustomTitle title="">
      <div v-if="!isOnlyView">
        <el-button
          type="primary"
          icon="Plus"
          @click="onRefProcessClick()"
          style="margin-right: 12px"
          >复制已有路线工序</el-button
        >

        <el-button type="primary" icon="Plus" @click="onAddCraftClick()">新建工序</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="customTableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #processSerial-default="{ row }">
        <el-input
          v-model="row.processSerial"
          placeholder="请输入"
          :disabled="isOnlyView"
          @change="saveSubTech(row)"
        />
      </template>

      <template #techId-default="{ row }">
        <el-select-v2
          v-model="row.techId"
          @change="onChildCraftChange($event, row)"
          :options="childCraftOptions"
          :disabled="isOnlyView"
          popper-class="auto-width-dropdown"
          filterable
        />
      </template>

      <template #craftTypeName-default="{ row }">
        <span>{{ getCraftTypeName(row) || "-" }}</span>
      </template>

      <template #nature-default="{ row }">
        <el-select
          placeholder="请选择生产方式"
          v-model="row.nature"
          @change="saveSubTech(row)"
          :disabled="
            isOnlyView ||
            row.type == EnumCraftType.GROUP ||
            row.type == EnumCraftType.AND ||
            isAndCraft ||
            isGroupCraft 
          "
        >
          <el-option
            v-for="(value, key) in EnumProductionTypeMap"
            :key="key"
            :label="value"
            :value="+key"
          />
        </el-select>
      </template>

      <template #preProcessListNums-default="{ row }">
        <el-select
          v-model="row.preProcessListNums"
          :multiple="true"
          :disabled="isOnlyView"
          placeholder=""
          clearable
          @change="saveSubTech(row)"
        >
          <el-option
            v-for="item in preProcessListOptions"
            :value="item.id"
            :label="item.processSerial"
            :key="item.id"
            :disabled="item.processSerial == row.processSerial"
          ></el-option>
        </el-select>
      </template>

      <template #productionSchedulingType-default="{ row }">
        <el-select
          v-model="row.productionSchedulingType"
          @change="saveSubTech(row)"
          :disabled="
            isOnlyView ||
            row.type === EnumCraftType.AND ||
            row.nature === EnumProductionType.OUTSOURCING
          "
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #codeRelate-default="{ row }">
        <el-select
          v-if="
            row.productionSchedulingType !== 0 &&
            row.bizType !== EnumCraftBizType.PACK &&
            !isAndCraft
          "
          v-model="row.codeRelate"
          @change="saveSubTech(row)"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </template>

      <template #defaultCodeRelationType-default="{ row }">
        <el-select
          v-if="
            row.productionSchedulingType !== 0 &&
            row.bizType !== EnumCraftBizType.PACK &&
            row.codeRelate === 1 &&
            !isAndCraft
          "
          v-model="row.defaultCodeRelationType"
          @change="saveSubTech(row)"
          :disabled="isOnlyView"
        >
          <el-option
            v-for="(value, key) in EnumBarcodeDefaultRelevanceModeMap"
            :key="key"
            :label="value"
            :value="+key"
          />
        </el-select>
      </template>

      <template #vehicleRelate-default="{ row }">
        <el-select
          v-if="row.productionSchedulingType !== 0 && row.bizType !== EnumCraftBizType.PACK"
          v-model="row.vehicleRelate"
          @change="saveSubTech(row)"
          :disabled="isOnlyView"
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
          <el-option label="不限" :value="2" />
        </el-select>
      </template>

      <template #operation-default="{ row }">
        <div>
          <el-button type="primary" size="small" link @click="handleCurrentChange(row)" v-if="isOnlyView">生产要素查看</el-button>
          <el-button type="primary" size="small" link @click="handleCurrentChange(row)" v-else>生产要素配置</el-button>
          <el-button
            v-if="!isOnlyView"
            style="margin-left: 6px"
            type="danger"
            size="small"
            link
            @click="onDeleteChildCraftClick(row)"
            >删除</el-button
          >
        </div>
        <div>
          <el-button
            v-if="row.type == EnumCraftType.GROUP"
            type="primary"
            link
            size="small"
            @click="onCraftGroupConfigClick(row)"
            >配置工艺组</el-button
          >
          <el-button
            v-if="row.type == EnumCraftType.AND"
            type="primary"
            link
            size="small"
            @click="onCraftAndConfigClick(row)"
            >配置且工艺</el-button
          >
        </div>
      </template>
    </CustomTable>


    <!-- 引用工序弹窗 -->
    <SelectCraftVersionLinkDialog
      v-model="craftHandleData.show"
      :product-no="props.productModelNo"
      :selected-list="craftHandleData.selectedList"
      multiple
      @success="onReferenceCraftSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import type { TechProcessInfo } from "@/api/craft"
import {
  createTech,
  deletetechProcess,
  getSonTechProcessInfo,
  getTechProcessList,
  queryAllCraftList,
  quoteTech,
  saveTech
} from "@/api/craft"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectCraftVersionLinkDialog from "@/components/SelectCraftVersionLinkDialog/index.vue"
import {
  EnumBarcodeDefaultRelevanceModeMap,
  EnumCraftBizType,
  EnumCraftStatus,
  EnumCraftType,
  EnumCraftTypeMap,
  EnumParentCraftType,
  EnumProductionType,
  EnumProductionTypeMap
} from "@/constant/enums"
import type { ICraftConfigInfo } from "@/types/base-info/craftRoute"

interface PreProcessListOption {
  id: string
  processSerial: string
}
interface ITableRow extends TechProcessInfo {
  preProcessListNums: string[]
}

const props = withDefaults(
  defineProps<{
    craftVersionId: string
    craftType: EnumParentCraftType // 工艺类型
    status: EnumCraftStatus // 工艺状态
    productModelNo?: string // 产品编号
    productModelName?: string // 产品名称
  }>(),
  {
    productModelNo: "",
    productModelName: ""
  }
)
const emit = defineEmits<{
  (e: "config-craft", data: ICraftConfigInfo): void
  (e: "current-change", data: ITableRow): void
}>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "300px",
  highlightCurrentRow: true,
  isSaveColumnWidth: true,
  localTableKey: "ChildListTable",
  columns: [
    {
      prop: "processSerial",
      label: "工序",
      width: 90,
      align: "center",
      slots: {
        default: "processSerial-default"
      }
    },
    {
      prop: "techId",
      label: "工艺名称",
      minWidth: 140,
      align: "center",
      slots: {
        default: "techId-default"
      }
    },
    {
      prop: "craftTypeName",
      label: "工艺类型",
      minWidth: 100,
      align: "center",
      slots: {
        default: "craftTypeName-default"
      }
    },
    {
      prop: "nature",
      label: "性质",
      minWidth: 100,
      align: "center",
      slots: {
        default: "nature-default"
      }
    },
    {
      prop: "preProcessListNums",
      label: "前置工序",
      minWidth: 140,
      align: "center",
      hidden: () => {
        return isAndCraft.value
      },
      slots: {
        default: "preProcessListNums-default"
      }
    },
    {
      prop: "productionSchedulingType",
      label: "要求排产",
      minWidth: 90,
      align: "center",
      slots: {
        default: "productionSchedulingType-default"
      }
    },
    {
      prop: "codeRelate",
      label: "关联条码",
      minWidth: 90,
      align: "center",
      slots: {
        default: "codeRelate-default"
      }
    },
    {
      prop: "defaultCodeRelationType",
      label: "关联条码方式",
      minWidth: 140,
      align: "center",
      slots: {
        default: "defaultCodeRelationType-default"
      }
    },
    {
      prop: "vehicleRelate",
      label: "关联载具",
      minWidth: 90,
      align: "center",
      slots: {
        default: "vehicleRelate-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      minWidth: 120,
      fixed:"right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const preProcessListOptions = ref<PreProcessListOption[]>([]) // 前置工序下拉选项
const currentSelectedRow = shallowRef<ITableRow>() // 当前选中子工序的行
const childCraftOptions = ref<
  { value: string; label: string; no: string; craftTypeId?: string; craftTypeNo?: string; craftTypeName?: string }[]
>([]) // 子工艺下拉选项

// 初始化引用已有工序弹窗数据
function craftHandleDataInit() {
  return {
    show: false,
    selectedList: [],
    disabledIds: []
  } as {
    show: boolean
    selectedList: number[]
    disabledIds: string[]
  }
}
const craftHandleData = ref(craftHandleDataInit())

const isAndCraft = computed(() => props.craftType === EnumParentCraftType.CRAFT_AND) // 是否为且工艺
const isGroupCraft = computed(() => props.craftType === EnumParentCraftType.CRAFT_GROUP) // 是否为工艺组

const isOnlyView = inject("isOnlyView")

onBeforeMount(() => {
  getChildCraftList()
  getTechQueryPageList()
})

watch(
  () => props.craftVersionId,
  () => {
    getChildCraftList()
  }
)

// 获取可用子工艺下拉列表
const getTechQueryPageList = async () => {
  const res = await queryAllCraftList({})
  childCraftOptions.value = res.map((item) => ({
    value: item.id,
    label: item.name,
    no: item.no,
    craftTypeId: item.craftTypeId,
    craftTypeNo: item.craftTypeNo,
    craftTypeName: item.craftTypeName
  }))
  customTableData.value = customTableData.value.map((item) => syncCraftMeta(item))
}

// 获取子工艺列表数据
const getChildCraftList = async () => {
  if (props.craftVersionId) {
    try {
      customTableRef.value?.setLoading(true)
      const res = await getTechProcessList(props.craftVersionId)
      customTableData.value = res.map((item, index) => ({
        ...syncCraftMeta(item),
        sortNum: index + 1,
        preProcessListNums: (item.preProcessList && item.preProcessList.map((p) => p.id)) || []
      }))
      // 前置工序可选列表
      preProcessListOptions.value = customTableData.value.map((item) => {
        return {
          id: item.id,
          processSerial: item.processSerial
        }
      })

      // 当前选中子工序回显
      if (currentSelectedRow?.value?.id) {
        const index = customTableData.value.findIndex(
          (item) => item.id == currentSelectedRow?.value?.id
        )
        if (index > -1) {
          customTableRef.value?.setHighLightRow(customTableData.value[index].id)
        } else {
          currentSelectedRow.value = undefined
        }
      }
      customTableRef.value?.setLoading(false)
    } catch (error) {
      customTableRef.value?.setLoading(false)
    }
  }
}

/** 新增工艺 */
const onAddCraftClick = async () => {
  const previousLastProcess = customTableData.value.at(-1)
  try {
    customTableRef.value?.setLoading(true)
    await createTech({
      techVersionIdMain: props.craftVersionId,
      type: 1
    })
  } finally {
    await getChildCraftList()
  }

  const newLastProcess = customTableData.value.at(-1)
  if (
    previousLastProcess?.id &&
    newLastProcess?.id &&
    newLastProcess.id !== previousLastProcess.id &&
    !newLastProcess.preProcessListNums?.length
  ) {
    newLastProcess.preProcessListNums = [previousLastProcess.id]
    await saveSubTech(newLastProcess)
  }
}

//点击 引用子工艺
const onRefProcessClick = () => {
  craftHandleData.value = craftHandleDataInit()
  craftHandleData.value.show = true
  const arr = customTableData.value.map((item) => item.id)
  craftHandleData.value.disabledIds = arr
}

// 选择引用工序弹窗回调
const onReferenceCraftSuccess = async (data: TechProcessInfo[]) => {
  if (data.length) {
    const paramsItem = data.map((item: any) => ({
      techVersionIdMain: props.craftVersionId,
      techVersionIdSon: item.techVersionId
    }))
    await quoteTech(paramsItem)
    await getChildCraftList()
  }
}

const syncCraftMeta = <T extends TechProcessInfo>(row: T): T => {
  const current = childCraftOptions.value.find((item) => item.value === row.techId)
  return {
    ...row,
    craftTypeId: current?.craftTypeId || row.craftTypeId || "",
    craftTypeNo: current?.craftTypeNo || row.craftTypeNo || "",
    craftTypeName: current?.craftTypeName || row.craftTypeName || ""
  }
}

const getCraftTypeName = (row: ITableRow) => {
  return syncCraftMeta(row).craftTypeName || ""
}

/** 切换子工艺名称 */
const onChildCraftChange = (val: string, row: ITableRow) => {
  const current = childCraftOptions.value.find((t) => t.value == val)
  if (current) {
    row.techNo = current.no
    row.name = current.label
    row.craftTypeId = current.craftTypeId
    row.craftTypeNo = current.craftTypeNo
    row.craftTypeName = current.craftTypeName
  }
  saveSubTech(row)
}

//选择子工艺
const handleCurrentChange = async (data: ITableRow) => {
  if (data?.id) {
    currentSelectedRow.value = data
  }
  emit("current-change", cloneDeep(currentSelectedRow.value!))
}

// 删除子工艺
const onDeleteChildCraftClick = async (row: ITableRow) => {
  try {
    customTableRef.value?.setLoading(true)
    await deletetechProcess(row.id)
  } finally {
    await getChildCraftList()
  }
}

/** 配置工艺组 */
const onCraftGroupConfigClick = async (row: ITableRow) => {
  if (!row.techId) {
    ElMessage.warning("请先选择工艺")
  } else {
    const data = await getSonTechProcessInfo(row.techVersionId)
    emit("config-craft", { ...data, isCraftGroup: true })
  }
}

/** 配置且工艺 */
const onCraftAndConfigClick = async (row: ITableRow) => {
  if (!row.techId) {
    ElMessage.warning("请先选择工艺")
  } else {
    const data = await getSonTechProcessInfo(row.techVersionId)
    emit("config-craft", { ...data, isCraftAnd: true })
  }
}

//保存单条子工艺
const saveSubTech = async (row: ITableRow) => {
  const currentRow = syncCraftMeta(row)
  try {
    customTableRef.value?.setLoading(true)
    await saveTech({
      id: currentRow.id,
      name: currentRow.name,
      nature: currentRow.nature,
      bizTypeName: currentRow.bizTypeName,
      bizType: currentRow.bizType,
      craftTypeId: currentRow.craftTypeId,
      craftTypeNo: currentRow.craftTypeNo,
      craftTypeName: currentRow.craftTypeName,
      preProcessList: currentRow.preProcessListNums,
      processSerial: currentRow.processSerial,
      codeRelate: currentRow.codeRelate,
      sortNum: currentRow.sortNum,
      techId: currentRow.techId,
      type: currentRow.type,
      productionSchedulingType:
        currentRow.nature === EnumProductionType.OUTSOURCING ? 0 : currentRow.productionSchedulingType,
      vehicleRelate: currentRow.vehicleRelate,
      defaultCodeRelationType: currentRow.defaultCodeRelationType
    })
  } catch (error) {
    ElMessage.error("保存失败")
  } finally {
    await getChildCraftList()
  }
}
</script>

<style lang="scss">
.bizType-select-dropdown {
  display: none;
}
.bizType-dropdown-menu {
  width: 160px;

  &:hover {
    background-color: #fff !important;

    .bizType-dropdown-menu-active {
      background-color: #fff !important;

      &:hover {
        background-color: rgb(235.9, 245.3, 255) !important;
      }
    }
  }
  .el-dropdown-menu__item {
    padding: 5px 20px;

    &.bizType-dropdown-menu-active {
      background-color: rgb(235.9, 245.3, 255);
      color: #409eff !important;

      &:hover {
        color: #409eff !important;
      }
    }
    &:hover {
      background-color: rgb(235.9, 245.3, 255) !important;
      color: #606266;
    }
  }
  .el-dropdown-menu__item:not(.is-disabled):focus,
  .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #fff;
    color: #606266;
  }
}
</style>

<style lang="scss" scoped>
.child-craft {
  margin-top:-52px;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 32px;
    font-weight: bold;
    margin: 12px 0 16px;
  }
  .bizType-dropdown {
    width: 100%;

    &.is-disabled {
      cursor: unset;
    }
    :deep(.el-popper) {
      width: 100%;
    }
    &.empty-bizType-dropdown {
      :deep(.el-popper) {
        display: none;
      }
    }
  }
}
</style>
