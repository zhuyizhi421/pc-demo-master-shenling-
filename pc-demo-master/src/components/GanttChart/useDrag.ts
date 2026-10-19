import { ref } from "vue"

const drag = ref(false)

const dragStart = (event: DragEvent, data?: string) => {
  drag.value = true
  if (data) {
    event.dataTransfer?.setData("text/plain", data)
  }
  event.dataTransfer?.setDragImage(document.createElement("div"), 0, 0)
}

export const useDrag = () => {
  return { drag, dragStart }
}
