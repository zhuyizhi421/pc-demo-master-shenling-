<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        :menu-items="menuItems"
        class="tree-sidebar"
        :show-custom-icon="false"
        @node-click="onMenuNodeClick"
      >
        <template #afterIcon="scope">
          <el-button
            v-if="isAuth && !isCancelledMode"
            link
            @click.stop="onMenuIconClick(scope.data, EnumMenuOperationType.ADD)"
          >
            <el-icon>
              <CirclePlus color="var(--tree-right-icon-color)" />
            </el-icon>
          </el-button>
          <template v-if="String(scope.data.id) !== '0' && isAuth && !isCancelledMode">
            <el-button link @click.stop="onMenuIconClick(scope.data, EnumMenuOperationType.DELETE)">
              <el-icon>
                <CircleClose color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
            <el-button
              class="mr-[4px]"
              link
              @click.stop="onMenuIconClick(scope.data, EnumMenuOperationType.EDIT)"
            >
              <el-icon>
                <EditPen color="var(--tree-right-icon-color)" />
              </el-icon>
            </el-button>
          </template>
        </template>
      </CustomTreeMenu>
    </div>

    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle :title="pageTitle">
          <div>
            <el-button
              v-if="isAuth && !isCancelledMode && currentDirectory?.id !== '0' && canUploadCurrentDirectory"
              icon="Plus"
              type="primary"
              @click="onEditDocumentClick(EnumDocumentOperationType.ADD)"
            >
              上传新文档
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
          <template #fileStatus-default="{ row }">
            <el-tag
              v-if="EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus]"
              :type="EnumDocumentStatusTagMap[row.fileStatus as EnumDocumentStatus]"
            >
              {{ EnumDocumentStatusMap[row.fileStatus as EnumDocumentStatus] }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="fileDownloadHandle(row.fileId)">
                下载
              </el-button>
              <el-button
                v-if="row.fileStatus === EnumDocumentStatus.Normal && isAuth && canReviseDocument(row)"
                link
                type="primary"
                size="small"
                @click="onEditDocumentClick(EnumDocumentOperationType.REVISE, row)"
              >
                修订
              </el-button>
              <el-button
                v-if="row.fileStatus === EnumDocumentStatus.Normal && isAuth"
                link
                type="primary"
                size="small"
                @click="onEditDocumentClick(EnumDocumentOperationType.EDIT_RELATIONS, row)"
              >
                修改关联项
              </el-button>
              <el-button
                v-if="row.fileStatus === EnumDocumentStatus.Normal && isAuth && canCancelDocument(row)"
                link
                type="danger"
                size="small"
                @click="onDeleteDocumentClick(row.id, row)"
              >
                作废
              </el-button>
              <el-dropdown>
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="historyVersionRef?.setModalStatus({ show: true, id: row.id })"
                      >
                        历史版本
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button link type="primary" size="small" @click="onExamRecordClick(row)">
                        审批记录
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

    <DocumentTypeCreateDialog
      v-if="documentTypeVisible"
      :id="selectedDocumentId"
      :type="selectedType"
      :directory-name="selectedDocumentName"
      @close="documentTypeVisible = false"
      @success="DocumentTypeSuccess()"
    />

    <DocumentUploadModal
      ref="documentUploadModal"
      :current-directory="currentDirectory as any"
      :current-file="selectedItem"
      @on-ok="onDocumentOperateSuccess"
    />

    <HistoryVersionModal ref="historyVersionRef" />
    <CustomDialog v-model="examRecordShow" title="审批记录" size="medium">
      <CustomTable
        ref="customExamRecordTableRef"
        v-model:table-data="customExamRecordTableData"
        :config="examRecordTableConfig"
        class="custom-table"
      >
        <template #operation-default="{ row }">
          <el-button type="primary" link @click="useFlowDetail.setStatus(true, row.procInsId)">
            查看详情
          </el-button>
        </template>
      </CustomTable>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute } from "vue-router"

