import { requestUnreadMessageCount } from "@/api/systemMessage"

const sysMessageCount = ref(0)

export const useSystemMessage = () => {
  const initSystemMessage = async () => {
    const total = await requestUnreadMessageCount()
    sysMessageCount.value = +total
  }

  return {
    sysMessageCount,
    initSystemMessage
  }
}
