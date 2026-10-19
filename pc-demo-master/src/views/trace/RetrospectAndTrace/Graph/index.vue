<template>
  <div ref="container" class="retrospect-and-trace-graph">
    <div :id="graphContainerId" class="graph-container"></div>
    <div :id="graphContainerSVGId" ref="svgContainer" class="graph-container2"></div>
    <div :id="minimapContainerId" class="minimap-container"></div>
    <div :id="toolbarContainerId" class="toolbar-container">
      <el-space :size="16">
        <!-- <el-button :icon="FullScreen" @click="toggleFullscreen" class="custom-shadow">全屏</el-button> -->
        <el-button
          :icon="FullScreen"
          @click="toggleFullscreen"
          class="custom-shadow"
          title="全屏"
        ></el-button>
        <el-button-group class="custom-shadow">
          <el-button :icon="Minus" @click="zoom(0.8)"></el-button>
          <el-button :icon="Plus" @click="zoom(1.25)"></el-button>
        </el-button-group>
        <el-button-group class="custom-shadow">
          <el-button :icon="Crop" @click="fitView" title="适应视口"></el-button>
          <el-button :icon="ScaleToOriginal" @click="scaleToOriginal" title="原始尺寸"></el-button>
          <el-button :icon="Location" @click="focusItem" title="定位当前节点"></el-button>
        </el-button-group>
      </el-space>
      <el-dropdown>
        <el-button type="primary">
          <el-icon>
            <Download />
          </el-icon>
          导出
          <el-icon>
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="exportImg">图片(.png)</el-dropdown-item>
            <el-dropdown-item @click="exportPdf">详情(.pdf)</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ArrowDown,
  Crop,
  Download,
  FullScreen,
  Location,
  Minus,
  Plus,
  ScaleToOriginal
} from "@element-plus/icons-vue"
import { useDebounceFn, useResizeObserver } from "@vueuse/core"
import dayjs from "dayjs"
import { ElMessage, ElMessageBox } from "element-plus"
import { unique } from "radash"
import { onMounted, onUnmounted, ref, shallowRef } from "vue"

import { queryEventDetail, queryEventsGraph } from "@/api/trace"
import { TraceDirectionEnum, traceDirectionNameMap } from "@/constant/enums"
import usePrintPdf from "@/hooks/usePrintPdf"
import { dagreLayout } from "@/plugins/dagre"
import type { EdgeConfig, Graph, GraphData, GraphOptions, NodeConfig } from "@/plugins/g6"
import g6 from "@/plugins/g6"
import type { IEventDetail, IEventsGraphQueryParams, IRelatedEventsGraph } from "@/types/trace"

defineOptions({
  name: "RetrospectAndTraceGraph"
})

interface IProps {
  queryParams: IEventsGraphQueryParams
  selectedEventId: number | undefined
}
const props = defineProps<IProps>()

const emits = defineEmits<{
  "update:selectedEventId": [newEventId: number | undefined]
  "toggle-fullscreen": []
}>()

// 详情列表
const detailList = shallowRef<IEventDetail[]>([])
// svg追溯图
const svgContainer = ref<HTMLDivElement>()
// 打印pdf
const { print } = usePrintPdf()
/**
 * 方向
 */
const traceDirection = props.queryParams.direction

/**
 * 节点默认宽度和高度
 */
const NODE_DEFAULT_WIDTH = 180
const NODE_DEFAULT_HEIGHT = 90

let otherNodes: {
  eventId: string
  direction: TraceDirectionEnum
}[] = []

/**
 * data
 */