import { deleteFileDirectory, getFileDirectory, type IFileDirectory } from "@/api/directory"
import {
  deleteFile,
  fileDownloadHandle,
  getFileFlowRecord,
  searchFileResourceList
} from "@/api/fileResource"
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
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import {
  EnumDocumentStatus,
  EnumDocumentStatusMap,
  EnumDocumentStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import useUserStore from "@/store/modules/user"
import type {
  IFileFlowRecord,
  IFileResourcePageItem as ITableRow,
  IFileResourceParams
} from "@/types/base-info/file"
import mitter from "@/utils/mitt"

import DocumentTypeCreateDialog from "./components/DocumentTypeCreateDialog.vue"
import DocumentUploadModal from "./components/documentUploadModal.vue"
import HistoryVersionModal from "./components/historyVersionModal.vue"

defineOptions({
  name: "DocumentManage"
})

enum EnumMenuOperationType {
  ADD = "add",
  EDIT = "edit",
  DELETE = "delete"
}

enum EnumDocumentOperationType {
  REVISE = "revise",
  ADD = "add",
  EDIT_RELATIONS = "editRelations"
}

type Direction = Omit<IFileDirectory, "subDirs"> & {
  label: string
  children?: Direction[]
}

const isAuth = useButtonAuth("DocumentManage_update", "DocumentManage_query")
const useFlowDetail = useFlowDetailStore()
const useUser = useUserStore()
const route = useRoute()
const isCancelledMode = computed(() => route.name === "CancelledDocumentManage")
const pageTitle = computed(() =>
  isCancelledMode.value
    ? `已作废文档${currentDirectory.value?.directoryName ? ` - ${currentDirectory.value.directoryName}` : ""}`
    : currentDirectory.value?.directoryName || ""
)

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "fileName",
    label: "文档名",
    value: "",
    placeholder: "请输入文档名"
  },
  {
    type: EnumComponentType.Input,
    key: "extension",
    label: "格式",
    value: "",
    placeholder: "请输入格式"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  fileName: string
  extension: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const treeMenuRef = ref()

const selectedItem = ref<ITableRow>()
const historyVersionRef = ref<InstanceType<typeof HistoryVersionModal>>()

const menuItems = ref<Direction[]>([])
const currentDirectory = ref<Direction>()

type DirectoryPermissionField =
  | "uploadPermissionRoleCodes"
  | "revisePermissionRoleCodes"
  | "cancelPermissionRoleCodes"

const normalizeRoleCodes = (codes?: string[]) =>
  Array.isArray(codes) ? codes.map((item) => String(item)).filter(Boolean) : []

const directoryMap = computed(() => {
  const map = new Map<string, Direction>()
  const collect = (items: Direction[] = []) => {
    items.forEach((item) => {
      map.set(String(item.id), item)
      if (item.children?.length) {
        collect(item.children)
      }
    })
  }
  collect(menuItems.value)
  return map
})

const hasDirectoryOperationPermission = (
  directory: Partial<IFileDirectory> | undefined,
  field: DirectoryPermissionField
) => {
  const permissionCodes = normalizeRoleCodes(directory?.[field] as string[] | undefined)
  if (!permissionCodes.length) return true

  const currentRoleCodes = new Set(normalizeRoleCodes(useUser.roleCodes))
  return permissionCodes.some((item) => currentRoleCodes.has(item))
}

const getDirectoryById = (id?: number | string) => directoryMap.value.get(String(id || ""))

const canUploadCurrentDirectory = computed(() =>
  hasDirectoryOperationPermission(currentDirectory.value, "uploadPermissionRoleCodes")
)

const canReviseDocument = (row: ITableRow) =>
  hasDirectoryOperationPermission(getDirectoryById(row.directoryId), "revisePermissionRoleCodes")

const canCancelDocument = (row: ITableRow) =>
  hasDirectoryOperationPermission(getDirectoryById(row.directoryId), "cancelPermissionRoleCodes")

const documentUploadModal = ref<InstanceType<typeof DocumentUploadModal>>()

const documentTypeVisible = ref(false)
const selectedDocumentId = ref("")
const selectedDocumentName = ref("")
const selectedType = ref(1)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "fileName",
      label: "文档名",
      width: 160
    },
    {
      prop: "version",
      label: "当前版本",
      width: 120,
      align: "center"
    },
    {
      prop: "extension",
      label: "格式",
      width: 160,
      align: "center"
    },
    {
      prop: "sourceName",
      label: "源文档名",
      width: 160
    },
    {
      prop: "directoryName",
      label: "文档类型",
      width: 160
    },
    {
      prop: "fileStatus",
      label: "文档状态",
      width: 120,
      align: "center",
      slots: {
        default: "fileStatus-default"
      }
    },
    {
      prop: "size",
      label: "文档大小",
      width: 120,
      align: "right"
    },
    {
      prop: "uploadTime",
      label: "上传时间",
      width: 180
    },
    {
      prop: "operation",
      label: "操作",
      width: 280,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const customExamRecordTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customExamRecordTableData = ref<IFileFlowRecord[]>([])
const examRecordTableConfig = ref<ITableConfig>({
  height: "400px",
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
      align: "center",
      type: "index"
    },
    {
      prop: "procDefName",
      label: "流程名称",
      minWidth: 160
    },
    {
      prop: "procProgress",
      label: "流程进度",
      width: 120,
      align: "center",
      formatter: (row: IFileFlowRecord) => {
        return ["", "进行中", "已通过", "已拒绝"][row.procProgress] || "-"
      }
    },
    {
      prop: "startUserName",
      label: "提交人",
      width: 120,
      align: "center"
    },
    {
      prop: "startTime",
      label: "提交时间",
      width: 180
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
const examRecordShow = ref(false)

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onDocumentOperateSuccess = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const queryConfig: ITableRequestConfig<[IFileResourceParams], ITableRow, true> = {
  api: searchFileResourceList,
  getParams: () => {
    const statusList = isCancelledMode.value
      ? [EnumDocumentStatus.Cancelled]
      : [EnumDocumentStatus.Normal, EnumDocumentStatus.Review]

    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          directoryId: currentDirectory.value?.id || 0,
          statusList,
          ...getFormData()
        }
      }
    ]
  }
}

