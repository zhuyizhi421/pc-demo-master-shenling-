type State = {
  // 设备管理中的类型状态
  flowInstanceId: string
  show: boolean
  examCallback: () => void
}

const useFlowDetailStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-flowDetail", {
  state: (): State => ({
    flowInstanceId: "",
    show: false,
    examCallback: () => {}
  }),
  actions: {
    setStatus(show = false, flowInstanceId = "", examCallback = () => {}) {
      this.show = show
      this.flowInstanceId = flowInstanceId
      this.examCallback = examCallback
    }
  }
})

export default useFlowDetailStore