const eventsGraph = shallowRef<IRelatedEventsGraph>({
  events: [],
  relations: []
})
const traceDirectionDialogNameMap = {
  "-1": "向前追溯",
  "0": "追踪追溯",
  "1": "向后追踪"
}
async function getEventsGraph(params: IEventsGraphQueryParams) {
  try {
    const res = await queryEventsGraph({
      ...params
    })

    console.log(params)
    res.relations = res.relations.filter((item) => {
      if (item.startEventId !== params.eventId && item.endEventId !== params.eventId) {
        return true
      } else if (item.objects.some((obj) => params.traceObjectCode?.includes(obj))) {
        return true
      }
      otherNodes.push({
        eventId: (item.startEventId === params.eventId
          ? item.endEventId
          : item.startEventId) as any,
        direction:
          item.startEventId === params.eventId ? TraceDirectionEnum.向后 : TraceDirectionEnum.向前
      })
      return false
    })

    // res.relations = res.relations.filter((item) => {
    //   return item.objects.some((obj) => params.traceObjectCode?.includes(obj))
    // })

    if (res.events.length === 0) {
      ElMessageBox.alert(
        `${traceDirectionDialogNameMap[params.direction as TraceDirectionEnum] + " "}未查询到相关数据`,
        "提示",
        {
          confirmButtonText: "确认",
          closeOnClickModal: true
        }
      ).catch(() => {
        // .
      })
      return false
    }
    if (res.events.length === 1 && res.events.some((i) => i.eventId === params.eventId)) {
      ElMessageBox.alert(
        `未${traceDirectionDialogNameMap[params.direction as TraceDirectionEnum]}到其他节点`,
        "提示",
        {
          confirmButtonText: "确认",
          closeOnClickModal: true
        }
      ).catch(() => {
        // .
      })
    }

    // 将新获取的关系图新增到旧有的图数据中
    const { events, relations } = eventsGraph.value

    // 去重
    eventsGraph.value.events = unique([...events, ...res.events], (e) => e.eventId)
    eventsGraph.value.relations = unique(
      [...relations, ...res.relations],
      (e) => `${e.startEventId}-${e.endEventId}`
    )
    // triggerRef(eventsGraph)
    return true
  } catch (e) {
    return false
  }
}

function dataMapping(rawData: IRelatedEventsGraph) {
  const rawEdges = rawData.relations

  const nodes = rawData.events.map((item) => {
    // 节点是否存在左侧、右侧 edge（即节点是否被作为某个 edge 的 target、csource）
    const rightCollapsed =
      rawEdges.findIndex((e) => e.startEventId === item.eventId) < 0 &&
      (traceDirection === TraceDirectionEnum.向后 || traceDirection === TraceDirectionEnum.全向)
    const leftCollapsed =
      rawEdges.findIndex((e) => e.endEventId === item.eventId) < 0 &&
      (traceDirection === TraceDirectionEnum.向前 || traceDirection === TraceDirectionEnum.全向)

    const res: NodeConfig = {
      id: `${item.eventId}`,
      label: item.eventTypeName,
      type: "custom-node",
      memos: item.memo ? item.memo.map((m) => `${m.field}：${m.value}`) : [],
      size: [NODE_DEFAULT_WIDTH, NODE_DEFAULT_HEIGHT],
      leftCollapsed,
      rightCollapsed
    }

    if (item.operator) {
      res.memos = [
        ...res.memos,
        `人员：${item.operator}`,
        `id：${res.id}`,
        `时间：${dayjs(item.eventTime).format("YYYY-MM-DD HH:mm:ss")}`
      ]
    } else {
      res.memos = [
        ...res.memos,
        `id：${res.id}`,
        `时间：${dayjs(item.eventTime).format("YYYY-MM-DD HH:mm:ss")}`
      ]
    }

    return res
  })

  const edges = rawData.relations.map((item) => {
    let label = ""
    const length = item.objects.length
    if (item.objects && length > 0) {
      // label = `${item.objects[0]}`
      // if (length > 1) {
      //   label += `, +${length - 1}`
      // }
      label = item.objects.slice(0, 3).join("\n")
      if (length > 3) {
        label += `, +${length - 3}`
      }
    }

    const res: EdgeConfig = {
      source: `${item.startEventId}`,
      target: `${item.endEventId}`,
      label,
      identifiers: item.objects || []
    }
    return res
  })

  const res: GraphData = {
    nodes,
    edges
  }

  return res
}

/**
 * graph
 */