const handleTreeListData = (data: IFileDirectory): Direction => {
  const { subDirs, ...others } = data
  return {
    ...others,
    label: others.directoryName || "",
    children: subDirs?.map((item) => handleTreeListData(item))
  }
}

const fileDirectoryRequest = async (updateCurrent = true, id?: number) => {
  const res = await getFileDirectory({ id })
  const data = handleTreeListData(res)
  data.directoryName = data.label = "所有文档类型"

  if (updateCurrent) {
    currentDirectory.value = data
  }
  menuItems.value = [data]

  setTimeout(() => {
    treeMenuRef.value?.getTreeRef()?.setCurrentKey(currentDirectory.value?.id, true)
  })
}

const onMenuIconClick = async (data: Direction, type: EnumMenuOperationType) => {
  if (type === EnumMenuOperationType.DELETE) {
    const confirm = await ElMessageBox.confirm("确定删除该文档类型吗？", "提示", {
      type: "warning"
    })
    if (!confirm) return

    await deleteFileDirectory([data.id])
    if (currentDirectory.value?.id === data.id) {
      await fileDirectoryRequest()
      onReset()
      customTableRef.value?.requestData()
    } else {
      await fileDirectoryRequest(false)
      ElMessage.success("删除成功")
      if (currentDirectory.value?.id) {
        treeMenuRef.value?.getTreeRef()?.setCurrentKey(currentDirectory.value.id, true)
      }
    }
    return
  }

  documentTypeVisible.value = true
  selectedDocumentId.value = String(data.id)
  selectedDocumentName.value = data.directoryName || ""
  selectedType.value = type === EnumMenuOperationType.ADD ? 1 : 2
}

const DocumentTypeSuccess = async () => {
  await fileDirectoryRequest()
  customTableRef.value?.requestData()
}

const onEditDocumentClick = (status: EnumDocumentOperationType, data?: ITableRow) => {
  if (status === EnumDocumentOperationType.ADD && !canUploadCurrentDirectory.value) {
    ElMessage.warning("当前文档类型未授权上传")
    return
  }

  if (status === EnumDocumentOperationType.REVISE && data && !canReviseDocument(data)) {
    ElMessage.warning("当前文档类型未授权修订")
    return
  }

  selectedItem.value = data
  documentUploadModal.value?.setStatus(status as any)
  documentUploadModal.value?.setShow()
}

const onDeleteDocumentClick = async (id: number | string, row?: ITableRow) => {
  if (row && !canCancelDocument(row)) {
    ElMessage.warning("当前文档类型未授权作废")
    return
  }

  const confirm = await ElMessageBox.confirm(
    "此操作将永久作废该文档及其历史记录，是否继续？",
    "提示",
    {
      type: "warning"
    }
  )
  if (!confirm) return

  await deleteFile({ idList: [id] })
  ElMessage.success("作废成功")
  customTableRef.value?.requestData()
}

const onExamRecordClick = async (data: ITableRow) => {
  examRecordShow.value = true
  const res = await getFileFlowRecord({ id: data?.id })
  customExamRecordTableData.value = res || []
}

const onMenuNodeClick = (data: Direction | string) => {
  if (typeof data === "string") {
    setTimeout(() => {
      treeMenuRef.value?.getTreeRef()?.setCurrentKey(data, true)
      const sourceData = treeMenuRef.value?.getTreeRef()?.getNode(data)

      if (sourceData?.data) {
        currentDirectory.value = sourceData.data as Direction
        onReset()
        customTableRef.value?.requestData()
      }
    }, 50)
    return
  }

  currentDirectory.value = data
  onReset()
  customTableRef.value?.requestData()
}

onMounted(async () => {
  fileDirectoryRequest()
  customTableRef.value?.requestData()
  mitter.on("examOnOk", () => {
    customTableRef.value?.requestData()
  })
})

watch(isCancelledMode, async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
})

onBeforeUnmount(() => {
  mitter.off("examOnOk")
})
</script>

<style lang="scss" scoped>
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 1px solid #e8e8e8;
  }

  .layout-main-page {
    flex: 1;
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
}

.tree-sidebar {
  height: 100%;
  overflow-y: auto;

  &:deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
</style>
