import type {
  EdgeConfig,
  Graph,
  GraphData,
  GraphOptions,
  IGroup,
  Item,
  ModelConfig,
  NodeConfig
} from "@antv/g6"
import g6 from "@antv/g6"
import { getEllipsisText } from "@antv/util"

export type { EdgeConfig, Graph, GraphData, GraphOptions, Item, NodeConfig }

interface NodeExtendedFields {
  memos: string[]
  leftCollapsed?: boolean
  rightCollapsed?: boolean
  date?: string
}

interface EdgeExtendedFields {
  identifiers: string[]
}

interface ModelConfigExtended extends ModelConfig, NodeExtendedFields {}

// interface EdgeModelConfigExtended extends EdgeConfig, EdgeExtendedFields {}

// 扩展 @antv/g6
declare module "@antv/g6" {
  // export interface ModelConfig extends ExtendedFields {
  //   // memos: string[],
  //   // leftCollapsed?: boolean,
  //   // rightCollapsed?: boolean,
  //   // date?: string,
  // }
  export interface NodeConfig extends NodeExtendedFields {}
  export interface EdgeConfig extends EdgeExtendedFields {}
}

const COLLAPSE_ICON = function COLLAPSE_ICON(x: number, y: number, r: number) {
  const rtSide1 = (r - 4) * Math.cos(Math.PI / 4)
  const rtSide2 = (r - 4) * Math.sin(Math.PI / 4)
  return [
    ["M", x - r, y],
    ["a", r, r, 0, 1, 0, r * 2, 0],
    ["a", r, r, 0, 1, 0, -r * 2, 0],
    ["M", x - rtSide1, y - rtSide2],
    ["L", x + rtSide1, y + rtSide2],
    ["M", x - rtSide1, y + rtSide2],
    ["L", x + rtSide1, y - rtSide2]
    // ['L', x - r + 2 * r - 4, y],
  ]
}
const EXPAND_ICON = function EXPAND_ICON(x: number, y: number, r: number) {
  return [
    ["M", x - r, y],
    ["a", r, r, 0, 1, 0, r * 2, 0],
    ["a", r, r, 0, 1, 0, -r * 2, 0],
    ["M", x - r + 4, y],
    ["L", x - r + 2 * r - 4, y],
    ["M", x - r + r, y - r + 4],
    ["L", x, y + r - 4]
  ]
}

const createExpandMarker = (
  group: IGroup,
  x: number,
  y: number,
  position: "left" | "right",
  visible: boolean
) => {
  group.addShape("circle", {
    attrs: {
      x,
      y,
      r: 7,
      fill: "rgba(255, 255, 255, 1)",
      opacity: 1,
      zIndex: 1
    },
    name: `collapse-icon-bg-${position}`,
    visible
  })
  group.addShape("marker", {
    attrs: {
      x,
      y,
      r: 7,
      symbol: EXPAND_ICON,
      stroke: "rgba(0,0,0,0.5)",
      fill: "rgba(0,0,0,0)",
      lineWidth: 1,
      cursor: "pointer",
      zIndex: 2
    },
    name: `collapse-icon-${position}`,
    visible
  })
}

const createRemoveMarker = (group: IGroup, x: number, y: number) => {
  group.addShape("circle", {
    attrs: {
      x,
      y,
      r: 7,
      fill: "rgba(255, 255, 255, 1)",
      opacity: 1,
      zIndex: 1
    },
    name: "remove-icon-bg",
    visible: false
  })

  group.addShape("marker", {
    attrs: {
      x,
      y,
      r: 7,
      symbol: COLLAPSE_ICON,
      // stroke: 'rgba(0,0,0,0.5)',
      stroke: "rgba(245, 63, 63, 1)",
      fill: "rgba(0,0,0,0)",
      lineWidth: 1,
      cursor: "pointer",
      zIndex: 2
    },
    name: "remove-icon",
    visible: false
  })
}

