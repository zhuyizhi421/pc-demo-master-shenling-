/** 实施配置-其他配置hooks */

import dayjs from "dayjs"

import { EnumCustomFormComponentType, EnumCustomFormOperationType } from "@/constant/enums"

export const useImplementConfig = () => {
  /** 编辑回显自定义列表 */
  const customFieldViewList = ref<any[]>([])

  /**
   * 实施配置接口获取的数据转换为实施配置页面中每一行对应的配置项数据，
   * 注意：当将配置项数据用于组件显示（预览）时，使用每一项中的previewData字段；
   * @param configItem 实施配置项中配置的字段信息
   * @returns
   */
  const configToPreviewData = (configItem: any[] = []) => {
    const transformData = configItem.map((item: any) => {
      if (
        [EnumCustomFormComponentType.SELECT, EnumCustomFormComponentType.MULTIPLE_SELECT].includes(
          item.fieldType
        )
      ) {
        return {
          ...item,
          selectOptions: item.options,
          previewData: {
            ...item,
            selectOptions: item.options
          }
        }
      } else if (item.fieldType === EnumCustomFormComponentType.NUMBER_STEPPER) {
        return {
          ...item,
          min: item.lowerLimit,
          max: item.upperLimit,
          previewData: {
            ...item,
            min: item.lowerLimit,
            max: item.upperLimit
          }
        }
      } else if (
        [EnumCustomFormComponentType.DATE_PICKER, EnumCustomFormComponentType.TIME_PICKER].includes(
          item.fieldType
        )
      ) {
        const newItem = {
          ...item,
          dateType: item.isPoint ? 1 : 2
        }
        if (typeof item.defaultValue === "number") {
          newItem.defaultValue = Math.abs(item.defaultValue)
          newItem.defaultTimeOperation =
            item.defaultValue > 0
              ? EnumCustomFormOperationType.PLUS
              : EnumCustomFormOperationType.MINUS
        }
        if (typeof item.lowerLimit === "number") {
          newItem.startTime = Math.abs(item.lowerLimit)
          newItem.startTimeOperation =
            item.lowerLimit > 0
              ? EnumCustomFormOperationType.PLUS
              : EnumCustomFormOperationType.MINUS
        }
        if (typeof item.upperLimit === "number") {
          newItem.endTime = Math.abs(item.upperLimit)
          newItem.endTimeOperation =
            item.upperLimit > 0
              ? EnumCustomFormOperationType.PLUS
              : EnumCustomFormOperationType.MINUS
        }

        // 格式化日期默认值

        let newDefaultValue
        if (typeof item.defaultValue === "number") {
          if (item.fieldType === EnumCustomFormComponentType.DATE_PICKER) {
            newDefaultValue = dayjs(new Date())
              .add(item.defaultValue || 0, "day")
              .format("YYYY-MM-DD")
          } else {
            newDefaultValue = dayjs(new Date())
              .add(item.defaultValue || 0, "day")
              .format("YYYY-MM-DD HH:mm:ss")
          }
        } else {
          newDefaultValue = ""
        }

        return {
          ...newItem,
          previewData: {
            ...newItem,
            defaultValue:
              newItem.dateType === 1 ? newDefaultValue : [newDefaultValue, newDefaultValue]
          }
        }
      } else if (item.fieldType === EnumCustomFormComponentType.FILE_UPLOAD) {
        return {
          ...item,
          previewData: {
            ...item,
            accept: item.supportTypes?.join(",")
          }
        }
      } else if (item.fieldType === EnumCustomFormComponentType.SELECT_USER) {
        return {
          ...item,
          isMultiple: item.isMultiple,
          selectUserTypes: item.selectTypes,
          previewData: {
            ...item,
            selectUserTypes: item.selectTypes
          }
        }
      } else {
        return {
          ...item,
          previewData: {
            ...item
          }
        }
      }
    })

    customFieldViewList.value = cloneDeep(transformData).map((item: any) => item.previewData)

    return transformData
  }

  /**
   * 更新自定义字段显示列表，用于编辑时回显填充数据
   * @param source
   */
  const updateCustomFieldViewList = (source: any[]) => {
    customFieldViewList.value.forEach((item) => {
      const target = source?.find((field: any) => field.fieldDef.id === item.id)
      if (!target) {
        return
      }

      const value = JSON.parse(target.value ?? '""')
      const fieldType = item.fieldType
      if (fieldType === EnumCustomFormComponentType.SELECT_USER) {
        // 选人
        item.curSelectUserType = value.curSelectUserType
        item.currentSelectedList = value.list
        item.defaultValue = value.list
      } else {
        item.defaultValue =
          fieldType === EnumCustomFormComponentType.SWITCH ? value || false : value
      }
    })
  }

  /**
   * 格式化配置信息，返回格式化后的详情数据，用于详情列表信息展示（不适用编辑回显）
   * @param customizedFields 通过详情接口获取的自定义字段信息
   * @returns 格式化后的详情数据
   */
  const formatConfigDetail = (customizedFields: any[] = []) => {
    const customList = customizedFields.map((item) => {
      const config = item.fieldDef,
        fieldType = config.fieldType, // 字段类型
        label = config.fieldName // 字段名称
      let value = JSON.parse(item.value ?? '""')

      switch (fieldType) {
        case EnumCustomFormComponentType.SWITCH:
          value = value ? "开启" : "关闭"
          break
        case EnumCustomFormComponentType.SELECT:
          value = config.options.find((option: any) => option.value === value)?.label
          break
        case EnumCustomFormComponentType.MULTIPLE_SELECT:
          value = config.options
            .filter((option: any) => value.includes(option.value))
            .map((option: any) => option.label)
            .join(",")
          break
        case EnumCustomFormComponentType.FILE_UPLOAD:
          if (value) {
            value = value?.map((item: any) => item.fileId)?.join(",")
          }
          break
        case EnumCustomFormComponentType.SELECT_USER:
          if (!value.data) {
            value = ""
            break
          }
          if (value.curSelectUserType === 1) {
            // 用户
            value = value.data?.map((item: any) => item.name)?.join(",")
          } else if (value.curSelectUserType === 2) {
            // 部门
            value = value.data?.map((item: any) => item.label)?.join(",")
          } else if (value.curSelectUserType === 3) {
            // 职位
            value = value.data?.map((item: any) => item.positionName)?.join(",")
          }
          break
      }

      return {
        label,
        value,
        fieldType
      }
    })
    return customList
  }

  /**
   * 将自定义字段显示列表转换为数据保存时使用的参数信息，如产品信息中配置的自定义字段信息保存到产品信息中
   */
  const customFieldViewListToParams = () => {
    return customFieldViewList.value.map((item) => {
      if (item.fieldType === EnumCustomFormComponentType.SELECT_USER) {
        // 选人
        return {
          defId: item.id,
          value: JSON.stringify({
            curSelectUserType: item.curSelectUserType,
            list: item.defaultValue?.map((user: any) => user.empId || user.id),
            data: item.defaultValue
          })
        }
      } else if (item.fieldType === EnumCustomFormComponentType.SWITCH) {
        return {
          defId: item.id,
          value: JSON.stringify(item.defaultValue || false)
        }
      } else {
        return {
          defId: item.id,
          value: JSON.stringify(item.defaultValue)
        }
      }
    })
  }

  /**
   * 自定义字段保存时校验是否必传
   * @returns 检验是否通过
   */
  const customFieldSaveCheck = () => {
    // 校验自定义项是否必传
    console.log(customFieldViewList.value)

    const valid = customFieldViewList.value.every((item) => {
      if (!item.isRequired || typeof item.defaultValue === "boolean") {
        return true
      }
      if (!item.defaultValue && item.defaultValue !== 0) {
        return false
      }
      if (Array.isArray(item.defaultValue) && !item.defaultValue.length) {
        return false
      }
      return true
    })
    return valid
  }

  return {
    customFieldViewList,
    customFieldSaveCheck,
    formatConfigDetail,
    configToPreviewData,
    updateCustomFieldViewList,
    customFieldViewListToParams
  }
}
