<template>
  <CustomTable v-model:table-data="customTableData" :config="tableConfig" class="custom-table">
    <template #operation-default="{ row }">
      <el-button link type="primary" @click.prevent="onCancelClick(row.menuId)">
        <svg-icon icon-class="starred" style="color: #ffc700ff" />取消收藏
      </el-button>
    </template>
  </CustomTable>
</template>

<script lang="ts" setup>
import { requestDeleteFavorite } from "@/api/favorite"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import SvgIcon from "@/components/SvgIcon/Index.vue"
import type { ITableItem } from "@/types/personal/collect"

const props = withDefaults(
  defineProps<{
    favoriteMenus: ITableItem[]
  }>(),
  {
    favoriteMenus: () => []
  }
)

const emit = defineEmits<{
  (e: "delete-click"): void
}>()

const customTableData = computed(() => props.favoriteMenus)
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "menuName",
      label: "菜单名称",
      minWidth: 160
    },
    {
      prop: "menuFullName",
      label: "菜单层级",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 150,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

/** 取消收藏 */
const onCancelClick = async (menuId: string) => {
  await requestDeleteFavorite({ menuId })
  emit("delete-click")
}
</script>

<style lang="scss" scoped>
:deep(.el-button) {
  span {
    line-height: 24px;

    .svg-icon {
      font-size: 16px;
      margin: 0 4px;
      padding-bottom: 1px;
    }
  }
}
</style>