interface ICalcHeightParams {
  yPadding: number
  labelHeight: number
  dividerHeight: number
  memoLength: number
  memoHeight: number
}
function calcRectHeightAndTextYCoord(params: ICalcHeightParams) {
  const { yPadding: padding, labelHeight, memoLength, memoHeight, dividerHeight } = params

  const rectHeight = labelHeight + memoLength * memoHeight + padding * 2 + dividerHeight

  const labelY = padding + labelHeight / 2 - rectHeight / 2

  const memoYArr: number[] = []
  for (let i = 0; i < memoLength; i++) {
    memoYArr.push(padding + labelHeight + memoHeight * i + memoHeight / 2 - rectHeight / 2)
  }

  return {
    rectHeight,
    labelY,
    memoYArr
  }
}

g6.registerNode("custom-node", {
  draw(_cfg, group) {
    const cfg = _cfg as ModelConfigExtended
    const size = cfg.size as number[]
    const rectWidth = size[0]

    const padding = 10

    const label = cfg.label
    const mockMemos = cfg.memos as string[]
    const dividerHeight = 20
    const { rectHeight, labelY, memoYArr } = calcRectHeightAndTextYCoord({
      yPadding: padding / 2,
      labelHeight: 30,
      memoHeight: 20,
      memoLength: mockMemos.length,
      dividerHeight
    })

    // keyShape: 矩形
    const rectX = -(rectWidth / 2)
    const rectY = -(rectHeight / 2)

    const keyShape = group.addShape("rect", {
      attrs: {
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        fill: "steelblue",
        stroke: "#666",
        lineWidth: 1,
        radius: 4
      },
      draggable: true,
      name: "custom-node-keyShape"
    })

    // label
    const labelX = -(rectWidth / 2) + padding
    const ellipsisLabel = getEllipsisText(
      label as string,
      rectWidth / 2,
      {
        fontSize: 18
      },
      "..."
    )
    group.addShape("text", {
      attrs: {
        text: ellipsisLabel,
        x: labelX,
        y: labelY,
        fill: "#fff",
        fontSize: 18,
        // textAlign: 'center',
        textBaseline: "middle"
      },
      draggable: true,
      name: "custom-node-label"
    })

    // memos
    mockMemos.forEach((memo, index) => {
      const memoY = memoYArr[index]

      const ellipsisMemo = getEllipsisText(
        memo as string,
        135,
        {
          fontSize: 12
        },
        "..."
      )

      if (index === mockMemos.length - 2) {
        const xPosition = -(rectWidth / 2) + 1
        const yPosition = memoY
        group.addShape("path", {
          attrs: {
            path: [
              ["M", xPosition, yPosition],
              ["L", rectWidth + xPosition - 2, yPosition]
            ],
            stroke: "#fff",
            lineWidth: 1
          }
        })
      }

      group.addShape("text", {
        attrs: {
          text: ellipsisMemo,
          x: labelX,
          y: index >= mockMemos.length - 2 ? memoY + dividerHeight : memoY,
          fill: "#fff",
          fontSize: 12,
          textBaseline: "middle"
        },
        draggable: true,
        name: `custom-node-memo-${index}`
      })
    })

    // 左侧 collapse icon
    createExpandMarker(group, -(rectWidth / 2), 0, "left", cfg.leftCollapsed === true)

    // 右侧 collapse icon
    createExpandMarker(group, rectWidth / 2, 0, "right", cfg.rightCollapsed === true)

    // 右上角 remove icon
    createRemoveMarker(group, rectWidth / 2, -(rectHeight / 2))

    return keyShape
  },
  update(cfg, item) {
    const { leftCollapsed, rightCollapsed } = item.getModel()
    const group = item.getContainer()
    if (!group) {
      return
    }

    // 更新 visible of 左右 expand icon
    const shapes = group.getChildren()

    const leftIconBgShape = shapes.find((s) => s.cfg.name === "collapse-icon-bg-left")
    const leftIconShape = shapes.find((s) => s.cfg.name === "collapse-icon-left")

    if (leftCollapsed) {
      leftIconBgShape?.show()
      leftIconShape?.show()
    } else {
      leftIconBgShape?.hide()
      leftIconShape?.hide()
    }

    const rightIconBgShape = shapes.find((s) => s.cfg.name === "collapse-icon-bg-right")
    const rightIconShape = shapes.find((s) => s.cfg.name === "collapse-icon-right")
    if (rightCollapsed) {
      rightIconBgShape?.show()
      rightIconShape?.show()
    } else {
      rightIconBgShape?.hide()
      rightIconShape?.hide()
    }
  },
  getAnchorPoints() {
    return [
      [0, 0.5],
      [1, 0.5]
    ]
  },
  setState(name, value, item) {
    const group = item?.getContainer()

    if (!group) {
      return
    }

    if (name === "click") {
      const shapes = group.getChildren()
      const keyShape = shapes[0]
      const removeIconBgShape = shapes.find((s) => s.cfg.name === "remove-icon-bg")
      const removeIconShape = shapes.find((s) => s.cfg.name === "remove-icon")
      if (value) {
        keyShape.attr("stroke", "#000")
        keyShape.attr("lineWidth", 3)
        keyShape.attr("fill", "#46b4af")
        // const attrs = item?.getStateStyle('click')
        // if (attrs) {
        //   console.log(attrs)
        //   setAttrs(keyShape, attrs)
        // }

        removeIconBgShape?.show()
        removeIconShape?.show()
      } else {
        keyShape.attr("stroke", "#666")
        keyShape.attr("lineWidth", 1)
        keyShape.attr("fill", "steelblue")
        // const attrs = item?.getOriginStyle()['custom-node-keyShape']
        // if (attrs) {
        //   console.log(attrs)
        //   setAttrs(keyShape, attrs)
        // }

        removeIconBgShape?.hide()
        removeIconShape?.hide()
      }
    } else if (name === "hover") {
      // 状态优先级：click > hover
      if (item?.hasState("click")) {
        return
      }

      const keyShape = group.getChildren()[0]
      if (value) {
        keyShape.attr("fill", "lightsteelblue")
      } else {
        keyShape.attr("fill", "steelblue")
      }
    }
  }
})

