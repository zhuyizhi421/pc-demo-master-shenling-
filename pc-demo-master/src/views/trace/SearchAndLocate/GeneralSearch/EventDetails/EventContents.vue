<template>
  <div class="tnt-title" style="margin: 0">
    <div>
      <span>
        {{ eventDetail.eventTypeName }}
      </span>
    </div>
    <el-space :size="'large'">
      <el-button :type="'primary'" plain @click="openDialog(TraceDirectionEnum.向前)"
        >向前追溯</el-button
      >
      <el-button :type="'primary'" plain @click="openDialog(TraceDirectionEnum.全向)"
        >追踪追溯</el-button
      >
      <el-button :type="'primary'" plain @click="openDialog(TraceDirectionEnum.向后)"
        >向后追踪</el-button
      >
    </el-space>
  </div>
  <template v-for="item of eventDetail.data" :key="item.eventContentField">
    <div class="detail-title" :id="item.eventContentField">
      <div class="text">{{ item.eventContentName }}</div>
      <div class="line"></div>
    </div>
    <div v-if="item.type === 'KEY_VALUE'" class="key-value-container">
      <div v-for="(k, index) in item.value" :key="index" class="key-value-item">
        <span class="key">{{ k.name }}</span>
        <template v-if="k.component === 'node'">
          <span class="value self" v-if="isSelf(k.value)" title="自身">{{ k.value }}</span>
          <span class="value obj" v-else title="点击追踪追溯" @click="toTnt(k.value)">{{
            k.value
          }}</span>
        </template>
        <span class="value link" v-else-if="k.url" title="点击跳转" @click="toUrl(k.url)">{{
          k.value
        }}</span>
        <span class="value" v-else>{{ k.value }}</span>
      </div>
    </div>
    <div class="table-container" v-else-if="item.type === 'LIST'">
      <CustomTable v-model:table-data="item.contentBean.rows" :config="tableConfig(item)">
        <template
          v-for="(column, index) in item.contentBean.title"
          :key="index"
          #[`${column}-default`]="{ row }"
        >
          <template v-if="row[index].component === 'node'">
            <template v-if="isSelf(row[index].content)">
              <span style="display: flex; align-items: center">
                <span class="value obj" title="自身" @click="toTnt(row[index].content)">{{
                  row[index].content
                }}</span>
                <span class="custom-self" title="自身" />
              </span>
            </template>
            <template v-else>
              <span class="value obj" title="点击追踪追溯" @click="toTnt(row[index].content)">{{
                row[index].content
              }}</span>
            </template>
          </template>
          <span
            class="value link"
            v-else-if="row[index].url"
            title="点击跳转"
            @click="toUrl(row[index].url)"
            >{{ row[index].content }}</span
          >
          <span class="value" v-else>{{ row[index].content }}</span>
        </template>
      </CustomTable>
    </div>
  </template>

  <CustomDialog v-model="dialog" :title="`选择${directionName}目标`">
    <el-scrollbar :height="400">
      <IdTree ref="IdTreeRef" :tree="objectCodeTree" />
    </el-scrollbar>
    <template #footer>
      <el-space :size="'default'">
        <el-button @click="closeDialog">取消</el-button>
        <el-button :type="'primary'" @click="onTrace" :disabled="objectCodeTree.length === 0">
          进入{{ directionName }}
        </el-button>
      </el-space>
    </template>
  </CustomDialog>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from "vue"

import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import { TraceDirectionEnum } from "@/constant/enums"
import type { IEventDetail, IEventDetailListData } from "@/types/trace"

import IdTree from "./IdTree.vue"

defineOptions({
  name: "SearchAndLocateEventContents"
})

interface IProps {
  eventDetail: IEventDetail
  selfObjectCodes: string[]
}
const props = defineProps<IProps>()

const tableConfig = (item: IEventDetailListData) => {
  return {
    columns: item.contentBean.title.map((column) => ({
      label: column,
      minWidth: 150,
      slots: {
        default: `${column}-default`
      }
    }))
  } as ITableConfig
}

const emits = defineEmits<{
  "new-tab": [objectCode: string]
  "retrospect-or-trace": [
    params: {
      eventId: number
      direction: TraceDirectionEnum
      traceObjectCode: string[]
    }
  ]
}>()

const toTnt = (objectCode: string) => {
  emits("new-tab", objectCode)
}
const toUrl = (url: any) => {
  if (typeof url === "string") {
    window.open(url)
  }
}

/** 自身 */
const isSelf = (objectCode: string) => {
  return props.selfObjectCodes.some((item) => item === objectCode)
}

/** 追踪/追溯 dialog */
const dialog = ref(false)
const traceDirection = ref<TraceDirectionEnum>(TraceDirectionEnum.全向)
const directionName = computed(() => {
  switch (traceDirection.value) {
    case TraceDirectionEnum.向前: {
      return "追溯"
    }
    case TraceDirectionEnum.向后: {
      return "追踪"
    }
    case TraceDirectionEnum.全向: {
      return "追踪追溯"
    }
    default: {
      return "未知"
    }
  }
})
const openDialog = (direction: TraceDirectionEnum) => {
  dialog.value = true
  traceDirection.value = direction
}
function closeDialog() {
  dialog.value = false
}

// 标识 tree
const IdTreeRef = shallowRef<InstanceType<typeof IdTree>>()

interface TreeNode {
  id?: string
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isComp?: boolean
  self?: boolean
}
const objectCodeTree = computed(() => {
  const root: TreeNode = {
    label: props.eventDetail.eventTypeName,
    // disabled: true,
    children: []
  }

  props.eventDetail.data.forEach((data, index) => {
    const treeNode: TreeNode = {
      label: data.eventContentName,
      // disabled: true,
      children: []
    }

    if (data.type === "KEY_VALUE") {
      const nodes = data.value.filter((item) => item.component === "node")

      treeNode.children = nodes.map((n, idx) => ({
        id: n.value + "自定义" + index + idx,
        label: n.value,
        isComp: true,
        self: isSelf(n.value)
      }))
    } else if (data.type === "LIST") {
      data.contentBean.rows.forEach((row, idx) => {
        const nodes = row.filter((i) => i.component === "node")

        treeNode.children = [
          ...(treeNode.children ? treeNode.children : []),
          ...nodes.map((n, i) => ({
            id: n.content + "自定义" + index + idx + i,
            label: n.content,
            isComp: true,
            self: isSelf(n.content)
          }))
        ]
      })
    }

    if (treeNode.children && treeNode.children.length > 0) {
      root.children?.push(treeNode)
    }
  })

  return root.children && root.children.length > 0 ? [root] : []
})

function onTrace() {
  const res = IdTreeRef.value?.getCheckedKeys()
  if (res?.length) {
    dialog.value = false

    emits("retrospect-or-trace", {
      eventId: props.eventDetail.eventId,
      direction: traceDirection.value,
      traceObjectCode: res as string[]
    })
  }
}

/** 锚点 */
function scrollToAnchor(id: string, container: HTMLElement) {
  const el = container.querySelector(`#${id}`) as HTMLElement
  container.scrollTo(0, el?.offsetTop)
}

defineExpose({
  scrollToAnchor
})
</script>

<style lang="scss" scoped>
@import "../index.scss";

.custom-self {
  display: inline-block;
  content: "";
  background: url("@/assets/icon/svg/pos_icon.svg") center no-repeat;
  background-size: 100%;
  width: 16px;
  height: 16px;
  margin-left: 4px;
}
</style>
