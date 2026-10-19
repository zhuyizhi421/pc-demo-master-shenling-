import { requestPreviewBarcode, requestPrintCheckBarcode } from "@/api/barcode"
import { requestSupplierDeliveryOrderPrint } from "@/api/baseInfo/supplier-platform/supplier-platform"

const useBarcodePrint = () => {
  /**
   * 打印条形码
   * @param barcodeList 条码id列表
   * @param callback 打印界面成功显示后回调函数
   */
  const printBarcode = async (barcodeList: string[], callback?: () => void) => {
    const { filePath } = await requestPreviewBarcode({ barcodeList })
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = filePath
    iframe.onload = () => {
      console.log("iframe loaded")
      const iframeWin = iframe.contentWindow
      iframeWin!.onafterprint = () => {
        console.log("print cancel or success")
        document.body.removeChild(iframe)
      }
      iframeWin!.print()
      callback?.()
    }
    document.body.appendChild(iframe)
  }

  /**
   * 盘点打印条码
   * @param barcodeList 条码id列表
   * @param num 实盘数量
   */
  const printCheckBarcode = async (list: { barcode: string; quantity: number }[]) => {
    const { filePath } = await requestPrintCheckBarcode(list)
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = filePath
    iframe.onload = () => {
      console.log("iframe loaded")
      const iframeWin = iframe.contentWindow
      iframeWin!.onafterprint = () => {
        console.log("print cancel or success")
        document.body.removeChild(iframe)
      }
      iframeWin!.print()
    }
    document.body.appendChild(iframe)
  }

  /** 供应商发货单打印 */
  const printDeliveryOrder = async (sendOrderNo: string, supplierId: string) => {
    const { filePath } = await requestSupplierDeliveryOrderPrint({ sendOrderNo, supplierId })
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = filePath
    iframe.onload = () => {
      console.log("iframe loaded")
      const iframeWin = iframe.contentWindow
      iframeWin!.onafterprint = () => {
        console.log("print cancel or success")
        document.body.removeChild(iframe)
      }
      iframeWin!.print()
    }
    document.body.appendChild(iframe)
  }

  return {
    printBarcode,
    printCheckBarcode,
    printDeliveryOrder
  }
}

export default useBarcodePrint