const graphContainerId = `mountNode-${dayjs().valueOf()}`
const graphContainerSVGId = `mountNodeSVG-${dayjs().valueOf()}`
const minimapContainerId = `miniMap-${dayjs().valueOf()}`
const toolbarContainerId = `toolbar-${dayjs().valueOf()}`

const container = shallowRef<HTMLDivElement>()

const graph = shallowRef<Graph>()
const graphSVG = shallowRef<Graph>()

// graph plugins
function getPlugins() {
  const miniMap = new g6.Minimap({
    container: minimapContainerId,
    size: [200, 80],
    type: "keyShape",
    hideEdge: true
  })

  const grid = new g6.Grid()

  return [miniMap, grid]
}

// 初始化 options
interface IGetGraphOptions {
  plugins?: any[]
}
function getGraphOptions(params: IGetGraphOptions) {
  const { plugins } = params

  const graphOptions: GraphOptions = {
    container: graphContainerId,
    plugins,
    // fitCenter: true,
    fitView: true,
    fitViewPadding: 50,

    animate: true,
    animateCfg: {
      duration: 500,
      easing: "easeCubic"
    },

    modes: {
      default: [
        "drag-canvas",
        "zoom-canvas",
        "drag-node",
        {
          type: "tooltip",
          formatText: (data) => {
            const memos = data.memos as string[]

            const text = `
              <div style="font-size: 16px; font-weight: bold;">${data.label as string}</div>
              ${memos.reduce((pre, cur) => {
                return `<div style="margin-top: 6px;">${pre}${cur}<div>`
              }, "")}`
            return text
          }
        },
        {
          type: "edge-tooltip",
          formatText: (data) => {
            const ids = data.identifiers as string[]
            const text = ids.reduce((pre, cur) => {
              return `${pre}${cur}</br>`
            }, "")
            return text
          }
        }
      ]
    },

    defaultNode: {
      size: 60,
      style: {
        fill: "steeblue",
        stroke: "#666",
        lineWidth: 1
      },
      labelCfg: {
        style: {
          fill: "#fff"
        }
      }
    },

    defaultEdge: {
      style: {
        opacity: 0.6,
        stroke: "grey",
        endArrow: true
      },
      labelCfg: {
        autoRotate: false,
        style: {
          fill: "#86909c",
          lineHeight: 16,
          background: {
            fill: "#ffffff",
            stroke: "#9EC9FF",
            padding: [6, 8, 6, 8],
            radius: 4
          }
        }
      }
    },

    nodeStateStyles: {
      hover: {
        fill: "lightsteelblue"
      },
      click: {
        stroke: "#000",
        lineWidth: 3
      }
    }

    // edgeStateStyles: {
    //   click: {
    //     // stroke: 'steelblue',
    //     lineWidth: 3,
    //     'text-bg-shape': {
    //       lineWidth: 3,
    //     }
    //   },
    // }
  }

  return graphOptions
}

// 向左和右同时递归移除节点
function removeNodeAllDirectionRecursively(nodeId: string) {
  const leftSubNodeIds = eventsGraph.value.relations
    .filter((relation) => {
      return `${relation.endEventId}` === nodeId
    })
    .map((relation) => {
      return `${relation.startEventId}`
    })

  const rightSubNodeIds = eventsGraph.value.relations
    .filter((relation) => {
      return `${relation.startEventId}` === nodeId
    })
    .map((relation) => {
      return `${relation.endEventId}`
    })

  removeNodeFromGraph(nodeId, eventsGraph.value)

  leftSubNodeIds.forEach((leftSubNodeId) => {
    removeNodeRecursively(leftSubNodeId, "left", false)
  })
  rightSubNodeIds.forEach((rightSubNodeId) => {
    removeNodeRecursively(rightSubNodeId, "right", false)
  })
}

