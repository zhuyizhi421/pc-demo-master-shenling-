<template>
  <CustomTable
    ref="customTableRef"
    v-model:table-data="customTableData"
    v-model:total="pagination.total"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-table"
  >
    <template #files-default="{ row }">
      <el-image
        v-for="item in row?.files"
        :key="item.id"
        :src="formatImgUrlPreview(item.path)"
        :preview-teleported="true"
        :zoom-rate="1"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="[formatImgUrlPreview(item.path)]"
        class="w-[50px] h-[50px]"
        fit="contain"
      />
    </template>

    <template #operation-default="{ row }">
      <el-button
        v-if="row.processInstanceId"
        link
        type="primary"
        size="small"
        @click="useFlowDetail.setStatus(true, row.processInstanceId)"
        >查看详情</el-button
      >
      <el-button v-else link type="primary" size="small" disabled>暂无详情</el-button>
    </template>
  </CustomTable>

  <CustomPagination
    v-model:currentPage="pagination.currentPage"
    v-model:pageSize="pagination.pageSize"
    :total="pagination.total"
    border
    @change="customTableRef?.requestData()"
  />
</template>

<script setup lang="ts">
import { queryEquipmentScrapPageList } from "@/api/operation/equipment/equipment-scrap-apply"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type {
  IEquipmentScrapPageItem as ITableRow,
  IEquipmentScrapPageListParams
} from "@/types/maintain/equipment-manage/equipment-scrap-apply"
import { formatImgUrlPreview } from "@/utils/common"

enum EnumSourceTypeMap {
  "保养" = 1,
  "维修" = 2,
  "手动创建" = 3
}

enum EnumScrapStatusMap {
  "申请中" = 1,
  "已通过" = 2,
  "未通过" = 3
}

const props = defineProps<{
  deviceId: string
}>()

const useFlowDetail = useFlowDetailStore()

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "processDefineName",
      label: "流程名称",
      width: 160
    },
    {
      prop: "scrapStatus",
      label: "申请状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumScrapStatusMap[row.scrapStatus] ?? "-"
      }
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160
    },
    {
      prop: "equipmentNo",
      label: "台账编号",
      width: 160
    },
    {
      prop: "scrapReason",
      label: "报废原因",
      width: 160
    },
    {
      prop: "files",
      label: "报废附件",
      width: 160,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "reportUsersName",
      label: "发起人",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers?.length ? row.reportUsers.map((item) => item.name).join(",") : "-"
      }
    },
    {
      prop: "reportUsersDepName",
      label: "所属部门",
      width: 160,
      formatter: (row: ITableRow) => {
        return row?.reportUsers?.length
          ? row.reportUsers.map((item) => item.depName).join(",")
          : "-"
      }
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumSourceTypeMap[row.sourceType] ?? "-"
      }
    },
    {
      prop: "sourceNo",
      label: "关联维修单",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentScrapPageListParams], ITableRow, true> = {
  api: queryEquipmentScrapPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          equipmentId: props.deviceId
        }
      }
    ]
  }
}

onMounted(() => {
  customTableRef.value?.requestData()
})

defineOptions({
  name: "scrapRecord"
})
</script>

<style scoped lang="scss"></style>

