<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="工艺类型列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="openDialog('create')">
              新建工艺类型
            </el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          class="custom-table"
        >
          <template #needLoadBindIronTag-default="{ row }">
            <span>{{ isNeedLoadBindIronTag(row) ? "是" : "否" }}</span>
          </template>
          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(canEdit ? 'edit' : 'view', row.id)">
              {{ canEdit ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button
              v-if="canEdit"
              link
              type="danger"
              size="small"
              @click="onDeleteCraftType(row.id)"
            >
              删除
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="loadTableData"
      />
    </div>

    <CraftTypeDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :craft-type-id="selectedCraftTypeId"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryCraftTypeDetail, queryCraftTypePageList, requestDeleteCraftType } from "@/api/craft"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { ICraftTypeItem } from "@/types/base-info/craftType"

import CraftTypeDialog from "./components/CraftTypeDialog.vue"

defineOptions({
  name: "CraftTypeConfig"
})

type CraftTypeDialogMode = "create" | "edit" | "view"
type CraftTypeFlagCacheItem = {
  needLoadBindIronTag?: number
}

const authType = useButtonAuth("CraftTypeConfig_update", "CraftTypeConfig_query")
const canEdit = computed(() => authType.value !== AuthType.View)
const craftTypeFlagCacheStorageKey = "craft-type-config-flag-cache"

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "craftTypeNo",
    label: "工艺类型编号",
    value: "",
    placeholder: "请输入工艺类型编号"
  },
  {
    type: EnumComponentType.Input,
    key: "craftTypeName",
    label: "工艺类型名称",
    value: "",
    placeholder: "请输入工艺类型名称"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  craftTypeNo: string
  craftTypeName: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const dialogVisible = ref(false)
const dialogMode = ref<CraftTypeDialogMode>("create")
const selectedCraftTypeId = ref("")
const craftTypeFlagCacheMap = ref<Record<string, CraftTypeFlagCacheItem>>({})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ICraftTypeItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "craftTypeNo",
      label: "工艺类型编号",
      minWidth: 180
    },
    {
      prop: "craftTypeName",
      label: "工艺类型名称",
      minWidth: 220
    },
    {
      prop: "needLoadBindIronTag",
      label: "上料绑定铁牌",
      minWidth: 150,
      slots: {
        default: "needLoadBindIronTag-default"
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 240
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const loadTableData = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const { records, total } = await queryCraftTypePageList({
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: {
        ...getFormData()
      }
    })
    const normalizedRecords = (records || []).map((item) => ({
      ...item,
      needLoadBindIronTag: getNeedLoadBindIronTagValue(item)
    }))
    customTableData.value = normalizedRecords
    pagination.value.total = Number(total || 0)
    await backfillNeedLoadBindIronTag(normalizedRecords)
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await loadTableData()
}

const openDialog = (mode: CraftTypeDialogMode, id = "") => {
  dialogMode.value = mode
  selectedCraftTypeId.value = id
  dialogVisible.value = true
}

const onDialogSuccess = async (payload?: { id?: string; needLoadBindIronTag: number }) => {
  if (payload?.id) {
    saveCraftTypeFlagCacheItem(payload.id, payload.needLoadBindIronTag)
  }
  dialogVisible.value = false
  await loadTableData()
}

const onDeleteCraftType = async (id: string) => {
  try {
    await ElMessageBox.confirm("确认要删除吗", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "error"
    })

    await requestDeleteCraftType({ id })
    ElMessage.success("删除成功")
    await loadTableData()
  } catch (error: any) {
    if (error === "cancel" || error === "close") return
    if (error?.isAxiosError || error?.response || error?.success === false) return
    ElMessage.error(error?.message || "删除失败")
  }
}

const readCraftTypeFlagCache = () => {
  try {
    const raw = window.localStorage.getItem(craftTypeFlagCacheStorageKey)
    craftTypeFlagCacheMap.value = raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.warn("read craft type flag cache failed", error)
    craftTypeFlagCacheMap.value = {}
  }
}

const writeCraftTypeFlagCache = () => {
  window.localStorage.setItem(craftTypeFlagCacheStorageKey, JSON.stringify(craftTypeFlagCacheMap.value))
}

const saveCraftTypeFlagCacheItem = (id: string, needLoadBindIronTag?: number) => {
  const normalizedId = String(id || "").trim()
  if (!normalizedId) return
  craftTypeFlagCacheMap.value[normalizedId] = {
    needLoadBindIronTag: Number(needLoadBindIronTag || 0)
  }
  writeCraftTypeFlagCache()
}

const backfillNeedLoadBindIronTag = async (records: ICraftTypeItem[]) => {
  const targetList = records.filter((item) => item.id && item.needLoadBindIronTag === undefined)
  if (!targetList.length) return
  const resultList = await Promise.allSettled(
    targetList.map(async (item) => {
      const detail = await queryCraftTypeDetail(item.id)
      const value = Number(detail?.needLoadBindIronTag || 0)
      saveCraftTypeFlagCacheItem(item.id, value)
      return {
        id: item.id,
        needLoadBindIronTag: value
      }
    })
  )
  const valueMap = new Map<string, number>()
  resultList.forEach((result) => {
    if (result.status !== "fulfilled") return
    valueMap.set(result.value.id, result.value.needLoadBindIronTag)
  })
  if (!valueMap.size) return
  customTableData.value = customTableData.value.map((item) =>
    valueMap.has(item.id)
      ? {
          ...item,
          needLoadBindIronTag: valueMap.get(item.id)
        }
      : item
  )
}

const getNeedLoadBindIronTagValue = (row?: Partial<ICraftTypeItem>) => {
  const normalizedId = String(row?.id || "").trim()
  const apiValue = row?.needLoadBindIronTag
  if (apiValue !== undefined && apiValue !== null && String(apiValue).trim() !== "") {
    const normalizedValue = Number(apiValue || 0)
    if (normalizedId) {
      saveCraftTypeFlagCacheItem(normalizedId, normalizedValue)
    }
    return normalizedValue
  }
  return Number(craftTypeFlagCacheMap.value[normalizedId]?.needLoadBindIronTag || 0)
}

const isNeedLoadBindIronTag = (row: ICraftTypeItem) => getNeedLoadBindIronTagValue(row) === 1

onMounted(() => {
  readCraftTypeFlagCache()
  loadTableData()
})
</script>