// 按某个方向，递归移除节点
function removeNodeRecursively(nodeId: string, direction: "left" | "right", isFirstNode: boolean) {
  if (!isFirstNode && hasEdge(nodeId, eventsGraph.value, direction)) {
    return
  }

  const edges = eventsGraph.value.relations.filter((relation) => {
    if (direction === "left") {
      return `${relation.endEventId}` === nodeId
    } else {
      return `${relation.startEventId}` === nodeId
    }
  })
  const subNodeIds = edges.map((edge) => {
    if (direction === "left") {
      return `${edge.startEventId}`
    } else {
      return `${edge.endEventId}`
    }
  })

  // 先移除当前节点，以及对应 direction 方向的边
  removeNodeFromGraph(nodeId, eventsGraph.value)

  // 在移除当前节点 direction 方向的子节点
  subNodeIds.forEach((subNodeId) => {
    removeNodeRecursively(subNodeId, direction, false)
  })
}

// 某个节点某个方向是否存在边
function hasEdge(nodeId: string, graph: IRelatedEventsGraph, nodeDirection: "left" | "right") {
  const edges = graph.relations.filter((relation) => {
    if (nodeDirection === "left") {
      return `${relation.startEventId}` === nodeId
    } else {
      return `${relation.endEventId}` === nodeId
    }
  })

  return edges.length > 0
}

// 从原始 graph 数据上移除节点和边
function removeNodeFromGraph(nodeId: string, graph: IRelatedEventsGraph) {
  graph.events = graph.events.filter((event) => `${event.eventId}` !== nodeId)
  graph.relations = graph.relations.filter((relation) => {
    return `${relation.startEventId}` !== nodeId && `${relation.endEventId}` !== nodeId
  })
}

// 第一次渲染结束后，click 当前 queryParams 的 eventId 对应的事件（如果存在的话）
let firstRendered = true
function initFirstClickNode(nodeId: number, eventsGraph: IRelatedEventsGraph, graph: Graph) {
  if (firstRendered && eventsGraph.events.some((e) => e.eventId === nodeId)) {
    graph.setItemState(`${nodeId}`, "click", true)
    emits("update:selectedEventId", nodeId)

    firstRendered = false
  }
}

