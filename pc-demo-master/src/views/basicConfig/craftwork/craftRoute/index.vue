<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle :title="pageTitle">
          <div>
            <el-button type="primary" v-if="isAuth" icon="Plus" @click="onCreateCraftRouteClick()"
              >{{ createButtonText }}</el-button
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
          <template #publishStatus-default="{ row }">
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
            <el-button
              type="primary"
              size="small"
              @click="onViewClick(row, row.publishStatus === EnumCraftStatus.DESIGN && !!isAuth)"
              link
              >{{
                row.publishStatus === EnumCraftStatus.DESIGN && !!isAuth ? "编辑查看" : "查看详情"
              }}</el-button
            >
            <el-button v-if="isAuth" type="primary" size="small" @click="onCopyClick(row)" link
              >新建版本</el-button
            >
            <el-button
              v-if="row.publishStatus === EnumCraftStatus.PUBLISHED && !!isAuth"
              type="danger"
              size="small"
              link
              @click="onDestroyClick(row)"
              >作废</el-button
            >
            <el-button
              v-if="row.publishStatus === EnumCraftStatus.DESIGN && !!isAuth"
              type="primary"
              size="small"
              link
              @click="onPublishClick(row)"
              >发布</el-button
            >
            <el-button
              v-if="row.publishStatus !== EnumCraftStatus.PUBLISHED && !!isAuth"
              type="danger"
              size="small"
              link
              @click="onDeleteClick(row)"
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

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-show="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs
        ref="customPageCrumbsRef"
        v-model="curPageKey"
        :data="pageTree"
        @change="onPageCrumbsChange()"
      />

      <!-- 配置工艺路线子页面 -->
      <CraftRouteConfig
        v-if="curPageKey === EnumPageType.Craft_route_config"
        :data="craftRouteConfigData!"
        :route-purpose="props.routePurpose"
        @close="onConfigClose()"
        @update-page-list="onUpdatePageList"
        @update-view-status="onUpdateViewStatus"
      ></CraftRouteConfig>

      <!-- 配置工艺组、且工艺子页面 -->
      <CraftConfig
        v-if="[EnumPageType.Craft_group_config, EnumPageType.Craft_and_config].includes(curPageKey)"
        :data="craftConfigData!"
        @close="onConfigClose()"
      />

      <!-- 配置产品信息子页面 -->
      <ProductDetail
        v-if="
          [
            EnumPageType.Product_detail_route,
            EnumPageType.Product_detail_group,
            EnumPageType.Product_detail_and
          ].includes(curPageKey)
        "
        isReadonly
        :product-info="productInfo"
        @close="onConfigClose()"
      />
    </div>

    <!-- 工艺路线新建弹窗 -->
    <CraftRouteCreateDialog
      v-if="craftRouteCreateVisible"
      :product-id="productId"
      :route-purpose="props.routePurpose"
      @close="craftRouteCreateVisible = false"
      @success="onCreateCraftRouteSuccess"
    />

    <!-- 工艺路线复制弹窗 -->
    <CraftRouteCopyDialog
      v-if="craftRouteCopyVisible"
      :id="selectRowId"
      :route-purpose="props.routePurpose"
      @close="craftRouteCopyVisible = false"
      @success="customTableRef?.requestData()"
    />

    <!-- 工艺路线发布弹窗 -->
    <CraftRoutePublishDialog
      v-if="craftRoutePublishVisible"
      :id="selectRowId"
      :publishRemarks="publishRemarks"
      @close="craftRoutePublishVisible = false"
      @success="customTableRef?.requestData()"
    />
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { cancelCraftRouteItem, deleteCraftRouteItem, queryCraftRoutePageList } from "@/api/craft"
import { getProductModelById } from "@/api/product"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import type { IPageCrumbsItem } from "@/components/CustomPageCrumbs/type"
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
import {
  EnumCraftStatus,
  EnumCraftStatusMap,
  EnumParentCraftType,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useCraftWorkStore from "@/store/modules/craftwort"
import type {
  ICraftConfigInfo,
  ICraftPageCrumbsData,
  ICraftRouteItem as ITableRow,
  ICraftRouteParams
} from "@/types/base-info/craftRoute"
import ProductDetail from "@/views/basicConfig/craftwork/productManage/components/ProductDetail.vue"

import CraftConfig from "./components/CraftConfig.vue"
import CraftRouteConfig from "./components/CraftRouteConfig.vue"
import CraftRouteCopyDialog from "./components/CraftRouteCopyDialog.vue"
import CraftRouteCreateDialog from "./components/CraftRouteCreateDialog.vue"
import CraftRoutePublishDialog from "./components/CraftRoutePublishDialog.vue"

defineOptions({
  name: "CraftRoute"
})

const props = withDefaults(
  defineProps<{
    routePurpose?: "standard" | "rework-template"
  }>(),
  {
    routePurpose: "standard"
  }
)

type IOptionItem = {
  label: string
  value: number
}

const isReworkTemplate = computed(() => props.routePurpose === "rework-template")
const pageTitle = computed(() => (isReworkTemplate.value ? "返工工艺模板" : "工艺路线"))
const configTitle = computed(() =>
  isReworkTemplate.value ? "返工工艺模板配置" : "工艺路线配置"
)
const createButtonText = computed(() =>
  isReworkTemplate.value ? "新建返工工艺模板" : "新建工艺路线"
)

const publishStatusOptions = ref<IOptionItem[]>([])
const sourceTypeOptions = ref<IOptionItem[]>([])

const useCraftWork = useCraftWorkStore()
const isAuth = useButtonAuth("CraftRoute_update", "CraftRoute_query")

const customPageCrumbsRef = ref<InstanceType<typeof CustomPageCrumbs>>()

const searchFormData = ref<ISearchItem[]>([
  ...(!isReworkTemplate.value
    ? [
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
        }
      ]
    : []),
  {
    type: EnumComponentType.Select,
    key: "publishStatusList",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: publishStatusOptions,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "sourceType",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: sourceTypeOptions
  },
  {
    type: EnumComponentType.Input,
    key: "techProcessNo",
    label: "路线编号",
    value: "",
    placeholder: "请输入路线编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  sourceType?: number
  publishStatusList?: number[]
  queryProductName: string
  queryProductNo: string
  techProcessNo: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Craft_route_config, // 工艺路线配置
  Craft_group_config, // 工艺组配置
  Craft_and_config, // 且工艺配置
  Product_detail_route, // 工艺路线下产品信息详情
  Product_detail_group, // 工艺组下产品信息详情
  Product_detail_and // 切工艺下产品信息详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref<IPageCrumbsItem[]>([
  {
    name: pageTitle.value,
    key: EnumPageType.Main,
    children: [
      {
        name: configTitle.value,
        key: EnumPageType.Craft_route_config,
        children: [
          {
            name: "产品信息详情",
            key: EnumPageType.Product_detail_route
          },
          {
            name: "工艺组配置",
            key: EnumPageType.Craft_group_config,
            children: [
              {
                name: "产品信息详情",
                key: EnumPageType.Product_detail_group
              }
            ]
          },
          {
            name: "且工艺配置",
            key: EnumPageType.Craft_and_config,
            children: [
              {
                name: "产品信息详情",
                key: EnumPageType.Product_detail_and
              }
            ]
          }
        ]
      }
    ]
  }
])

const craftRouteConfigData = ref<ICraftPageCrumbsData>()
const craftConfigData = ref<ICraftPageCrumbsData>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "产品名称",
      minWidth: 160,
      hidden: () => isReworkTemplate.value
    },
    {
      prop: "productModel.specification",
      label: "产品规格",
      minWidth: 160,
      hidden: () => isReworkTemplate.value,
      formatter: (row: ITableRow) => {
        const data = row as any
        return data.productModel?.specification || data.productModelSpec || data.specification || "-"
      }
    },
    {
      prop: "productModel.code",
      label: "产品编号",
      minWidth: 160,
      hidden: () => isReworkTemplate.value
    },
    {
      prop: "no",
      label: "工艺路线编号",
      minWidth: 160
    },
    {
      prop: "version",
      label: "路线版本",
      minWidth: 160
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
      prop: "publishStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "publishStatus-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
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
      width: 240,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[ICraftRouteParams], ITableRow, true> = {
  api: queryCraftRoutePageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData(),
          ...(isReworkTemplate.value ? { routePurpose: props.routePurpose } : {})
        }
      }
    ]
  }
}

