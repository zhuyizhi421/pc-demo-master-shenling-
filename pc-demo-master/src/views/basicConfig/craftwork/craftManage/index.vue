<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="工艺配置">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="openDialog('create')">新建工艺</el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          class="custom-table"
        >
          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="openDialog(canEdit ? 'edit' : 'view', row)"
            >
              {{ canEdit ? "编辑查看" : "查看详情" }}
            </el-button>
            <el-button v-if="canEdit" link type="danger" size="small" @click="onDeleteCraft(row.id)">
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

    <CustomDialog v-model="dialogVisible" :title="dialogTitle" :loading="dialogLoading" @close="resetDialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="dialog-form">
        <el-form-item label="工艺名称" prop="name">
          <el-input
            v-model="formData.name"
            class="w-full"
            maxlength="100"
            placeholder="请输入工艺名称"
            :disabled="isReadonly"
          />
        </el-form-item>
        <el-form-item label="工艺编号" prop="no">
          <el-input
            v-model="formData.no"
            class="w-full"
            maxlength="50"
            placeholder="不填则自动生成"
            :disabled="isCodeReadonly"
          />
        </el-form-item>
        <el-form-item label="工艺类型" prop="craftTypeId">
          <el-select
            v-model="formData.craftTypeId"
            class="w-full"
            clearable
            filterable
            placeholder="请选择工艺类型"
            :disabled="isReadonly"
          >
            <el-option
              v-for="item in craftTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div v-if="craftTypeEmptyTip" class="form-tip">{{ craftTypeEmptyTip }}</div>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入备注"
            :disabled="isReadonly"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isReadonly" type="primary" @click="onSubmitDialog">保存</el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"

import {
  createCraftItem,
  deleteCraftItem,
  queryAllCraftList,
  queryCraftTypeList,
  updateCraftItem
} from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { ICraftItem } from "@/types/base-info/craftRoute"

defineOptions({
  name: "CraftManage"
})

type CraftDialogMode = "create" | "edit" | "view"

type CraftTypeOption = {
  label: string
  value: string
  craftTypeName: string
  craftTypeNo: string
}

type CraftTypeCacheItem = {
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
}

const craftTypeCacheStorageKey = "craft-manage-type-cache"

const authType = useButtonAuth("CraftManage_update", "CraftManage_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const craftTypeOptions = ref<CraftTypeOption[]>([])
const craftTypeEmptyTip = computed(() =>
  craftTypeOptions.value.length ? "" : "请先在工艺类型配置中维护工艺类型"
)

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
  },
  {
    type: EnumComponentType.Select,
    key: "craftTypeId",
    label: "工艺类型",
    value: "",
    placeholder: "请选择工艺类型",
    options: craftTypeOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name: string
  no: string
  craftTypeId: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const craftTypeCacheMap = ref<Record<string, CraftTypeCacheItem>>({})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ICraftItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "name",
      label: "工艺名称",
      minWidth: 180
    },
    {
      prop: "no",
      label: "工艺编号",
      minWidth: 160
    },
    {
      prop: "craftTypeName",
      label: "工艺类型",
      minWidth: 220,
      formatter: (row: ICraftItem) => {
        return formatCraftTypeLabel(row)
      }
    },
    {
      prop: "remarks",
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

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<CraftDialogMode>("create")
const currentCraftId = ref("")
const formRef = ref<FormInstance | null>(null)

const formData = reactive({
  name: "",
  no: "",
  remarks: "",
  craftTypeId: ""
})

const isReadonly = computed(() => dialogMode.value === "view")
const isCodeReadonly = computed(() => dialogMode.value !== "create")
const dialogTitle = computed(() => {
  if (dialogMode.value === "create") return "新建工艺"
  if (dialogMode.value === "edit") return "编辑工艺"
  return "查看工艺"
})

const createTrimmedRequiredValidator =
  (message: string) => (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!String(value || "").trim()) {
      callback(new Error(message))
      return
    }
    callback()
  }

const rules = reactive<FormRules<typeof formData>>({
  name: [
    {
      required: true,
      validator: createTrimmedRequiredValidator("请输入工艺名称"),
      trigger: "blur"
    }
  ],
  craftTypeId: [
    {
      required: true,
      message: "请选择工艺类型",
      trigger: "change"
    }
  ]
})

const buildCraftTypeLabel = (craftTypeNo?: string, craftTypeName?: string) => {
  const name = String(craftTypeName || "").trim()
  return name || "-"
}

