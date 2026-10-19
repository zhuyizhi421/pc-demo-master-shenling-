/**
 * 获取区域位置
 * @returns
 */
export const useAreaLocation = () => {
  const locationList = [
    {
      level: 1,
      name: "公司"
    },
    {
      level: 2,
      name: "工厂"
    },
    {
      level: 3,
      name: "区域"
    },
    {
      level: 4,
      name: "生产单位"
    },
    {
      level: 5,
      name: "工位"
    }
  ]

  const curLocation = locationList[4] // 此处当前位置信息依据实际项目而定

  return {
    curLocation
  }
}