// function setAttrs (shape: any, attrs: { [key: string]: any }) {
//   const keys = Object.keys(attrs)
//   keys.forEach(key => {
//     shape.attr(key, attrs[key])
//   })
// }

// function createIdentifiers () {

// }
// interface ICalcIdentifiersHeightParams {
//   gap: number,
//   identifiersLength: number,
//   identifiersHeight: number,
// }
// function calcIdentifiersHeight (params: ICalcIdentifiersHeightParams) {
//   const {
//     gap,
//     identifiersHeight,
//     identifiersLength: length,
//   } = params

//   const height = identifiersHeight + (gap / 2)
//   const rectHeight = length * height

//   const yArr: number[] = []
//   for (let i = 0; i < length; i++) {
//     yArr.push((height * i) + (height / 2) - (rectHeight / 2))
//   }

//   return yArr
// }
// g6.registerEdge('custom-edge', {
//   afterDraw (_cfg, group) {
//     console.log('after draw.')
//     const cfg = _cfg as EdgeModelConfigExtended
//     if (cfg != undefined && group != undefined) {
//       // console.log(group)
//       const shape = group.get('children')[0]
//       const midPoint = shape.getPoint(0.5)
//       // console.log(shape.getTotalLength())

//       const container = group.addGroup({
//         id: 'custom-edge-identifiers-container',
//       })

//       const width = 100
//       const gap = 10
//       const height = 20
//       const length = cfg.identifiers.length

//       const yArr = calcIdentifiersHeight({
//         gap,
//         identifiersHeight: height,
//         identifiersLength: length,
//       })

//       const x = (-width / 2) + midPoint.x
//       cfg.identifiers.forEach((idStr, index) => {
//         const y = yArr[index] + midPoint.y

//         container.addShape('text', {
//           attrs: {
//             text: idStr,
//             x,
//             y,
//             fill: 'black',
//             fontSize: 8,
//             textBaseline: 'middle',
//           },
//           draggable: true,
//           name: `custom-edge-identifier-${index}`
//         })
//       })
//     }
//   },
//   // update: undefined,
//   afterUpdate (cfg, item) {
//     const group = item?.getContainer()
//     if (!cfg || !group) {
//       return
//     }

//     const shape = group.get('children')[0]
//     const midPoint = shape.getPoint(0.5)
//     console.log('after update: ', midPoint)

//     const container = group.getChildren()[1]
//     const arr = container.get('children') as any[]

//     if (arr) {
//       arr.forEach(item => {
//         item.attr('x', midPoint.x)
//         item.attr('y', midPoint.y)
//       })
//     }
//   },
// }, 'line')

export default g6