const getCraftTypeNameById = (craftTypeId?: string) => {
  const targetId = String(craftTypeId || "").trim()
  if (!targetId) return ""
  return craftTypeOptions.value.find((item) => item.value === targetId)?.craftTypeName || ""
}

const getCraftTypeNoById = (craftTypeId?: string) => {
  const targetId = String(craftTypeId || "").trim()
  if (!targetId) return ""
  return craftTypeOptions.value.find((item) => item.value === targetId)?.craftTypeNo || ""
}

const getCraftTypeCacheKeyList = (row?: Partial<ICraftItem>) => {
  const keyList: string[] = []
  const id = String(row?.id || "").trim()
  const no = String(row?.no || "").trim()
  if (id) keyList.push(`id:${id}`)
  if (no) keyList.push(`no:${no}`)
  return keyList
}

const readCraftTypeCache = () => {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem(craftTypeCacheStorageKey)
    craftTypeCacheMap.value = raw ? JSON.parse(raw) : {}
  } catch {
    craftTypeCacheMap.value = {}
  }
}

const writeCraftTypeCache = () => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(craftTypeCacheStorageKey, JSON.stringify(craftTypeCacheMap.value))
}

const getCraftTypeCacheItem = (row?: Partial<ICraftItem>) => {
  const keyList = getCraftTypeCacheKeyList(row)
  for (const key of keyList) {
    const item = craftTypeCacheMap.value[key]
    if (item) return item
  }
  return null
}

const saveCraftTypeCacheItem = (
  row: Partial<ICraftItem>,
  item: {
    craftTypeId?: string
    craftTypeName?: string
    craftTypeNo?: string
  }
) => {
  const keyList = getCraftTypeCacheKeyList(row)
  if (!keyList.length) return
  keyList.forEach((key) => {
    craftTypeCacheMap.value[key] = {
      craftTypeId: item.craftTypeId,
      craftTypeName: item.craftTypeName,
      craftTypeNo: item.craftTypeNo
    }
  })
  writeCraftTypeCache()
}

const formatCraftTypeLabel = (row: ICraftItem) => {
  const cacheItem = getCraftTypeCacheItem(row)
  const craftTypeName =
    getCraftTypeNameById(row.craftTypeId) ||
    String(row.craftTypeName || "").trim() ||
    String(cacheItem?.craftTypeName || "").trim()
  return buildCraftTypeLabel(getCraftTypeNoById(row.craftTypeId) || row.craftTypeNo || cacheItem?.craftTypeNo, craftTypeName)
}

const upsertCraftTypeOption = (item?: Partial<ICraftItem>) => {
  const value = String(item?.craftTypeId || "").trim()
  if (!value) return
  if (craftTypeOptions.value.some((option) => option.value === value)) return
  craftTypeOptions.value.unshift({
    value,
    craftTypeNo: String(item?.craftTypeNo || "").trim(),
    craftTypeName: String(item?.craftTypeName || "").trim(),
    label: buildCraftTypeLabel(item?.craftTypeNo, item?.craftTypeName)
  })
}

const loadCraftTypeOptions = async () => {
  try {
    const list = await queryCraftTypeList()
    craftTypeOptions.value = list.map((item) => ({
      value: item.id,
      craftTypeNo: item.craftTypeNo,
      craftTypeName: item.craftTypeName,
      label: buildCraftTypeLabel(item.craftTypeNo, item.craftTypeName)
    }))
  } catch (error: any) {
    craftTypeOptions.value = []
    ElMessage.error(error?.message || "工艺类型加载失败")
  }
}

