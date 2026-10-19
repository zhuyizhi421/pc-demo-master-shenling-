import { type RouteLocationNormalizedLoaded } from "vue-router"

import { type IRoute } from "@/types/common"

const getViewKey = (view: Pick<RouteLocationNormalizedLoaded, "fullPath" | "path">) =>
  view.fullPath || view.path

const getCachedViewNames = (views: IRoute[]) =>
  Array.from(
    new Set(
      views
        .filter((view) => view.name && !view.meta?.noCache)
        .map((view) => view.name as string)
    )
  )

const useTagsViewStore = defineStore(import.meta.env.VITE_PRODUCT_NAME + "-tags-view", {
  state: () => ({
    visitedViews: [] as IRoute[],
    cachedViews: [] as string[],
    iframeViews: [] as IRoute[]
  }),
  actions: {
    addView(view: RouteLocationNormalizedLoaded) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addIframeView(view: RouteLocationNormalizedLoaded) {
      if (this.iframeViews.some((item) => getViewKey(item) === getViewKey(view))) return
      this.iframeViews.push(
        Object.assign({}, view, {
          title: (view.meta.title as string) || "no-name"
        })
      )
    },
    addVisitedView(view: RouteLocationNormalizedLoaded) {
      if (this.visitedViews.some((item) => getViewKey(item) === getViewKey(view))) return
      this.visitedViews.push(
        Object.assign({}, view, {
          title: (view.meta.title as string) || "no-name"
        })
      )
    },
    addCachedView(view: RouteLocationNormalizedLoaded) {
      if (!view.name || view.meta.noCache) return
      if (!this.cachedViews.includes(view.name as string)) {
        this.cachedViews.push(view.name as string)
      }
    },
    delView(
      view: RouteLocationNormalizedLoaded
    ): Promise<{ visitedViews: IRoute[]; cachedViews: string[] }> {
      return new Promise((resolve) => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delVisitedView(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const targetKey = getViewKey(view)
        for (const [index, item] of this.visitedViews.entries()) {
          if (getViewKey(item) === targetKey) {
            this.visitedViews.splice(index, 1)
            break
          }
        }
        this.iframeViews = this.iframeViews.filter((item) => getViewKey(item) !== targetKey)
        resolve([...this.visitedViews])
      })
    },
    delIframeView(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const targetKey = getViewKey(view)
        this.iframeViews = this.iframeViews.filter((item) => getViewKey(item) !== targetKey)
        resolve([...this.iframeViews])
      })
    },
    delCachedView(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const targetName = view.name as string
        const hasRemainingSameNameView = this.visitedViews.some(
          (item) => item.name === targetName && !item.meta?.noCache
        )
        if (!hasRemainingSameNameView) {
          const index = this.cachedViews.indexOf(targetName)
          index > -1 && this.cachedViews.splice(index, 1)
        }
        resolve([...this.cachedViews])
      })
    },
    delOthersViews(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        this.delOthersVisitedViews(view)
        this.delOthersCachedViews(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delOthersVisitedViews(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const targetKey = getViewKey(view)
        this.visitedViews = this.visitedViews.filter((item) => item.meta.affix || getViewKey(item) === targetKey)
        this.iframeViews = this.iframeViews.filter((item) => getViewKey(item) === targetKey)
        resolve([...this.visitedViews])
      })
    },
    delOthersCachedViews(_view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        this.cachedViews = getCachedViewNames(this.visitedViews)
        resolve([...this.cachedViews])
      })
    },
    delAllViews() {
      return new Promise((resolve) => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delAllVisitedViews() {
      return new Promise((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta.affix)
        this.visitedViews = affixTags
        this.iframeViews = []
        resolve([...this.visitedViews])
      })
    },
    delAllCachedViews() {
      return new Promise((resolve) => {
        this.cachedViews = []
        resolve([...this.cachedViews])
      })
    },
    updateVisitedView(view: RouteLocationNormalizedLoaded) {
      const targetKey = getViewKey(view)
      for (let item of this.visitedViews) {
        if (getViewKey(item) === targetKey) {
          item = Object.assign(item, view)
          break
        }
      }
    },
    delRightTags(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const index = this.visitedViews.findIndex((item) => getViewKey(item) === getViewKey(view))
        if (index === -1) {
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => idx <= index || Boolean(item.meta?.affix))
        const remainedViewKeys = new Set(this.visitedViews.map((item) => getViewKey(item)))
        this.iframeViews = this.iframeViews.filter((item) => remainedViewKeys.has(getViewKey(item)))
        this.cachedViews = getCachedViewNames(this.visitedViews)
        resolve([...this.visitedViews])
      })
    },
    delLeftTags(view: RouteLocationNormalizedLoaded) {
      return new Promise((resolve) => {
        const index = this.visitedViews.findIndex((item) => getViewKey(item) === getViewKey(view))
        if (index === -1) {
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => idx >= index || Boolean(item.meta?.affix))
        const remainedViewKeys = new Set(this.visitedViews.map((item) => getViewKey(item)))
        this.iframeViews = this.iframeViews.filter((item) => remainedViewKeys.has(getViewKey(item)))
        this.cachedViews = getCachedViewNames(this.visitedViews)
        resolve([...this.visitedViews])
      })
    }
  }
})

export default useTagsViewStore