// 事件
function addEventListeners(graph: Graph) {
  graph.on("node:mouseenter", (e) => {
    if (graph == undefined) {
      return
    }
    const nodeItem = e.item
    if (nodeItem) {
      graph.setItemState(nodeItem, "hover", true)
    }
  })
  graph.on("node:mouseleave", (e) => {
    if (graph == undefined) {
      return
    }
    const nodeItem = e.item
    if (nodeItem) {
      graph.setItemState(nodeItem, "hover", false)
    }
  })
  graph.on("node:click", (e) => {
    if (graph == undefined) {
      return
    }
    const clickNodes = graph.findAllByState("node", "click")
    clickNodes.forEach((cn) => {
      graph.setItemState(cn, "click", false)
    })

    const nodeItem = e.item
    if (nodeItem) {
      graph.setItemState(nodeItem, "click", true)
      emits("update:selectedEventId", Number(nodeItem.getModel().id))
    }
  })

  graph.on("collapse-icon-left:click", async (e) => {
    const nodeItem = e.item
    if (!nodeItem) {
      return
    }

    const res = await getEventsGraph({
      eventId: Number(nodeItem.getID()),
      direction: TraceDirectionEnum.向前
    })
    if (!res) {
      return
    }
    const newData = dataMapping(eventsGraph.value)

    const { x, y } = nodeItem.getModel()
    dagreLayout({
      nodes: newData.nodes as NodeConfig[],
      edges: newData.edges as EdgeConfig[],
      fixedNode: {
        id: nodeItem.getID(),
        x: x as number,
        y: y as number
      }
    })

    graph.changeData(newData)
    graph.setItemState(nodeItem, "click", true)
  })

  graph.on("collapse-icon-right:click", async (e) => {
    const nodeItem = e.item
    if (!nodeItem) {
      return
    }

    const res = await getEventsGraph({
      eventId: Number(nodeItem.getID()),
      direction: TraceDirectionEnum.向后
    })
    if (!res) {
      return
    }
    const newData = dataMapping(eventsGraph.value)

    const { x, y } = nodeItem.getModel()
    dagreLayout({
      nodes: newData.nodes as NodeConfig[],
      edges: newData.edges as EdgeConfig[],
      fixedNode: {
        id: nodeItem.getID(),
        x: x as number,
        y: y as number
      }
    })

    graph.changeData(newData)
    graph.setItemState(nodeItem, "click", true)
  })

  graph.on("remove-icon:click", async (e) => {
    const nodeItem = e.item
    if (!nodeItem) {
      return
    }

    const { label } = nodeItem.getModel()

    try {
      const originNodeId = `${props.queryParams.eventId}`

      if (originNodeId === nodeItem.getID()) {
        ElMessage.warning("初始节点不能被移除")
        return
      }

      await ElMessageBox.confirm(`确认移除“${label}”节点吗？`, "提示", {
        type: "warning",
        cancelButtonText: "取消",
        confirmButtonText: "移除",
        appendTo: container.value
      })

      if (traceDirection === TraceDirectionEnum.向前) {
        removeNodeRecursively(nodeItem.getID(), "left", true)
      } else if (traceDirection === TraceDirectionEnum.向后) {
        removeNodeRecursively(nodeItem.getID(), "right", true)
      } else {
        removeNodeAllDirectionRecursively(nodeItem.getID())
      }

      const newData = dataMapping(eventsGraph.value)
      graph.changeData(newData)

      ElMessage.success("移除成功")

      const clickNodes = graph.findAllByState("node", "click")
      clickNodes.forEach((cn) => {
        graph.setItemState(cn, "click", false)
      })
      emits("update:selectedEventId", undefined)
    } catch (e) {
      ElMessage.info("取消移除")
    }
  })

  graph.on("afterrender", () => {
    initFirstClickNode(props.queryParams.eventId, eventsGraph.value, graph)

    // // 渲染完成后，删除没有边的节点；若只有一个节点则跳过删除操作
    // const allNodes = graph.getNodes()
    // if (allNodes.length <= 1) {
    //   return
    // }
    // const emptyEdgeNodes = allNodes.filter((node) => !node.getEdges()?.length)
    // emptyEdgeNodes.forEach((node) => {
    //   graph.removeItem(node.getID())
    // })
    // fitView()
    console.log("otherNodes", otherNodes)
    otherNodes.forEach((item) => {
      if (item.direction === TraceDirectionEnum.向前) {
        removeNodeRecursively(item.eventId, "left", true)
      } else if (item.direction === TraceDirectionEnum.向后) {
        removeNodeRecursively(item.eventId, "right", true)
      }
    })
    otherNodes = []
  })
}

function removeEventListeners(graph: Graph) {
  graph.off("node:mouseenter")
  graph.off("node:mouseleave")
  graph.off("node:click")

  graph.off("collapse-icon-left:click")
  graph.off("collapse-icon-right:click")
  graph.off("remove-icon:click")
  // graph.off('edge:click')
  graph.off("afterrender")
}

// 防抖：render 和 resize
let initialed = false
const debounceFn = useDebounceFn((width: number, height: number) => {
  if (graph.value == undefined) {
    return
  }
  if (!initialed) {
    graph.value.render()
    initialed = true
  } else {
    graph.value.changeSize(width, height)
  }
}, 200)

// 挂载
onMounted(async () => {
  await getEventsGraph(props.queryParams)
  const remoteData = dataMapping(eventsGraph.value)
  dagreLayout({
    nodes: remoteData.nodes as NodeConfig[],
    edges: remoteData.edges as EdgeConfig[]
  })
  const plugins = getPlugins()
  const graphOptions = getGraphOptions({ plugins })
  graph.value = new g6.Graph(graphOptions)
  graph.value.data(remoteData)
  addEventListeners(graph.value)
  useResizeObserver(container, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    if (!!width && !!height) {
      debounceFn(width, height)
    }
  })
})

// 卸载
onUnmounted(() => {
  if (graph.value != undefined) {
    removeEventListeners(graph.value)
  }
  graph.value?.destroy()
  graph.value = undefined
})

/**
 * toolbar
 */
