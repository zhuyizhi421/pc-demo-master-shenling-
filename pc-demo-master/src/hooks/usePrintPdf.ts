import "jspdf-autotable"

import dayjs from "dayjs"
import jsPDF from "jspdf"
import { type CellHookData } from "jspdf-autotable"
import { svg2pdf } from "svg2pdf.js"

import type { IEventDetail, IRelatedEvent, IRelatedEventsGraph } from "@/types/trace"

interface Links {
  x: number
  y: number
  height: number
  width: number
  pageNumber: number
}
interface IProps {
  svgContainer?: HTMLElement
  detailList: IEventDetail[]
  eventsGraph: IRelatedEventsGraph
  fileName: string
}
enum FONT_LEVEL {
  TITLE_1 = 1, //大标题
  TITLE_2, //二标题
  TEXT_1 //正文
}

export default function usePrintPdf() {
  // 获取事件列表
  const getTableData = function (eventsGraph: IRelatedEventsGraph) {
    const eventMap = new Map<number, IRelatedEvent>()
    eventsGraph.events.forEach((item) => {
      eventMap.set(item.eventId, item)
    })
    return eventsGraph.events.map((item) => {
      let memo = ""
      if (item.memo) {
        memo = item.memo.map((item) => `${item.field}：${item.value}`).join("；")
      }
      const arr: string[] = []
      eventsGraph.relations
        .filter((rela) => {
          return item.eventId == rela.endEventId || item.eventId == rela.startEventId
        })
        .map((sub) => {
          if (sub.endEventId == item.eventId) {
            const startEvent = eventMap.get(sub.startEventId)
            arr.unshift(`(前置)${startEvent?.eventTypeName}: ${startEvent?.eventId}`)
          } else if (sub.startEventId == item.eventId) {
            const endEvent = eventMap.get(sub.endEventId)
            arr.push(`(后置)${endEvent?.eventTypeName}: ${endEvent?.eventId}`)
          }
        })
      return {
        ...item,
        eventTime: dayjs(item.eventTime).format("YYYY-MM-DD HH:mm:ss"),
        memo,
        relation: arr.join("；")
      }
    })
  }
  // 打印pdf
  const print = async (props: IProps) => {
    //A4实际尺寸
    // const A4_WIDTH = 592.28;
    const A4_HEIGHT = 841.89
    const Base_X = 30 //横坐标留白区域
    const Base_Y = 30
    let currentPage: number = 1
    //当前绘制坐标
    let offsetY = Base_Y
    let offsetX = Base_X
    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
      orientation: "p"
    })
    // 字体设置
    pdf.addFileToVFS("noto-sanssc-medium-normal.ttf", await loadFont())
    pdf.addFont("noto-sanssc-medium-normal.ttf", "noto-sanssc-medium", "normal")
    pdf.setFont("noto-sanssc-medium", "normal")

    /** 绘制svg */
    if (props.svgContainer) {
      const svgDom = props.svgContainer.getElementsByTagName("svg")[0]
      // 设置svg内的字体类型,插入svg
      const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
      style.textContent = `text {font-family: 'noto-sanssc-medium';}`
      svgDom.insertBefore(style, svgDom.firstChild)
      await svg2pdf(svgDom, pdf, {
        x: Base_X,
        y: offsetY,
        width: svgDom.clientWidth,
        height: svgDom.clientHeight
      })
      offsetY = svgDom.clientHeight
    }

    /** 事件列表  */
    // 处理事件列表的数据
    const tableData = getTableData(props.eventsGraph)
    // 事件列表表头
    const eventListHeader = [
      {
        eventId: "事件ID",
        eventTypeName: "事件名称",
        eventTime: "发生时间",
        memo: "关键信息",
        operator: "相关人",
        relation: "后置事件（追踪） / 前置事件（追溯）"
      }
    ]
    //存储需要绘制锚点的位置信息
    const linkMap = new Map<string, Links[]>()
    // 绘制事件列表
    pdf.autoTable({
      head: eventListHeader,
      body: tableData,
      startY: offsetY + 25,
      rowPageBreak: "auto", //如果表格内容超过页面高度，自动分页
      bodyStyles: { valign: "middle" },
      tableWidth: 500,
      showHead: "everyPage", //换页显示时，显示header
      styles: {
        font: "noto-sanssc-medium",
        fontSize: 8,
        fontStyle: "normal",
        minCellWidth: 80,
        overflow: "linebreak" //超出自动换行
      },
      horizontalPageBreak: false, //原先尝试通过设置 true进行自动表格分页 ，但这样单元格内不会自动换行（overflow: 'linebreak'失效），会显的很长
      // cell绘制前处理
      willDrawCell: (data: CellHookData) => {
        // body eventID 在绘制eventId 时记录他的位置
        if (data.column.dataKey === "eventId" && data.section === "body") {
          const { x, y, height, width } = data.cell
          pdf.setTextColor(0, 0, 255)
          pdf.textWithLink(`${data.cell.raw}`, x, y + height / 2, { url: "#" })
          const pageNumber = pdf.getCurrentPageInfo().pageNumber
          const links = linkMap.get(`${data.cell.raw}`)
          if (links) {
            links.push({
              x,
              y,
              height,
              width,
              pageNumber
            })
            linkMap.set(`${data.cell.raw}`, links) //记录要绘制跳转时的位置大小
          } else {
            linkMap.set(`${data.cell.raw}`, [
              {
                x,
                y,
                height,
                width,
                pageNumber
              }
            ])
          }
        }
      }
    })

    /** 绘制详情列表 */
    //记录绘制坐标当前位置
    offsetY = pdf.lastAutoTable.finalY || offsetY
    currentPage = pdf.getCurrentPageInfo().pageNumber
    props.detailList.forEach((event) => {
      addY(50)
      //绘制详情大标题
      setTextFont(FONT_LEVEL.TITLE_1)
      pdf.text(`${event.eventId} ${event.eventTypeName}`, Base_X, offsetY)
      addY(30)
      const jumpLinks = linkMap.get(`${event.eventId}`)
      if (jumpLinks) {
        //去绘制锚点
        jumpLinks.forEach((links: Links) => {
          pdf.setPage(links.pageNumber) //回到记录的位置进行绘制跳转链接
          pdf.link(links.x, links.y, links.width, links.height, {
            pageNumber: currentPage,
            top: offsetY - 100 //当前位置向上一点作为跳转目标
          })
          pdf.setPage(currentPage)
        })
      }
      event.data.forEach((item) => {
        // 绘制二级标题
        setTextFont(FONT_LEVEL.TITLE_2)
        pdf.text(`${item.eventContentName}`, Base_X, offsetY)
        addY(20)
        if (item.type == "KEY_VALUE") {
          //绘制key_value类型
          offsetX = Base_X + 20 //向内缩进20
          for (let k = 0; k < item.value.length; k++) {
            // 绘制文本类型
            const text = `${item.value[k].name}:   ${item.value[k].value}`
            const texts = pdf.splitTextToSize(text, 240)
            setTextFont(FONT_LEVEL.TEXT_1)
            pdf.text(texts, offsetX, offsetY)
            // 计算下个key_value类型绘制坐标
            if (offsetX >= 240) {
              offsetX = Base_X + 20
              addY(texts.length * 20)
            } else {
              offsetX += 240
              if (k == item.value.length - 1)
                //最后一个keyval 类型时 换行
                addY(texts.length * 20)
            }
          }
        } else if (item.type == "LIST") {
          //绘制表格类型
          const rows: string[][] = item.contentBean.rows.map((row) =>
            row.map((cell) => cell.content)
          )
          const titles = item.contentBean.title
          const MAX_LEN = 6 //不包含第1列 超过MAX_LEN列时表格换行显示
          const heads: string[][] = spiltWidthMaxLen(titles, MAX_LEN) //heads.length代表要分割绘制的表格数
          for (let i = 0; i < heads.length; i++) {
            // 获取每个分割表格下的内容
            const body = rows.map((row) => {
              return [row[0], ...row.slice(i * MAX_LEN + 1, (i + 1) * MAX_LEN + 1)]
            })
            pdf.autoTable({
              head: [heads[i]], //示例：[['标题1','标题2']]
              body: body, //[['第一行第一列','第一行第二列’],[['第二行第一列'],['第二行第二列']]]
              showHead: "everyPage",
              startY: offsetY,
              tableWidth: 500,
              bodyStyles: { valign: "middle" },
              styles: {
                font: "noto-sanssc-medium",
                fontSize: 8,
                fontStyle: "normal",
                minCellWidth: 500 / Math.min(item.contentBean.title.length, MAX_LEN + 1),
                overflow: "linebreak" //超出自动换行
              }
            })
            offsetY = (pdf.lastAutoTable.finalY || offsetY) + 10
          }
          offsetY = (pdf.lastAutoTable.finalY || offsetY) + 25
          currentPage = pdf.getCurrentPageInfo().pageNumber
        }
      })
    })
    await pdf.save(props.fileName)
    /**
     * 计算当前的绘制坐标 offsetY
     * @param y 要添加的距离
     */
    function addY(y: number) {
      if (offsetY + y > A4_HEIGHT - Base_Y * 2) {
        currentPage++
        offsetY = Base_Y
        pdf.addPage()
      } else {
        offsetY += y
      }
    }
    /**
     * 计算title （超出MAX_LEN+1长度时，绘制多行表格）
     * @param arr
     * @param MAX_LEN
     * @returns
     */
    function spiltWidthMaxLen(arr: string[], MAX_LEN: number = 5): string[][] {
      const len = arr.length - 1
      if (len < MAX_LEN) return [arr]
      const first = arr[0]
      const res = []
      for (let i = 0; i < len / MAX_LEN; i++) {
        res.push([first, ...arr.slice(i * MAX_LEN + 1, (i + 1) * MAX_LEN + 1)])
      }
      return res
    }
    /**
     * 不同的类型的文本字体大小
     * @param type
     */
    function setTextFont(type: FONT_LEVEL) {
      switch (type) {
        case FONT_LEVEL.TITLE_1: //大标题
          pdf.setTextColor("#0000ff")
          pdf.setFontSize(14)
          break
        case FONT_LEVEL.TITLE_2: //二标题
          pdf.setTextColor("black")
          pdf.setFontSize(12)
          break
        case FONT_LEVEL.TEXT_1: //正文1
          pdf.setTextColor("#333")
          pdf.setFontSize(10)
          break
        default:
          pdf.setTextColor("#333") //默认正文
          pdf.setFontSize(8)
          break
      }
    }
  }
  // 载入字体
  const loadFont = async () => {
    try {
      // 动态引入模块
      const { font_nono_sanssc } = await import("@/assets/font/nono-sanssc-medium-normal")
      return font_nono_sanssc
    } catch (error) {
      console.error("Failed to load module:", error)
      return ""
    }
  }
  return {
    print
  }
}