const loadTableData = async () => {
  customTableRef.value?.setLoading(true)
  try {
    const queryFormData = getFormData()
    const selectedCraftType = craftTypeOptions.value.find(
      (item) => item.value === String(queryFormData.craftTypeId || "").trim()
    )

    const allList = await queryAllCraftList({
      name: queryFormData.name,
      no: queryFormData.no
    })

    const normalizedCraftTypeName = String(selectedCraftType?.craftTypeName || "")
      .trim()
      .toLowerCase()
    const normalizedCraftTypeId = String(queryFormData.craftTypeId || "").trim()

    const filteredList = (allList || [])
      .map((item) => ({
        ...item,
        craftTypeName:
          getCraftTypeNameById(item.craftTypeId) ||
          String(item.craftTypeName || "").trim() ||
          String(getCraftTypeCacheItem(item)?.craftTypeName || "").trim(),
        craftTypeNo:
          getCraftTypeNoById(item.craftTypeId) ||
          String(item.craftTypeNo || "").trim() ||
          String(getCraftTypeCacheItem(item)?.craftTypeNo || "").trim() ||
          ""
      }))
      .filter((item) => {
        if (queryFormData.name && !String(item.name || "").includes(String(queryFormData.name))) return false
        if (queryFormData.no && !String(item.no || "").includes(String(queryFormData.no))) return false
        if (!normalizedCraftTypeId) return true
        if (String(item.craftTypeId || "").trim() === normalizedCraftTypeId) return true
        if (!normalizedCraftTypeName) return false
        return String(item.craftTypeName || "").trim().toLowerCase() === normalizedCraftTypeName
      })

    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize

    customTableData.value = filteredList.slice(start, end).map((item) => ({
      ...item,
      craftTypeName: String(item.craftTypeName || "").trim(),
      craftTypeNo: String(item.craftTypeNo || "").trim()
    }))
    pagination.value.total = filteredList.length
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

const resetDialog = () => {
  currentCraftId.value = ""
  formData.name = ""
  formData.no = ""
  formData.remarks = ""
  formData.craftTypeId = ""
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

const openDialog = async (mode: CraftDialogMode, row?: ICraftItem) => {
  dialogMode.value = mode
  resetDialog()
  await loadCraftTypeOptions()
  if (row) {
    currentCraftId.value = row.id
    formData.name = row.name || ""
    formData.no = row.no || ""
    formData.remarks = row.remarks || ""
    formData.craftTypeId = row.craftTypeId || String(getCraftTypeCacheItem(row)?.craftTypeId || "")
    upsertCraftTypeOption({
      ...row,
      craftTypeName:
        getCraftTypeNameById(row.craftTypeId) ||
        String(row.craftTypeName || "").trim() ||
        String(getCraftTypeCacheItem(row)?.craftTypeName || "").trim(),
      craftTypeNo:
        getCraftTypeNoById(row.craftTypeId) ||
        String(row.craftTypeNo || "").trim() ||
        String(getCraftTypeCacheItem(row)?.craftTypeNo || "").trim() ||
        ""
    })
  }
  dialogVisible.value = true
  if (mode !== "view" && craftTypeEmptyTip.value) {
    ElMessage.warning(craftTypeEmptyTip.value)
  }
}

const onSubmitDialog = async () => {
  if (craftTypeEmptyTip.value) {
    ElMessage.warning(craftTypeEmptyTip.value)
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const selectedCraftType = craftTypeOptions.value.find((item) => item.value === formData.craftTypeId)
  if (!selectedCraftType) {
    ElMessage.warning("请选择工艺类型")
    return
  }

  dialogLoading.value = true
  try {
    const payload = {
      name: formData.name.trim(),
      remarks: formData.remarks.trim(),
      craftTypeId: selectedCraftType.value,
      craftTypeNo: selectedCraftType.craftTypeNo,
      craftTypeName: selectedCraftType.craftTypeName
    }
    if (dialogMode.value === "create") {
      const createRes = await createCraftItem({
        ...payload,
        no: formData.no.trim() || undefined
      })
      saveCraftTypeCacheItem(
        {
          id: (createRes as any)?.id,
          no: (createRes as any)?.no || formData.no.trim()
        },
        payload
      )
      ElMessage.success("新建成功")
    } else {
      await updateCraftItem({
        ...payload,
        id: currentCraftId.value
      })
      saveCraftTypeCacheItem(
        {
          id: currentCraftId.value,
          no: formData.no.trim()
        },
        payload
      )
      ElMessage.success("编辑成功")
    }
    dialogVisible.value = false
    resetDialog()
    await loadTableData()
  } catch (error: any) {
    ElMessage.error(error?.message || "保存失败")
  } finally {
    dialogLoading.value = false
  }
}

const onDeleteCraft = async (id: string) => {
  try {
    await ElMessageBox.confirm("此操作将永久删除该工艺, 是否继续?", "提示", {
      type: "warning"
    })
    await deleteCraftItem(id)
    ElMessage.success("删除成功")
    await loadTableData()
  } catch (error) {
    /* empty */
  }
}

onMounted(async () => {
  readCraftTypeCache()
  await loadCraftTypeOptions()
  await loadTableData()
})
</script>

<style scoped lang="scss">
.dialog-form {
  :deep(.el-form-item) {
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    height: auto;
    line-height: 20px;
    padding-top: 6px;
  }
}

.form-tip {
  margin-top: 6px;
  color: var(--el-color-warning);
  font-size: 12px;
  line-height: 18px;
}
</style>