function toggleFullscreen() {
  emits("toggle-fullscreen")
}

function zoom(ratio: number) {
  if (graph.value == undefined) {
    return
  }

  const centerPoint = graph.value.getGraphCenterPoint()

  graph.value.zoom(ratio, centerPoint, true, {
    duration: 300,
    easing: "easeCubic"
  })
}

function scaleToOriginal() {
  if (graph.value == undefined) {
    return
  }

  const centerPoint = graph.value.getGraphCenterPoint()

  graph.value.zoomTo(1, centerPoint, true, {
    duration: 300,
    easing: "easeCubic"
  })
}

function fitView() {
  graph.value?.fitView(50, undefined, true, {
    duration: 300,
    easing: "easeCubic"
  })
}

function focusItem() {
  if (graph.value == undefined) {
    return
  }

  const clickNodes = graph.value.findAllByState("node", "click")
  if (clickNodes.length === 1) {
    const nodeItem = clickNodes[0]

    graph.value.focusItem(nodeItem)
  }
}

function zoomTo(ratio: number, duration: number = 500): Promise<void> {
  return new Promise((resolve) => {
    if (graph.value == undefined) {
      return
    }
    const centerPoint = graph.value.getGraphCenterPoint()
    graph.value.zoomTo(ratio, centerPoint, true, {
      duration: duration,
      callback: async () => {
        resolve()
      }
    })
  })
}

// 导出pdf
async function exportPdf() {
  try {
    const filename = `事件${props.queryParams.eventId}${traceDirectionNameMap[props.queryParams.direction as TraceDirectionEnum]}`
    const graphOptions = getGraphOptions({ plugins: [] })
    Object.assign(graphOptions, { container: graphContainerSVGId, renderer: "svg" })
    graphSVG.value = new g6.Graph(graphOptions)
    graphSVG.value.data(graph.value?.save())
    await graphSVG.value.render()
    graphSVG.value?.fitView(50, undefined, false)
    await getEventListDetail()
    await print({
      svgContainer: svgContainer.value,
      detailList: detailList.value,
      eventsGraph: eventsGraph.value,
      fileName: filename
    })
    graphSVG.value?.destroy()
  } catch (error) {
    console.log(error)
    graphSVG.value?.destroy()
  }
}

// 导出图片 png
async function exportImg() {
  if (graph.value == undefined) {
    return
  }
  const filename = `事件${props.queryParams.eventId}${traceDirectionNameMap[props.queryParams.direction as TraceDirectionEnum]}`
  const zoomNumber = graph.value.getZoom()
  await zoomTo(1.2, 100)
  await graph.value?.downloadFullImage(`${filename}`, "image/png", {
    backgroundColor: "#fff",
    padding: [60, 40, 60, 40]
  })
  zoomTo(zoomNumber, 0)
}

//获取详情列表
async function getEventListDetail() {
  detailList.value = []
  let len = eventsGraph.value.events.length
  try {
    for (let i = 0; i < len; i++) {
      const res = await queryEventDetail(eventsGraph.value.events[i].eventId)

      if (res) detailList.value.push(res)
    }
  } catch (e) {
    // .
  }
  detailList.value = [...detailList.value]
}
</script>

<style lang="scss" scoped>
.retrospect-and-trace-graph {
  user-select: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  // background-color: #ebedf0;
  .graph-container {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 2;
    background-color: #fff;
  }

  .graph-container2 {
    height: 300px;
    width: 550px;
    position: fixed;
    top: 0px;
    top: -1000px;
    z-index: 11;
    background-color: #fff;
  }

  .minimap-container {
    position: absolute;
    bottom: 0;
    right: 0;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    z-index: 2;
    // width: 100px;
    // height: 80px;
    // border: 1px solid black;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  }
  .toolbar-container {
    display: inline-block;
    position: relative;
    padding: 12px;
    // background-color: #fff;
    // border-bottom: 1px solid #DCDFE6;
    // border-right: 1px solid #DCDFE6;
    // border-bottom-right-radius: 8px;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

.custom-shadow {
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
}
</style>