const productId = ref("") // 从“产品管理”页面创建工艺路线时，携带的产品id
const craftRouteCreateVisible = ref(false) // 新建工艺路线弹窗显示标识
const craftRouteCopyVisible = ref(false) // 工艺路线复制弹窗显示标识
const publishRemarks = ref("") // 发布工艺路线备注
const craftRoutePublishVisible = ref(false) // 工艺路线发布弹窗显示标识
const productInfo = ref() // 工艺路线配置页面产品配置操作中“料”、“产出”的产品信息

const selectRowId = ref("") // 选中行id
const viewStatus = ref(false) // 是否为工艺路线查看

provide("isOnlyView", viewStatus) // 向后代组件传递是否为查看状态

// 向后代组件提供的产品配置页面信息
provide("productSettingObj", {
  /** 显示产品配置页面 */
  showProductSetting: async (id: string) => {
    const data = await getProductModelById(id)
    productInfo.value = data

    if (curPageKey.value === EnumPageType.Craft_route_config) {
      curPageKey.value = EnumPageType.Product_detail_route
    } else if (curPageKey.value === EnumPageType.Craft_group_config) {
      curPageKey.value = EnumPageType.Product_detail_group
    } else if (curPageKey.value === EnumPageType.Craft_and_config) {
      curPageKey.value = EnumPageType.Product_detail_and
    }
  }
})

