/**
 * dagre layout
 * - 不使用 g6 自带的 dagre 布局
 * - 原因：追溯/追踪时会新增节点和边，g6 自带的 dagre 重新布局后，旧有的节点和边坐标会发生变化，导致当前被追溯/追踪的节点被挤到其他位置（大概率可视窗口外）
 */
import dagre from "@dagrejs/dagre"

import type { EdgeConfig, NodeConfig } from "./g6"

interface IDagreLayoutParams {
  nodes: NodeConfig[]
  edges: EdgeConfig[]
  // 需要固定的节点（图重新布局后，以该节点的新坐标与旧坐标的偏移量为准，将其他所有节点和边的坐标进行偏移）
  fixedNode?: {
    id: string
    x: number
    y: number
  }
}
export function dagreLayout(params: IDagreLayoutParams) {
  const { nodes, edges, fixedNode } = params

  const g = new dagre.graphlib.Graph({})

  g.setGraph({
    rankdir: "LR",
    nodesep: 300,
    edgesep: 300,
    ranksep: 400
  })

  g.setDefaultEdgeLabel(function () {
    return {}
  })

  nodes.forEach((node) => {
    g.setNode(node.id, node as any)
  })
  edges.forEach((edge) => {
    const { source, target } = edge
    if (source && target) {
      g.setEdge(source, target)
    }
  })

  dagre.layout(g)

  // 图重新布局后，以该节点的新坐标与旧坐标的偏移量为准，将其他所有节点和边的坐标进行偏移
  if (fixedNode) {
    const idx = g.nodes().findIndex((n) => n === fixedNode.id)
    if (idx >= 0) {
      const { x: curX, y: curY } = g.node(fixedNode.id)
      const { x: oldX, y: oldY } = fixedNode
      const offsetX = oldX - curX
      const offsetY = oldY - curY

      g.nodes().forEach(function (v) {
        g.node(v).x = g.node(v).x + offsetX
        g.node(v).y = g.node(v).y + offsetY
        // console.log("Node " + v + ": " + JSON.stringify(g.node(v)))
      })
      g.edges().forEach(function (e) {
        g.edge(e).x = g.edge(e).x + offsetX
        g.edge(e).y = g.edge(e).y + offsetY
        // console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)))
      })
    }
  }
}