onMounted(async () => {
  buildOptions()
  await customTableRef.value?.requestData()
  // 检测是否有快捷创建工艺路线信息
  if (useCraftWork.$state.quickCraftRouteInfo) {
    craftRouteCreateVisible.value = true
    productId.value = useCraftWork.$state.quickCraftRouteInfo.id
    useCraftWork.clearQuickCraftRouteInfo()
  }

  // 检测是否有其他页面跳转到工艺路线页面，进行查看工艺路线信息
  const craftRouteInfo = useCraftWork.$state.craftRouteInfo
  if (craftRouteInfo) {
    onViewClick(
      craftRouteInfo,
      craftRouteInfo.techVersion.status === EnumCraftStatus.DESIGN && !!isAuth
    )
    useCraftWork.clearCraftRouteInfo()
  }
})

/** 构建下拉选项 */
const buildOptions = () => {
  publishStatusOptions.value = Object.keys(EnumCraftStatusMap).map((key) => ({
    label: EnumCraftStatusMap[key as unknown as EnumCraftStatus],
    value: +key
  }))

  sourceTypeOptions.value = Object.keys(EnumProductionOrderSourceMap).map((key) => ({
    label: EnumProductionOrderSourceMap[key as unknown as EnumProductionOrderSource],
    value: +key
  }))
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 新建工艺路线 */
const onCreateCraftRouteClick = () => {
  craftRouteCreateVisible.value = true
}

/** 新建工艺路线成功回调 */
const onCreateCraftRouteSuccess = (data: ITableRow) => {
  customTableRef.value?.requestData()
  onViewClick(data, data.publishStatus === EnumCraftStatus.DESIGN && !!isAuth)
}

/** 编辑、查看工艺路线 */
const onViewClick = (row: ITableRow, isEdit: boolean) => {
  selectRowId.value = row.id
  viewStatus.value = !isEdit
  curPageKey.value = EnumPageType.Craft_route_config

  craftRouteConfigData.value = {
    craftRouteId: row.id, // 工艺路线只需传入工艺路线id
    techVersionId: "",
    craftType: EnumParentCraftType.CRAFT_ROUTE,
    routePurpose: props.routePurpose
  }
}

/** 创建工艺路线副本 */
const onCopyClick = (row: ITableRow) => {
  craftRouteCopyVisible.value = true
  selectRowId.value = row.id
}

/** 作废工艺路线 */
const onDestroyClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定将该工艺路线作废？", "提示", {
    type: "warning"
  })
  await cancelCraftRouteItem(row.id)
  ElMessage.success("作废成功")
  customTableRef.value?.requestData()
}

/** 发布工艺路线 */
const onPublishClick = (row: ITableRow) => {
  publishRemarks.value = row.remarks
  craftRoutePublishVisible.value = true
  selectRowId.value = row.id
}

/** 删除工艺路线 */
const onDeleteClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该工艺路线么？", "提示", {
    type: "warning"
  })
  await deleteCraftRouteItem(row.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

/** 配置页返回 */
const onConfigClose = () => {
  const list = customPageCrumbsRef.value?.getCurRoute()
  curPageKey.value = list[list.length - 2].key
  customTableRef.value?.requestData()
}

/** 工艺路线配置页点击配置操作回调 */
const onUpdatePageList = (data: ICraftConfigInfo) => {
  if (data.isCraftGroup) {
    craftConfigData.value = {
      craftRouteId: "",
      techVersionId: data.techVersion.id, // 且工艺、工艺组需要传入的是techVersionId
      craftType: EnumParentCraftType.CRAFT_GROUP
    }
    curPageKey.value = EnumPageType.Craft_group_config
  } else {
    craftConfigData.value = {
      craftRouteId: "",
      techVersionId: data.techVersion.id, // 且工艺、工艺组需要传入的是techVersionId
      craftType: EnumParentCraftType.CRAFT_AND
    }
    curPageKey.value = EnumPageType.Craft_and_config
  }
}

/** 页面面包屑change回调 */
const onPageCrumbsChange = () => {
  nextTick(() => {
    const list = customPageCrumbsRef.value?.getCurRoute()
    if (list.length === 1) {
      customTableRef.value?.requestData()
    }
  })
}

/** 工艺路线发布回调 */
const onUpdateViewStatus = (status: boolean) => {
  viewStatus.value = status
}
</script>

<style scoped lang="scss"></style>
